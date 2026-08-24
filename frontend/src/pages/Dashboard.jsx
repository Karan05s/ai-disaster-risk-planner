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
  const [districtFilter, setDistrictFilter] =
    useState("ALL");

  const [riskFilter, setRiskFilter] =
    useState("ALL");

  const [hazardFilter, setHazardFilter] =
    useState("ALL");

  const [priorityFilter, setPriorityFilter] =
    useState("ALL");

  const [selectedVillage, setSelectedVillage] =
    useState(null);

  const [focusLocation, setFocusLocation] =
    useState(null);

  // =====================================
  // FILTER VILLAGES
  // =====================================

  const filteredVillages = villages.filter(
    (village) => {
      const districtMatch =
        districtFilter === "ALL" ||
        village.district === districtFilter;

      const riskMatch =
        riskFilter === "ALL" ||
        village.riskLevel === riskFilter;

      const hazardMatch =
        hazardFilter === "ALL" ||
        village.hazardType === hazardFilter;

      const priorityMatch =
        priorityFilter === "ALL" ||
        village.priority === priorityFilter;

      return (
        districtMatch &&
        riskMatch &&
        hazardMatch &&
        priorityMatch
      );
    }
  );

  // =====================================
  // FILTER HAZARDS
  // =====================================

  const filteredHazards =
    hazardFilter === "ALL"
      ? hazards
      : hazards.filter(
          (hazard) =>
            hazard.type === hazardFilter
        );

    console.log("Total villages:", villages.length);

console.log(
  "Filtered villages:",
  filteredVillages.length
);

console.log(
  "Filters:",
  {
    districtFilter,
    riskFilter,
    hazardFilter,
    priorityFilter,
  }
);

  return (
    <DashboardLayout
      villages={villages}
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
          display: "grid",
          gridTemplateColumns:
            "1fr 320px",

          gap: "15px",

          height: "100%",
        }}
      >
        {/* ================================= */}
        {/* MAP SECTION */}
        {/* ================================= */}

        <div
          style={{
            position: "relative",
            height: "100%",
          }}
        >
          {/* SEARCH BAR */}

          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "70px",
              zIndex: 1000,
              width: "280px",
            }}
          >
            <SearchBar
              villages={filteredVillages}
              onSelectVillage={
                setSelectedVillage
              }
            />
          </div>

          {/* MAP */}

          <MapView
            villages={filteredVillages}
            hazards={filteredHazards}
            selectedVillage={
              selectedVillage
            }
            focusLocation={
              focusLocation
            }
          />
        </div>

        {/* ================================= */}
        {/* RIGHT PANEL */}
        {/* ================================= */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",

            overflowY: "auto",
          }}
        >
          <SummaryCards
            villages={filteredVillages}
          />

          <StatisticsPanel
            villages={filteredVillages}
          />

          <VillageDetails
            village={selectedVillage}
            onClose={() =>
              setSelectedVillage(null)
            }
            onViewOnMap={
              setFocusLocation
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;