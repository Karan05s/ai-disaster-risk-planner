import React, { useState, useEffect } from 'react';
import { getVillages, getRelocationSites, getHazardZones } from '../api/client';

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
  error: '#ba1a1a',
};

const RISK_COLORS = {
  CRITICAL: { bg: '#ffdad6', color: '#ba1a1a' },
  HIGH:     { bg: '#fff3e0', color: '#e65100' },
  MEDIUM:   { bg: 'rgba(119,82,1,0.1)', color: '#775201' },
  LOW:      { bg: '#e7e8ec', color: '#42474f' },
};

const HAZARD_COLORS = {
  FLOOD:     { bg: 'rgba(42,92,138,0.1)', color: '#2a5c8a', icon: 'water' },
  LANDSLIDE: { bg: 'rgba(119,82,1,0.1)', color: '#775201', icon: 'landscape' },
};

const thStyle = {
  padding: '10px 16px',
  fontFamily: 'Inter',
  fontSize: '12px',
  fontWeight: '600',
  color: '#42474f',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
  textAlign: 'left',
};

const tdStyle = {
  padding: '12px 16px',
  fontFamily: 'Inter',
  fontSize: '14px',
  color: '#1a1c1f',
  borderBottom: `1px solid #E5E3DF`,
};

export function ResourcesScreen() {
  const [activeTab, setActiveTab] = useState('villages');
  const [villages, setVillages] = useState([]);
  const [sites, setSites] = useState([]);
  const [hazardZones, setHazardZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [v, s, h] = await Promise.all([
        getVillages().catch(() => []),
        getRelocationSites().catch(() => []),
        getHazardZones().catch(() => []),
      ]);
      setVillages(v);
      setSites(s);
      setHazardZones(h);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const tabs = [
    { key: 'villages',  label: 'Villages',        icon: 'location_city', count: villages.length },
    { key: 'sites',     label: 'Relocation Sites', icon: 'home_work',     count: sites.length },
    { key: 'hazards',   label: 'Hazard Zones',     icon: 'warning',       count: hazardZones.length },
  ];

  const filteredVillages = villages.filter(v => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (v.name || '').toLowerCase().includes(q) || (v.district || '').toLowerCase().includes(q) || (v.state || '').toLowerCase().includes(q);
  });

  const filteredSites = sites.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q);
  });

  const filteredZones = hazardZones.filter(z => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (z.hazardType || '').toLowerCase().includes(q) || String(z.id || '').includes(q) || (z.source || '').toLowerCase().includes(q);
  });

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '22px', lineHeight: '32px', letterSpacing: '-0.01em', color: C.onSurface, marginBottom: '4px' }}>
          Resources
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', color: C.onSurfaceVariant }}>
          Browse villages, relocation sites, and hazard zones registered in the system.
        </p>
      </div>

      {/* ── Tab bar + search ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: C.surface, padding: '8px',
        borderRadius: '4px', border: `1px solid ${C.hairline}`,
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              style={{
                padding: '6px 16px', borderRadius: '2px',
                fontFamily: 'Inter', fontSize: '14px',
                color: activeTab === tab.key ? C.primary : C.onSurfaceVariant,
                border: `1px solid ${activeTab === tab.key ? C.primaryContainer : C.hairline}`,
                backgroundColor: activeTab === tab.key ? C.bg : C.surface,
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? '600' : '400',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
                backgroundColor: activeTab === tab.key ? C.primaryContainer : C.surfaceContainerHigh,
                color: activeTab === tab.key ? '#fff' : C.onSurfaceVariant,
                padding: '1px 6px', borderRadius: '10px',
                lineHeight: '1.4',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '18px', color: C.onSurfaceVariant,
          }}>search</span>
          <input
            type="text"
            placeholder={`Search ${activeTab}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              paddingLeft: '32px', paddingRight: '16px', paddingTop: '6px', paddingBottom: '6px',
              borderRadius: '2px', fontFamily: 'Inter', fontSize: '14px',
              backgroundColor: C.surface, border: `1px solid ${C.hairline}`,
              color: C.onSurface, outline: 'none', width: '240px',
            }}
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: '4px', overflow: 'hidden' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              height: '52px', borderBottom: `1px solid ${C.outlineVariant}`,
              backgroundColor: i % 2 === 0 ? C.surfaceContainerLow : C.surface,
              opacity: 1 - i * 0.1,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ backgroundColor: C.errorContainer, border: `1px solid ${C.hairline}`, borderRadius: '4px', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: C.error, fontFamily: 'Inter', fontWeight: '600', marginBottom: '12px' }}>{error}</p>
          <button onClick={fetchData} style={{ backgroundColor: C.primaryContainer, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Inter', fontWeight: '600' }}>Retry</button>
        </div>
      ) : (
        <>
          {/* ── Villages Tab ── */}
          {activeTab === 'villages' && (
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: '4px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.hairline}` }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>District</th>
                    <th style={thStyle}>State</th>
                    <th style={thStyle}>Population</th>
                    <th style={thStyle}>Risk Level</th>
                    <th style={thStyle}>Priority</th>
                    <th style={thStyle}>Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVillages.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '48px 16px', color: C.onSurfaceVariant }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', color: C.outlineVariant }}>search_off</span>
                        No villages found.
                      </td>
                    </tr>
                  ) : (
                    filteredVillages.map(v => {
                      const rc = RISK_COLORS[v.riskLevel?.toUpperCase()] || RISK_COLORS.LOW;
                      return (
                        <tr key={v.id} style={{ transition: 'background-color 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant }}>{v.id}</td>
                          <td style={{ ...tdStyle, fontWeight: '600' }}>{v.name || '—'}</td>
                          <td style={tdStyle}>{v.district || '—'}</td>
                          <td style={tdStyle}>{v.state || '—'}</td>
                          <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                            {v.population?.toLocaleString() || '—'}
                          </td>
                          <td style={tdStyle}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '2px 8px', borderRadius: '2px',
                              backgroundColor: rc.bg, color: rc.color,
                              fontSize: '12px', fontWeight: '600',
                            }}>
                              <span style={{ fontSize: '10px' }}>●</span>
                              {v.riskLevel || '—'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center',
                              padding: '2px 8px', borderRadius: '2px',
                              border: `1px solid ${C.outlineVariant}`,
                              backgroundColor: C.surface,
                              fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
                            }}>
                              {v.priorityLevel?.replace('_', ' ') || '—'}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                            {v.riskScore != null ? (v.riskScore > 10 ? (v.riskScore / 10).toFixed(1) : v.riskScore.toFixed(1)) : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.hairline}`, backgroundColor: C.bg }}>
                <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>
                  Showing {filteredVillages.length} of {villages.length} villages
                </span>
              </div>
            </div>
          )}

          {/* ── Sites Tab ── */}
          {activeTab === 'sites' && (
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: '4px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.hairline}` }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Capacity Total</th>
                    <th style={thStyle}>Capacity Used</th>
                    <th style={thStyle}>Utilisation</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSites.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '48px 16px', color: C.onSurfaceVariant }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', color: C.outlineVariant }}>search_off</span>
                        No sites found.
                      </td>
                    </tr>
                  ) : (
                    filteredSites.map(s => {
                      const capPct = s.capacityTotal ? Math.round((s.capacityUsed || 0) / s.capacityTotal * 100) : 0;
                      const isOver = capPct >= 100;
                      const isNear = capPct >= 80 && !isOver;
                      const barColor = isOver ? C.error : isNear ? '#e65100' : C.primaryContainer;
                      return (
                        <tr key={s.id} style={{ transition: 'background-color 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant }}>{s.id}</td>
                          <td style={{ ...tdStyle, fontWeight: '600' }}>{s.name || '—'}</td>
                          <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>{s.capacityTotal?.toLocaleString() || '—'}</td>
                          <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>{(s.capacityUsed || 0).toLocaleString()}</td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '8px', backgroundColor: C.surfaceVariant, borderRadius: '4px', overflow: 'hidden', minWidth: '80px' }}>
                                <div style={{
                                  width: `${Math.min(capPct, 100)}%`,
                                  height: '100%',
                                  backgroundColor: barColor,
                                  borderRadius: '4px',
                                  transition: 'width 0.4s ease',
                                }} />
                              </div>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: isOver ? C.error : C.onSurfaceVariant, minWidth: '36px' }}>
                                {capPct}%
                              </span>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '2px 8px', borderRadius: '2px',
                              backgroundColor: s.status === 'AVAILABLE' ? 'rgba(42,92,138,0.1)' : C.surfaceContainerHigh,
                              color: s.status === 'AVAILABLE' ? '#2a5c8a' : C.onSurfaceVariant,
                              fontSize: '12px', fontWeight: '600',
                            }}>
                              {s.status || '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.hairline}`, backgroundColor: C.bg }}>
                <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>
                  Showing {filteredSites.length} of {sites.length} sites
                </span>
              </div>
            </div>
          )}

          {/* ── Hazard Zones Tab ── */}
          {activeTab === 'hazards' && (
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, borderRadius: '4px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.hairline}` }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Hazard Type</th>
                    <th style={thStyle}>Severity</th>
                    <th style={thStyle}>Source</th>
                    <th style={thStyle}>Detected At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredZones.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: '48px 16px', color: C.onSurfaceVariant }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', color: C.outlineVariant }}>search_off</span>
                        No hazard zones found.
                      </td>
                    </tr>
                  ) : (
                    filteredZones.map(z => {
                      const hc = HAZARD_COLORS[z.hazardType?.toUpperCase()] || HAZARD_COLORS.FLOOD;
                      const severityPct = Math.round((z.severity || 0) * 100);
                      return (
                        <tr key={z.id} style={{ transition: 'background-color 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant }}>{z.id}</td>
                          <td style={tdStyle}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '3px 10px', borderRadius: '2px',
                              backgroundColor: hc.bg, color: hc.color,
                              fontSize: '12px', fontWeight: '600',
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{hc.icon}</span>
                              {z.hazardType || '—'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', backgroundColor: C.surfaceVariant, borderRadius: '3px', overflow: 'hidden', minWidth: '60px', maxWidth: '100px' }}>
                                <div style={{
                                  width: `${severityPct}%`,
                                  height: '100%',
                                  backgroundColor: severityPct >= 80 ? C.error : severityPct >= 60 ? '#e65100' : '#775201',
                                  borderRadius: '3px',
                                }} />
                              </div>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: C.onSurfaceVariant }}>
                                {(z.severity || 0).toFixed(1)}
                              </span>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, fontSize: '13px', color: C.onSurfaceVariant }}>{z.source || '—'}</td>
                          <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: C.onSurfaceVariant }}>
                            {z.detectedAt ? new Date(z.detectedAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.hairline}`, backgroundColor: C.bg }}>
                <span style={{ fontFamily: 'Inter', fontSize: '12px', color: C.onSurfaceVariant }}>
                  Showing {filteredZones.length} of {hazardZones.length} hazard zones
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
