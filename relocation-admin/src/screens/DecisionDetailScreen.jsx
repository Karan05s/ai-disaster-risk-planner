import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getDecisionById, getVillageById, getSiteCapacity,
  approveDecision, overrideDecision, rejectDecision, getRelocationSites, getAuditLogs, getNearbySites,
} from '../api/client';

/* ──── Stitch color tokens ──── */
const C = {
  bg: '#f9f9fd',
  surface: '#ffffff',
  surfaceContainer: '#ededf2',
  surfaceContainerLow: '#f3f3f8',
  surfaceVariant: '#e2e2e6',
  onSurface: '#1a1c1f',
  onSurfaceVariant: '#42474f',
  outlineVariant: '#c2c7d0',
  hairline: '#E5E3DF',
  primary: '#054471',
  primaryContainer: '#2a5c8a',
  errorContainer: '#ffdad6',
  error: '#ba1a1a',
  tertiary: '#775201',
  tertiaryFixed: '#ffdeac',
};

function getRiskBadgeStyle(level) {
  const map = {
    CRITICAL: { bg: '#ffdad6', color: '#ba1a1a', label: 'Critical Risk', icon: 'warning' },
    HIGH:     { bg: '#ffdad6', color: '#ba1a1a', label: 'High Risk',     icon: 'warning' },
    MEDIUM:   { bg: 'rgba(119,82,1,0.1)', color: '#775201', label: 'Medium Risk', icon: 'info' },
    LOW:      { bg: '#e7e8ec', color: '#42474f', label: 'Low Risk',      icon: 'check_circle' },
  };
  return map[level?.toUpperCase()] || { bg: '#e7e8ec', color: '#42474f', label: level || 'Unknown', icon: 'info' };
}

function getPriorityBadge(level) {
  const map = {
    IMMEDIATE:   { label: 'Priority 1' },
    SHORT_TERM:  { label: 'Priority 2' },
    MEDIUM_TERM: { label: 'Priority 3' },
  };
  return map[level?.toUpperCase()] || { label: level || '—' };
}

function getStatusLabel(status) {
  return {
    PENDING: 'Pending Authority Review',
    APPROVED: 'Approved',
    OVERRIDDEN: 'Overridden',
    REJECTED: 'Rejected',
  }[status?.toUpperCase()] || status;
}

function getStatusDotColor(status) {
  return {
    PENDING: C.tertiaryFixed,
    APPROVED: '#9ccaff',
    OVERRIDDEN: C.outlineVariant,
    REJECTED: C.error,
  }[status?.toUpperCase()] || C.outlineVariant;
}

export function DecisionDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [decision, setDecision] = useState(null);
  const [village, setVillage] = useState(null);
  const [site, setSite] = useState(null);
  const [sites, setSites] = useState([]);
  const [nearbySites, setNearbySites] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideForm, setOverrideForm] = useState({ siteId: '', overrideReason: '' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dec = await getDecisionById(id);
      const [vil, st, sitesList, nearby, logs] = await Promise.all([
        getVillageById(dec.villageId).catch(() => null),
        getSiteCapacity(dec.siteId).catch(() => null),
        getRelocationSites().catch(() => []),
        getNearbySites(dec.villageId, 50).catch(() => []),
        getAuditLogs().catch(() => []),
      ]);
      setDecision(dec);
      setVillage(vil);
      setSite(st);
      setSites(sitesList);
      setNearbySites(nearby);
      // Filter audit logs related to this decision
      const related = logs.filter(l =>
        String(l.entityId) === String(id) ||
        String(l.entity_id) === String(id) ||
        (l.entityType === 'DECISION' && String(l.entity_id) === String(id))
      );
      setAuditLogs(related.length > 0 ? related : logs.slice(0, 3));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    setActionError(null);
    setActionMsg(null);
    try {
      const updated = await approveDecision(id);
      setDecision(updated);
      setActionMsg('Decision approved successfully.');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverride = async () => {
    if (!overrideForm.overrideReason?.trim()) {
      setActionError('Override reason is required.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    setActionMsg(null);
    try {
      const updated = await overrideDecision(id, overrideForm);
      setDecision(updated);
      setShowOverride(false);
      setOverrideForm({ siteId: '', overrideReason: '' });
      setActionMsg('Decision overridden successfully.');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    setActionError(null);
    setActionMsg(null);
    try {
      const updated = await rejectDecision(id);
      setDecision(updated);
      setActionMsg('Decision rejected.');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const isActioned = decision?.status === 'APPROVED' || decision?.status === 'OVERRIDDEN' || decision?.status === 'REJECTED';
  const capacityPct = site ? Math.round((site.capacityUsed / site.capacityTotal) * 100) : 0;
  const isOverCapacity = capacityPct >= 100;
  const isNearCapacity = capacityPct >= 80 && !isOverCapacity;

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ width: '120px', height: '16px', backgroundColor: C.surfaceContainer, borderRadius: '2px', animation: 'pulse 1.5s infinite' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '80px', backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`,
              borderRadius: '2px', opacity: 1 - i * 0.2,
            }} />
          ))}
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px', fontFamily: 'Inter, sans-serif' }}>
        <button onClick={() => navigate('/decisions')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: C.onSurfaceVariant, fontFamily: 'Inter', fontSize: '14px', marginBottom: '24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to queue
        </button>
        <div style={{ backgroundColor: C.errorContainer, border: `1px solid ${C.hairline}`, borderRadius: '4px', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: C.error, fontFamily: 'Inter', fontWeight: '600', marginBottom: '12px' }}>{error}</p>
          <button onClick={fetchData} style={{
            backgroundColor: C.primaryContainer, color: '#fff', border: 'none',
            padding: '8px 16px', borderRadius: '2px', cursor: 'pointer',
            fontFamily: 'Inter', fontWeight: '600', fontSize: '14px',
          }}>Retry</button>
        </div>
      </div>
    );
  }

  const riskBadge = getRiskBadgeStyle(village?.riskLevel || decision?.riskLevel);
  const priorityBadge = getPriorityBadge(village?.priorityLevel || decision?.priorityLevel);

  return (
    <div style={{
      maxWidth: '1440px', margin: '0 auto',
      padding: '32px 24px',
      fontFamily: 'Inter, sans-serif',
      backgroundColor: C.bg,
      minHeight: '100vh',
    }}>
      {/* ── Breadcrumb ── */}
      <nav style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/decisions')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter', fontSize: '14px', color: C.onSurfaceVariant,
            padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.primary}
          onMouseLeave={e => e.currentTarget.style.color = C.onSurfaceVariant}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '4px' }}>arrow_back</span>
          Back to queue
        </button>
      </nav>

      {/* ── Page Header ── */}
      <header style={{
        marginBottom: '32px',
        borderBottom: `1px solid ${C.outlineVariant}`,
        paddingBottom: '24px',
      }}>
        <h1 style={{
          fontFamily: 'Inter', fontWeight: '600', fontSize: '22px',
          lineHeight: '32px', letterSpacing: '-0.01em', color: C.onSurface,
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        }}>
          Village: {village?.name || decision?.villageId}
          {/* Risk badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px',
            backgroundColor: riskBadge.bg,
            color: riskBadge.color,
            fontFamily: 'Inter', fontWeight: '400', fontSize: '12px',
            borderRadius: '2px',
            border: `1px solid ${riskBadge.color}22`,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>{riskBadge.icon}</span>
            {riskBadge.label}
          </span>
          {/* Priority badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px',
            backgroundColor: 'rgba(119,82,1,0.08)',
            color: '#775201',
            fontFamily: 'Inter', fontWeight: '400', fontSize: '12px',
            borderRadius: '2px',
            border: `1px solid rgba(119,82,1,0.2)`,
          }}>
            <span style={{ fontSize: '10px' }}>●</span>
            {priorityBadge.label}
          </span>
        </h1>
      </header>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Using CSS grid with responsive breakpoints via style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Vital Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <StatCard label="Population" value={village?.population?.toLocaleString() || '—'} mono valueColor={C.onSurface} />
              <StatCard label="Risk Score" value={village?.riskScore != null ? `${village.riskScore > 10 ? (village.riskScore / 10).toFixed(1) : village.riskScore} / 10` : '—'} mono valueColor={C.error} />
              <StatCard label="District" value={village?.district || decision?.district || '—'} valueColor={C.onSurface} />
            </div>

            {/* Recommended Site */}
            <section style={{ backgroundColor: C.surface, border: `1px solid ${C.hairline}`, borderRadius: '2px', padding: '24px' }}>
              <h2 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: C.onSurface, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>location_city</span>
                Recommended Site: {site?.name || decision?.siteId || '—'}
              </h2>

              {site ? (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>Capacity Utilisation</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurface }}>
                      {site.capacityUsed}/{site.capacityTotal} Units
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', backgroundColor: C.surfaceVariant, height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(capacityPct, 100)}%`,
                      height: '100%',
                      borderRadius: '4px',
                      backgroundColor: isOverCapacity ? C.error : isNearCapacity ? '#e65100' : C.primaryContainer,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  {(isNearCapacity || isOverCapacity) && (
                    <p style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant, marginTop: '8px' }}>
                      <span style={{ color: C.error, fontWeight: '600' }}>Warning:</span>{' '}
                      {isOverCapacity ? 'Exceeds maximum capacity.' : 'Approaching maximum capacity.'}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ fontFamily: 'Inter', fontSize: '14px', color: C.onSurfaceVariant }}>Site capacity data unavailable.</p>
              )}
            </section>

            {/* Decision Status */}
            <section style={{ backgroundColor: C.surface, border: `1px solid ${C.hairline}`, borderRadius: '2px', padding: '24px' }}>
              <h2 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: C.onSurface, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>pending_actions</span>
                Decision Status
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  backgroundColor: getStatusDotColor(decision?.status),
                  animation: decision?.status === 'PENDING' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', color: C.onSurface }}>
                  {getStatusLabel(decision?.status)}
                </span>
              </div>
              <p style={{
                fontFamily: 'Inter', fontSize: '14px', color: C.onSurfaceVariant,
                borderTop: `1px solid ${C.outlineVariant}`, paddingTop: '12px',
              }}>
                {decision?.status === 'PENDING'
                  ? `Awaiting final sign-off to initiate relocation protocol for ${village?.population?.toLocaleString() || '—'} individuals to ${site?.name || 'the recommended site'}.`
                  : decision?.status === 'APPROVED'
                  ? `Approved by ${decision?.decidedBy || 'Authority'} on ${decision?.decidedAt ? new Date(decision.decidedAt).toLocaleDateString() : '—'}.`
                  : decision?.status === 'OVERRIDDEN'
                  ? `Overridden. Reason: ${decision?.overrideReason || '—'}`
                  : `Status: ${getStatusLabel(decision?.status)}`
                }
              </p>
            </section>

            {/* Nearby Sites */}
            {nearbySites.length > 0 && (
              <section style={{ backgroundColor: C.surface, border: `1px solid ${C.hairline}`, borderRadius: '2px', padding: '24px' }}>
                <h2 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: C.onSurface, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>near_me</span>
                  Nearby Sites (within 50 km)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {nearbySites.slice(0, 5).map(ns => {
                    const nsPct = ns.capacityTotal ? Math.round(((ns.capacityUsed || 0) / ns.capacityTotal) * 100) : 0;
                    return (
                      <div key={ns.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '2px', border: `1px solid ${C.outlineVariant}`, backgroundColor: C.surfaceContainerLow }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: C.primaryContainer }}>home_work</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: '600', color: C.onSurface, display: 'block' }}>{ns.name || ns.id}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{ flex: 1, height: '4px', backgroundColor: C.surfaceVariant, borderRadius: '2px', overflow: 'hidden', maxWidth: '120px' }}>
                              <div style={{ width: `${Math.min(nsPct, 100)}%`, height: '100%', backgroundColor: nsPct >= 100 ? C.error : nsPct >= 80 ? '#e65100' : C.primaryContainer, borderRadius: '2px' }} />
                            </div>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: C.onSurfaceVariant }}>{nsPct}% used</span>
                          </div>
                        </div>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: C.onSurfaceVariant }}>
                          {ns.capacityTotal ? `${(ns.capacityTotal - (ns.capacityUsed || 0)).toLocaleString()} avail` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ position: 'sticky', top: '32px' }}>
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.hairline}`, borderRadius: '2px', padding: '24px' }}>
              <h2 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: C.onSurface, marginBottom: '16px' }}>
                Actions
              </h2>

              {/* Success / error messages */}
              {actionMsg && (
                <div style={{ backgroundColor: 'rgba(42,92,138,0.08)', border: `1px solid ${C.outlineVariant}`, borderRadius: '2px', padding: '8px 12px', marginBottom: '12px' }}>
                  <p style={{ fontFamily: 'Inter', fontSize: '12px', color: C.primaryContainer }}>{actionMsg}</p>
                </div>
              )}
              {actionError && (
                <div style={{ backgroundColor: C.errorContainer, border: `1px solid ${C.hairline}`, borderRadius: '2px', padding: '8px 12px', marginBottom: '12px' }}>
                  <p style={{ fontFamily: 'Inter', fontSize: '12px', color: C.error }}>{actionError}</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Approve button */}
                <button
                  disabled={isActioned || actionLoading}
                  onClick={handleApprove}
                  style={{
                    width: '100%',
                    backgroundColor: isActioned ? C.surfaceContainer : C.primaryContainer,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '12px 24px',
                    fontFamily: 'Inter', fontWeight: '600', fontSize: '14px',
                    cursor: isActioned ? 'not-allowed' : 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                    opacity: isActioned ? 0.6 : 1,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActioned) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { if (!isActioned) e.currentTarget.style.opacity = '1'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                  {actionLoading ? 'Processing…' : 'Approve Relocation'}
                </button>

                {/* Override button */}
                {!showOverride ? (
                  <button
                    disabled={isActioned || actionLoading}
                    onClick={() => { setShowOverride(true); setActionMsg(null); setActionError(null); }}
                    style={{
                      width: '100%',
                      backgroundColor: C.surface,
                      color: isActioned ? C.onSurfaceVariant : C.primary,
                      border: `1px solid ${C.hairline}`,
                      borderRadius: '2px',
                      padding: '12px 24px',
                      fontFamily: 'Inter', fontWeight: '600', fontSize: '14px',
                      cursor: isActioned ? 'not-allowed' : 'pointer',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                      opacity: isActioned ? 0.6 : 1,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit_note</span>
                    Override Site
                  </button>
                ) : (
                  <div style={{ border: `1px solid ${C.outlineVariant}`, borderRadius: '2px', padding: '16px', backgroundColor: C.surfaceContainerLow, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>
                      New Site
                      <select
                        value={overrideForm.siteId}
                        onChange={e => setOverrideForm(f => ({ ...f, siteId: e.target.value }))}
                        style={{
                          display: 'block', width: '100%', marginTop: '4px',
                          border: `1px solid ${C.outlineVariant}`, borderRadius: '2px',
                          padding: '6px 8px', fontFamily: 'Inter', fontSize: '14px',
                          backgroundColor: C.surface, color: C.onSurface,
                        }}
                      >
                        <option value="">Select site…</option>
                        {sites.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </label>
                    <label style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>
                      Override Reason <span style={{ color: C.error }}>*</span>
                      <textarea
                        value={overrideForm.overrideReason}
                        onChange={e => setOverrideForm(f => ({ ...f, overrideReason: e.target.value }))}
                        rows={3}
                        placeholder="Required…"
                        style={{
                          display: 'block', width: '100%', marginTop: '4px',
                          border: `1px solid ${C.outlineVariant}`, borderRadius: '2px',
                          padding: '6px 8px', fontFamily: 'Inter', fontSize: '14px',
                          backgroundColor: C.surface, color: C.onSurface,
                          resize: 'vertical',
                        }}
                      />
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleOverride}
                        disabled={actionLoading}
                        style={{
                          flex: 1, backgroundColor: C.primaryContainer, color: '#fff',
                          border: 'none', borderRadius: '2px', padding: '8px',
                          fontFamily: 'Inter', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                        }}
                      >
                        {actionLoading ? 'Saving…' : 'Submit Override'}
                      </button>
                      <button
                        onClick={() => { setShowOverride(false); setOverrideForm({ siteId: '', overrideReason: '' }); }}
                        style={{
                          flex: 1, backgroundColor: C.surface, color: C.onSurfaceVariant,
                          border: `1px solid ${C.outlineVariant}`, borderRadius: '2px', padding: '8px',
                          fontFamily: 'Inter', fontSize: '14px', cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Reject button */}
                <button
                  disabled={isActioned || actionLoading}
                  onClick={handleReject}
                  style={{
                    width: '100%',
                    backgroundColor: isActioned ? C.surfaceContainer : C.surface,
                    color: isActioned ? C.onSurfaceVariant : C.error,
                    border: `1px solid ${isActioned ? C.outlineVariant : C.error}`,
                    borderRadius: '2px',
                    padding: '12px 24px',
                    fontFamily: 'Inter', fontWeight: '600', fontSize: '14px',
                    cursor: isActioned ? 'not-allowed' : 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                    opacity: isActioned ? 0.6 : 1,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActioned) e.currentTarget.style.backgroundColor = '#ffdad6'; }}
                  onMouseLeave={e => { if (!isActioned) e.currentTarget.style.backgroundColor = C.surface; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cancel</span>
                  {actionLoading ? 'Processing…' : 'Reject Relocation'}
                </button>
              </div>

              {/* Audit Trail */}
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${C.outlineVariant}` }}>
                <h3 style={{
                  fontFamily: 'Inter', fontSize: '12px', fontWeight: '400',
                  color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}>
                  Audit Trail
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                  {auditLogs.length === 0 ? (
                    <li style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>No audit entries yet.</li>
                  ) : (
                    auditLogs.slice(0, 4).map((log, i) => (
                      <li key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurface }}>
                          {log.action || log.actorId || 'System Action'}
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: C.onSurfaceVariant }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : log.createdAt || '—'}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, mono, valueColor }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #E5E3DF',
      borderRadius: '2px',
      padding: '16px',
    }}>
      <h3 style={{
        fontFamily: 'Inter', fontWeight: '400', fontSize: '12px',
        color: '#42474f', textTransform: 'uppercase', letterSpacing: '0.05em',
        marginBottom: '8px',
      }}>
        {label}
      </h3>
      <p style={{
        fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter',
        fontSize: '20px',
        fontWeight: '400',
        color: valueColor || '#1a1c1f',
        margin: 0,
      }}>
        {value}
      </p>
    </div>
  );
}