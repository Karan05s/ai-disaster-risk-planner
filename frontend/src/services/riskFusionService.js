/**
 * Live Risk Fusion & Safe Shelter Intelligence Service
 * 
 * Fuses baseline multi-hazard geospatial records (Floods, Landslides, Tsunamis, Cyclones)
 * with Real-Time Atmospheric Telemetry (Precipitation rate, 12h forecast accumulation,
 * WMO severe weather codes, wind gusts, atmospheric pressure) to dynamically compute:
 * 
 * 1. Live Dynamic Risk Tier (SAFE, LOW, MEDIUM, HIGH, CRITICAL)
 * 2. Transparent Explainable Rationale (Baseline vs Live Weather Fusion)
 * 3. Proximity-Ranked Safe Shelters & Relocation Colonies
 * 4. District-Level Live Disaster Assessment Reports
 */

import { relocationSites as defaultShelters } from "../utils/relocationSites";
import { calculateDistance } from "../utils/mapHelpers";

/**
 * Calculates compass direction bearing from point 1 to point 2
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const compassPoints = [
    "North", "Northeast", "East", "Southeast",
    "South", "Southwest", "West", "Northwest"
  ];
  const idx = Math.round(brng / 45) % 8;
  return compassPoints[idx];
}

/**
 * Finds top nearby safe shelters and relief sites ranked by proximity and capacity
 */
export function findNearbySafeShelters(lat, lng, shelterList = defaultShelters, limit = 5, requiredCapacity = 0) {
  if (!lat || !lng) return [];

  const validShelters = (shelterList || defaultShelters).filter(
    (s) => s.status === "AVAILABLE" && (s.availableCapacity || s.capacity || 0) >= requiredCapacity
  );

  const scoredShelters = validShelters.map((site) => {
    const dist = calculateDistance(lat, lng, site.lat, site.lng);
    const direction = calculateBearing(lat, lng, site.lat, site.lng);
    return {
      ...site,
      distance: Math.round(dist * 10) / 10,
      direction,
      availableCapacity: site.availableCapacity || site.capacity || 500,
    };
  });

  scoredShelters.sort((a, b) => a.distance - b.distance);
  return scoredShelters.slice(0, limit);
}

/**
 * Evaluates the Live Dynamic Multi-Hazard Risk for any coordinate, village, or district
 */
export function evaluateLiveDynamicRisk({
  lat,
  lng,
  locationName = "Selected Zone",
  district = "General",
  state = "India",
  population = 3000,
  baselineRiskLevel = null,
  baselineRiskScore = null,
  baselineHazardType = null,
  weatherData = null,
  hazardsList = [],
  relocationSitesList = defaultShelters,
}) {
  // =========================================================================
  // 1. BASELINE GEOSPATIAL & HISTORICAL VULNERABILITY SCORE (0 to 100)
  // =========================================================================
  let baseScore = 0;
  let baseLevel = "SAFE";
  let hazardReason = "No documented historical disaster recurrence in registry.";
  let detectedHazardType = baselineHazardType || "None";
  let insideHazardPolygon = false;
  let nearestHazardDistance = 999;

  // Map known baseline levels
  if (baselineRiskLevel) {
    const map = { CRITICAL: 85, HIGH: 70, MEDIUM: 50, LOW: 25, SAFE: 10 };
    baseScore = baselineRiskScore || map[baselineRiskLevel] || 35;
    baseLevel = baselineRiskLevel;
  }

  // Check proximity to active PostGIS Hazard Polygons
  if (lat && lng && hazardsList && hazardsList.length > 0) {
    hazardsList.forEach((h) => {
      if (h.coordinates && h.coordinates.length > 0) {
        // Compute centroid
        const avgLat = h.coordinates.reduce((acc, c) => acc + c[0], 0) / h.coordinates.length;
        const avgLng = h.coordinates.reduce((acc, c) => acc + c[1], 0) / h.coordinates.length;
        const d = calculateDistance(lat, lng, avgLat, avgLng);
        if (d < nearestHazardDistance) {
          nearestHazardDistance = d;
          detectedHazardType = h.type || "Flood";
        }
      }
    });

    if (nearestHazardDistance < 5) {
      insideHazardPolygon = true;
      baseScore = Math.max(baseScore, 75);
      baseLevel = "HIGH";
      hazardReason = `Directly intersecting designated ${detectedHazardType} Risk Zone (<5 km).`;
    } else if (nearestHazardDistance < 15) {
      baseScore = Math.max(baseScore, 50);
      baseLevel = baseLevel === "SAFE" ? "MEDIUM" : baseLevel;
      hazardReason = `Located within ${nearestHazardDistance.toFixed(1)} km buffer of active ${detectedHazardType} zone.`;
    }
  }

  // =========================================================================
  // 2. LIVE ATMOSPHERIC THREAT EVALUATION (0 to 100)
  // =========================================================================
  let atmosphericScore = 0;
  let atmosphericLevel = "SAFE";
  const weatherFactors = [];

  if (weatherData && weatherData.current) {
    const { current, forecast12h } = weatherData;
    const precip = current.precipitation || 0;
    const wCode = current.weather_code || 0;
    const wind = current.windSpeed || current.wind_speed_10m || 0;
    const gusts = current.windGusts || current.wind_gusts_10m || 0;
    const pressure = current.surfacePressure || current.surface_pressure || 1013;

    // A. Real-Time Precipitation Rate (mm/h)
    if (precip >= 35) {
      atmosphericScore += 80;
      weatherFactors.push(`Torrential downpour (${precip} mm/h) - High Flash Flood Trigger`);
    } else if (precip >= 15) {
      atmosphericScore += 60;
      weatherFactors.push(`Heavy intense rainfall (${precip} mm/h)`);
    } else if (precip >= 5) {
      atmosphericScore += 35;
      weatherFactors.push(`Moderate-to-heavy showers (${precip} mm/h)`);
    } else if (precip > 0.5) {
      atmosphericScore += 15;
      weatherFactors.push(`Light rain/drizzle (${precip} mm/h)`);
    }

    // B. Severe Weather Codes (WMO classification)
    if (wCode >= 95) {
      atmosphericScore += 40;
      weatherFactors.push(`Severe Thunderstorm & Hail activity (WMO Code ${wCode})`);
    } else if (wCode === 82) {
      atmosphericScore += 35;
      weatherFactors.push("Violent cloudburst rain showers detected");
    } else if (wCode >= 65 || wCode === 75 || wCode === 86) {
      atmosphericScore += 25;
      weatherFactors.push("Heavy continuous precipitation event");
    } else if (wCode >= 51 && precip === 0) {
      atmosphericScore += 10;
      weatherFactors.push("Overcast / Drizzle conditions");
    }

    // C. 12-Hour Forecast Rainfall Accumulation
    if (forecast12h && forecast12h.length > 0) {
      const total12hRain = forecast12h.reduce((acc, h) => acc + (h.precipitation || 0), 0);
      const maxRainProb = Math.max(...forecast12h.map((h) => h.precipitationProb || 0));

      if (total12hRain >= 40) {
        atmosphericScore += 30;
        weatherFactors.push(`12h forecast accumulation of ${total12hRain.toFixed(1)} mm`);
      } else if (total12hRain >= 15) {
        atmosphericScore += 18;
        weatherFactors.push(`Elevated 12h forecast rain (${total12hRain.toFixed(1)} mm, ${maxRainProb}% prob)`);
      }
    }

    // D. Wind & Cyclonic Depression
    if (wind >= 50 || gusts >= 70) {
      atmosphericScore += 30;
      weatherFactors.push(`Gale-force wind speeds (${wind} km/h, Gusts ${gusts} km/h)`);
    } else if (wind >= 30) {
      atmosphericScore += 15;
      weatherFactors.push(`Gusty winds (${wind} km/h)`);
    }

    if (pressure < 995) {
      atmosphericScore += 20;
      weatherFactors.push(`Deep low-pressure cyclonic disturbance (${pressure} hPa)`);
    }

    // Atmospheric Tier Assignment
    if (atmosphericScore >= 70) atmosphericLevel = "CRITICAL";
    else if (atmosphericScore >= 45) atmosphericLevel = "HIGH";
    else if (atmosphericScore >= 25) atmosphericLevel = "MEDIUM";
    else if (atmosphericScore >= 10) atmosphericLevel = "LOW";
    else atmosphericLevel = "SAFE";
  } else {
    weatherFactors.push("Atmospheric observations clear / nominal");
  }

  // =========================================================================
  // 3. FUSED LIVE DYNAMIC RISK SCORE & TIER DETERMINATION
  // =========================================================================
  // Live Weather is weighted dynamically: severe storms elevate any peaceful baseline!
  let fusedScore = 0;
  let fusedRiskLevel = "SAFE";
  let statusBadge = "🟢 SAFE";
  let alertSummary = "";
  let actionPriority = "NORMAL";

  // If live atmospheric threat is CRITICAL (Flash flood / severe cloudburst),
  // promote risk to CRITICAL/HIGH even if zero previous disaster records existed!
  if (atmosphericLevel === "CRITICAL") {
    fusedScore = Math.max(85, Math.round(baseScore * 0.3 + atmosphericScore * 0.7));
    fusedRiskLevel = "CRITICAL";
    statusBadge = "🔴 CRITICAL THREAT";
    actionPriority = "IMMEDIATE";
    alertSummary = `Severe Live Weather Hazard! Torrential downpour/thunderstorm active. Immediate flash flood and emergency shelter protocol advised for ${district}.`;
  } else if (atmosphericLevel === "HIGH") {
    fusedScore = Math.max(68, Math.round(baseScore * 0.4 + atmosphericScore * 0.6));
    fusedRiskLevel = "HIGH";
    statusBadge = "🟠 HIGH RISK";
    actionPriority = "HIGH";
    alertSummary = `Elevated Atmospheric Vulnerability. High rainfall/wind gusts observed. Relief shelters placed on standby.`;
  } else if (baseLevel === "CRITICAL" && atmosphericLevel === "SAFE") {
    // High historical vulnerability, but calm weather today
    fusedScore = Math.round(baseScore * 0.65 + atmosphericScore * 0.35);
    fusedRiskLevel = fusedScore > 65 ? "HIGH" : "MEDIUM";
    statusBadge = "🟡 MONITORED (CALM WEATHER)";
    actionPriority = "SHORT_TERM";
    alertSummary = `Known High-Risk Zone with calm current weather. Monitoring telemetry active.`;
  } else if (baseLevel === "HIGH" && atmosphericLevel === "SAFE") {
    fusedScore = 48;
    fusedRiskLevel = "MEDIUM";
    statusBadge = "🟡 MODERATE (NOMINAL WEATHER)";
    actionPriority = "SHORT_TERM";
    alertSummary = `Moderate baseline exposure with clear atmospheric conditions.`;
  } else if (atmosphericLevel === "MEDIUM" || baseLevel === "MEDIUM") {
    fusedScore = Math.round(baseScore * 0.45 + atmosphericScore * 0.55);
    fusedRiskLevel = fusedScore >= 55 ? "HIGH" : "MEDIUM";
    statusBadge = "🟡 MEDIUM RISK";
    actionPriority = "SHORT_TERM";
    alertSummary = `Moderate weather precipitation interacting with regional terrain.`;
  } else if (atmosphericLevel === "LOW" || baseLevel === "LOW") {
    fusedScore = Math.max(18, Math.round(baseScore * 0.5 + atmosphericScore * 0.5));
    fusedRiskLevel = "LOW";
    statusBadge = "🟢 LOW RISK";
    actionPriority = "NORMAL";
    alertSummary = `Low risk observed. Atmospheric and geospatial parameters within safe tolerance limits.`;
  } else {
    fusedScore = Math.min(14, baseScore + atmosphericScore);
    fusedRiskLevel = "SAFE";
    statusBadge = "🟢 SAFE ZONE";
    actionPriority = "NORMAL";
    alertSummary = `All parameters safe. No active disaster hazards or adverse weather detected.`;
  }

  // Cap scores between 0 - 100
  fusedScore = Math.min(100, Math.max(5, fusedScore));

  // =========================================================================
  // 4. FIND CLOSEST SAFE SHELTERS FOR THIS LOCATION
  // =========================================================================
  const nearbyShelters = findNearbySafeShelters(lat, lng, relocationSitesList, 5, 0);

  // =========================================================================
  // 5. GENERATE EXPLAINABLE AI REASONING TEXT
  // =========================================================================
  let explainableReason = "";
  if (baseLevel === "SAFE" && (atmosphericLevel === "CRITICAL" || atmosphericLevel === "HIGH")) {
    explainableReason = `Even though ${locationName} (${district}) has no prior historical disaster events in the registry, current live weather telemetry records ${weatherFactors.join(", ")}, escalating the real-time threat index to ${fusedRiskLevel}. Nearest safe shelter ${nearbyShelters[0]?.name || "Facility"} is situated ${nearbyShelters[0]?.distance || "N/A"} km away.`;
  } else if (baseLevel !== "SAFE" && atmosphericLevel === "CRITICAL") {
    explainableReason = `High-risk convergence: Known ${detectedHazardType} zone compounded by ${weatherFactors.join("; ")}. Extreme emergency status: Evacuation protocol recommended to ${nearbyShelters[0]?.name || "regional shelters"}.`;
  } else if (fusedRiskLevel === "SAFE" || fusedRiskLevel === "LOW") {
    explainableReason = `${locationName} in ${district} is currently in a ${fusedRiskLevel.toUpperCase()} zone with optimal weather observations (${weatherData?.current?.temperature || 26}°C, nominal rainfall) and zero active hazard polygon intersections.`;
  } else {
    explainableReason = `Composite evaluation for ${locationName}: Baseline vulnerability rated ${baseLevel} (${hazardReason}), combined with ${atmosphericLevel.toLowerCase()} atmospheric telemetry (${weatherFactors.join(", ")}).`;
  }

  return {
    locationName,
    district,
    state,
    coordinates: { lat, lng },
    population,
    // Baseline metrics
    baseline: {
      riskLevel: baseLevel,
      riskScore: baseScore,
      hazardType: detectedHazardType,
      insideHazardPolygon,
      nearestHazardDistanceKm: nearestHazardDistance < 999 ? Math.round(nearestHazardDistance * 10) / 10 : null,
      reason: hazardReason,
    },
    // Atmospheric metrics
    atmospheric: {
      threatLevel: atmosphericLevel,
      threatScore: atmosphericScore,
      factors: weatherFactors,
      currentWeather: weatherData?.current || null,
    },
    // Fused dynamic result
    dynamicRisk: {
      score: fusedScore,
      level: fusedRiskLevel,
      statusBadge,
      actionPriority,
      alertSummary,
      explainableReason,
    },
    // Safe shelters
    nearbyShelters,
    recommendedShelter: nearbyShelters[0] || null,
  };
}

/**
 * Computes an aggregated District Live Risk Report
 */
export function getDistrictLiveReport({
  districtName,
  villagesList = [],
  relocationSitesList = defaultShelters,
  hazardsList = [],
  districtWeather = null,
}) {
  if (!districtName || districtName === "ALL") return null;

  // Filter habitations belonging to district
  const districtVillages = villagesList.filter(
    (v) => v.district && v.district.toLowerCase() === districtName.toLowerCase()
  );

  // Filter shelters belonging to district
  const districtShelters = relocationSitesList.filter(
    (s) => s.district && s.district.toLowerCase() === districtName.toLowerCase()
  );

  const totalPopulation = districtVillages.reduce((acc, v) => acc + (v.population || 0), 0);
  const totalCapacity = districtShelters.reduce((acc, s) => acc + (s.capacity || s.capacityTotal || 0), 0);
  const availableCapacity = districtShelters.reduce((acc, s) => acc + (s.availableCapacity || s.capacity || 0), 0);

  // Determine centroid coordinates for weather lookup if not provided
  let centerLat = 26.14;
  let centerLng = 91.73;

  if (districtVillages.length > 0) {
    centerLat = districtVillages.reduce((acc, v) => acc + v.lat, 0) / districtVillages.length;
    centerLng = districtVillages.reduce((acc, v) => acc + v.lng, 0) / districtVillages.length;
  } else if (districtShelters.length > 0) {
    centerLat = districtShelters.reduce((acc, s) => acc + s.lat, 0) / districtShelters.length;
    centerLng = districtShelters.reduce((acc, s) => acc + s.lng, 0) / districtShelters.length;
  }

  // State
  const state = districtVillages[0]?.state || districtShelters[0]?.state || "India";

  // Check baseline risk of villages in district
  const hasCriticalVillages = districtVillages.some((v) => v.riskLevel === "CRITICAL");
  const hasHighVillages = districtVillages.some((v) => v.riskLevel === "HIGH");

  let baseDistrictLevel = "SAFE";
  if (hasCriticalVillages) baseDistrictLevel = "CRITICAL";
  else if (hasHighVillages) baseDistrictLevel = "HIGH";
  else if (districtVillages.length > 0) baseDistrictLevel = "MEDIUM";

  // Evaluate Live Risk for the District
  const assessment = evaluateLiveDynamicRisk({
    lat: centerLat,
    lng: centerLng,
    locationName: `${districtName} District`,
    district: districtName,
    state,
    population: totalPopulation,
    baselineRiskLevel: baseDistrictLevel,
    weatherData: districtWeather,
    hazardsList,
    relocationSitesList,
  });

  return {
    districtName,
    state,
    centerCoordinates: { lat: centerLat, lng: centerLng },
    villageCount: districtVillages.length,
    totalPopulation,
    shelterCount: districtShelters.length,
    totalCapacity,
    availableCapacity,
    assessment,
    sheltersInDistrict: districtShelters.slice(0, 8),
    allNearbyShelters: assessment.nearbyShelters,
  };
}
