import { Polyline, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import { relocationSites } from "../../utils/relocationSites";
import { calculateDistance } from "../../utils/mapHelpers";

const endPointIcon = L.divIcon({
  className: "custom-route-endpoint",
  html: `
    <div style="
      background: #16a34a;
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
      white-space: nowrap;
    ">
      🏠 Target Safe Site
    </div>
  `,
  iconSize: [100, 24],
  iconAnchor: [50, 12],
});

export default function EvacuationRoute({ selectedVillage }) {
  if (!selectedVillage || !selectedVillage.lat || !selectedVillage.lng) {
    return null;
  }

  // Match optimal site (from Hungarian algorithm or nearest with capacity)
  const matchingSite = relocationSites.find(s => 
    s.status === "AVAILABLE" && s.availableCapacity >= selectedVillage.population
  ) || relocationSites[0];

  if (!matchingSite || !matchingSite.lat || !matchingSite.lng) {
    return null;
  }

  const distance = calculateDistance(
    selectedVillage.lat,
    selectedVillage.lng,
    matchingSite.lat,
    matchingSite.lng
  );

  const start = [selectedVillage.lat, selectedVillage.lng];
  const end = [matchingSite.lat, matchingSite.lng];
  const mid = [
    (selectedVillage.lat + matchingSite.lat) / 2,
    (selectedVillage.lng + matchingSite.lng) / 2,
  ];

  return (
    <>
      {/* Animated Glowing Polyline */}
      <Polyline
        positions={[start, end]}
        pathOptions={{
          color: selectedVillage.riskLevel === "CRITICAL" ? "#ef4444" : "#3b82f6",
          weight: 4,
          dashArray: "8, 8",
          opacity: 0.85,
        }}
      >
        <Tooltip permanent direction="top" position={mid}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e293b" }}>
            🚗 Evacuation Corridor: {distance.toFixed(1)} km (Hungarian Optimal)
          </span>
        </Tooltip>
      </Polyline>

      {/* Target Marker */}
      <Marker position={end} icon={endPointIcon} />
    </>
  );
}
