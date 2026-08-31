import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecisions, getVillageById, setSimulateError } from '../api/client';

/* ──── Stitch color tokens ──── */
const C = {
  bg: '#f9f9fd',
  surface: '#ffffff',
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
  onPrimary: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  error: '#ba1a1a',
  tertiaryFixed: '#ffdeac',
  onTertiaryFixedVariant: '#604100',
};

/* ── Risk helpers ── */
function getRiskBadge(level) {
  const map = {
    CRITICAL: { bg: C.errorContainer, color: C.onErrorContainer, label: 'CRITICAL', icon: 'warning' },
    HIGH:     { bg: C.tertiaryFixed, color: C.onTertiaryFixedVariant, label: 'ELEVATED', icon: 'error' },
    MEDIUM:   { bg: C.surfaceContainer, color: C.onSurface, label: 'ELEVATED', icon: 'error' },
    LOW:      { bg: C.surfaceContainer, color: C.onSurface, label: 'STABLE', icon: 'info' },
  };
  return map[level?.toUpperCase()] || { bg: C.surfaceContainerHigh, color: C.onSurfaceVariant, label: level || '—', icon: 'info' };
}

function getStatusBadgeStyle(status) {
  const map = {
    PENDING:    { bg: 'rgba(119,82,1,0.1)', color: '#775201' },
    APPROVED:   { bg: 'rgba(42,92,138,0.1)', color: '#2a5c8a' },
    OVERRIDDEN: { bg: C.surfaceContainerHigh, color: C.onSurfaceVariant },
    REJECTED:   { bg: C.errorContainer, color: C.error },
  };
  return map[status?.toUpperCase()] || { bg: C.surfaceContainerHigh, color: C.onSurfaceVariant };
}

function priorityLabel(level) {
  return { IMMEDIATE: 'P-1', SHORT_TERM: 'P-2', MEDIUM_TERM: 'P-3' }[level?.toUpperCase()] || level || '—';
}

function priorityFullLabel(level) {
  return { IMMEDIATE: 'High Priority', SHORT_TERM: 'Med Priority', MEDIUM_TERM: 'Low Priority' }[level?.toUpperCase()] || level || '—';
}

function riskLabel(level) {
  return { CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Moderate', LOW: 'Low' }[level?.toUpperCase()] || level || '—';
}

function statusLabel(status) {
  return { PENDING: 'Pending', APPROVED: 'Approved', OVERRIDDEN: 'Overridden', REJECTED: 'Rejected' }[status?.toUpperCase()] || status || '—';
}

/* ──────────────────────────── */

export function QueueScreen() {
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulatingError, setSimulatingError] = useState(false);

  // View mode: 'list' | 'grid'
  const [viewMode, setViewMode] = useState('list');

  // Quick filter tabs (grid view)
  const [quickFilter, setQuickFilter] = useState('all');

  // Search
  const [search, setSearch] = useState('');

  // Dropdown filters (list view)
  const [filters, setFilters] = useState({ status: '', riskLevel: '', priorityLevel: '', district: '' });

  const fetchDecisions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDecisions();
      const enriched = await Promise.all(data.map(async (d) => {
        const village = await getVillageById(d.villageId).catch(() => null);
        return {
          ...d,
          villageName: village?.name || d.villageId,
          villageDistrict: village?.district || d.district || 'Unknown',
          population: village?.population,
          riskScore: village?.riskScore,
        };
      }));
      setDecisions(enriched);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDecisions(); }, []);

  const handleToggleError = () => {
    const next = !simulatingError;
    setSimulatingError(next);
    setSimulateError(next);
    fetchDecisions();
  };

  /* ── Filtering ── */
  const applyFilters = (d) => {
    if (filters.status && d.status !== filters.status) return false;
    if (filters.riskLevel && d.riskLevel !== filters.riskLevel) return false;
    if (filters.priorityLevel && d.priorityLevel !== filters.priorityLevel) return false;
    if (filters.district && d.villageDistrict !== filters.district) return false;
    return true;
  };

  const applyQuickFilter = (d) => {
    if (quickFilter === 'critical') return d.riskLevel === 'CRITICAL';
    if (quickFilter === 'pending') return d.status === 'PENDING';
    return true;
  };

  const applySearch = (d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (d.villageName || '').toLowerCase().includes(q) ||
      (d.villageDistrict || '').toLowerCase().includes(q)
    );
  };

  const filteredDecisions = decisions.filter(d =>
    applyFilters(d) && applyQuickFilter(d) && applySearch(d)
  );

  const districts = [...new Set(decisions.map(d => d.villageDistrict).filter(Boolean))];
  const clearFilters = () => setFilters({ status: '', riskLevel: '', priorityLevel: '', district: '' });

  /* ── Shared styles ── */
  const selectStyle = {
    width: '100%',
    backgroundColor: C.surface,
    border: `1px solid ${C.outlineVariant}`,
    borderRadius: '2px',
    padding: '6px 8px',
    fontFamily: 'Inter', fontSize: '14px', color: C.onSurface,
    outline: 'none', cursor: 'pointer',
  };
  const labelStyle = {
    fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px',
    color: C.onSurfaceVariant, marginBottom: '4px', display: 'block',
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '22px', color: C.onSurface, marginBottom: '4px' }}>
            Decisions Queue
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: '14px', color: C.onSurfaceVariant }}>
            Manage and prioritize active relocation requests.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`,
              borderRadius: '2px', height: '60px', opacity: 1 - i * 0.15,
            }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div>
        <h1 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '22px', color: C.onSurface, marginBottom: '16px' }}>
          Decisions Queue
        </h1>
        <div style={{ backgroundColor: C.errorContainer, border: `1px solid ${C.hairline}`, borderRadius: '4px', padding: '24px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: C.error, display: 'block', marginBottom: '8px' }}>error_outline</span>
          <p style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.error, marginBottom: '12px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={fetchDecisions} style={{ backgroundColor: C.primaryContainer, color: '#fff', border: 'none', borderRadius: '2px', padding: '8px 16px', fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Retry</button>
            {simulatingError && (
              <button onClick={handleToggleError} style={{ backgroundColor: C.surface, color: C.primary, border: `1px solid ${C.outlineVariant}`, borderRadius: '2px', padding: '8px 16px', fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Disable Error Simulation</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '22px', lineHeight: '32px', letterSpacing: '-0.01em', color: C.onSurface, marginBottom: '4px' }}>
            Decisions Queue
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', color: C.onSurfaceVariant }}>
            {viewMode === 'grid'
              ? 'Manage and prioritize active relocation requests.'
              : 'Review and action pending village relocation recommendations.'}
          </p>
        </div>
        {viewMode === 'grid' && (
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: C.primaryContainer, color: C.onPrimary,
            border: `1px solid ${C.hairline}`,
            borderRadius: '2px', padding: '8px 16px',
            fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            New Request
          </button>
        )}
      </div>

      {/* ── GRID VIEW: Quick tab bar + search + toggle ── */}
      {viewMode === 'grid' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: C.surface, padding: '8px',
          borderRadius: '2px', border: `1px solid ${C.hairline}`,
          marginBottom: '16px',
        }}>
          {/* Quick filter tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'critical', label: 'Critical' },
              { key: 'pending', label: 'Pending Review' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setQuickFilter(key)}
                style={{
                  padding: '4px 16px', borderRadius: '2px',
                  fontFamily: 'Inter', fontSize: '14px',
                  color: C.onSurfaceVariant,
                  border: `1px solid ${C.hairline}`,
                  backgroundColor: quickFilter === key ? C.bg : C.surface,
                  cursor: 'pointer', fontWeight: quickFilter === key ? '600' : '400',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search + view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{
                position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '18px', color: C.onSurfaceVariant,
              }}>search</span>
              <input
                type="text"
                placeholder="Search villages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  paddingLeft: '32px', paddingRight: '16px', paddingTop: '4px', paddingBottom: '4px',
                  borderRadius: '2px', fontFamily: 'Inter', fontSize: '14px',
                  backgroundColor: C.surface, border: `1px solid ${C.hairline}`,
                  color: C.onSurface, outline: 'none', width: '200px',
                }}
              />
            </div>
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        </div>
      )}

      {/* ── LIST VIEW: Filter bar ── */}
      {viewMode === 'list' && (
        <div style={{
          backgroundColor: C.surface,
          borderBottom: `1px solid ${C.hairline}`,
          padding: '16px',
          marginBottom: '24px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '140px' }}>
            <label style={labelStyle}>Status</label>
            <select style={selectStyle} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="OVERRIDDEN">Overridden</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '140px' }}>
            <label style={labelStyle}>Risk Level</label>
            <select style={selectStyle} value={filters.riskLevel} onChange={e => setFilters(f => ({ ...f, riskLevel: e.target.value }))}>
              <option value="">All Risks</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '140px' }}>
            <label style={labelStyle}>Priority</label>
            <select style={selectStyle} value={filters.priorityLevel} onChange={e => setFilters(f => ({ ...f, priorityLevel: e.target.value }))}>
              <option value="">All Priorities</option>
              <option value="IMMEDIATE">Priority 1</option>
              <option value="SHORT_TERM">Priority 2</option>
              <option value="MEDIUM_TERM">Priority 3</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '140px' }}>
            <label style={labelStyle}>District</label>
            <select style={selectStyle} value={filters.district} onChange={e => setFilters(f => ({ ...f, district: e.target.value }))}>
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* List view toggle + clear */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '34px' }}>
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            <button onClick={clearFilters} style={{ background: 'none', border: 'none', fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.primary, cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* ── Dev: error simulation ── */}
      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={handleToggleError}
          style={{
            fontSize: '11px', fontFamily: 'Inter', padding: '3px 8px', borderRadius: '2px',
            backgroundColor: simulatingError ? C.errorContainer : C.surfaceContainerLow,
            color: simulatingError ? C.error : C.onSurfaceVariant,
            border: `1px solid ${C.outlineVariant}`, cursor: 'pointer',
          }}
        >
          {simulatingError ? '⚠ Error sim ON — click to disable' : 'Simulate error'}
        </button>
      </div>

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        filteredDecisions.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.onSurfaceVariant, fontFamily: 'Inter', fontSize: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', color: C.outlineVariant }}>search_off</span>
            No decisions match your filters.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {filteredDecisions.map(d => (
              <GridCard key={d.id} decision={d} onClick={() => navigate(`/decisions/${d.id}`)} />
            ))}
          </div>
        )
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <>
          <div style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: '2px', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'flex', alignItems: 'center', padding: '8px 16px',
              backgroundColor: C.bg, borderBottom: `1px solid ${C.hairline}`,
              fontFamily: 'Inter', fontSize: '12px', fontWeight: '600',
              color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>Village / District</div>
              <div style={{ width: '130px' }}>Risk Level</div>
              <div style={{ width: '110px' }}>Priority</div>
              <div style={{ width: '130px' }}>Status</div>
              <div style={{ width: '40px' }} />
            </div>

            {filteredDecisions.length === 0 ? (
              <div style={{ padding: '48px 16px', textAlign: 'center', color: C.onSurfaceVariant, fontFamily: 'Inter', fontSize: '14px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', color: C.outlineVariant }}>search_off</span>
                No decisions match your filters.
              </div>
            ) : (
              filteredDecisions.map((d, idx) => (
                <ListRow
                  key={d.id}
                  decision={d}
                  isLast={idx === filteredDecisions.length - 1}
                  onClick={() => navigate(`/decisions/${d.id}`)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 4px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant }}>
              Showing 1–{filteredDecisions.length} of {filteredDecisions.length}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled style={{ padding: '4px 12px', border: `1px solid ${C.outlineVariant}`, borderRadius: '2px', backgroundColor: C.surface, color: C.onSurfaceVariant, fontFamily: 'Inter', fontSize: '14px', cursor: 'not-allowed', opacity: 0.5 }}>Prev</button>
              <button style={{ padding: '4px 12px', border: `1px solid ${C.outlineVariant}`, borderRadius: '2px', backgroundColor: C.surface, color: C.onSurface, fontFamily: 'Inter', fontSize: '14px', cursor: 'pointer' }}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── View toggle button component ── */
function ViewToggle({ viewMode, onChange }) {
  return (
    <div style={{
      display: 'flex', border: `1px solid ${C.hairline}`,
      borderRadius: '2px', overflow: 'hidden',
    }}>
      <button
        onClick={() => onChange('list')}
        title="List View"
        style={{
          padding: '4px 8px', border: 'none', cursor: 'pointer',
          backgroundColor: viewMode === 'list' ? C.surfaceContainer : C.surface,
          color: viewMode === 'list' ? C.primary : C.onSurfaceVariant,
          display: 'flex', alignItems: 'center',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_list</span>
      </button>
      <button
        onClick={() => onChange('grid')}
        title="Grid View"
        style={{
          padding: '4px 8px', border: 'none', borderLeft: `1px solid ${C.hairline}`, cursor: 'pointer',
          backgroundColor: viewMode === 'grid' ? C.surfaceContainer : C.surface,
          color: viewMode === 'grid' ? C.primary : C.onSurfaceVariant,
          display: 'flex', alignItems: 'center',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '18px', fontVariationSettings: viewMode === 'grid' ? "'FILL' 1" : "'FILL' 0" }}
        >
          grid_view
        </span>
      </button>
    </div>
  );
}

/* ── Grid card (Stitch grid design) ── */
function GridCard({ decision, onClick }) {
  const [hovered, setHovered] = useState(false);
  const riskBadge = getRiskBadge(decision.riskLevel);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? C.bg : C.surface,
        borderRadius: '4px',
        border: `1px solid ${C.hairline}`,
        padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
    >
      {/* Card header: name + risk badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{
            fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', lineHeight: '24px',
            color: hovered ? C.primary : C.onSurface,
            transition: 'color 0.15s',
          }}>
            {decision.villageName || decision.villageId}
          </h3>
          <p style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant, marginTop: '4px' }}>
            {decision.villageDistrict || '—'}
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '4px 8px', borderRadius: '2px',
          backgroundColor: riskBadge.bg, color: riskBadge.color,
          fontFamily: 'Inter', fontSize: '12px', fontWeight: '400',
          flexShrink: 0,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{riskBadge.icon}</span>
          {riskBadge.label}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
        <div>
          <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant, display: 'block' }}>Pop. Affected</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurface }}>
            {decision.population ? decision.population.toLocaleString() : '—'}
          </span>
        </div>
        <div>
          <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant, display: 'block' }}>Status</span>
          <span style={{ fontFamily: 'Inter', fontSize: '13px', color: C.onSurface }}>
            {statusLabel(decision.status)}
          </span>
        </div>
      </div>

      {/* Footer: priority + review link */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '16px', borderTop: `1px solid ${C.hairline}`,
        marginTop: 'auto',
      }}>
        <span style={{
          backgroundColor: C.surfaceVariant, color: C.onSurface,
          fontFamily: 'Inter', fontSize: '12px',
          padding: '4px 8px', borderRadius: '2px',
        }}>
          {priorityFullLabel(decision.priorityLevel)}
        </span>
        <span style={{
          color: C.primary, fontFamily: 'Inter', fontWeight: '600', fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '4px',
          transform: hovered ? 'translateX(4px)' : 'translateX(0)',
          transition: 'transform 0.15s',
        }}>
          Review
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
        </span>
      </div>
    </div>
  );
}

/* ── List row (Stitch list design) ── */
function ListRow({ decision, isLast, onClick }) {
  const [hovered, setHovered] = useState(false);
  const riskStyle = getRiskListBadge(decision.riskLevel);
  const statusStyle = getStatusBadgeStyle(decision.status);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', padding: '16px',
        borderBottom: isLast ? 'none' : `1px solid ${C.hairline}`,
        backgroundColor: hovered ? C.bg : C.surface,
        outline: hovered ? `2px solid ${C.primaryContainer}` : 'none',
        outlineOffset: '-2px',
        cursor: 'pointer', transition: 'background-color 0.15s',
      }}
    >
      <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.onSurface }}>
          {decision.villageName || decision.villageId}
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>
          {decision.villageDistrict || '—'}
        </span>
      </div>
      <div style={{ width: '130px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '2px', fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', ...riskStyle }}>
          <span style={{ marginRight: '4px', fontSize: '10px' }}>●</span>
          {riskLabel(decision.riskLevel)}
        </span>
      </div>
      <div style={{ width: '110px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '2px', border: `1px solid ${C.outlineVariant}`, backgroundColor: C.surface, color: C.onSurface, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          {priorityLabel(decision.priorityLevel)}
        </span>
      </div>
      <div style={{ width: '130px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '2px', fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', ...statusStyle }}>
          <span style={{ marginRight: '4px', fontSize: '10px' }}>●</span>
          {statusLabel(decision.status)}
        </span>
      </div>
      <div style={{ width: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.onSurfaceVariant }}>chevron_right</span>
      </div>
    </div>
  );
}

function getRiskListBadge(level) {
  const map = {
    CRITICAL: { background: '#ffdad6', color: '#ba1a1a' },
    HIGH:     { background: '#fff3e0', color: '#e65100' },
    MEDIUM:   { background: 'rgba(119,82,1,0.1)', color: '#775201' },
    LOW:      { background: '#e7e8ec', color: '#42474f' },
  };
  return map[level?.toUpperCase()] || { background: '#e7e8ec', color: '#42474f' };
}