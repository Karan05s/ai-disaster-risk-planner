const HazardFilter = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "5px" }}>
        <span>🌊</span>
        <span>Hazard Category</span>
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "7px 10px",
          marginTop: "6px",
          borderRadius: "6px",
          border: "1px solid #cbd5e1",
          background: "#ffffff",
          fontSize: "12px",
          color: "#0f172a",
          outline: "none",
          fontWeight: "500",
        }}
      >
        <option value="ALL">All Multi-Hazards</option>
        <option value="Flood">🌊 Riverine Flood</option>
        <option value="Coastal Flood">🏖️ Coastal Inundation</option>
        <option value="Landslide">⛰️ Landslide Slope</option>
      </select>
    </div>
  );
};

export default HazardFilter;