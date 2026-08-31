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
  useMap,
} from "react-leaflet";

const INDIA_BOUNDS = [
  [6.5, 68.0],
  [37.5, 97.5],
];

const TILES = {
  CLEAN: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  TOPO: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
};

// India ko perfectly fit karne ke liye
const IndiaBoundsController = () => {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(INDIA_BOUNDS, {
      padding: [20, 20],
    });
  }, [map]);

  return null;
};

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

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* MAP LAYER CONTROLS (Floating HUD) */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          zIndex: 1000,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(8px)",
          padding: "8px 12px",
          borderRadius: "8px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <button
          onClick={() => setTileTheme(tileTheme === "CLEAN" ? "TOPO" : "CLEAN")}
          style={{
            background: tileTheme === "TOPO" ? "#16a34a" : "#334155",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "5px 10px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {tileTheme === "TOPO" ? "🏔️ Terrain Map" : "🗺️ Street Map"}
        </button>

        <button
          onClick={() => setShowHazards(!showHazards)}
          style={{
            background: showHazards ? "#ea580c" : "#334155",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "5px 9px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {showHazards ? "🌊 Hazards ON" : "Hazards OFF"}
        </button>

        <button
          onClick={() => setShowShelters(!showShelters)}
          style={{
            background: showShelters ? "#16a34a" : "#334155",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "5px 9px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {showShelters ? "🏠 Shelters ON" : "Shelters OFF"}
        </button>
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

        {showShelters && <RelocationSites />}

        {/* HUNGARIAN OPTIMAL EVACUATION CORRIDOR */}
        {showRoutes && <EvacuationRoute selectedVillage={selectedVillage} />}
      </MapContainer>

      <MapLegend />
    </div>
  );
};

export default MapView;