import { useState, useEffect, useCallback } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import MapView from "../components/map/MapContainer";

import { villages as initialVillages } from "../utils/villages";
import { hazards as initialHazards } from "../utils/hazards";
import { relocationSites } from "../utils/relocationSites";
import { getVillages } from "../services/api";

import {
  fetchAllIndiaLiveTelemetry,
  generateDynamicRealtimeHazards,
  reevaluateVillagesWithLiveThreats,
} from "../services/liveThreatService";

import SearchBar from "../components/dashboard/SearchBar";
import SummaryCards from "../components/dashboard/SummaryCards";
import StatisticsPanel from "../components/dashboard/StatisticsPanel";
import VillageDetails from "../components/village/VillageDetails";
import DistrictLiveReportBanner from "../components/dashboard/DistrictLiveReportBanner";
import LiveSyncControllerHUD from "../components/dashboard/LiveSyncControllerHUD";
import AdminPanelModal from "../components/admin/AdminPanelModal";

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

  // Live Telemetry 2-Hour Synchronization State
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Admin Command Panel Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Core Real-Time Synchronization Routine
  const syncLiveAllIndiaThreats = useCallback(async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch raw habitations
      const rawVillages = (await getVillages()) || initialVillages;

      // 2. Fetch live batch telemetry from Open-Meteo across all-India primary nodes
      const telemetryMap = await fetchAllIndiaLiveTelemetry();

      // 3. Dynamically generate active real-time hazard zones
      const dynamicHazards = generateDynamicRealtimeHazards(telemetryMap);
      setHazardsList(dynamicHazards);

      // 4. Dynamically re-evaluate all villages with live atmospheric & hazard threats
      const dynamicVillages = reevaluateVillagesWithLiveThreats(rawVillages, dynamicHazards);
      setVillagesList(dynamicVillages);

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedAt(timestamp);
    } catch (err) {
      console.error("Live telemetry sync encountered an error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial mount sync & 2-Hour Auto-Update Periodic Interval
  useEffect(() => {
    syncLiveAllIndiaThreats();

    // 2-hour interval (2 * 60 * 60 * 1000 ms)
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      syncLiveAllIndiaThreats();
    }, twoHoursMs);

    return () => clearInterval(interval);
  }, [syncLiveAllIndiaThreats]);

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
  const criticalCount = villagesList.filter((v) => v.riskLevel === "CRITICAL").length;
  const immediateRelocationCount = villagesList.filter((v) => v.priority === "IMMEDIATE").length;

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
      hazards={hazardsList}
      districtFilter={districtFilter}
      setDistrictFilter={setDistrictFilter}
      riskFilter={riskFilter}
      setRiskFilter={setRiskFilter}
      hazardFilter={hazardFilter}
      setHazardFilter={setHazardFilter}
      priorityFilter={priorityFilter}
      setPriorityFilter={setPriorityFilter}
      onOpenAdminPanel={() => setIsAdminModalOpen(true)}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          gap: "8px",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* LIVE 2-HOUR TELEMETRY SYNC STATUS BAR */}
        <div style={{ flexShrink: 0 }}>
          <LiveSyncControllerHUD
            lastSyncedAt={lastSyncedAt}
            isSyncing={isSyncing}
            onForceSync={syncLiveAllIndiaThreats}
            totalHazardsCount={hazardsList.length}
            criticalVillagesCount={criticalCount}
            immediateRelocationCount={immediateRelocationCount}
          />
        </div>

        {/* DISTRICT LIVE REPORT BANNER (WHEN DISTRICT FILTER ACTIVE) */}
        {districtFilter !== "ALL" && (
          <div style={{ flexShrink: 0 }}>
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
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "12px",
            flex: 1,
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* ================================= */}
          {/* MAP SECTION */}
          {/* ================================= */}
          <div
            style={{
              position: "relative",
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
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
              gap: "10px",
              overflowY: "auto",
              overscrollBehavior: "contain",
              height: "100%",
              maxHeight: "100%",
              minHeight: 0,
              paddingRight: "4px",
              boxSizing: "border-box",
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

      {/* ================================= */}
      {/* ADMIN COMMAND PANEL MODAL */}
      {/* ================================= */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        villages={villagesList}
        hazards={hazardsList}
        lastSyncedAt={lastSyncedAt}
        onForceSync={syncLiveAllIndiaThreats}
        onSelectVillageOnMap={(loc) => {
          setSelectedVillage(loc);
          if (loc.lat && loc.lng) {
            setFocusLocation({ lat: loc.lat, lng: loc.lng });
          }
        }}
      />
    </DashboardLayout>
  );
};

export default Dashboard;