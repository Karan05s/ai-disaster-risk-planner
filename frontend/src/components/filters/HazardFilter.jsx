const HazardFilter = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label>
        <strong>Hazard Type</strong>
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginTop: "8px",
        }}
      >
        <option value="ALL">All Hazards</option>
        <option value="Flood">Flood</option>
        <option value="Landslide">Landslide</option>
      </select>
    </div>
  );
};

export default HazardFilter;