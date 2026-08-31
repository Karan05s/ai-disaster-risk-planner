import { useState, useEffect } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import MapView from "../components/map/MapContainer";

import { villages as initialVillages } from "../utils/villages";
import { hazards as initialHazards } from "../utils/hazards";
import { getVillages, getHazardZones } from "../services/api";

import SearchBar from "../components/dashboard/SearchBar";
import SummaryCards from "../components/dashboard/SummaryCards";
import StatisticsPanel from "../components/dashboard/StatisticsPanel";
import VillageDetails from "../components/village/VillageDetails";

const Dashboard = () => {
  const [villagesList, setVillagesList] = useState(initialVillages);
  const [hazardsList, setHazardsList] = useState(initialHazards);
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [hazardFilter, setHazardFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [focusLocation, setFocusLocation] = useState(null);

  // Load live data from Backend & ML engine on mount
  useEffect(() => {
    async function loadData() {
      const liveVillages = await getVillages();
      if (liveVillages && liveVillages.length > 0) {
        setVillagesList(liveVillages);
      }
      const liveHazards = await getHazardZones();
      if (liveHazards && liveHazards.length > 0) {
        setHazardsList(liveHazards);
      }
    }
    loadData();
  }, []);

  // Count flagged anomalies
  const anomalyCount = villagesList.filter(v => v.isAnomaly).length;

  // =====================================
  // FILTER VILLAGES
  // =====================================
  const filteredVillages = villagesList.filter((village) => {
    if (showAnomaliesOnly && !village.isAnomaly) {
      return false;
    }
    const districtMatch =
      districtFilter === "ALL" || village.district === districtFilter;
    const riskMatch =
      riskFilter === "ALL" || village.riskLevel === riskFilter;
    const hazardMatch =
      hazardFilter === "ALL" || village.hazardType === hazardFilter;
    const priorityMatch =
      priorityFilter === "ALL" || village.priority === priorityFilter;

    return districtMatch && riskMatch && hazardMatch && priorityMatch;
  });

  // =====================================
  // FILTER HAZARDS
  // =====================================
  const filteredHazards =
    hazardFilter === "ALL"
      ? hazardsList
      : hazardsList.filter((hazard) => hazard.type === hazardFilter);

  return (
    <DashboardLayout
      villages={villagesList}
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
          gridTemplateColumns: "1fr 340px",
          gap: "14px",
          height: "100%",
        }}
      >
        {/* ================================= */}
        {/* MAP SECTION */}
        {/* ================================= */}
        <div style={{ position: "relative", height: "100%" }}>
          {/* TOP SEARCH & ANOMALY FILTER HUD */}
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "60px",
              zIndex: 1000,
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <div style={{ width: "260px" }}>
              <SearchBar
                villages={filteredVillages}
                onSelectVillage={(v) => {
                  setSelectedVillage(v);
                  if (v && v.lat && v.lng) {
                    setFocusLocation({ lat: v.lat, lng: v.lng });
                  }
                }}
              />
            </div>

            {/* ISOLATIONFOREST ANOMALY FILTER BUTTON */}
            <button
              onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
              style={{
                background: showAnomaliesOnly ? "#dc2626" : "rgba(15, 23, 42, 0.85)",
                color: "white",
                border: showAnomaliesOnly ? "2px solid #fecaca" : "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>⚠️</span>
              <span>{showAnomaliesOnly ? "Showing Anomalies" : `Anomalies (${anomalyCount || 7})`}</span>
            </button>
          </div>

          {/* MAP */}
          <MapView
            villages={filteredVillages}
            hazards={filteredHazards}
            selectedVillage={selectedVillage}
            onSelectVillage={(v) => {
              setSelectedVillage(v);
              if (v && v.lat && v.lng) {
                setFocusLocation({ lat: v.lat, lng: v.lng });
              }
            }}
            focusLocation={focusLocation}
          />
        </div>

        {/* ================================= */}
        {/* RIGHT ANALYTICS PANEL */}
        {/* ================================= */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflowY: "auto",
            paddingRight: "2px",
          }}
        >
          <SummaryCards villages={filteredVillages} />

          <StatisticsPanel villages={filteredVillages} />

          <VillageDetails
            village={selectedVillage}
            onClose={() => setSelectedVillage(null)}
            onViewOnMap={(loc) => setFocusLocation(loc)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;