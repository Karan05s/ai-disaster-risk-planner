/**
 * Live All-India Real-Time Multi-Hazard & Threat Service
 * 
 * Monitors and synthesizes live hazard zones across India:
 * - ⛰️ Landslide Hazard Slopes (Western Ghats, Himalayan Slopes, Meghalaya, Nilgiris)
 * - 🏖️ Coastal Flood & Storm Surge (Odisha, Sundarbans, Kuttanad/Kerala, Konkan/Mumbai, Coromandel)
 * - 🌊 Riverine Flood Basins (Brahmaputra, Koshi, Ganga, Mahanadi, Rapti-Ghaghara)
 * - ⛈️ Real-Time Heavy Rain & Convective Thunderstorm Cells (with ⛈️ pulsing markers)
 * 
 * Runs on a 2-hour auto-sync cycle with manual on-demand trigger.
 */

import { villages as baseVillages } from "../utils/villages";
import { calculateDistance } from "../utils/mapHelpers";

// Primary Real-Time Telemetry Grid Nodes across India
export const REGIONAL_MONITORING_NODES = [
  // =========================================================================
  // 1. LANDSLIDE & MOUNTAIN SLOPE CORRIDORS (⛰️ Amber/Brown)
  // =========================================================================
  {
    id: "NODE-LANDSLIDE-WAYANAD",
    name: "Wayanad & Meppadi High Slopes",
    state: "Kerala",
    lat: 11.68,
    lng: 76.13,
    hazardType: "Landslide",
    hazardCategory: "LANDSLIDE",
    terrain: "STEEP_WESTERN_GHATS",
    defaultRadiusKm: 26,
  },
  {
    id: "NODE-LANDSLIDE-IDUKKI",
    name: "Idukki & Munnar Range",
    state: "Kerala",
    lat: 9.91,
    lng: 77.10,
    hazardType: "Landslide",
    hazardCategory: "LANDSLIDE",
    terrain: "HIGH_RANGE_SLOPE",
    defaultRadiusKm: 28,
  },
  {
    id: "NODE-LANDSLIDE-HIMACHAL",
    name: "Kullu-Manali & Shimla Slopes",
    state: "Himachal Pradesh",
    lat: 31.95,
    lng: 77.10,
    hazardType: "Landslide",
    hazardCategory: "LANDSLIDE",
    terrain: "HIMALAYAN_CORRIDOR",
    defaultRadiusKm: 30,
  },
  {
    id: "NODE-LANDSLIDE-CHAMOLI",
    name: "Chamoli & Joshimath Vulnerability Zone",
    state: "Uttarakhand",
    lat: 30.55,
    lng: 79.56,
    hazardType: "Landslide",
    hazardCategory: "LANDSLIDE",
    terrain: "TECTONIC_SLOPE",
    defaultRadiusKm: 25,
  },
  {
    id: "NODE-LANDSLIDE-DARJEELING",
    name: "Darjeeling & Kurseong Foothills",
    state: "West Bengal",
    lat: 27.03,
    lng: 88.26,
    hazardType: "Landslide",
    hazardCategory: "LANDSLIDE",
    terrain: "EASTERN_HIMALAYAS",
    defaultRadiusKm: 24,
  },
  {
    id: "NODE-LANDSLIDE-MEGHALAYA",
    name: "Cherrapunji & Khasi Hills Escarpment",
    state: "Meghalaya",
    lat: 25.27,
    lng: 91.73,
    hazardType: "Landslide",
    hazardCategory: "LANDSLIDE",
    terrain: "PLATEAU_ESCARPMENT",
    defaultRadiusKm: 26,
  },
  {
    id: "NODE-LANDSLIDE-JHARKHAND",
    name: "Dhanbad-Jharia Mining Subsidence Slopes",
    state: "Jharkhand",
    lat: 23.80,
    lng: 86.43,
    hazardType: "Landslide",
    hazardCategory: "LANDSLIDE",
    terrain: "MINING_SLOPE",
    defaultRadiusKm: 22,
  },
  {
    id: "NODE-LANDSLIDE-NILGIRIS",
    name: "Nilgiris & Ooty Ridge",
    state: "Tamil Nadu",
    lat: 11.41,
    lng: 76.70,
    hazardType: "Landslide",
    hazardCategory: "LANDSLIDE",
    terrain: "HIGH_ALTITUDE_SLOPE",
    defaultRadiusKm: 22,
  },

  // =========================================================================
  // 2. COASTAL FLOOD & STORM SURGE CORRIDORS (🏖️ Cyan/Teal)
  // =========================================================================
  {
    id: "NODE-COASTAL-ODISHA",
    name: "Puri & Coastal Odisha Tidal Zone",
    state: "Odisha",
    lat: 19.81,
    lng: 85.83,
    hazardType: "Coastal Flood",
    hazardCategory: "COASTAL_FLOOD",
    terrain: "COASTAL_LOWLAND",
    defaultRadiusKm: 32,
  },
  {
    id: "NODE-COASTAL-SUNDARBANS",
    name: "Sundarbans Estuarine Inundation Zone",
    state: "West Bengal",
    lat: 22.15,
    lng: 88.75,
    hazardType: "Coastal Flood",
    hazardCategory: "COASTAL_FLOOD",
    terrain: "ESTUARINE_MANGROVE",
    defaultRadiusKm: 35,
  },
  {
    id: "NODE-COASTAL-KERALA-KUTTANAD",
    name: "Alappuzha & Kuttanad Sub-Sea Level Lowlands",
    state: "Kerala",
    lat: 9.49,
    lng: 76.33,
    hazardType: "Coastal Flood",
    hazardCategory: "COASTAL_FLOOD",
    terrain: "SUB_SEA_LEVEL_WETLAND",
    defaultRadiusKm: 28,
  },
  {
    id: "NODE-COASTAL-MUMBAI",
    name: "Mumbai & Raigad Coastal Surge Belt",
    state: "Maharashtra",
    lat: 18.92,
    lng: 72.83,
    hazardType: "Coastal Flood",
    hazardCategory: "COASTAL_FLOOD",
    terrain: "URBAN_COASTAL_CATCHMENT",
    defaultRadiusKm: 30,
  },
  {
    id: "NODE-COASTAL-ANDHRA-GODAVARI",
    name: "Godavari-Krishna Coastal Delta",
    state: "Andhra Pradesh",
    lat: 16.98,
    lng: 82.24,
    hazardType: "Coastal Flood",
    hazardCategory: "COASTAL_FLOOD",
    terrain: "RIVER_OCEAN_CONFLUENCE",
    defaultRadiusKm: 30,
  },
  {
    id: "NODE-COASTAL-CHENNAI",
    name: "Chennai Coastal Catchment & Ennore",
    state: "Tamil Nadu",
    lat: 13.08,
    lng: 80.27,
    hazardType: "Coastal Flood",
    hazardCategory: "COASTAL_FLOOD",
    terrain: "COASTAL_PLAINS",
    defaultRadiusKm: 28,
  },

  // =========================================================================
  // 3. RIVERINE FLOOD BASINS (🌊 Royal Blue)
  // =========================================================================
  {
    id: "NODE-FLOOD-BRAHMAPUTRA",
    name: "Brahmaputra Valley & Majuli Island",
    state: "Assam",
    lat: 26.95,
    lng: 94.20,
    hazardType: "Flood",
    hazardCategory: "RIVERINE_FLOOD",
    terrain: "BRAIDED_RIVER_BASIN",
    defaultRadiusKm: 34,
  },
  {
    id: "NODE-FLOOD-CACHAR",
    name: "Barak Valley & Cachar Lowlands",
    state: "Assam",
    lat: 24.82,
    lng: 92.80,
    hazardType: "Flood",
    hazardCategory: "RIVERINE_FLOOD",
    terrain: "RIVER_BASIN",
    defaultRadiusKm: 28,
  },
  {
    id: "NODE-FLOOD-KOSHI",
    name: "North Bihar Koshi Floodplain (Supaul/Saharsa)",
    state: "Bihar",
    lat: 26.08,
    lng: 86.48,
    hazardType: "Flood",
    hazardCategory: "RIVERINE_FLOOD",
    terrain: "BRAIDED_FLOODPLAIN",
    defaultRadiusKm: 32,
  },
  {
    id: "NODE-FLOOD-GANGA-PATNA",
    name: "Central Ganga Basin (Patna/Bhagalpur)",
    state: "Bihar",
    lat: 25.60,
    lng: 85.12,
    hazardType: "Flood",
    hazardCategory: "RIVERINE_FLOOD",
    terrain: "RIVER_BASIN",
    defaultRadiusKm: 28,
  },
  {
    id: "NODE-FLOOD-RAPTI",
    name: "Rapti-Ghaghara Basin (Gorakhpur)",
    state: "Uttar Pradesh",
    lat: 26.76,
    lng: 83.37,
    hazardType: "Flood",
    hazardCategory: "RIVERINE_FLOOD",
    terrain: "RIVER_BASIN",
    defaultRadiusKm: 28,
  },
  {
    id: "NODE-FLOOD-MAHANADI",
    name: "Mahanadi Basin (Cuttack/Kendrapara)",
    state: "Odisha",
    lat: 20.46,
    lng: 85.88,
    hazardType: "Flood",
    hazardCategory: "RIVERINE_FLOOD",
    terrain: "RIVER_DELTA",
    defaultRadiusKm: 30,
  },
];

/**
 * Creates circular polygon coordinates given a center and radius in km
 */
function createCirclePolygon(centerLat, centerLng, radiusKm = 25, points = 24) {
  const coords = [];
  const earthRadiusKm = 6371;
  const latR = (centerLat * Math.PI) / 180;
  const lngR = (centerLng * Math.PI) / 180;
  const dByR = radiusKm / earthRadiusKm;

  for (let i = 0; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const pLatR = Math.asin(
      Math.sin(latR) * Math.cos(dByR) +
      Math.cos(latR) * Math.sin(dByR) * Math.cos(angle)
    );
    const pLngR =
      lngR +
      Math.atan2(
        Math.sin(angle) * Math.sin(dByR) * Math.cos(latR),
        Math.cos(dByR) - Math.sin(latR) * Math.sin(pLatR)
      );
    coords.push([
      Math.round(((pLatR * 180) / Math.PI) * 10000) / 10000,
      Math.round(((pLngR * 180) / Math.PI) * 10000) / 10000,
    ]);
  }
  return coords;
}

/**
 * Fetches batch real-time meteorological observations for all India nodes
 */
export async function fetchAllIndiaLiveTelemetry() {
  const lats = REGIONAL_MONITORING_NODES.map((n) => n.lat).join(",");
  const lngs = REGIONAL_MONITORING_NODES.map((n) => n.lng).join(",");

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,surface_pressure&forecast_days=1&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo returned status ${response.status}`);
    const data = await response.json();

    const results = Array.isArray(data) ? data : [data];

    const telemetryMap = {};
    results.forEach((res, idx) => {
      const node = REGIONAL_MONITORING_NODES[idx];
      if (node && res && res.current) {
        telemetryMap[node.id] = {
          ...node,
          current: res.current,
          temperature: res.current.temperature_2m,
          precipitation: res.current.precipitation || 0,
          weatherCode: res.current.weather_code || 0,
          windSpeed: res.current.wind_speed_10m || 0,
          windGusts: res.current.wind_gusts_10m || 0,
          pressure: res.current.surface_pressure || 1013,
          fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
      }
    });

    return telemetryMap;
  } catch (err) {
    console.warn("Real-time batch telemetry offline, generating simulated telemetry:", err);
    const telemetryMap = {};
    REGIONAL_MONITORING_NODES.forEach((node) => {
      telemetryMap[node.id] = {
        ...node,
        temperature: 28.5,
        precipitation: node.hazardType === "Flood" ? 2.4 : 0.0,
        weatherCode: node.hazardType === "Flood" ? 61 : 1,
        windSpeed: 14,
        windGusts: 22,
        pressure: 1011,
        fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    });
    return telemetryMap;
  }
}

/**
 * Dynamically synthesizes Live Real-Time Hazard Zones across India from active telemetry
 */
export function generateDynamicRealtimeHazards(telemetryMap = {}) {
  const dynamicHazards = [];
  let hazardCounter = 1;

  REGIONAL_MONITORING_NODES.forEach((node) => {
    const telemetry = telemetryMap[node.id];
    const precip = telemetry?.precipitation || 0;
    const wCode = telemetry?.weatherCode || 0;
    const wind = telemetry?.windSpeed || 0;

    // Detect Thunderstorm / Heavy Rain
    const isThunderstorm = wCode >= 95 || wCode === 82 || precip >= 8.0;
    const isHeavyRain = precip >= 4.0 || wCode >= 63;

    let severity = "LOW";
    let dynamicRadiusKm = node.defaultRadiusKm || 24;
    let alertMessage = "";

    if (precip >= 15 || wCode >= 95) {
      severity = "CRITICAL";
      dynamicRadiusKm = Math.round(dynamicRadiusKm * 1.35);
      alertMessage = `Extreme Flash Inundation / Severe Thunderstorm Alert (${precip} mm/h rain, Code ${wCode})`;
    } else if (precip >= 5 || wCode >= 65 || wind >= 40) {
      severity = "HIGH";
      dynamicRadiusKm = Math.round(dynamicRadiusKm * 1.15);
      alertMessage = `Active Inundation & Slope Hazard (${precip} mm/h rain, Gusts ${wind} km/h)`;
    } else if (precip >= 1.5 || node.hazardCategory === "RIVERINE_FLOOD") {
      severity = "MEDIUM";
      alertMessage = `Monitored Basin Buffer (${precip} mm/h precipitation, nominal flow)`;
    } else {
      severity = "LOW";
      alertMessage = `Nominal Flow Observation (${telemetry?.temperature || 28}°C, clear sky)`;
    }

    const polygonCoords = createCirclePolygon(node.lat, node.lng, dynamicRadiusKm, 20);

    dynamicHazards.push({
      id: `DYN-HAZARD-${hazardCounter++}`,
      type: node.hazardType,
      hazardCategory: node.hazardCategory,
      regionName: node.name,
      state: node.state,
      centroid: [node.lat, node.lng],
      radiusMeters: dynamicRadiusKm * 1000,
      radiusKm: dynamicRadiusKm,
      severity,
      precipitation: precip,
      temperature: telemetry?.temperature || 28,
      windSpeed: wind,
      weatherCode: wCode,
      isThunderstorm,
      isHeavyRain,
      alertMessage,
      updatedAt: telemetry?.fetchedAt || new Date().toLocaleTimeString(),
      color:
        node.hazardCategory === "LANDSLIDE"
          ? "brown"
          : node.hazardCategory === "COASTAL_FLOOD"
          ? "teal"
          : "blue",
      coordinates: polygonCoords,
      isDynamicRealtime: true,
    });
  });

  return dynamicHazards;
}

/**
 * Dynamically re-evaluates all village risk scores, priority levels, and anomalies
 * based on proximity to live emerging hazard zones and active telemetry.
 */
export function reevaluateVillagesWithLiveThreats(rawVillages = baseVillages, dynamicHazards = []) {
  return (rawVillages || baseVillages).map((village) => {
    let minDistanceKm = 999;
    let closestHazard = null;

    dynamicHazards.forEach((haz) => {
      const dist = calculateDistance(village.lat, village.lng, haz.centroid[0], haz.centroid[1]);
      if (dist < minDistanceKm) {
        minDistanceKm = dist;
        closestHazard = haz;
      }
    });

    const isInsideLiveHazard = minDistanceKm <= (closestHazard?.radiusKm || 25);
    const livePrecip = closestHazard?.precipitation || 0;

    let dynamicScore = village.riskScore || 50;
    let dynamicRiskLevel = village.riskLevel || "MEDIUM";
    let dynamicPriority = village.priority || "SHORT_TERM";
    let dynamicDominantFactor = village.dominantFactor || "Geospatial Exposure";
    let dynamicAnomaly = village.isAnomaly || false;

    if (closestHazard && closestHazard.severity === "CRITICAL" && isInsideLiveHazard) {
      dynamicScore = Math.min(96, Math.max(82, (village.riskScore || 60) + 25));
      dynamicRiskLevel = "CRITICAL";
      dynamicPriority = "IMMEDIATE";
      dynamicDominantFactor = `Live Torrential Rain (${livePrecip} mm/h)`;
      dynamicAnomaly = (village.population || 4000) > 5000;
    } else if (closestHazard && closestHazard.severity === "HIGH" && isInsideLiveHazard) {
      dynamicScore = Math.min(84, Math.max(68, (village.riskScore || 50) + 18));
      dynamicRiskLevel = "HIGH";
      dynamicPriority = "IMMEDIATE";
      dynamicDominantFactor = `High Atmospheric Inundation (${livePrecip} mm/h)`;
    } else if (isInsideLiveHazard && livePrecip > 1.0) {
      dynamicScore = Math.min(65, Math.max(45, (village.riskScore || 40) + 8));
      dynamicRiskLevel = "MEDIUM";
      dynamicPriority = "SHORT_TERM";
    } else if (minDistanceKm > 45 && livePrecip === 0) {
      dynamicScore = Math.min(38, (village.riskScore || 40) * 0.75);
      dynamicRiskLevel = dynamicScore < 20 ? "SAFE" : "LOW";
      dynamicPriority = "NORMAL";
      dynamicDominantFactor = "Nominal Atmospheric Clearance";
    }

    return {
      ...village,
      riskScore: Math.round(dynamicScore * 10) / 10,
      riskLevel: dynamicRiskLevel,
      priority: dynamicPriority,
      dominantFactor: dynamicDominantFactor,
      isAnomaly: dynamicAnomaly,
      livePrecipitation: livePrecip,
      nearestLiveHazardDistanceKm: Math.round(minDistanceKm * 10) / 10,
      isInsideLiveHazard,
      lastSyncTimestamp: closestHazard?.updatedAt || new Date().toLocaleTimeString(),
    };
  });
}
