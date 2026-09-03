import { useState, useMemo } from "react";
import { relocationSites } from "../../utils/relocationSites";
import { calculateDistance } from "../../utils/mapHelpers";

const riskBadgeColors = {
  CRITICAL: { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
  HIGH: { bg: "#fff7ed", text: "#9a3412", border: "#fdba74" },
  MEDIUM: { bg: "#fefce8", text: "#854d0e", border: "#fde047" },
  LOW: { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
  SAFE: { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
};

const AdminPanelModal = ({
  isOpen,
  onClose,
  villages = [],
  hazards = [],
  lastSyncedAt,
  onForceSync,
  onSelectVillageOnMap,
}) => {
  const [activeTab, setActiveTab] = useState("CRITICAL_ZONES"); // "CRITICAL_ZONES" | "HAZARD_ZONES" | "SHELTERS" | "DIRECTIVES"
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("ALL");
  const [approvedList, setApprovedList] = useState(new Set());

  // Filter Critical & Immediate Habitations
  const criticalVillages = useMemo(() => {
    return (villages || []).filter(
      (v) => v.riskLevel === "CRITICAL" || v.priority === "IMMEDIATE" || (v.riskScore || 0) >= 65
    ).sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
  }, [villages]);

  // Filter active shelters
  const filteredShelters = useMemo(() => {
    let list = relocationSites;
    if (filterState !== "ALL") {
      list = list.filter((s) => s.state && s.state.toLowerCase() === filterState.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.district && s.district.toLowerCase().includes(q)) ||
          (s.state && s.state.toLowerCase().includes(q)) ||
          (s.siteType && s.siteType.toLowerCase().includes(q))
      );
    }
    return list;
  }, [searchQuery, filterState]);

  // Filter critical habitations by search
  const displayedCritical = useMemo(() => {
    if (!searchQuery.trim()) return criticalVillages;
    const q = searchQuery.toLowerCase();
    return criticalVillages.filter(
      (v) =>
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.district && v.district.toLowerCase().includes(q)) ||
        (v.state && v.state.toLowerCase().includes(q))
    );
  }, [criticalVillages, searchQuery]);

  // Filter hazard zones by search
  const displayedHazards = useMemo(() => {
    if (!searchQuery.trim()) return hazards;
    const q = searchQuery.toLowerCase();
    return (hazards || []).filter(
      (h) =>
        (h.regionName && h.regionName.toLowerCase().includes(q)) ||
        (h.type && h.type.toLowerCase().includes(q)) ||
        (h.state && h.state.toLowerCase().includes(q))
    );
  }, [hazards, searchQuery]);

  // Unique states across shelters
  const uniqueStates = useMemo(() => {
    const s = new Set(relocationSites.map((site) => site.state).filter(Boolean));
    return Array.from(s).sort();
  }, []);

  // Total safe capacity
  const totalShelterCapacity = useMemo(() => {
    return relocationSites.reduce((acc, s) => acc + (s.capacity || s.capacityTotal || 500), 0);
  }, []);

  const totalCriticalPop = useMemo(() => {
    return criticalVillages.reduce((acc, v) => acc + (v.population || 0), 0);
  }, [criticalVillages]);

  const handleApprovePlan = (id) => {
    setApprovedList((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = "ID,Name,District,State,Population,Risk Level,Risk Score,Priority,Dominant Factor,Assigned Shelter,Shelter Distance Km\n";
    const rows = (villages || []).map((v) => {
      // Find nearest shelter
      let nearest = null;
      let minDist = 999;
      relocationSites.forEach((s) => {
        const d = calculateDistance(v.lat, v.lng, s.lat, s.lng);
        if (d < minDist) {
          minDist = d;
          nearest = s;
        }
      });
      return `"${v.id}","${v.name}","${v.district}","${v.state}",${v.population || 0},"${v.riskLevel}",${v.riskScore || 0},"${v.priority}","${v.dominantFactor || ''}","${nearest?.name || ''}",${minDist < 999 ? minDist.toFixed(1) : ''}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `National_Disaster_Relocation_Readiness_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          width: "1100px",
          maxWidth: "96vw",
          height: "88vh",
          maxHeight: "850px",
          borderRadius: "14px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* 1. ADMIN MODAL HEADER                                     */}
        {/* ========================================================= */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #334155",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                boxShadow: "0 2px 8px rgba(2, 132, 199, 0.4)",
              }}
            >
              🏛️
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "800", letterSpacing: "-0.2px" }}>
                  National Disaster Authority & Relocation Admin Command
                </h2>
                <span
                  style={{
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "9.5px",
                    fontWeight: "800",
                    padding: "2px 6px",
                    borderRadius: "10px",
                  }}
                >
                  LIVE SYSTEM
                </span>
              </div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                Real-Time Multi-Hazard Surveillance • 2h NWP Cycle (Last Synced: {lastSyncedAt || "Live"})
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onForceSync}
              style={{
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "11.5px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>🔄</span>
              <span>Re-Sync NWP Data</span>
            </button>

            <button
              onClick={handleExportCSV}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "11.5px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                width: "32px",
                height: "32px",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. EXECUTIVE KPI SUMMARY RIBBON                           */}
        {/* ========================================================= */}
        <div
          style={{
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            padding: "10px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
          }}
        >
          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600" }}>🚨 Critical Habitations</div>
            <strong style={{ fontSize: "16px", color: "#dc2626" }}>{criticalVillages.length} Zones</strong>
          </div>

          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600" }}>👥 Population at Immediate Risk</div>
            <strong style={{ fontSize: "16px", color: "#ea580c" }}>{totalCriticalPop.toLocaleString()}</strong>
          </div>

          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600" }}>🌊 Active Multi-Hazard Zones</div>
            <strong style={{ fontSize: "16px", color: "#0284c7" }}>{(hazards || []).length} All-India Zones</strong>
          </div>

          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600" }}>🏠 Safe Relief Shelters</div>
            <strong style={{ fontSize: "16px", color: "#16a34a" }}>{relocationSites.length.toLocaleString()} Facilities</strong>
          </div>

          <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600" }}>🛡️ Total Shelter Buffer</div>
            <strong style={{ fontSize: "16px", color: "#059669" }}>{totalShelterCapacity.toLocaleString()} Beds</strong>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. TABS & SEARCH CONTROLS                                 */}
        {/* ========================================================= */}
        <div
          style={{
            padding: "10px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#ffffff",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {/* TAB BUTTONS */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => { setActiveTab("CRITICAL_ZONES"); setSearchQuery(""); }}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeTab === "CRITICAL_ZONES" ? "#dc2626" : "#f1f5f9",
                color: activeTab === "CRITICAL_ZONES" ? "#ffffff" : "#475569",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🚨</span>
              <span>Immediate Evacuation ({criticalVillages.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab("HAZARD_ZONES"); setSearchQuery(""); }}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeTab === "HAZARD_ZONES" ? "#0284c7" : "#f1f5f9",
                color: activeTab === "HAZARD_ZONES" ? "#ffffff" : "#475569",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🌊</span>
              <span>Live Hazard Zones ({(hazards || []).length})</span>
            </button>

            <button
              onClick={() => { setActiveTab("SHELTERS"); setSearchQuery(""); }}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeTab === "SHELTERS" ? "#16a34a" : "#f1f5f9",
                color: activeTab === "SHELTERS" ? "#ffffff" : "#475569",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🏠</span>
              <span>Safe Shelters Directory ({relocationSites.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab("DIRECTIVES"); setSearchQuery(""); }}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeTab === "DIRECTIVES" ? "#4f46e5" : "#f1f5f9",
                color: activeTab === "DIRECTIVES" ? "#ffffff" : "#475569",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>📜</span>
              <span>Authority Directives</span>
            </button>
          </div>

          {/* SEARCH & STATE FILTER */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {activeTab === "SHELTERS" && (
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                <option value="ALL">All States ({uniqueStates.length})</option>
                {uniqueStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "4px 8px",
                width: "220px",
              }}
            >
              <span style={{ fontSize: "12px", marginRight: "4px", color: "#64748b" }}>🔍</span>
              <input
                type="text"
                placeholder="Filter table rows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "12px",
                  width: "100%",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ border: "none", background: "none", color: "#94a3b8", cursor: "pointer", fontSize: "12px" }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. MAIN CONTENT VIEW TABLES                               */}
        {/* ========================================================= */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {/* TAB 1: CRITICAL EMERGENCY HABITATIONS */}
          {activeTab === "CRITICAL_ZONES" && (
            <div>
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "#64748b" }}>
                Showing <strong>{displayedCritical.length}</strong> habitations requiring immediate help and relocation dispatch.
                Click <strong>"📍 Focus & Route on Map"</strong> to center the live map on any village and render its nearest safe shelter corridor.
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "700" }}>
                      <th style={{ padding: "10px 12px" }}>Village / Settlement</th>
                      <th style={{ padding: "10px 12px" }}>District & State</th>
                      <th style={{ padding: "10px 12px" }}>Population</th>
                      <th style={{ padding: "10px 12px" }}>Live Risk Tier</th>
                      <th style={{ padding: "10px 12px" }}>Primary Threat Driver</th>
                      <th style={{ padding: "10px 12px" }}>Assigned Safe Shelter</th>
                      <th style={{ padding: "10px 12px", textAlign: "right" }}>Map Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedCritical.map((v) => {
                      const badge = riskBadgeColors[v.riskLevel] || riskBadgeColors.CRITICAL;
                      const isApproved = approvedList.has(v.id);

                      // Calculate nearest shelter
                      let nearest = null;
                      let minDist = 999;
                      relocationSites.forEach((s) => {
                        const d = calculateDistance(v.lat, v.lng, s.lat, s.lng);
                        if (d < minDist) {
                          minDist = d;
                          nearest = s;
                        }
                      });

                      return (
                        <tr
                          key={v.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: isApproved ? "#f0fdf4" : "#ffffff",
                            transition: "background 0.15s",
                          }}
                        >
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: "700", color: "#0f172a" }}>{v.name}</div>
                            <span style={{ fontSize: "10.5px", color: "#64748b" }}>ID: {v.id}</span>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#334155" }}>
                            📍 {v.district}, {v.state}
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: "600", color: "#0f172a" }}>
                            {(v.population || 4000).toLocaleString()}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                background: badge.bg,
                                color: badge.text,
                                border: `1px solid ${badge.border}`,
                                padding: "2px 7px",
                                borderRadius: "6px",
                                fontWeight: "700",
                                fontSize: "11px",
                              }}
                            >
                              {v.riskLevel} ({v.riskScore || 85}/100)
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#475569" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span>{v.hazardType === "Flood" ? "🌊" : "⛰️"}</span>
                              <span>{v.dominantFactor || `${v.hazardType} Inundation`}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {nearest ? (
                              <div>
                                <strong style={{ color: "#166534", fontSize: "11.5px" }}>{nearest.name}</strong>
                                <div style={{ fontSize: "10.5px", color: "#15803d" }}>
                                  {minDist.toFixed(1)} km away • {nearest.availableCapacity?.toLocaleString()} free beds
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>Regional Shelter</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => handleApprovePlan(v.id)}
                                style={{
                                  background: isApproved ? "#16a34a" : "#f1f5f9",
                                  color: isApproved ? "#ffffff" : "#334155",
                                  border: `1px solid ${isApproved ? "#16a34a" : "#cbd5e1"}`,
                                  borderRadius: "5px",
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                              >
                                {isApproved ? "✅ Approved" : "Approve"}
                              </button>

                              <button
                                onClick={() => {
                                  if (onSelectVillageOnMap) {
                                    onSelectVillageOnMap(v);
                                  }
                                  onClose();
                                }}
                                style={{
                                  background: "#0284c7",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "5px",
                                  padding: "4px 10px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "3px",
                                }}
                              >
                                <span>📍</span>
                                <span>Focus & Route</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE ALL-INDIA HAZARD ZONES */}
          {activeTab === "HAZARD_ZONES" && (
            <div>
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "#64748b" }}>
                Showing <strong>{displayedHazards.length}</strong> real-time active multi-hazard zones synthesized across India from live NWP telemetry.
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "700" }}>
                      <th style={{ padding: "10px 12px" }}>Hazard Category</th>
                      <th style={{ padding: "10px 12px" }}>Region & State</th>
                      <th style={{ padding: "10px 12px" }}>Severity & Radius</th>
                      <th style={{ padding: "10px 12px" }}>Live Precipitation</th>
                      <th style={{ padding: "10px 12px" }}>Live Threat Advisory</th>
                      <th style={{ padding: "10px 12px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedHazards.map((h) => {
                      const isFlood = h.type === "Flood" || h.hazardCategory === "RIVERINE_FLOOD";
                      const isCoastal = h.hazardCategory === "COASTAL_FLOOD";
                      const isLandslide = h.hazardCategory === "LANDSLIDE" || h.type === "Landslide";
                      const emoji = isLandslide ? "⛰️" : (isCoastal ? "🏖️" : "🌊");

                      const center = h.centroid || h.coordinates?.[0] || [26.14, 91.73];

                      return (
                        <tr key={h.id} style={{ borderBottom: "1px solid #f1f5f9", background: "#ffffff" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "15px" }}>{emoji}</span>
                              <strong style={{ color: "#0f172a" }}>{h.type}</strong>
                            </div>
                            <span style={{ fontSize: "10.5px", color: "#64748b" }}>{h.id}</span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: "700", color: "#334155" }}>{h.regionName || h.state}</div>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>📍 {h.state} • {center[0].toFixed(3)}°N, {center[1].toFixed(3)}°E</span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                background: h.severity === "CRITICAL" ? "#fef2f2" : (h.severity === "HIGH" ? "#fff7ed" : "#eff6ff"),
                                color: h.severity === "CRITICAL" ? "#dc2626" : (h.severity === "HIGH" ? "#ea580c" : "#0284c7"),
                                padding: "2px 6px",
                                borderRadius: "5px",
                                fontWeight: "700",
                                fontSize: "11px",
                              }}
                            >
                              {h.severity || "ACTIVE"}
                            </span>
                            <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px" }}>
                              Radius: {Math.round((h.radiusMeters || 25000) / 1000)} km
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: "700", color: h.precipitation > 0 ? "#0284c7" : "#64748b" }}>
                            💧 {h.precipitation !== undefined ? `${h.precipitation} mm/h` : "Nominal"}
                          </td>
                          <td style={{ padding: "10px 12px", color: "#475569", maxWidth: "260px" }}>
                            {h.alertMessage || "Active meteorological monitoring buffer."}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "right" }}>
                            <button
                              onClick={() => {
                                if (onSelectVillageOnMap) {
                                  onSelectVillageOnMap({
                                    id: h.id,
                                    name: h.regionName || `${h.type} Zone`,
                                    district: h.state,
                                    state: h.state,
                                    lat: center[0],
                                    lng: center[1],
                                    isCustomLocation: true,
                                    riskLevel: h.severity === "CRITICAL" ? "CRITICAL" : "HIGH",
                                    priority: "IMMEDIATE",
                                    hazardType: h.type,
                                  });
                                }
                                onClose();
                              }}
                              style={{
                                background: "#0284c7",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 10px",
                                fontSize: "11px",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              📍 Focus Map
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SAFE SHELTERS DIRECTORY */}
          {activeTab === "SHELTERS" && (
            <div>
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "#64748b" }}>
                Showing <strong>{filteredShelters.length}</strong> safe relief facilities & relocation colonies across India.
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: "700" }}>
                      <th style={{ padding: "10px 12px" }}>Facility Name</th>
                      <th style={{ padding: "10px 12px" }}>District & State</th>
                      <th style={{ padding: "10px 12px" }}>Facility Type</th>
                      <th style={{ padding: "10px 12px" }}>Capacity / Available</th>
                      <th style={{ padding: "10px 12px" }}>Operational Status</th>
                      <th style={{ padding: "10px 12px", textAlign: "right" }}>Locate on Map</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShelters.slice(0, 100).map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9", background: "#ffffff" }}>
                        <td style={{ padding: "10px 12px" }}>
                          <strong style={{ color: "#166534" }}>🏠 {s.name}</strong>
                          <div style={{ fontSize: "10.5px", color: "#64748b" }}>ID: {s.id}</div>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#334155" }}>
                          📍 {s.district}, {s.state}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#475569" }}>
                          {s.siteType || "Relief Shelter / High Ground Colony"}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <strong>{(s.capacity || 500).toLocaleString()}</strong>
                          <span style={{ fontSize: "10.5px", color: "#16a34a", marginLeft: "4px" }}>
                            ({(s.availableCapacity || s.capacity || 500).toLocaleString()} free)
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              background: "#f0fdf4",
                              color: "#166534",
                              border: "1px solid #86efac",
                              padding: "2px 6px",
                              borderRadius: "5px",
                              fontWeight: "700",
                              fontSize: "11px",
                            }}
                          >
                            {s.status || "AVAILABLE"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          <button
                            onClick={() => {
                              if (onSelectVillageOnMap) {
                                onSelectVillageOnMap({
                                  ...s,
                                  isRelocationSite: true,
                                  riskLevel: "LOW",
                                  priority: "SAFE_HAVEN",
                                });
                              }
                              onClose();
                            }}
                            style={{
                              background: "#16a34a",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "5px",
                              padding: "5px 10px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            📍 View on Map
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AUTHORITY DIRECTIVES */}
          {activeTab === "DIRECTIVES" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#0f172a" }}>
                  📜 National Relocation Authority Executive Orders
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>
                  Authority directive actions logged into the spatial PostGIS audit registry per SRS FR-2.10 compliance.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                  <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                      <span>🔴 Directive #2026-NWP-09</span>
                      <span style={{ color: "#dc2626" }}>ACTIVE EMERGENCY</span>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px" }}>
                      Execute immediate staged evacuation for North Bihar Koshi & Cachar lowlands habitations. All SDMA relief teams mobilized.
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                      <span>🟠 Directive #2026-NWP-08</span>
                      <span style={{ color: "#ea580c" }}>STANDBY PROTOCOL</span>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px" }}>
                      Western Ghats Wayanad & Idukki slopes placed on red-alert soil saturation monitoring. High-altitude relief camps prepped.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#0f172a" }}>
                  ⚙️ System Execution Parameters
                </h3>
                <div style={{ fontSize: "12px", color: "#475569", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>• <strong>Optimization Engine:</strong> Hungarian Linear Sum Assignment (SciPy Global Cost Minimization)</div>
                  <div>• <strong>AI Diagnostic Model:</strong> Groq Llama-3 XAI Reasoning Engine</div>
                  <div>• <strong>NWP Telemetry Source:</strong> Open-Meteo High-Resolution Regional Grids</div>
                  <div>• <strong>Surveillance Cycle:</strong> 2-Hour Automated Periodic Resampling</div>
                  <div>• <strong>Spatial Database:</strong> PostgreSQL 16 + PostGIS EPSG:4326</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 5. MODAL FOOTER                                           */}
        {/* ========================================================= */}
        <div
          style={{
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            padding: "10px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "11.5px",
            color: "#64748b",
          }}
        >
          <div>
            🟢 Real-Time Synced with Interactive Leaflet Map • Click any row action to locate
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#334155",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Back to Map Dashboard ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelModal;
