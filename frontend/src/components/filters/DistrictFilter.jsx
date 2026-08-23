

const DistrictFilter = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label>
        <strong>District</strong>
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
        <option value="ALL">All Districts</option>
        <option value="Bhopal">Bhopal</option>
        <option value="Sehore">Sehore</option>
        <option value="Vidisha">Vidisha</option>
      </select>
    </div>
  );
};

export default DistrictFilter;