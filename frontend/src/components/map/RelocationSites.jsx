import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

import { relocationSites } from "../../utils/relocationSites";

const relocationIcon = L.divIcon({
  className: "",
  html: `
    <div
      style="
        width: 34px;
        height: 34px;
        background: #16a34a;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 18px;
      "
    >
      🏠
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const RelocationSites = () => {
  return (
    <>
      {relocationSites.map((site) => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng]}
          icon={relocationIcon}
        >
          <Popup>
            <div>
              <h3>{site.name}</h3>

              <p>
                District: {site.district}
              </p>

              <p>
                Capacity: {site.capacity}
              </p>

              <p>
                Available: {site.availableCapacity}
              </p>

              <p>
                Status: {site.status}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default RelocationSites;