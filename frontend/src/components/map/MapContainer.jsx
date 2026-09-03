import { useEffect, useState } from "react";
import VillageMarkers from "./VillageMarkers";
import HazardLayer from "./HazardLayer";
import RelocationSites from "./RelocationSites";
import EvacuationRoute from "./EvacuationRoute";
import MapLegend from "./MapLegend";
import MapFocus from "./MapFocus";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import { isWaterOrUninhabitedTerrain } from "../../services/riskFusionService";

const INDIA_BOUNDS = [
  [6.5, 68.0],
  [37.5, 97.5],
];

const TILES = {
  CLEAN: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  TOPO: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
};

// India fitting
const IndiaBoundsController = () => {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(INDIA_BOUNDS, {
      padding: [20, 20],
    });
  }, [map]);

  return null;
};

// Custom coordinate click detector
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const customPinIcon = L.divIcon({
  className: "custom-click-pin",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #0284c7;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    ">
      <div style="
        transform: rotate(45deg);
        font-size: 14px;
      ">📍</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapView = ({
  villages,
  hazards,
  selectedVillage,
  onSelectVillage,
  focusLocation,
}) => {
  const [tileTheme, setTileTheme] = useState("CLEAN");
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [customPin, setCustomPin] = useState(null);

  const handleMapClick = (latlng) => {
    const fastWater = isWaterOrUninhabitedTerrain(latlng.lat, latlng.lng);
    const newLocation = {
      id: `CUSTOM-${Date.now().toString().slice(-4)}`,
      name: fastWater ? `${fastWater.name || "Water Body"} (${latlng.lat.toFixed(3)}°N, ${latlng.lng.toFixed(3)}°E)` : `Pin (${latlng.lat.toFixed(3)}°N, ${latlng.lng.toFixed(3)}°E)`,
      district: fastWater ? (fastWater.type || "Water Surface") : "Custom Location",
      state: "India",
      lat: latlng.lat,
      lng: latlng.lng,
      isCustomLocation: true,
      isWaterTerrain: !!fastWater,
      waterType: fastWater ? fastWater.type : null,
      riskLevel: fastWater ? "CANNOT_DETERMINE" : "SAFE",
      priority: "ADVISORY",
    };
    setCustomPin(newLocation);
    if (onSelectVillage) {
      onSelectVillage(newLocation);
    }
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* MAP LAYER CONTROLS (Floating HUD) */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 1000,
          background: "#ffffff",
          padding: "5px 8px",
          borderRadius: "8px",
          display: "flex",
          gap: "6px",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          border: "1px solid #e2e8f0",
        }}
      >
        <button
          onClick={() => setTileTheme(tileTheme === "CLEAN" ? "TOPO" : "CLEAN")}
          style={{
            background: tileTheme === "TOPO" ? "#0284c7" : "#f1f5f9",
            color: tileTheme === "TOPO" ? "#ffffff" : "#334155",
            border: "1px solid " + (tileTheme === "TOPO" ? "#0284c7" : "#e2e8f0"),
            borderRadius: "6px",
            padding: "4px 8px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {tileTheme === "TOPO" ? "🏔️ Terrain" : "🗺️ Streets"}
        </button>

        <button
          onClick={() => setShowHazards(!showHazards)}
          style={{
            background: showHazards ? "#ea580c" : "#f1f5f9",
            color: showHazards ? "#ffffff" : "#475569",
            border: "1px solid " + (showHazards ? "#ea580c" : "#e2e8f0"),
            borderRadius: "6px",
            padding: "4px 8px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {showHazards ? "🌊 Hazards" : "Hazards Off"}
        </button>

        <button
          onClick={() => setShowShelters(!showShelters)}
          style={{
            background: showShelters ? "#16a34a" : "#f1f5f9",
            color: showShelters ? "#ffffff" : "#475569",
            border: "1px solid " + (showShelters ? "#16a34a" : "#e2e8f0"),
            borderRadius: "6px",
            padding: "4px 8px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {showShelters ? "🏠 Shelters" : "Shelters Off"}
        </button>
      </div>

      {/* MAP CLICK HINT PILL */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "55px",
          zIndex: 1000,
          background: "#ffffff",
          color: "#334155",
          fontSize: "11px",
          padding: "4px 10px",
          borderRadius: "16px",
          border: "1px solid #cbd5e1",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          pointerEvents: "none",
        }}
      >
        <span>💡</span>
        <span>Click anywhere on map to inspect real-time weather & 12h forecast</span>
      </div>

      <MapContainer
        center={[22.5, 79]}
        zoom={5}
        minZoom={4}
        maxZoom={14}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "12px",
        }}
      >
        <IndiaBoundsController />
        <MapClickHandler onMapClick={handleMapClick} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={TILES[tileTheme] || TILES.CLEAN}
        />

        <MapFocus location={focusLocation} />

        {showHazards && <HazardLayer hazards={hazards} />}

        <VillageMarkers
          villages={villages}
          selectedVillage={selectedVillage}
          onSelectVillage={onSelectVillage}
        />

        {showShelters && <RelocationSites onSelectSite={onSelectVillage} />}

        {/* CUSTOM CLICKED PIN OR SEARCH GEOCODED PIN */}
        {(customPin || (selectedVillage && selectedVillage.isCustomLocation)) && (
          <Marker
            position={[
              selectedVillage?.isCustomLocation ? selectedVillage.lat : customPin.lat,
              selectedVillage?.isCustomLocation ? selectedVillage.lng : customPin.lng,
            ]}
            icon={customPinIcon}
          >
            <Popup>
              <div style={{ fontFamily: "system-ui, sans-serif", minWidth: "170px" }}>
                <strong style={{ color: "#0284c7", fontSize: "13px" }}>
                  📍 {selectedVillage?.isCustomLocation ? selectedVillage.name : "Selected Coordinate"}
                </strong>
                <div style={{ fontSize: "11.5px", color: "#64748b", margin: "4px 0 8px 0" }}>
                  {(selectedVillage?.isCustomLocation ? selectedVillage.lat : customPin.lat).toFixed(4)}°N,{" "}
                  {(selectedVillage?.isCustomLocation ? selectedVillage.lng : customPin.lng).toFixed(4)}°E
                </div>
                <button
                  onClick={() =>
                    onSelectVillage &&
                    onSelectVillage(selectedVillage?.isCustomLocation ? selectedVillage : customPin)
                  }
                  style={{
                    width: "100%",
                    padding: "4px 8px",
                    background: "#0284c7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  View Real-Time Weather →
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* HUNGARIAN OPTIMAL EVACUATION CORRIDOR */}
        {showRoutes && selectedVillage && !selectedVillage.isCustomLocation && (
          <EvacuationRoute selectedVillage={selectedVillage} />
        )}
      </MapContainer>

      <MapLegend />
    </div>
  );
};

export default MapView;