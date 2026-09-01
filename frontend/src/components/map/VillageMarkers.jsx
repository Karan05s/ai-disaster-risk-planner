import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Risk level color mapping
const riskColors = {
  CRITICAL: "#dc2626", // bold red
  HIGH: "#ea580c",     // intense orange
  MEDIUM: "#d97706",   // amber
  LOW: "#16a34a",      // emerald green
};

const createIcon = (riskLevel, isAnomaly) => {
  const color = riskColors[riskLevel] || "#6c757d";
  const isCritical = riskLevel === "CRITICAL";

  return L.divIcon({
    className: "custom-village-marker",
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isCritical ? `
          <div style="
            position: absolute;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(220, 38, 38, 0.35);
            animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          "></div>
        ` : ""}
        <div style="
          background-color: ${color};
          width: ${isCritical ? "20px" : "16px"};
          height: ${isCritical ? "20px" : "16px"};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: white;
          font-weight: bold;
        ">
          ${isAnomaly ? "⚠️" : ""}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const VillageMarkers = ({ villages, selectedVillage, onSelectVillage }) => {
  const markerRefs = useRef({});

  useEffect(() => {
    if (!selectedVillage) {
      return;
    }
    const marker = markerRefs.current[selectedVillage.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedVillage]);

  return (
    <>
      {villages.map((village) => (
        <Marker
          key={village.id}
          position={[village.lat, village.lng]}
          icon={createIcon(village.riskLevel, village.isAnomaly)}
          eventHandlers={{
            click: () => {
              if (onSelectVillage) {
                onSelectVillage(village);
              }
            },
          }}
          ref={(marker) => {
            markerRefs.current[village.id] = marker;
          }}
        >
          <Popup>
            <div style={{ minWidth: "190px", fontFamily: "system-ui, sans-serif" }}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a", marginBottom: "2px" }}>
                {village.name}
              </div>
              <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "6px" }}>
                📍 {village.district}, {village.state}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "11px", marginBottom: "6px" }}>
                <div>Risk: <strong style={{ color: riskColors[village.riskLevel] || "#64748b" }}>{village.riskLevel}</strong></div>
                <div>Priority: <strong>{village.priority}</strong></div>
                <div>Pop: <strong>{village.population?.toLocaleString()}</strong></div>
                <div>Hazard: <strong>{village.hazardType}</strong></div>
              </div>

              {village.dominantFactor && (
                <div style={{ fontSize: "10.5px", background: "#f1f5f9", padding: "3px 6px", borderRadius: "4px", color: "#334155", marginBottom: "6px" }}>
                  Driver: <strong>{village.dominantFactor}</strong>
                </div>
              )}

              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => onSelectVillage && onSelectVillage(village)}
                  style={{
                    flex: 1,
                    padding: "5px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  AI Route →
                </button>
                <button
                  onClick={() => onSelectVillage && onSelectVillage({ ...village, openWeather: true })}
                  style={{
                    flex: 1,
                    padding: "5px",
                    background: "#0284c7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  ⛅ Weather
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default VillageMarkers;