import DistrictFilter from "../filters/DistrictFilter";
import RiskFilter from "../filters/RiskFilter";
import HazardFilter from "../filters/HazardFilter";
import PriorityFilter from "../filters/PriorityFilter";

const Sidebar = ({

    villages,

  districtFilter,
  setDistrictFilter,

  riskFilter,
  setRiskFilter,

  hazardFilter,
  setHazardFilter,

  priorityFilter,
  setPriorityFilter,
}) => {
  return (
    <div
      style={{
        width: "250px",
        background: "#f1f5f9",
        padding: "20px",
      }}
    >
      <h3>Filters</h3>

      <div style={{ marginTop: "25px" }}>

        <DistrictFilter

          value={districtFilter}
          onChange={setDistrictFilter}
           villages={villages}
        />

        <RiskFilter
          value={riskFilter}
          onChange={setRiskFilter}
        />

        <HazardFilter
          value={hazardFilter}
          onChange={setHazardFilter}
        />

        <PriorityFilter
          value={priorityFilter}
          onChange={setPriorityFilter}
        />

      </div>
    </div>
  );
};

export default Sidebar;