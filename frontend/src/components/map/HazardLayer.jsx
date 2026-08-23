import { Polygon, Popup } from "react-leaflet";

const HazardLayer = ({ hazards }) => {
  return (
    <>
      {hazards.map((hazard) => (
        <Polygon
          key={hazard.id}
          positions={hazard.coordinates}
          pathOptions={{
            color: hazard.color,
            fillOpacity: 0.4,
          }}
        >
          <Popup>
            <div>
              <h3>{hazard.type}</h3>

              <p>Hazard Zone</p>
            </div>
          </Popup>
        </Polygon>
      ))}
    </>
  );
};

export default HazardLayer;