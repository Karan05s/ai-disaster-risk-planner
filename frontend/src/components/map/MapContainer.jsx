import { useEffect } from "react";

import VillageMarkers from "./VillageMarkers";
import HazardLayer from "./HazardLayer";
import RelocationSites from "./RelocationSites";
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
  focusLocation,
}) => {
  return (
    <>
      <MapContainer
        center={[22.5, 79]}
        zoom={5}
        minZoom={5}
        maxZoom={12}
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
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFocus
          location={focusLocation}
        />

        <HazardLayer
          hazards={hazards}
        />

        <VillageMarkers
          villages={villages}
          selectedVillage={selectedVillage}
        />

        <RelocationSites />
      </MapContainer>

      <MapLegend />
    </>
  );
};

export default MapView;