import { useState, useEffect } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import MapView from "../components/map/MapContainer";

import { villages as initialVillages } from "../utils/villages";
import { hazards as initialHazards } from "../utils/hazards";
import { relocationSites } from "../utils/relocationSites";
import { getVillages, getHazardZones } from "../services/api";

import SearchBar from "../components/dashboard/SearchBar";
import SummaryCards from "../components/dashboard/SummaryCards";
import StatisticsPanel from "../components/dashboard/StatisticsPanel";
import VillageDetails from "../components/village/VillageDetails";
import DistrictLiveReportBanner from "../components/dashboard/DistrictLiveReportBanner";

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

  // When a district is selected, auto-center the map on that district
  useEffect(() => {
    if (districtFilter && districtFilter !== "ALL") {
      const matchV = villagesList.filter((v) => v.district === districtFilter);
      const matchS = relocationSites.filter((s) => s.district === districtFilter);

      let cLat = null;
      let cLng = null;

      if (matchV.length > 0) {
        cLat = matchV.reduce((acc, v) => acc + v.lat, 0) / matchV.length;
        cLng = matchV.reduce((acc, v) => acc + v.lng, 0) / matchV.length;
      } else if (matchS.length > 0) {
        cLat = matchS.reduce((acc, s) => acc + s.lat, 0) / matchS.length;
        cLng = matchS.reduce((acc, s) => acc + s.lng, 0) / matchS.length;
      }

      if (cLat && cLng) {
        setFocusLocation({ lat: cLat, lng: cLng });
      }
    }
  }, [districtFilter, villagesList]);

  // Count flagged anomalies
  const anomalyCount = villagesList.filter((v) => v.isAnomaly).length;

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
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: "10px",
        }}
      >
        {/* DISTRICT LIVE REPORT BANNER (WHEN DISTRICT FILTER ACTIVE) */}
        {districtFilter !== "ALL" && (
          <DistrictLiveReportBanner
            district={districtFilter}
            villages={villagesList}
            hazards={hazardsList}
            onSelectLocation={(loc) => {
              setSelectedVillage(loc);
              if (loc.lat && loc.lng) setFocusLocation({ lat: loc.lat, lng: loc.lng });
            }}
            onResetDistrict={() => setDistrictFilter("ALL")}
          />
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "14px",
            flex: 1,
            minHeight: 0,
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
                top: "12px",
                left: "55px",
                zIndex: 1000,
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <SearchBar
                villages={filteredVillages}
                onSelectVillage={(v) => {
                  setSelectedVillage(v);
                  if (v && v.lat && v.lng) {
                    setFocusLocation({ lat: v.lat, lng: v.lng });
                  }
                }}
              />

              {/* ISOLATIONFOREST ANOMALY FILTER BUTTON */}
              <button
                onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
                style={{
                  background: showAnomaliesOnly ? "#dc2626" : "#ffffff",
                  color: showAnomaliesOnly ? "#ffffff" : "#b45309",
                  border: showAnomaliesOnly ? "1px solid #b91c1c" : "1px solid #fde68a",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;