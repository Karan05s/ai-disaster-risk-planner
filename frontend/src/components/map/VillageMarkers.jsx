import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Risk level ke hisaab se color
const riskColors = {
  CRITICAL: "#e63946", // red
  HIGH: "#f77f00",     // orange
  MEDIUM: "#e9c46a",   // yellow/gold
  LOW: "#2a9d8f",      // green
};

// Custom colored circle icon banane ka function
const createIcon = (riskLevel) => {
  const color = riskColors[riskLevel] || "#6c757d"; // fallback grey

  return L.divIcon({
    className: "custom-village-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  });
};

const VillageMarkers = ({ villages, selectedVillage }) => {
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
          icon={createIcon(village.riskLevel)}
          ref={(marker) => {
            markerRefs.current[village.id] = marker;
          }}
        >
          <Popup>
            <div>
              <h3>{village.name}</h3>

              <p>
                <strong>District:</strong>{" "}
                {village.district}
              </p>

              <p>
                <strong>Risk:</strong>{" "}
                {village.riskLevel}
              </p>

              <p>
                <strong>Hazard:</strong>{" "}
                {village.hazardType}
              </p>

              <p>
                <strong>Population:</strong>{" "}
                {village.population}
              </p>

              <p>
                <strong>Priority:</strong>{" "}
                {village.priority}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default VillageMarkers;