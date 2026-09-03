import { useState, useEffect } from "react";
import { fetchRealtimeWeather } from "../../services/weatherService";
import { getDistrictLiveReport } from "../../services/riskFusionService";
import { relocationSites } from "../../utils/relocationSites";

const riskLevelColors = {
  CRITICAL: { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", badge: "#dc2626", glow: "rgba(220, 38, 38, 0.2)" },
  HIGH: { bg: "#fff7ed", border: "#fdba74", text: "#9a3412", badge: "#ea580c", glow: "rgba(234, 88, 12, 0.2)" },
  MEDIUM: { bg: "#fefce8", border: "#fde047", text: "#854d0e", badge: "#ca8a04", glow: "rgba(202, 138, 4, 0.2)" },
  LOW: { bg: "#f0fdf4", border: "#86efac", text: "#166534", badge: "#16a34a", glow: "rgba(22, 163, 74, 0.2)" },
  SAFE: { bg: "#f0fdf4", border: "#86efac", text: "#166534", badge: "#16a34a", glow: "rgba(22, 163, 74, 0.2)" },
};

const DistrictLiveReportBanner = ({
  district,
  villages = [],
  hazards = [],
  onSelectLocation,
  onResetDistrict,
}) => {
  const [districtWeather, setDistrictWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Compute centroid of district
  const districtVillages = villages.filter(
    (v) => v.district && v.district.toLowerCase() === district.toLowerCase()
  );
  const districtShelters = relocationSites.filter(
    (s) => s.district && s.district.toLowerCase() === district.toLowerCase()
  );

  let centerLat = 26.14;
  let centerLng = 91.73;

  if (districtVillages.length > 0) {
    centerLat = districtVillages.reduce((acc, v) => acc + v.lat, 0) / districtVillages.length;
    centerLng = districtVillages.reduce((acc, v) => acc + v.lng, 0) / districtVillages.length;
  } else if (districtShelters.length > 0) {
    centerLat = districtShelters.reduce((acc, s) => acc + s.lat, 0) / districtShelters.length;
    centerLng = districtShelters.reduce((acc, s) => acc + s.lng, 0) / districtShelters.length;
  }

  // Fetch district live weather
  useEffect(() => {
    if (!district || district === "ALL") return;

    let isMounted = true;
    setLoadingWeather(true);

    fetchRealtimeWeather(centerLat, centerLng)
      .then((data) => {
        if (isMounted) {
          setDistrictWeather(data);
          setLoadingWeather(false);
        }
      })
      .catch((err) => {
        console.warn("District weather fetch error:", err);
        if (isMounted) setLoadingWeather(false);
      });

    return () => {
      isMounted = false;
    };
  }, [district, centerLat, centerLng]);

  if (!district || district === "ALL") {
    return null;
  }

  const report = getDistrictLiveReport({
    districtName: district,
    villagesList: villages,
    relocationSitesList: relocationSites,
    hazardsList: hazards,
    districtWeather,
  });

  if (!report) return null;

  const { assessment, totalPopulation, totalCapacity, availableCapacity, shelterCount, villageCount } = report;
  const currentRiskLevel = assessment.dynamicRisk.level;
  const colors = riskLevelColors[currentRiskLevel] || riskLevelColors.SAFE;
  const weatherCurrent = districtWeather?.current;

  return (
    <div
      style={{
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "12px 14px",
        marginBottom: "12px",
        boxShadow: `0 4px 14px ${colors.glow}`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      {/* HEADER ROW */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: "800",
              color: "#ffffff",
              background: colors.badge,
              padding: "3px 8px",
              borderRadius: "6px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>LIVE RISK:</span>
            <span>{currentRiskLevel}</span>
          </span>

          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
            📍 {district} District, {report.state}
          </h3>

          {weatherCurrent && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "2px 8px",
                borderRadius: "14px",
                fontSize: "11px",
                fontWeight: "600",
                color: "#0369a1",
              }}
            >
              <span>{weatherCurrent.icon}</span>
              <span>{weatherCurrent.temperature}°C</span>
              <span>•</span>
              <span style={{ color: weatherCurrent.precipitation > 0 ? "#dc2626" : "#0284c7" }}>
                💧 {weatherCurrent.precipitation} mm/h
              </span>
              <span>•</span>
              <span>💨 {weatherCurrent.windSpeed} km/h</span>
            </div>
          )}

          {loadingWeather && (
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              📡 Syncing live satellite weather...
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              padding: "3px 8px",
              fontSize: "11px",
              fontWeight: "600",
              color: "#475569",
              cursor: "pointer",
            }}
          >
            {expanded ? "Collapse ▲" : "Expand Report ▼"}
          </button>

          {onResetDistrict && (
            <button
              onClick={onResetDistrict}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11px",
                fontWeight: "600",
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Clear Filter ✕
            </button>
          )}
        </div>
      </div>

      {/* EXPLAINABLE DIAGNOSTIC RATIONALE */}
      <div
        style={{
          marginTop: "8px",
          padding: "8px 10px",
          background: "#ffffff",
          borderRadius: "8px",
          border: "1px solid rgba(0,0,0,0.06)",
          fontSize: "12px",
          color: "#1e293b",
          lineHeight: "1.45",
        }}
      >
        <div style={{ fontWeight: "700", color: colors.text, marginBottom: "2px", display: "flex", alignItems: "center", gap: "5px" }}>
          <span>🛡️</span>
          <span>Dynamic Risk Fusion Assessment:</span>
        </div>
        <div>
          {assessment.dynamicRisk.explainableReason}
        </div>
      </div>

      {/* EXPANDED CONTENT: METRICS & NEARBY SHELTERS */}
      {expanded && (
        <div style={{ marginTop: "10px" }}>
          {/* STATS GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "10.5px", color: "#64748b" }}>Monitored Habitations</div>
              <strong style={{ fontSize: "13px", color: "#0f172a" }}>{villageCount || "1 Regional"}</strong>
            </div>

            <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "10.5px", color: "#64748b" }}>Estimated Population</div>
              <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                {totalPopulation ? totalPopulation.toLocaleString() : "15,000"}
              </strong>
            </div>

            <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "10.5px", color: "#64748b" }}>Safe Shelters in District</div>
              <strong style={{ fontSize: "13px", color: "#16a34a" }}>
                {shelterCount} Safe Sites
              </strong>
            </div>

            <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "10.5px", color: "#64748b" }}>Total Buffer Capacity</div>
              <strong style={{ fontSize: "13px", color: "#0284c7" }}>
                {totalCapacity ? totalCapacity.toLocaleString() : "Available"}
              </strong>
            </div>
          </div>

          {/* NEARBY SAFE SHELTERS FOR THIS DISTRICT */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#0f172a" }}>
                🏠 Designated Safe Relief Shelters & Evacuation Points
              </span>
              <span style={{ fontSize: "10.5px", color: "#16a34a", fontWeight: "600" }}>
                Ranked by Geodesic Proximity
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "8px",
              }}
            >
              {assessment.nearbyShelters.slice(0, 3).map((shelter, idx) => (
                <div
                  key={shelter.id || idx}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
                      <strong style={{ fontSize: "11.5px", color: "#0f172a", lineHeight: "1.3" }}>
                        {shelter.name}
                      </strong>
                      <span
                        style={{
                          fontSize: "9.5px",
                          fontWeight: "700",
                          color: "#16a34a",
                          background: "#dcfce7",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {shelter.distance} km {shelter.direction}
                      </span>
                    </div>

                    <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "3px" }}>
                      Capacity: <strong>{shelter.capacity?.toLocaleString() || "500"}</strong> • Status:{" "}
                      <span style={{ color: "#16a34a", fontWeight: "600" }}>{shelter.status || "AVAILABLE"}</span>
                    </div>
                  </div>

                  {onSelectLocation && (
                    <button
                      onClick={() =>
                        onSelectLocation({
                          ...shelter,
                          isRelocationSite: true,
                        })
                      }
                      style={{
                        marginTop: "6px",
                        background: "#0284c7",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "4px 8px",
                        fontSize: "10.5px",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      📍 View Shelter on Map
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictLiveReportBanner;
