import { useState } from "react";
import { Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { relocationSites } from "../../utils/relocationSites";

// ZOOMED-OUT MINIMAL GREEN DOT ICON (< 8 zoom)
const greenDotIcon = L.divIcon({
  className: "custom-shelter-dot",
  html: `
    <div style="
      width: 9px;
      height: 9px;
      background: #16a34a;
      border: 1.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 5px rgba(22, 163, 74, 0.75), 0 1px 3px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.15s ease;
    "></div>
  `,
  iconSize: [9, 9],
  iconAnchor: [4.5, 4.5],
  popupAnchor: [0, -8],
});

// ZOOMED-IN DETAILED SHELTER ICON (>= 8 zoom)
const fullShelterIcon = L.divIcon({
  className: "custom-shelter-badge",
  html: `
    <div
      style="
        width: 30px;
        height: 30px;
        background: rgba(22, 163, 74, 0.90);
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        font-size: 15px;
        cursor: pointer;
        transition: transform 0.15s ease;
      "
    >
      🏠
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const RelocationSites = ({ onSelectSite }) => {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());

  // Listen for zoom changes
  useMapEvents({
    zoomend: () => {
      setCurrentZoom(map.getZoom());
    },
  });

  const isZoomedIn = currentZoom >= 8;
  const activeIcon = isZoomedIn ? fullShelterIcon : greenDotIcon;

  return (
    <>
      {relocationSites.map((site) => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng]}
          icon={activeIcon}
          eventHandlers={{
            click: () => {
              if (onSelectSite) {
                onSelectSite({
                  ...site,
                  isRelocationSite: true,
                  riskLevel: "LOW",
                  priority: "SAFE_HAVEN",
                });
              }
            },
          }}
        >
          <Popup>
            <div style={{ minWidth: "190px", fontFamily: "system-ui, sans-serif" }}>
              <div style={{ fontWeight: "700", fontSize: "13.5px", color: "#166534", marginBottom: "4px" }}>
                🏠 {site.name}
              </div>
              <div style={{ fontSize: "11.5px", color: "#475569", marginBottom: "6px" }}>
                📍 {site.district}, {site.state || "Assam"}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "11px", marginBottom: "8px", background: "#f0fdf4", padding: "6px", borderRadius: "6px" }}>
                <div>Total: <strong>{site.capacity?.toLocaleString()}</strong></div>
                <div>Available: <strong>{site.availableCapacity?.toLocaleString()}</strong></div>
                <div style={{ gridColumn: "span 2" }}>Status: <strong style={{ color: "#15803d" }}>{site.status}</strong></div>
              </div>

              <button
                onClick={() => {
                  if (onSelectSite) {
                    onSelectSite({
                      ...site,
                      isRelocationSite: true,
                      riskLevel: "LOW",
                      priority: "SAFE_HAVEN",
                    });
                  }
                }}
                style={{
                  width: "100%",
                  padding: "5px 8px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Inspect Live Weather & Site →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default RelocationSites;