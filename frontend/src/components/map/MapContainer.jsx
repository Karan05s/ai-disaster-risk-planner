import VillageMarkers from "./VillageMarkers";
import HazardLayer from "./HazardLayer";
import RelocationSites from "./RelocationSites";
import MapLegend from "./MapLegend";
import MapFocus from "./MapFocus";

import {
  MapContainer,
  TileLayer,
} from "react-leaflet";

// India ka bounding box - fit karne ke liye aur pan-restrict karne ke liye
const INDIA_BOUNDS = [
  [6.5, 68.0],   // south-west corner
  [37.5, 97.5],  // north-east corner
];

const MapView = ({
  villages,
  hazards,
  selectedVillage,
  focusLocation,
}) => {

  return (
    <>
      <MapContainer
        bounds={INDIA_BOUNDS}
        boundsOptions={{ padding: [10, 10] }}
        minZoom={4}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

          {/* MAP FOCUS */}

        <MapFocus
          location={focusLocation}
        />

        {/* HAZARD POLYGONS */}

        <HazardLayer
          hazards={hazards}
        />

        {/* VILLAGE MARKERS */}

        <VillageMarkers
          villages={villages}
          selectedVillage={selectedVillage}
        />

        {/* RELOCATION SITES */}

        <RelocationSites />
      </MapContainer>

      {/* MAP LEGEND */}

      <MapLegend />
    </>
  );
};

export default MapView;