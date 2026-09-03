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
    <aside
      style={{
        width: "250px",
        height: "100%",
        background: "#f1f5f9",
        padding: "16px",
        overflowY: "auto",
        overscrollBehavior: "contain",
        borderRight: "1px solid #e2e8f0",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#0f172a", fontWeight: "700" }}>
        Filters & Layers
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
    </aside>
  );
};

export default Sidebar;