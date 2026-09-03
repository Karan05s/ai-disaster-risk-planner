import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";

const DashboardLayout = ({
  children,
  villages = [],
  hazards = [],
  districtFilter,
  setDistrictFilter,
  riskFilter,
  setRiskFilter,
  hazardFilter,
  setHazardFilter,
  priorityFilter,
  setPriorityFilter,
  onOpenAdminPanel,
}) => {
  const criticalCount = (villages || []).filter((v) => v.riskLevel === "CRITICAL").length;
  const totalHabitations = (villages || []).length;
  const totalHazards = (hazards || []).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#f8fafc",
      }}
    >
      <Header
        criticalCount={criticalCount}
        totalHabitations={totalHabitations}
        totalHazards={totalHazards}
        onOpenAdminPanel={onOpenAdminPanel}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          height: "calc(100vh - 62px)",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Sidebar
          villages={villages}
          districtFilter={districtFilter}
          setDistrictFilter={setDistrictFilter}
          riskFilter={riskFilter}
          setRiskFilter={setRiskFilter}
          hazardFilter={hazardFilter}
          setHazardFilter={setHazardFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        <main
          style={{
            flex: 1,
            height: "100%",
            minHeight: 0,
            padding: "10px",
            overflow: "hidden",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;