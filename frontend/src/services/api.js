import { villages as fallbackVillages } from "../utils/villages";
import { hazards as fallbackHazards } from "../utils/hazards";
import { relocationSites as fallbackSites } from "../utils/relocationSites";

const BACKEND_URL = "http://localhost:8080/api";
const ML_URL = "http://localhost:8001/api";

/**
 * Fetches all villages from Spring Boot backend, enriched with ML XAI & AI diagnostics
 */
export async function getVillages() {
  try {
    // 1. Fetch core villages from Backend
    const backendRes = await fetch(`${BACKEND_URL}/api/villages?size=200`, { timeout: 3000 }).catch(() => null);
    let villageData = [];

    if (backendRes && backendRes.ok) {
      const pageData = await backendRes.json();
      const rawList = pageData.content || pageData;
      villageData = rawList.map(v => {
        const coords = v.geometry?.coordinates || [];
        return {
          id: v.id,
          name: v.name,
          district: v.district,
          state: v.state,
          population: v.population,
          lat: coords[1] || v.latitude || 26.14,
          lng: coords[0] || v.longitude || 91.73,
          riskLevel: v.riskLevel || "MEDIUM",
          priority: v.priorityLevel || "SHORT_TERM",
          riskScore: v.riskScore || 50.0,
          hazardType: (v.name && v.name.toLowerCase().includes("flood")) ? "Flood" : "Landslide"
        };
      });
    } else {
      villageData = [...fallbackVillages];
    }

    // 2. Enrich with ML Service (AI Summaries, Dominant Factor, Breakdown, Anomalies)
    try {
      const mlRes = await fetch(`${ML_URL}/risk-scores`).catch(() => null);
      if (mlRes && mlRes.ok) {
        const mlScores = await mlRes.json();
        const mlMap = {};
        mlScores.forEach(s => { mlMap[s.villageId] = s; });

        villageData = villageData.map(v => {
          const ml = mlMap[v.id];
          if (ml) {
            return {
              ...v,
              riskScore: ml.score || v.riskScore,
              riskLevel: ml.riskLevel || v.riskLevel,
              dominantFactor: ml.dominantFactor,
              plainEnglishExplanation: ml.plainEnglishExplanation,
              breakdown: ml.breakdown,
              isAnomaly: ml.isAnomaly,
              anomalyScore: ml.anomalyScore,
              anomalyReason: ml.anomalyReason,
              aiSummary: ml.aiSummary,
            };
          }
          return v;
        });
      }
    } catch {
      // ML enrichment optional
    }

    return villageData;
  } catch (e) {
    console.warn("Backend unavailable, using local dataset:", e);
    return fallbackVillages;
  }
}

/**
 * Fetches Hazard Zones (PostGIS Polygons) from Backend
 */
export async function getHazardZones() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hazard-zones`).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      return data.map(h => ({
        id: h.id,
        type: h.hazardType === "FLOOD" ? "Flood" : "Landslide",
        color: h.hazardType === "FLOOD" ? "blue" : "brown",
        coordinates: h.geometry?.coordinates?.[0]?.map(pt => [pt[1], pt[0]]) || []
      }));
    }
  } catch {
    // fallback
  }
  return fallbackHazards;
}

/**
 * Fetches Relocation Sites from Backend
 */
export async function getRelocationSites() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/relocation-sites`).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      return data.map(s => {
        const coords = s.geometry?.coordinates || [];
        return {
          id: s.id,
          name: s.name,
          lat: coords[1] || 24.82,
          lng: coords[0] || 92.80,
          capacity: s.capacityTotal || 500,
          availableCapacity: Math.max(0, (s.capacityTotal || 500) - (s.capacityUsed || 0)),
          status: s.status || "AVAILABLE"
        };
      });
    }
  } catch {
    // fallback
  }
  return fallbackSites;
}

/**
 * Fetches Dashboard summary statistics
 */
export async function getDashboardSummary() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard/summary`).catch(() => null);
    if (res && res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }
  return null;
}
