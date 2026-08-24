

const StatisticsPanel = ({ villages }) => {
  // -----------------------------
  // RISK COUNTS
  // -----------------------------

  const criticalCount = villages.filter(
    (village) => village.riskLevel === "CRITICAL"
  ).length;

  const highCount = villages.filter(
    (village) => village.riskLevel === "HIGH"
  ).length;

  const mediumCount = villages.filter(
    (village) => village.riskLevel === "MEDIUM"
  ).length;

  const lowCount = villages.filter(
    (village) => village.riskLevel === "LOW"
  ).length;

  // -----------------------------
  // HAZARD COUNTS
  // -----------------------------

  const floodCount = villages.filter(
    (village) => village.hazardType === "Flood"
  ).length;

  const landslideCount = villages.filter(
    (village) => village.hazardType === "Landslide"
  ).length;

  const maxRiskCount = Math.max(
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    1
  );

  const maxHazardCount = Math.max(
    floodCount,
    landslideCount,
    1
  );

  // -----------------------------
  // STYLES
  // -----------------------------

  const panelStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  };

  const titleStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "18px",
  };

  const rowStyle = {
    marginBottom: "14px",
  };

  const labelStyle = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "6px",
    color: "#475569",
  };

  const barBackground = {
    width: "100%",
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "15px",
        marginBottom: "15px",
      }}
    >
      {/* ========================= */}
      {/* RISK DISTRIBUTION */}
      {/* ========================= */}

      <div style={panelStyle}>
        <div style={titleStyle}>
          Risk Distribution
        </div>

        {/* CRITICAL */}
        <div style={rowStyle}>
          <div style={labelStyle}>
            <span>Critical</span>
            <strong>{criticalCount}</strong>
          </div>

          <div style={barBackground}>
            <div
              style={{
                width: `${(criticalCount / maxRiskCount) * 100}%`,
                height: "100%",
                background: "#dc2626",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>

        {/* HIGH */}
        <div style={rowStyle}>
          <div style={labelStyle}>
            <span>High</span>
            <strong>{highCount}</strong>
          </div>

          <div style={barBackground}>
            <div
              style={{
                width: `${(highCount / maxRiskCount) * 100}%`,
                height: "100%",
                background: "#ea580c",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>

        {/* MEDIUM */}
        <div style={rowStyle}>
          <div style={labelStyle}>
            <span>Medium</span>
            <strong>{mediumCount}</strong>
          </div>

          <div style={barBackground}>
            <div
              style={{
                width: `${(mediumCount / maxRiskCount) * 100}%`,
                height: "100%",
                background: "#ca8a04",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>

        {/* LOW */}
        <div style={rowStyle}>
          <div style={labelStyle}>
            <span>Low</span>
            <strong>{lowCount}</strong>
          </div>

          <div style={barBackground}>
            <div
              style={{
                width: `${(lowCount / maxRiskCount) * 100}%`,
                height: "100%",
                background: "#16a34a",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* HAZARD DISTRIBUTION */}
      {/* ========================= */}

      <div style={panelStyle}>
        <div style={titleStyle}>
          Hazard Distribution
        </div>

        {/* FLOOD */}
        <div style={rowStyle}>
          <div style={labelStyle}>
            <span>Flood</span>
            <strong>{floodCount}</strong>
          </div>

          <div style={barBackground}>
            <div
              style={{
                width: `${(floodCount / maxHazardCount) * 100}%`,
                height: "100%",
                background: "#2563eb",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>

        {/* LANDSLIDE */}
        <div style={rowStyle}>
          <div style={labelStyle}>
            <span>Landslide</span>
            <strong>{landslideCount}</strong>
          </div>

          <div style={barBackground}>
            <div
              style={{
                width: `${(landslideCount / maxHazardCount) * 100}%`,
                height: "100%",
                background: "#92400e",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;