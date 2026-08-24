import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";

const DashboardLayout = ({
  children,

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
    <>
      <Header />

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 70px)",
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

        <div
          style={{
            flex: 1,
            height: "100%",
            padding: "10px",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;