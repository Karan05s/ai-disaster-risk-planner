import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { relocationSites } from "../../utils/relocationSites";

const relocationIcon = L.divIcon({
  className: "",
  html: `
    <div
      style="
        width: 32px;
        height: 32px;
        background: rgba(22, 163, 74, 0.85);
        border: 2px solid rgba(255, 255, 255, 0.95);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        font-size: 16px;
        cursor: pointer;
      "
    >
      🏠
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const RelocationSites = ({ onSelectSite }) => {
  return (
    <>
      {relocationSites.map((site) => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng]}
          icon={relocationIcon}
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
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#166534", marginBottom: "4px" }}>
                🏠 {site.name}
              </div>
              <div style={{ fontSize: "12px", color: "#475569", marginBottom: "6px" }}>
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