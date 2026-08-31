import { useEffect, useState } from "react";
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
      🏠 Safe Shelter
    </div>
  `,
  iconSize: [100, 24],
  iconAnchor: [50, 12],
});

/**
 * Fetch real road-based route geometry from OSRM (Open Source Routing Machine).
 * Falls back to straight line if OSRM is unreachable.
 */
async function fetchOSRMRoute(startLat, startLng, endLat, endLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // OSRM returns [lng, lat] — Leaflet needs [lat, lng]
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const distanceKm = route.distance / 1000;
      const durationMin = Math.round(route.duration / 60);
      return { coords, distanceKm, durationMin };
    }
  } catch (err) {
    console.warn("OSRM route fetch failed, falling back to straight line:", err);
  }
  return null;
}

export default function EvacuationRoute({ selectedVillage }) {
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distanceKm: 0, durationMin: 0 });
  const [loading, setLoading] = useState(false);

  // Match optimal site (from Hungarian algorithm — nearest available with sufficient capacity)
  const matchingSite = (() => {
    if (!selectedVillage) return null;
    const candidates = relocationSites
      .filter(s => s.status === "AVAILABLE" && s.availableCapacity >= (selectedVillage.population || 0))
      .map(s => ({
        ...s,
        dist: calculateDistance(selectedVillage.lat, selectedVillage.lng, s.lat, s.lng),
      }))
      .sort((a, b) => a.dist - b.dist);
    return candidates.length > 0 ? candidates[0] : relocationSites[0];
  })();

  // Fetch real road route whenever selected village changes
  useEffect(() => {
    if (!selectedVillage || !selectedVillage.lat || !selectedVillage.lng || !matchingSite || !matchingSite.lat) {
      setRouteCoords(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchOSRMRoute(selectedVillage.lat, selectedVillage.lng, matchingSite.lat, matchingSite.lng)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setRouteCoords(result.coords);
          setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });
        } else {
          // Fallback: straight line
          setRouteCoords([
            [selectedVillage.lat, selectedVillage.lng],
            [matchingSite.lat, matchingSite.lng],
          ]);
          const d = calculateDistance(selectedVillage.lat, selectedVillage.lng, matchingSite.lat, matchingSite.lng);
          setRouteInfo({ distanceKm: d, durationMin: Math.round(d * 1.5) });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedVillage?.id]);

  if (!selectedVillage || !routeCoords || routeCoords.length === 0) {
    return null;
  }

  const isCritical = selectedVillage.riskLevel === "CRITICAL";

  // Midpoint for label
  const midIdx = Math.floor(routeCoords.length / 2);
  const midPoint = routeCoords[midIdx] || routeCoords[0];

  return (
    <>
      {/* Outer glow line */}
      <Polyline
        positions={routeCoords}
        pathOptions={{
          color: isCritical ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)",
          weight: 10,
          lineCap: "round",
          lineJoin: "round",
        }}
      />

      {/* Main road route */}
      <Polyline
        positions={routeCoords}
        pathOptions={{
          color: isCritical ? "#dc2626" : "#2563eb",
          weight: 4,
          dashArray: "10, 6",
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }}
      >
        <Tooltip permanent direction="top" position={midPoint}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e293b" }}>
            🚗 {routeInfo.distanceKm.toFixed(1)} km • ~{routeInfo.durationMin} min (Road Route)
          </span>
        </Tooltip>
      </Polyline>

      {/* Destination marker */}
      <Marker position={routeCoords[routeCoords.length - 1]} icon={endPointIcon} />
    </>
  );
}
