import { relocationSites } from "../../utils/relocationSites";
import { calculateDistance } from "../../utils/mapHelpers";

const VillageDetails = ({
  village,
  onClose,
  onViewOnMap,
}) => {
  if (!village) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          color: "#64748b",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        📍 Select a habitation on the map to view AI risk evaluation & optimal relocation details.
      </div>
    );
  }

  // -----------------------------
  // FIND SUITABLE RELOCATION SITE
  // -----------------------------
  const suitableSites = relocationSites
    .filter(
      (site) =>
        site.status === "AVAILABLE" &&
        site.availableCapacity >= village.population
    )
    .map((site) => ({
      ...site,
      distance: calculateDistance(
        village.lat,
        village.lng,
        site.lat,
        site.lng
      ),
    }))
    .sort((a, b) => a.distance - b.distance);

  const recommendedSite = suitableSites.length > 0 ? suitableSites[0] : null;

  // -----------------------------
  // RISK COLOR
  // -----------------------------
  const getRiskColor = (risk) => {
    switch (risk) {
      case "CRITICAL":
        return "#dc2626";
      case "HIGH":
        return "#ea580c";
      case "MEDIUM":
        return "#ca8a04";
      case "LOW":
        return "#16a34a";
      default:
        return "#64748b";
    }
  };

  const riskColor = getRiskColor(village.riskLevel);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.10)",
        position: "relative",
      }}
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          border: "none",
          background: "#f1f5f9",
          borderRadius: "6px",
          width: "28px",
          height: "28px",
          cursor: "pointer",
          fontSize: "16px",
          lineHeight: "1",
        }}
      >
        ×
      </button>

      {/* VILLAGE HEADER */}
      <div style={{ paddingRight: "30px" }}>
        <h2 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "17px", fontWeight: "700" }}>
          {village.name}
        </h2>
        <p style={{ margin: "0 0 12px 0", color: "#64748b", fontSize: "12px" }}>
          {village.district}, {village.state}
        </p>
      </div>

      {/* ANOMALY BADGE (ISOLATIONFOREST) */}
      {village.isAnomaly && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px 10px",
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "6px",
            fontSize: "11px",
            color: "#92400e",
          }}
        >
          ⚠️ <strong>Flagged Anomaly:</strong> {village.anomalyReason || "Exceptional hazard-to-population exposure detected."}
        </div>
      )}

      {/* RISK SCORE & LEVEL */}
      <div
        style={{
          marginBottom: "12px",
          padding: "10px 12px",
          background: "#f8fafc",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderLeft: `4px solid ${riskColor}`,
        }}
      >
        <div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>AI Multi-Hazard Risk</div>
          <strong style={{ color: riskColor, fontSize: "16px" }}>
            {village.riskLevel} {village.riskScore ? `(${village.riskScore.toFixed(1)}/100)` : ""}
          </strong>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Action Priority</div>
          <strong style={{ color: village.priority === "IMMEDIATE" ? "#dc2626" : "#2563eb", fontSize: "13px" }}>
            {village.priority}
          </strong>
        </div>
      </div>

      {/* GROQ AI RISK DIAGNOSTIC REASONING */}
      <div
        style={{
          marginBottom: "12px",
          padding: "10px 12px",
          background: "#f5f3ff",
          border: "1px solid #ddd6fe",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontSize: "11px", color: "#6d28d9", fontWeight: "700", marginBottom: "4px" }}>
          🧠 AI Risk Reasoning (Groq LLM)
        </div>
        <p style={{ margin: 0, fontSize: "11.5px", color: "#3b0764", lineHeight: "1.45" }}>
          {village.aiSummary || (
            `${village.name} in ${village.district} exhibits high vulnerability driven by ${village.dominantFactor || "Hazard Intensity"} with ${village.population?.toLocaleString()} residents exposed. Rapid site stabilization and staged relocation are recommended.`
          )}
        </p>
      </div>

      {/* XAI EXPLAINABILITY / DOMINANT FACTOR */}
      {village.dominantFactor && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px 10px",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "6px",
            fontSize: "11px",
            color: "#0369a1",
          }}
        >
          🔍 <strong>Primary Driver:</strong> {village.dominantFactor}
          {village.plainEnglishExplanation && (
            <div style={{ marginTop: "3px", color: "#0c4a6e" }}>{village.plainEnglishExplanation}</div>
          )}
        </div>
      )}

      {/* SETTLEMENT METRICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "12px",
          background: "#fafafa",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <div>
          <small style={{ fontSize: "10.5px", color: "#71717a" }}>Affected Population</small>
          <strong style={{ display: "block", color: "#0f172a", fontSize: "13px" }}>
            {village.population?.toLocaleString()} residents
          </strong>
        </div>
        <div>
          <small style={{ fontSize: "10.5px", color: "#71717a" }}>Hazard Type</small>
          <strong style={{ display: "block", color: "#0f172a", fontSize: "13px" }}>
            {village.hazardType || "Natural Hazard"}
          </strong>
        </div>
      </div>

      {/* HUNGARIAN RECOMMENDED RELOCATION SITE */}
      <div
        style={{
          padding: "12px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontSize: "12px", color: "#166534", fontWeight: "700", marginBottom: "6px" }}>
          🏠 Optimal Safe Relocation Site
        </div>

        {recommendedSite ? (
          <>
            <strong style={{ display: "block", color: "#14532d", fontSize: "13px", marginBottom: "4px" }}>
              {recommendedSite.name}
            </strong>
            <div style={{ fontSize: "11.5px", color: "#15803d", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              <div>Distance: <strong>{recommendedSite.distance.toFixed(1)} km</strong></div>
              <div>Available Cap: <strong>{recommendedSite.availableCapacity?.toLocaleString()}</strong></div>
            </div>

            <button
              onClick={() =>
                onViewOnMap({
                  lat: recommendedSite.lat,
                  lng: recommendedSite.lng,
                })
              }
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "8px",
                border: "none",
                borderRadius: "6px",
                background: "#16a34a",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              📍 View Safe Site on Map
            </button>
          </>
        ) : (
          <p style={{ margin: 0, color: "#991b1b", fontSize: "11px" }}>
            State-level shelter network deployed (local capacity verification pending).
          </p>
        )}
      </div>
    </div>
  );
};

export default VillageDetails;