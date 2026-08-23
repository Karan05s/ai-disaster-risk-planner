

import { useEffect } from "react";
import { useMap } from "react-leaflet";

const MapFocus = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.flyTo(
      [location.lat, location.lng],
      13,
      {
        duration: 1.2,
      }
    );
  }, [location, map]);

  return null;
};

export default MapFocus;