import { useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import MapView from "../components/map/MapContainer";

import { villages } from "../utils/villages";
import { hazards } from "../utils/hazards";

import SearchBar from "../components/dashboard/SearchBar";
import SummaryCards from "../components/dashboard/SummaryCards";
import StatisticsPanel from "../components/dashboard/StatisticsPanel";

import VillageDetails from "../components/village/VillageDetails";

const Dashboard = () => {
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [hazardFilter, setHazardFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [selectedVillage, setSelectedVillage] = useState(null);
  const [focusLocation, setFocusLocation] = useState(null);

  const filteredVillages = villages.filter((village) => {
    const districtMatch = districtFilter === "ALL" || village.district === districtFilter;
    const riskMatch = riskFilter === "ALL" || village.riskLevel === riskFilter;
    const hazardMatch = hazardFilter === "ALL" || village.hazardType === hazardFilter;
    const priorityMatch = priorityFilter === "ALL" || village.priority === priorityFilter;
    return districtMatch && riskMatch && hazardMatch && priorityMatch;
  });

  const filteredHazards =
    hazardFilter === "ALL"
      ? hazards
      : hazards.filter((hazard) => hazard.type === hazardFilter);

  return (
    <DashboardLayout
      districtFilter={districtFilter}
      setDistrictFilter={setDistrictFilter}
      riskFilter={riskFilter}
      setRiskFilter={setRiskFilter}
      hazardFilter={hazardFilter}
      setHazardFilter={setHazardFilter}
      priorityFilter={priorityFilter}
      setPriorityFilter={setPriorityFilter}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          gap: "12px",
          padding: "12px",
          boxSizing: "border-box",
        }}
      >
        {/* SUMMARY CARDS */}
        <div style={{ flexShrink: 0 }}>
          <SummaryCards villages={filteredVillages} />
        </div>

        {/* STATISTICS */}
        <div style={{ flexShrink: 0 }}>
          <StatisticsPanel villages={filteredVillages} />
        </div>

        {/* MAP + DETAILS AREA - takes all remaining space */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "15px",
            flex: 1,
            minHeight: 0,
            width: "100%",
          }}
        >
          {/* MAP SECTION */}
          <div
            style={{
              position: "relative",
              minWidth: 0,
              height: "100%",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* SEARCH BAR */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "60px",
                zIndex: 1000,
                maxWidth: "260px",
              }}
            >
              <SearchBar
                villages={filteredVillages}
                onSelectVillage={setSelectedVillage}
              />
            </div>

            {/* MAP */}
            <MapView
              villages={filteredVillages}
              hazards={filteredHazards}
              selectedVillage={selectedVillage}
              focusLocation={focusLocation}
            />
          </div>

          {/* VILLAGE DETAILS */}
          <div
            style={{
              height: "100%",
              overflowY: "auto",
            }}
          >
            <VillageDetails
              village={selectedVillage}
              onClose={() => setSelectedVillage(null)}
              onViewOnMap={setFocusLocation}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;