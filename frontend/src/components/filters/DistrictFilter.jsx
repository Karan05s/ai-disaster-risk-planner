const DistrictFilter = ({
  value,
  onChange,
  villages,
}) => {

  const districts = [
    ...new Set(
      (villages || [])
        .map((village) => village.district)
        .filter(Boolean)
    ),
  ];

  return (
    <div style={{ marginBottom: "20px" }}>

      <label>
        <strong>District</strong>
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={{
          width: "100%",
          padding: "8px",
          marginTop: "8px",
        }}
      >
        <option value="ALL">
          All Districts
        </option>

        {districts.map((district) => (
          <option
            key={district}
            value={district}
          >
            {district}
          </option>
        ))}
      </select>

    </div>
  );
};

export default DistrictFilter;