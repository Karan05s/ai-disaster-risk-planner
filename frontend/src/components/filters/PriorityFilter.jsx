

const PriorityFilter = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label>
        <strong>Priority</strong>
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
        <option value="ALL">All Priorities</option>
        <option value="NORMAL">Normal</option>
        <option value="HIGH">High</option>
        <option value="IMMEDIATE">Immediate</option>
      </select>
    </div>
  );
};

export default PriorityFilter;