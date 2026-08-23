
const MapLegend = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        background: "white",
        padding: "10px",
        borderRadius: "10px",
        zIndex: 1000,
      }}
    >
      <p>🔴 Critical</p>
      <p>🟠 High</p>
      <p>🟡 Medium</p>
      <p>🟢 Low</p>

      <hr />

      <p>🟦 Flood</p>
      <p>🟫 Landslide</p>
    </div>
  );
};

export default MapLegend;