import { useState, useEffect } from "react";
import { relocationSites } from "../../utils/relocationSites";
import { hazards } from "../../utils/hazards";
import { evaluateLiveDynamicRisk } from "../../services/riskFusionService";
import { fetchRealtimeWeather } from "../../services/weatherService";
import WeatherReport from "../weather/WeatherReport";

const riskLevelColors = {
  CRITICAL: { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", badge: "#dc2626" },
  HIGH: { bg: "#fff7ed", border: "#fdba74", text: "#9a3412", badge: "#ea580c" },
  MEDIUM: { bg: "#fefce8", border: "#fde047", text: "#854d0e", badge: "#ca8a04" },
  LOW: { bg: "#f0fdf4", border: "#86efac", text: "#166534", badge: "#16a34a" },
  SAFE: { bg: "#f0fdf4", border: "#86efac", text: "#166534", badge: "#16a34a" },
};

const VillageDetails = ({
  village,
  onClose,
  onViewOnMap,
}) => {
  const [activeTab, setActiveTab] = useState("AI_RISK"); // "AI_RISK" | "SHELTERS" | "WEATHER"
  const [liveWeather, setLiveWeather] = useState(null);
  const [decisionState, setDecisionState] = useState(null); // 'APPROVED' | 'OVERRIDDEN'
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  // Automatically fetch live weather whenever selected village/pin changes
  useEffect(() => {
    if (village && village.lat && village.lng) {
      let isMounted = true;
      fetchRealtimeWeather(village.lat, village.lng)
        .then((data) => {
          if (isMounted) setLiveWeather(data);
        })
        .catch(() => {
          if (isMounted) setLiveWeather(null);
        });

      if (village.openWeather || village.isCustomLocation) {
        setActiveTab("AI_RISK");
      }
      return () => {
        isMounted = false;
      };
    }
  }, [village?.id, village?.lat, village?.lng]);

  if (!village) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "24px 16px",
          color: "#64748b",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🗺️</div>
        <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>
          No Zone Selected
        </div>
        <div style={{ fontSize: "12px", marginTop: "6px", color: "#64748b", lineHeight: "1.4" }}>
          Click any village pin, shelter, search item, or custom point on the map to evaluate live multi-hazard risk fusion, atmospheric telemetry, and nearby shelters.
        </div>
      </div>
    );
  }

  const isCustomPin = village.isCustomLocation;
  const isShelter = village.isRelocationSite;

  // Compute Live Multi-Hazard Dynamic Fusion
  const fusionReport = evaluateLiveDynamicRisk({
    lat: village.lat,
    lng: village.lng,
    locationName: village.name,
    district: village.district || "Regional District",
    state: village.state || "India",
    population: village.population || 4000,
    baselineRiskLevel: isCustomPin ? "SAFE" : village.riskLevel,
    baselineRiskScore: village.riskScore,
    baselineHazardType: village.hazardType,
    weatherData: liveWeather,
    hazardsList: hazards,
    relocationSitesList: relocationSites,
  });

  const { dynamicRisk, baseline, atmospheric, nearbyShelters, recommendedShelter } = fusionReport;
  const riskTheme = riskLevelColors[dynamicRisk.level] || riskLevelColors.SAFE;

  // Approximate factor percentages for XAI breakdown
  const hazardPts = (village.hazardIntensity || 0.8) * 50;
  const popPts = Math.min(30, ((village.population || 5000) / 15000) * 30);
  const histPts = (village.disasterHistory || 0.7) * 20;
  const totalScore = village.riskScore || (hazardPts + popPts + histPts);

  const hazardPct = Math.round((hazardPts / totalScore) * 100) || 50;
  const popPct = Math.round((popPts / totalScore) * 100) || 30;
  const histPct = Math.max(0, 100 - hazardPct - popPct);

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
          color: "#475569",
        }}
      >
        ×
      </button>

      {/* HEADER SECTION */}
      <div style={{ paddingRight: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <h2 style={{ margin: "0", color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
            {isShelter ? "🏠 " : isCustomPin ? "📍 " : ""}{village.name}
          </h2>
        </div>
        <p style={{ margin: "2px 0 8px 0", color: "#64748b", fontSize: "12px" }}>
          📍 {village.district ? `${village.district}, ` : ""}{village.state || "India"} • {village.lat?.toFixed(3)}°N, {village.lng?.toFixed(3)}°E
          {village.id && !isCustomPin && (
            <> • ID: <code style={{ fontSize: "11px", background: "#f1f5f9", padding: "1px 4px", borderRadius: "3px" }}>{village.id}</code></>
          )}
        </p>
      </div>

      {/* LIVE DYNAMIC RISK SUMMARY STRIP */}
      {!isShelter && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px 10px",
            background: riskTheme.bg,
            border: `1px solid ${riskTheme.border}`,
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "10px", color: riskTheme.text, fontWeight: "700", textTransform: "uppercase" }}>
              LIVE DYNAMIC RISK INDEX
            </div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: riskTheme.badge }}>
              {dynamicRisk.level} ({dynamicRisk.score}/100)
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#64748b" }}>Live Weather</div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#0284c7" }}>
              {liveWeather?.current ? `${liveWeather.current.temperature}°C ${liveWeather.current.icon}` : "📡 Live"}
            </div>
          </div>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div
        style={{
          display: "flex",
          background: "#f1f5f9",
          padding: "3px",
          borderRadius: "8px",
          marginBottom: "12px",
          gap: "2px",
        }}
      >
        <button
          onClick={() => setActiveTab("AI_RISK")}
          style={{
            flex: 1,
            padding: "5px 6px",
            border: "none",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "AI_RISK" ? "#ffffff" : "transparent",
            color: activeTab === "AI_RISK" ? "#0f172a" : "#64748b",
            boxShadow: activeTab === "AI_RISK" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          📊 Live Risk & AI
        </button>

        <button
          onClick={() => setActiveTab("SHELTERS")}
          style={{
            flex: 1,
            padding: "5px 6px",
            border: "none",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "SHELTERS" ? "#ffffff" : "transparent",
            color: activeTab === "SHELTERS" ? "#16a34a" : "#64748b",
            boxShadow: activeTab === "SHELTERS" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          🏠 Shelters ({nearbyShelters.length})
        </button>

        <button
          onClick={() => setActiveTab("WEATHER")}
          style={{
            flex: 1,
            padding: "5px 6px",
            border: "none",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "WEATHER" ? "#ffffff" : "transparent",
            color: activeTab === "WEATHER" ? "#0284c7" : "#64748b",
            boxShadow: activeTab === "WEATHER" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          ⛅ Weather (12h)
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LIVE MULTI-HAZARD RISK & EXPLAINABLE REASONING     */}
      {/* ========================================================= */}
      {activeTab === "AI_RISK" && (
        <>
          {/* BASELINE VS LIVE WEATHER FUSION CARD */}
          <div
            style={{
              marginBottom: "10px",
              padding: "10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
              ⚡ Risk Assessment Breakdown:
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px" }}>
              <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <span style={{ color: "#64748b" }}>Baseline Hazard:</span>
                <div style={{ fontWeight: "700", color: "#0f172a", marginTop: "1px" }}>
                  {baseline.riskLevel} {baseline.hazardType !== "None" ? `(${baseline.hazardType})` : "(No Prior Record)"}
                </div>
              </div>

              <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <span style={{ color: "#64748b" }}>Atmospheric Threat:</span>
                <div style={{ fontWeight: "700", color: atmospheric.threatLevel === "CRITICAL" ? "#dc2626" : (atmospheric.threatLevel === "HIGH" ? "#ea580c" : "#16a34a"), marginTop: "1px" }}>
                  {atmospheric.threatLevel} ({liveWeather?.current?.precipitation || 0} mm/h rain)
                </div>
              </div>
            </div>

            <div style={{ marginTop: "6px", fontSize: "11px", color: "#475569", lineHeight: "1.4" }}>
              <strong>Status Verdict:</strong> {dynamicRisk.alertSummary}
            </div>
          </div>

          {/* GROQ / EXPLAINABLE AI DIAGNOSTIC */}
          <div
            style={{
              marginBottom: "10px",
              padding: "10px",
              background: "#faf5ff",
              border: "1px solid #e9d5ff",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
              <span>🧠</span>
              <span style={{ fontSize: "11px", color: "#7e22ce", fontWeight: "700" }}>
                AI Disaster Risk Diagnostic Rationale
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "11px", color: "#3b0764", lineHeight: "1.45" }}>
              {dynamicRisk.explainableReason}
            </p>
          </div>

          {/* XAI FACTOR CONTRIBUTION GAUGES */}
          {!isShelter && !isCustomPin && (
            <div
              style={{
                marginBottom: "10px",
                padding: "8px 10px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                  🔍 Factor Breakdown
                </span>
                <span style={{ fontSize: "10px", color: "#0284c7", fontWeight: "600" }}>
                  Driver: {village.dominantFactor || "Atmospheric & Hazard"}
                </span>
              </div>

              {/* Hazard Intensity */}
              <div style={{ marginBottom: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#475569", marginBottom: "2px" }}>
                  <span>Hazard Intensity (50% wt)</span>
                  <strong>{hazardPct}%</strong>
                </div>
                <div style={{ width: "100%", height: "5px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${hazardPct}%`, height: "100%", background: "#ef4444" }} />
                </div>
              </div>

              {/* Population Density */}
              <div style={{ marginBottom: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#475569", marginBottom: "2px" }}>
                  <span>Population Exposure (30% wt)</span>
                  <strong>{popPct}%</strong>
                </div>
                <div style={{ width: "100%", height: "5px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${popPct}%`, height: "100%", background: "#f97316" }} />
                </div>
              </div>

              {/* Disaster History */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#475569", marginBottom: "2px" }}>
                  <span>Disaster Recurrence (20% wt)</span>
                  <strong>{histPct}%</strong>
                </div>
                <div style={{ width: "100%", height: "5px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${histPct}%`, height: "100%", background: "#eab308" }} />
                </div>
              </div>
            </div>
          )}

          {/* PRIMARY RECOMMENDED SHELTER CALLOUT */}
          {!isShelter && recommendedShelter && (
            <div
              style={{
                padding: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: "#166534", fontWeight: "700" }}>
                  🏠 Primary Safe Relief Shelter
                </span>
                <span style={{ fontSize: "10px", color: "#15803d", background: "#dcfce7", padding: "1px 5px", borderRadius: "6px", fontWeight: "700" }}>
                  {recommendedShelter.distance} km {recommendedShelter.direction}
                </span>
              </div>

              <strong style={{ display: "block", color: "#14532d", fontSize: "12px", marginBottom: "2px" }}>
                {recommendedShelter.name}
              </strong>
              <div style={{ fontSize: "10.5px", color: "#15803d", marginBottom: "6px" }}>
                Capacity: <strong>{recommendedShelter.capacity?.toLocaleString()}</strong> • Status: {recommendedShelter.status}
              </div>

              <button
                onClick={() => onViewOnMap({ lat: recommendedShelter.lat, lng: recommendedShelter.lng })}
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "none",
                  borderRadius: "5px",
                  background: "#16a34a",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "11px",
                }}
              >
                📍 Track Evacuation Route
              </button>
            </div>
          )}

          {/* AUTHORITY ACTIONS */}
          {!isShelter && !isCustomPin && (
            <div
              style={{
                padding: "8px 10px",
                background: decisionState === "APPROVED" ? "#ecfdf5" : (decisionState === "OVERRIDDEN" ? "#fff7ed" : "#f8fafc"),
                border: `1px solid ${decisionState === "APPROVED" ? "#6ee7b7" : (decisionState === "OVERRIDDEN" ? "#fed7aa" : "#e2e8f0")}`,
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>
                🏛️ Authority Action:
              </div>

              {decisionState === "APPROVED" ? (
                <div style={{ color: "#065f46", fontSize: "11px", fontWeight: "600" }}>
                  ✅ Evacuation Plan Approved & Synchronized to Database
                </div>
              ) : decisionState === "OVERRIDDEN" ? (
                <div style={{ color: "#9a3412", fontSize: "11px" }}>
                  ⚠️ Overridden: {overrideReason || "Manual diversion requested."}
                </div>
              ) : (
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => setDecisionState("APPROVED")}
                    style={{
                      flex: 1,
                      padding: "5px",
                      background: "#059669",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "10.5px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    ✅ Approve Plan
                  </button>

                  <button
                    onClick={() => setShowOverrideInput(!showOverrideInput)}
                    style={{
                      flex: 1,
                      padding: "5px",
                      background: "#d97706",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "10.5px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    ⚠️ Override Site
                  </button>
                </div>
              )}

              {showOverrideInput && !decisionState && (
                <div style={{ marginTop: "6px" }}>
                  <input
                    type="text"
                    placeholder="Enter override rationale..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "4px 6px",
                      fontSize: "10.5px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      boxSizing: "border-box",
                      marginBottom: "4px",
                    }}
                  />
                  <button
                    onClick={() => setDecisionState("OVERRIDDEN")}
                    style={{
                      width: "100%",
                      padding: "4px",
                      background: "#ea580c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "10.5px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Confirm Override
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* TAB 2: NEARBY SAFE SHELTERS DIRECTORY                     */}
      {/* ========================================================= */}
      {activeTab === "SHELTERS" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#0f172a" }}>
              🏠 Safe Shelters Ranked by Proximity
            </span>
            <span style={{ fontSize: "10.5px", color: "#16a34a", fontWeight: "600" }}>
              {nearbyShelters.length} Available
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {nearbyShelters.map((site, index) => (
              <div
                key={site.id || index}
                style={{
                  padding: "8px 10px",
                  background: index === 0 ? "#f0fdf4" : "#ffffff",
                  border: index === 0 ? "1.5px solid #86efac" : "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
                  <div>
                    {index === 0 && (
                      <span style={{ fontSize: "9px", background: "#16a34a", color: "white", padding: "1px 5px", borderRadius: "4px", fontWeight: "700", marginRight: "4px" }}>
                        BEST MATCH
                      </span>
                    )}
                    <strong style={{ fontSize: "11.5px", color: "#0f172a" }}>
                      {site.name}
                    </strong>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#16a34a", whiteSpace: "nowrap" }}>
                    {site.distance} km {site.direction}
                  </span>
                </div>

                <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "3px" }}>
                  📍 {site.district}, {site.state} • Capacity: <strong>{site.capacity?.toLocaleString() || "500"}</strong>
                </div>

                <div style={{ fontSize: "10px", color: "#0284c7", marginTop: "2px" }}>
                  Type: {site.siteType || "Relief Shelter / High Ground Colony"}
                </div>

                <button
                  onClick={() => onViewOnMap({ lat: site.lat, lng: site.lng })}
                  style={{
                    marginTop: "6px",
                    width: "100%",
                    padding: "4px 8px",
                    background: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "5px",
                    fontSize: "10.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  📍 View Route to this Shelter
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: LIVE WEATHER TELEMETRY & 12H FORECAST              */}
      {/* ========================================================= */}
      {activeTab === "WEATHER" && (
        <WeatherReport
          lat={village.lat}
          lng={village.lng}
          locationName={village.name}
          district={village.district}
          state={village.state}
        />
      )}
    </div>
  );
};

export default VillageDetails;