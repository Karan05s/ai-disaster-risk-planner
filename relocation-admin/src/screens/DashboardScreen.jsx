import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary, getDecisions } from '../api/client';

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

const RISK_COLORS = {
  CRITICAL: { bg: '#ffdad6', color: '#ba1a1a', icon: 'warning' },
  HIGH:     { bg: '#fff3e0', color: '#e65100', icon: 'error' },
  MEDIUM:   { bg: 'rgba(119,82,1,0.1)', color: '#775201', icon: 'info' },
  LOW:      { bg: '#e7e8ec', color: '#42474f', icon: 'check_circle' },
};

const STATUS_COLORS = {
  PENDING:    { bg: 'rgba(119,82,1,0.1)', color: '#775201' },
  APPROVED:   { bg: 'rgba(42,92,138,0.1)', color: '#2a5c8a' },
  OVERRIDDEN: { bg: '#e7e8ec', color: '#42474f' },
  REJECTED:   { bg: '#ffdad6', color: '#ba1a1a' },
};

const PRIORITY_LABELS = {
  IMMEDIATE: 'Immediate (P1)',
  SHORT_TERM: 'Short Term (P2)',
  MEDIUM_TERM: 'Medium Term (P3)',
};

export function DashboardScreen() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, decisions] = await Promise.all([
        getDashboardSummary().catch(() => null),
        getDecisions().catch(() => []),
      ]);
      setSummary(sum);
      setRecentDecisions(decisions.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '22px', color: C.onSurface, marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: '14px', color: C.onSurfaceVariant }}>
            Loading system overview…
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`,
              borderRadius: '4px', height: '120px', opacity: 1 - i * 0.15,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error && !summary) {
    return (
      <div>
        <h1 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '22px', color: C.onSurface, marginBottom: '16px' }}>
          Dashboard
        </h1>
        <div style={{ backgroundColor: C.errorContainer, border: `1px solid ${C.hairline}`, borderRadius: '4px', padding: '24px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: C.error, display: 'block', marginBottom: '8px' }}>error_outline</span>
          <p style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.error, marginBottom: '12px' }}>{error}</p>
          <button onClick={fetchData} style={{ backgroundColor: C.primaryContainer, color: '#fff', border: 'none', borderRadius: '2px', padding: '8px 16px', fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Villages',
      value: summary?.totalVillages ?? '—',
      icon: 'location_city',
      iconBg: 'rgba(42,92,138,0.1)',
      iconColor: C.primaryContainer,
    },
    {
      label: 'Pending Decisions',
      value: summary?.pendingDecisions ?? '—',
      icon: 'pending_actions',
      iconBg: 'rgba(119,82,1,0.1)',
      iconColor: '#775201',
      highlight: (summary?.pendingDecisions || 0) > 0,
    },
    {
      label: 'Relocation Sites',
      value: summary?.totalRelocationSites ?? '—',
      icon: 'home_work',
      iconBg: 'rgba(42,92,138,0.1)',
      iconColor: C.primaryContainer,
    },
    {
      label: 'Sites Over Capacity',
      value: summary?.sitesOverCapacity ?? '—',
      icon: 'warning',
      iconBg: summary?.sitesOverCapacity > 0 ? 'rgba(186,26,26,0.08)' : 'rgba(42,92,138,0.1)',
      iconColor: summary?.sitesOverCapacity > 0 ? C.error : C.primaryContainer,
      highlight: (summary?.sitesOverCapacity || 0) > 0,
    },
  ];

  const riskLevels = summary?.villagesByRiskLevel || {};
  const riskTotal = Object.values(riskLevels).reduce((a, b) => a + b, 0) || 1;

  const decisionStatuses = summary?.decisionsByStatus || {};
  const decisionTotal = Object.values(decisionStatuses).reduce((a, b) => a + b, 0) || 1;

  const priorityLevels = summary?.villagesByPriorityLevel || {};
  const priorityTotal = Object.values(priorityLevels).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '22px', lineHeight: '32px', letterSpacing: '-0.01em', color: C.onSurface, marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', color: C.onSurfaceVariant }}>
          System overview and key performance indicators.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {kpiCards.map(card => (
          <div key={card.label} style={{
            backgroundColor: C.surface,
            border: `1px solid ${card.highlight ? 'rgba(186,26,26,0.2)' : C.hairline}`,
            borderRadius: '4px',
            padding: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            transition: 'border-color 0.2s',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              backgroundColor: card.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: card.iconColor }}>{card.icon}</span>
            </div>
            <div>
              <p style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {card.label}
              </p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '28px', fontWeight: '400', color: card.highlight ? C.error : C.onSurface, lineHeight: '1.1' }}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Breakdown Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Risk Distribution */}
        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.hairline}`, borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.onSurface, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>assessment</span>
            Risk Distribution
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
              const count = riskLevels[level] || 0;
              const pct = Math.round((count / riskTotal) * 100);
              const rc = RISK_COLORS[level] || RISK_COLORS.LOW;
              return (
                <div key={level}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter', fontSize: '13px', color: C.onSurface }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: rc.color, display: 'inline-block' }} />
                      {level.charAt(0) + level.slice(1).toLowerCase()}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: C.surfaceVariant, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: rc.color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decision Status */}
        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.hairline}`, borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.onSurface, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>task_alt</span>
            Decision Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['PENDING', 'APPROVED', 'OVERRIDDEN', 'REJECTED'].map(status => {
              const count = decisionStatuses[status] || 0;
              const pct = Math.round((count / decisionTotal) * 100);
              const sc = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter', fontSize: '13px', color: C.onSurface }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 6px', borderRadius: '2px', backgroundColor: sc.bg, color: sc.color, fontFamily: 'Inter', fontSize: '11px', fontWeight: '600' }}>
                        {status}
                      </span>
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant }}>
                      {count}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: C.surfaceVariant, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: sc.color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.hairline}`, borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.onSurface, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>priority_high</span>
            Priority Distribution
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['IMMEDIATE', 'SHORT_TERM', 'MEDIUM_TERM'].map(level => {
              const count = priorityLevels[level] || 0;
              const pct = Math.round((count / priorityTotal) * 100);
              const colors = {
                IMMEDIATE: '#ba1a1a',
                SHORT_TERM: '#e65100',
                MEDIUM_TERM: '#775201',
              };
              return (
                <div key={level}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter', fontSize: '13px', color: C.onSurface }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors[level], display: 'inline-block' }} />
                      {PRIORITY_LABELS[level] || level}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: C.surfaceVariant, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colors[level], borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Decisions ── */}
      <div style={{ backgroundColor: C.surface, border: `1px solid ${C.hairline}`, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${C.hairline}` }}>
          <h2 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.onSurface, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
            Recent Decisions
          </h2>
          <button
            onClick={() => navigate('/decisions')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter', fontWeight: '600', fontSize: '13px', color: C.primary,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            View all
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
          </button>
        </div>

        {recentDecisions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: C.onSurfaceVariant, fontFamily: 'Inter', fontSize: '14px' }}>
            No decisions found.
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{
              display: 'flex', alignItems: 'center', padding: '8px 20px',
              backgroundColor: C.bg, borderBottom: `1px solid ${C.hairline}`,
              fontFamily: 'Inter', fontSize: '12px', fontWeight: '600',
              color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>Village</div>
              <div style={{ width: '100px' }}>Risk</div>
              <div style={{ width: '130px' }}>Status</div>
              <div style={{ width: '40px' }} />
            </div>
            {recentDecisions.map((d, idx) => {
              const risk = RISK_COLORS[d.riskLevel?.toUpperCase()] || RISK_COLORS.LOW;
              const status = STATUS_COLORS[d.status?.toUpperCase()] || STATUS_COLORS.PENDING;
              return (
                <div
                  key={d.id}
                  onClick={() => navigate(`/decisions/${d.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '12px 20px',
                    borderBottom: idx < recentDecisions.length - 1 ? `1px solid ${C.hairline}` : 'none',
                    cursor: 'pointer', transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <span style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.onSurface, display: 'block' }}>
                      {d.villageName || d.villageId}
                    </span>
                    <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>
                      {d.villageDistrict || d.district || '—'}
                    </span>
                  </div>
                  <div style={{ width: '100px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '2px',
                      backgroundColor: risk.bg, color: risk.color,
                      fontFamily: 'Inter', fontSize: '12px', fontWeight: '600',
                    }}>
                      <span style={{ fontSize: '10px' }}>●</span>
                      {(d.riskLevel || '—').charAt(0) + (d.riskLevel || '—').slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div style={{ width: '130px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '2px',
                      backgroundColor: status.bg, color: status.color,
                      fontFamily: 'Inter', fontSize: '12px', fontWeight: '600',
                    }}>
                      <span style={{ fontSize: '10px' }}>●</span>
                      {d.status || '—'}
                    </span>
                  </div>
                  <div style={{ width: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.onSurfaceVariant }}>chevron_right</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
