import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuditLogs } from '../api/client';
import { useAuth } from '../context/AuthContext';

/* ── Stitch color tokens ── */
const C = {
  bg: '#f9f9fd',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f3f8',
  surfaceContainer: '#ededf2',
  surfaceContainerHigh: '#e7e8ec',
  surfaceVariant: '#e2e2e6',
  onSurface: '#1a1c1f',
  onSurfaceVariant: '#42474f',
  outlineVariant: '#c2c7d0',
  hairline: '#E5E3DF',
  primary: '#054471',
  primaryContainer: '#2a5c8a',
  onPrimaryContainer: '#afd4ff',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
};

function getActionBadge(action) {
  const a = (action || '').toUpperCase();
  if (a === 'CREATE') return { bg: C.surfaceContainerHigh, color: C.onSurface, border: C.outlineVariant };
  if (a === 'UPDATE' || a === 'APPROVE') return { bg: C.surfaceContainerHigh, color: C.onSurface, border: C.outlineVariant };
  if (a === 'DELETE' || a === 'REJECT') return { bg: C.errorContainer, color: C.onErrorContainer, border: C.errorContainer };
  if (a === 'OVERRIDE') return { bg: 'rgba(119,82,1,0.1)', color: '#775201', border: 'rgba(119,82,1,0.2)' };
  return { bg: C.surfaceContainerHigh, color: C.onSurface, border: C.outlineVariant };
}

function formatTs(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')}`;
  } catch { return ts; }
}

/* ───────────────── Component ───────────────── */
export function AuditLogScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters] = useState({ entity: '', actor: '', dateFrom: '', dateTo: '' });

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const entityTypes = [...new Set(logs.map(l => l.entityType || l.entity).filter(Boolean))];

  const filtered = logs.filter(l => {
    const entityVal = String(l.entityType || l.entity || '');
    const actorVal = String(l.actorId || l.actor || '');
    if (filters.entity && entityVal !== filters.entity) return false;
    if (filters.actor && !actorVal.toLowerCase().includes(filters.actor.toLowerCase())) return false;
    if (filters.dateFrom && new Date(l.timestamp) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(l.timestamp) > new Date(filters.dateTo + 'T23:59:59')) return false;
    return true;
  });

  const clearFilters = () => setFilters({ entity: '', actor: '', dateFrom: '', dateTo: '' });

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      str = str.replace(/"/g, '""');
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str}"`;
      }
      return str;
    };
    const headers = ['Timestamp (UTC)', 'Action', 'Entity', 'Entity ID', 'Actor ID', 'Before State', 'After State'];
    const rows = filtered.map(log => [
      formatTs(log.timestamp),
      log.action || '',
      log.entityType || log.entity || '',
      log.entityId || log.entity_id || '',
      log.actorId || log.actor || '',
      log.beforeState ? JSON.stringify(log.beforeState) : '',
      log.afterState ? JSON.stringify(log.afterState) : '',
    ]);
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputStyle = {
    border: `1px solid ${C.outlineVariant}`,
    borderRadius: '2px',
    backgroundColor: C.surfaceContainerLowest,
    padding: '6px 12px',
    fontFamily: 'Inter',
    fontSize: '14px',
    color: C.onSurface,
    outline: 'none',
  };

  /* ── Full-page layout (overrides sidebar layout for audit page) ── */
  return (
    <div style={{
      backgroundColor: C.bg,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* ── TopNavBar (horizontal links, as per Stitch design) ── */}
      <header style={{
        backgroundColor: C.surfaceContainerLowest,
        borderBottom: `1px solid ${C.outlineVariant}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', maxWidth: '1440px', margin: '0 auto',
          padding: '0 32px', height: '64px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '22px', letterSpacing: '-0.01em', color: C.primary }}>
              Relocation Portal
            </span>
          </div>
          {/* Nav + Sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <nav style={{ display: 'flex', gap: '0', height: '64px' }}>
              {[
                { label: 'Dashboard', to: '/decisions' },
                { label: 'Relocations', to: '/decisions' },
                { label: 'Resources', to: '#' },
                { label: 'Reports', to: '/audit-logs' },
              ].map(({ label, to }) => {
                const isActive = label === 'Reports';
                return (
                  <a
                    key={label}
                    href={to === '#' ? '#' : undefined}
                    onClick={e => { if (to !== '#') { e.preventDefault(); navigate(to); } }}
                    style={{
                      height: '64px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 8px',
                      textDecoration: 'none',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? C.primary : C.onSurfaceVariant,
                      borderBottom: isActive ? `2px solid ${C.primary}` : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                      boxSizing: 'border-box',
                    }}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${C.outlineVariant}`, paddingLeft: '24px' }}>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter', fontWeight: '600', fontSize: '14px',
                  color: C.primary, padding: '6px 12px', borderRadius: '2px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                Sign Out
              </button>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: C.surfaceVariant, border: `1px solid ${C.outlineVariant}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', color: C.primary,
                overflow: 'hidden',
              }}>
                {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Header with filters ── */}
      <div style={{
        backgroundColor: C.surfaceContainerLowest,
        borderBottom: `1px solid ${C.outlineVariant}`,
        padding: '16px 32px',
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '22px', letterSpacing: '-0.01em', color: C.onSurface }}>
                System Audit Log
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '2px 8px',
                backgroundColor: C.surfaceVariant,
                color: C.onSurfaceVariant,
                border: `1px solid ${C.outlineVariant}`,
                borderRadius: '2px',
                fontFamily: 'Inter', fontSize: '12px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                Read-Only
              </span>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                border: `1px solid ${C.outlineVariant}`,
                borderRadius: '2px',
                backgroundColor: C.surfaceContainerLowest,
                color: C.onSurface,
                fontFamily: 'Inter', fontWeight: '600', fontSize: '14px',
                cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
                opacity: filtered.length === 0 ? 0.6 : 1,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              Export CSV
            </button>
          </div>

          {/* Filter bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            {/* Entity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>Entity</label>
              <select
                value={filters.entity}
                onChange={e => setFilters(f => ({ ...f, entity: e.target.value }))}
                style={{ ...inputStyle, width: '192px' }}
              >
                <option value="">All Entities</option>
                {entityTypes.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Actor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>Actor</label>
              <input
                type="text"
                placeholder="Search actor ID or name"
                value={filters.actor}
                onChange={e => setFilters(f => ({ ...f, actor: e.target.value }))}
                style={{ ...inputStyle, width: '256px' }}
              />
            </div>

            {/* Date Range */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>Date Range</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} style={inputStyle} />
                <span style={{ color: C.onSurfaceVariant }}>-</span>
                <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            <button
              onClick={clearFilters}
              style={{
                padding: '6px 16px',
                backgroundColor: C.surfaceContainerLow,
                border: `1px solid ${C.outlineVariant}`,
                borderRadius: '2px',
                color: C.onSurface,
                fontFamily: 'Inter', fontWeight: '600', fontSize: '14px',
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ flex: 1, padding: '24px 32px', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

          {loading ? (
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: '4px', overflow: 'hidden' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ height: '52px', borderBottom: `1px solid ${C.outlineVariant}`, backgroundColor: i % 2 === 0 ? C.surfaceContainerLow : C.surface, opacity: 1 - i * 0.1 }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ backgroundColor: C.errorContainer, border: `1px solid ${C.hairline}`, borderRadius: '4px', padding: '32px', textAlign: 'center' }}>
              <p style={{ color: C.error, fontFamily: 'Inter', fontWeight: '600', marginBottom: '12px' }}>{error}</p>
              <button onClick={fetchLogs} style={{ backgroundColor: C.primaryContainer, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Inter', fontWeight: '600' }}>Retry</button>
            </div>
          ) : (
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: '4px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: C.surfaceContainerLowest, borderBottom: `1px solid ${C.outlineVariant}` }}>
                    <th style={thStyle}>{ }</th>
                    <th style={thStyle}>TIMESTAMP (UTC)</th>
                    <th style={thStyle}>ACTION</th>
                    <th style={thStyle}>ENTITY</th>
                    <th style={thStyle}>ENTITY ID</th>
                    <th style={thStyle}>ACTOR</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: C.onSurfaceVariant, fontFamily: 'Inter', fontSize: '14px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', color: C.outlineVariant }}>search_off</span>
                        No audit logs match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(log => (
                      <AuditRow
                        key={log.id}
                        log={log}
                        isExpanded={expandedId === log.id}
                        onToggle={() => setExpandedId(prev => prev === log.id ? null : log.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 16px',
                borderTop: `1px solid ${C.outlineVariant}`,
                backgroundColor: C.surfaceContainerLowest,
              }}>
                <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>
                  Showing 1 to {filtered.length} of {filtered.length} entries
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <PagBtn label="Prev" disabled />
                  <PagBtn label="1" active />
                  <PagBtn label="Next" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Audit row with expandable before/after state ── */
function AuditRow({ log, isExpanded, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const actionBadge = getActionBadge(log.action);
  const actionStr = (log.action || '—').toUpperCase();
  const entityVal = log.entityType || log.entity || '—';
  const entityId = String(log.entityId || log.entity_id || '—');
  const actorVal = String(log.actorId || log.actor || 'System');
  const isDelete = actionStr === 'DELETE' || actionStr === 'REJECT';

  return (
    <>
      <tr
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: 'pointer',
          backgroundColor: hovered ? '#fafaf9' : '#ffffff',
          transition: 'background-color 0.2s ease',
          borderBottom: `1px solid ${C.outlineVariant}`,
        }}
      >
        <td style={{ padding: '12px 16px', color: C.onSurfaceVariant, width: '40px' }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', display: 'block', transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'none' }}
          >
            expand_more
          </span>
        </td>
        <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant, whiteSpace: 'nowrap' }}>
          {formatTs(log.timestamp)}
        </td>
        <td style={{ padding: '12px 16px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 6px',
            backgroundColor: actionBadge.bg,
            color: actionBadge.color,
            border: `1px solid ${actionBadge.border}`,
            borderRadius: '2px',
            fontFamily: 'Inter', fontSize: '12px', fontWeight: '400',
          }}>
            {actionStr}
          </span>
        </td>
        <td style={{ padding: '12px 16px', fontFamily: 'Inter', fontSize: '14px', color: C.onSurface }}>{entityVal}</td>
        <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant }}>{String(entityId)}</td>
        <td style={{ padding: '12px 16px', fontFamily: 'Inter', fontSize: '14px', color: C.onSurface }}>{actorVal}</td>
      </tr>

      {/* Expanded before/after state */}
      {isExpanded && (
        <tr style={{ backgroundColor: C.surfaceContainerLowest, borderBottom: `1px solid ${C.outlineVariant}` }}>
          <td colSpan={6} style={{ padding: 0 }}>
            <div style={{
              display: 'flex', gap: '24px',
              padding: '16px 24px',
              marginLeft: '40px',
              borderLeft: `4px solid ${isDelete ? C.error : C.primaryContainer}`,
            }}>
              {/* Before */}
              <div style={{ flex: 1, border: `1px solid ${C.outlineVariant}`, borderRadius: '2px', backgroundColor: C.surface, overflow: 'hidden' }}>
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${C.outlineVariant}`, backgroundColor: C.surfaceContainerLowest, fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Before
                </div>
                <pre style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: C.onSurfaceVariant, margin: 0, overflowX: 'auto', lineHeight: '1.6' }}>
                  {log.beforeState
                    ? JSON.stringify(log.beforeState, null, 2)
                    : <span style={{ fontStyle: 'italic', color: C.onSurfaceVariant }}>null</span>
                  }
                </pre>
              </div>
              {/* After */}
              <div style={{ flex: 1, border: `1px solid ${C.outlineVariant}`, borderRadius: '2px', backgroundColor: C.surface, overflow: 'hidden' }}>
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${C.outlineVariant}`, backgroundColor: C.surfaceContainerLowest, fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  After
                </div>
                <pre style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: C.onSurfaceVariant, margin: 0, overflowX: 'auto', lineHeight: '1.6' }}>
                  {log.afterState
                    ? JSON.stringify(log.afterState, null, 2)
                    : (actionStr === 'DELETE' ? <span style={{ fontStyle: 'italic' }}>deleted</span> : <span style={{ fontStyle: 'italic' }}>null</span>)
                  }
                </pre>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const thStyle = {
  padding: '8px 16px',
  fontFamily: 'Inter',
  fontSize: '12px',
  fontWeight: '400',
  color: '#42474f',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

function PagBtn({ label, active, disabled }) {
  return (
    <button
      disabled={disabled}
      style={{
        padding: '2px 8px',
        border: active ? `1px solid #054471` : `1px solid #c2c7d0`,
        borderRadius: '2px',
        backgroundColor: active ? '#2a5c8a' : '#ffffff',
        color: active ? '#afd4ff' : disabled ? '#c2c7d0' : '#1a1c1f',
        fontFamily: 'Inter', fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}