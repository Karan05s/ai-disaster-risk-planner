import { useState } from "react";

const MapLegend = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        right: "16px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(6px)",
        padding: collapsed ? "6px 10px" : "10px 12px",
        borderRadius: "10px",
        zIndex: 1000,
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
        border: "1px solid #cbd5e1",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "11px",
        color: "#1e293b",
        minWidth: collapsed ? "auto" : "165px",
        transition: "all 0.2s ease",
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          fontWeight: "700",
          color: "#0f172a",
          fontSize: "11.5px",
          borderBottom: collapsed ? "none" : "1px solid #e2e8f0",
          paddingBottom: collapsed ? "0" : "6px",
          marginBottom: collapsed ? "0" : "6px",
        }}
      >
        <span>🗺️ Map Legend</span>
        <span style={{ fontSize: "9px", color: "#64748b" }}>{collapsed ? "▲" : "▼"}</span>
      </div>

      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* RISK TIERS */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#dc2626" }} />
            <span>Critical Threat (Immediate)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ea580c" }} />
            <span>High Risk Zone</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d97706" }} />
            <span>Medium / Monitored</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a" }} />
            <span>Low Risk / Safe Haven</span>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "4px 0" }} />

          {/* HAZARD TYPES */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🌊</span>
            <span style={{ color: "#1d4ed8", fontWeight: "600" }}>Riverine Flood</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🏖️</span>
            <span style={{ color: "#0f766e", fontWeight: "600" }}>Coastal Inundation</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>⛰️</span>
            <span style={{ color: "#b45309", fontWeight: "600" }}>Landslide Slope</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>⛈️</span>
            <span style={{ color: "#7e22ce", fontWeight: "600" }}>Heavy Rain / Storm</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🏠</span>
            <span style={{ color: "#16a34a", fontWeight: "600" }}>Safe Relief Shelter</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;