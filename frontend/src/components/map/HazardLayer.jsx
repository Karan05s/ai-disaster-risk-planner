import { Circle, Polygon, Tooltip, Popup, Marker } from "react-leaflet";
import L from "leaflet";

// Real-Time Animated Thunderstorm / Heavy Rain Badge
const createThunderstormMarker = (rainMm, isStorm) => {
  return L.divIcon({
    className: "custom-thunder-marker",
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <!-- PULSING STORM RING -->
        <div style="
          position: absolute;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(147, 51, 234, 0.35);
          animation: pulse-ring 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        "></div>

        <!-- STORM BADGE -->
        <div style="
          background: linear-gradient(135deg, #4c1d95 0%, #7e22ce 100%);
          border: 2px solid #ffffff;
          padding: 3px 6px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 3px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          font-family: system-ui, sans-serif;
        ">
          <span style="font-size: 13px;">⛈️</span>
          <span>${rainMm > 0 ? `${rainMm}mm` : "Storm"}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Helper to determine cause & risk factors dynamically
const getHazardDiagnostics = (hazard, isLandslide, isCoastal) => {
  if (isLandslide) {
    return {
      cause: "Steep mountain slope destabilization triggered by rainfall infiltration & saturated pore-water pressure.",
      riskFactors: "Steep slope gradient (>30°), saturated soil moisture, heavy runoff, deforestation & hill settlement exposure.",
    };
  }
  if (isCoastal) {
    return {
      cause: "Tidal storm surge, estuarine backup, and low-lying coastal drainage congestion.",
      riskFactors: "High tide confluence, cyclonic depression winds, sub-sea level topography, coastal population density.",
    };
  }
  return {
    cause: "High upstream catchment discharge, riverbank breach, and floodplain inundation.",
    riskFactors: "Heavy monsoon precipitation, riverbed siltation, embankment vulnerability, high habitation exposure.",
  };
};

const HazardLayer = ({ hazards = [] }) => {
  return (
    <>
      {hazards.map((hazard) => {
        if (!hazard.coordinates || hazard.coordinates.length === 0) return null;

        const avgLat = hazard.centroid
          ? hazard.centroid[0]
          : hazard.coordinates.reduce((acc, pt) => acc + pt[0], 0) / hazard.coordinates.length;
        const avgLng = hazard.centroid
          ? hazard.centroid[1]
          : hazard.coordinates.reduce((acc, pt) => acc + pt[1], 0) / hazard.coordinates.length;

        const isLandslide = hazard.hazardCategory === "LANDSLIDE" || hazard.type === "Landslide";
        const isCoastal = hazard.hazardCategory === "COASTAL_FLOOD" || hazard.type === "Coastal Flood";
        const isFlood = !isLandslide && !isCoastal;

        const zoneRadius = hazard.radiusMeters || (isFlood ? 28000 : (isCoastal ? 30000 : 24000));
        const diagnostics = getHazardDiagnostics(hazard, isLandslide, isCoastal);

        // Color & Translucency Matrix
        let circleStyles = {};
        let polygonStyles = {};
        let emoji = "🌊";

        if (isLandslide) {
          emoji = "⛰️";
          circleStyles = {
            color: "#b45309",      // Deep warm amber
            fillColor: "#f59e0b",  // Translucent amber
            fillOpacity: 0.22,
            weight: 1.5,
            dashArray: "6 6",
          };
          polygonStyles = {
            color: "rgba(180, 83, 9, 0.40)",
            fillColor: "#fde68a",
            fillOpacity: 0.12,
            weight: 1,
            dashArray: "4 4",
          };
        } else if (isCoastal) {
          emoji = "🏖️";
          circleStyles = {
            color: "#0f766e",      // Deep teal/cyan
            fillColor: "#14b8a6",  // Translucent cyan-teal
            fillOpacity: 0.22,
            weight: 1.5,
            dashArray: "6 6",
          };
          polygonStyles = {
            color: "rgba(15, 118, 110, 0.40)",
            fillColor: "#99f6e4",
            fillOpacity: 0.12,
            weight: 1,
            dashArray: "4 4",
          };
        } else {
          emoji = "🌊";
          circleStyles = {
            color: "#2563eb",      // Royal blue
            fillColor: "#3b82f6",  // Translucent sky blue
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: "6 6",
          };
          polygonStyles = {
            color: "rgba(37, 99, 235, 0.40)",
            fillColor: "#93c5fd",
            fillOpacity: 0.10,
            weight: 1,
            dashArray: "4 4",
          };
        }

        const showStormMarker = hazard.isThunderstorm || hazard.isHeavyRain || (hazard.precipitation >= 4.0);

        return (
          <div key={`hazard-group-${hazard.id}`}>
            {/* 1. CIRCULAR TRANSLUCENT HAZARD ZONE WITH HOVER TOOLTIP & CLICK POPUP */}
            <Circle
              center={[avgLat, avgLng]}
              radius={zoneRadius}
              pathOptions={{
                color: circleStyles.color,
                fillColor: circleStyles.fillColor,
                fillOpacity: circleStyles.fillOpacity,
                weight: circleStyles.weight,
                dashArray: circleStyles.dashArray,
              }}
              eventHandlers={{
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({ weight: 2.5, fillOpacity: circleStyles.fillOpacity + 0.10 });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle({ weight: circleStyles.weight, fillOpacity: circleStyles.fillOpacity });
                },
              }}
            >
              {/* INSTANT MOUSEOVER HOVER TOOLTIP */}
              <Tooltip sticky direction="top" opacity={0.98}>
                <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", minWidth: "210px", padding: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
                    <span style={{ fontSize: "14px" }}>{emoji}</span>
                    <strong style={{ color: circleStyles.color, fontSize: "12.5px" }}>
                      {hazard.regionName || `${hazard.type} Hazard Buffer`}
                    </strong>
                  </div>

                  <div style={{ fontSize: "11px", color: "#1e293b", marginBottom: "4px", lineHeight: "1.35" }}>
                    <span style={{ color: "#64748b", fontWeight: "700" }}>Cause: </span>
                    {diagnostics.cause}
                  </div>

                  <div
                    style={{
                      background: isLandslide ? "#fef3c7" : (isCoastal ? "#ccfbf1" : "#eff6ff"),
                      border: `1px solid ${isLandslide ? "#fde68a" : (isCoastal ? "#99f6e4" : "#bfdbfe")}`,
                      padding: "4px 6px",
                      borderRadius: "5px",
                      fontSize: "10.5px",
                      color: "#1e293b",
                      lineHeight: "1.35",
                    }}
                  >
                    <div>⚠️ <strong>Risk Factors:</strong> {diagnostics.riskFactors}</div>
                    <div style={{ marginTop: "3px", display: "flex", justifyContent: "space-between", color: "#475569", fontWeight: "600" }}>
                      <span>Radius: <strong>{Math.round(zoneRadius / 1000)} km</strong></span>
                      <span>Severity: <strong style={{ color: hazard.severity === "CRITICAL" ? "#dc2626" : (hazard.severity === "HIGH" ? "#ea580c" : "#0284c7") }}>{hazard.severity || "ACTIVE"}</strong></span>
                    </div>
                  </div>
                </div>
              </Tooltip>

              {/* DETAILED CLICK POPUP */}
              <Popup>
                <div style={{ fontFamily: "system-ui, sans-serif", minWidth: "190px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "15px" }}>{emoji}</span>
                    <strong style={{ color: circleStyles.color, fontSize: "13px" }}>
                      {hazard.regionName ? `${hazard.regionName}` : `${hazard.type} Hazard Buffer`}
                    </strong>
                  </div>

                  {hazard.state && (
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "3px" }}>
                      📍 {hazard.state} • {avgLat.toFixed(3)}°N, {avgLng.toFixed(3)}°E
                    </div>
                  )}

                  <div style={{ fontSize: "10.5px", background: isLandslide ? "#fef3c7" : (isCoastal ? "#ccfbf1" : "#eff6ff"), padding: "4px 6px", borderRadius: "5px", color: "#1e293b", margin: "4px 0", lineHeight: "1.35" }}>
                    ⚠️ <strong>Live Threat:</strong> {hazard.alertMessage || `Active ${hazard.type} Monitoring Buffer`}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "10.5px", marginTop: "4px" }}>
                    <div>Radius: <strong>{Math.round(zoneRadius / 1000)} km</strong></div>
                    <div>Severity: <strong style={{ color: hazard.severity === "CRITICAL" ? "#dc2626" : (hazard.severity === "HIGH" ? "#ea580c" : "#0284c7") }}>{hazard.severity || "ACTIVE"}</strong></div>
                    {hazard.precipitation !== undefined && (
                      <div style={{ gridColumn: "span 2", color: "#0284c7" }}>
                        Live Rain: <strong>{hazard.precipitation} mm/h</strong> {showStormMarker ? "⛈️ Severe" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Circle>

            {/* 2. INNER TRANSLUCENT PERIMETER POLYGON */}
            <Polygon
              positions={hazard.coordinates}
              pathOptions={{
                color: polygonStyles.color,
                fillColor: polygonStyles.fillColor,
                fillOpacity: polygonStyles.fillOpacity,
                weight: polygonStyles.weight,
                dashArray: polygonStyles.dashArray,
              }}
            />

            {/* 3. REAL-TIME THUNDERSTORM / HEAVY RAIN INDICATOR (⛈️) */}
            {showStormMarker && (
              <Marker
                position={[avgLat, avgLng]}
                icon={createThunderstormMarker(hazard.precipitation || 0, hazard.isThunderstorm)}
              >
                <Tooltip sticky direction="top" opacity={0.98}>
                  <div style={{ fontFamily: "system-ui, sans-serif", minWidth: "160px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>⛈️</span>
                      <strong>Active Thunderstorm / Rain Cell</strong>
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                      Precipitation: <strong>{hazard.precipitation} mm/h</strong>
                    </div>
                  </div>
                </Tooltip>

                <Popup>
                  <div style={{ fontFamily: "system-ui, sans-serif", minWidth: "175px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
                      <span style={{ fontSize: "16px" }}>⛈️</span>
                      <strong style={{ color: "#7e22ce", fontSize: "13px" }}>
                        Active Thunderstorm Cell
                      </strong>
                    </div>
                    <div style={{ fontSize: "11px", color: "#475569" }}>
                      📍 {hazard.regionName || hazard.state}
                    </div>
                    <div style={{ fontSize: "11px", background: "#faf5ff", border: "1px solid #e9d5ff", padding: "4px 6px", borderRadius: "5px", color: "#581c87", marginTop: "4px" }}>
                      Rainfall Intensity: <strong>{hazard.precipitation} mm/h</strong><br />
                      Wind Speed: <strong>{hazard.windSpeed || 15} km/h</strong>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </div>
        );
      })}
    </>
  );
};

export default HazardLayer;