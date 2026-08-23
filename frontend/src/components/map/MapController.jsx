

import { useEffect } from "react";
import { useMap } from "react-leaflet";

const MapController = ({ selectedVillage }) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedVillage) {
      return;
    }

    map.flyTo(
      [
        selectedVillage.lat,
        selectedVillage.lng,
      ],
      12,
      {
        duration: 1.5,
      }
    );
  }, [selectedVillage, map]);

  return null;
};

export default MapController;