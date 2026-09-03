import { relocationSites } from "../../utils/relocationSites";

const DistrictFilter = ({
  value,
  onChange,
  villages = [],
}) => {
  const villageDistricts = (villages || []).map((v) => v.district).filter(Boolean);
  const shelterDistricts = (relocationSites || []).map((s) => s.district).filter(Boolean);

  const districts = Array.from(
    new Set([...villageDistricts, ...shelterDistricts])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "5px" }}>
        <span>📍</span>
        <span>District Assessment & Shelters</span>
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
        <option value="ALL">All Districts ({districts.length} Regions)</option>

        {districts.map((district) => (
          <option key={district} value={district}>
            {district}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DistrictFilter;