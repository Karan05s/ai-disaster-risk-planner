const RiskFilter = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label>
        <strong>Risk Level</strong>
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
        <option value="ALL">All Risks</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>
    </div>
  );
};

export default RiskFilter;