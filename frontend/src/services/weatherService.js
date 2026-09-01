/**
 * Weather Service - Real-time atmospheric observations and 12-hour hourly forecasts
 * Powered by Open-Meteo High-Resolution Global & Regional Numerical Weather Prediction API
 */

const WMO_CODE_MAP = {
  0: { label: "Clear Sky", icon: "☀️", hazard: "NONE", bg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" },
  1: { label: "Mainly Clear", icon: "🌤️", hazard: "NONE", bg: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)" },
  2: { label: "Partly Cloudy", icon: "⛅", hazard: "NONE", bg: "linear-gradient(135deg, #475569 0%, #0284c7 100%)" },
  3: { label: "Overcast", icon: "☁️", hazard: "LOW", bg: "linear-gradient(135deg, #334155 0%, #64748b 100%)" },
  45: { label: "Fog", icon: "🌫️", hazard: "LOW", bg: "linear-gradient(135deg, #475569 0%, #94a3b8 100%)" },
  48: { label: "Depositing Rime Fog", icon: "🌫️", hazard: "LOW", bg: "linear-gradient(135deg, #475569 0%, #94a3b8 100%)" },
  51: { label: "Light Drizzle", icon: "🌦️", hazard: "LOW", bg: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)" },
  53: { label: "Moderate Drizzle", icon: "🌦️", hazard: "LOW", bg: "linear-gradient(135deg, #1e293b 0%, #2563eb 100%)" },
  55: { label: "Dense Drizzle", icon: "🌧️", hazard: "MEDIUM", bg: "linear-gradient(135deg, #1e293b 0%, #1d4ed8 100%)" },
  56: { label: "Light Freezing Drizzle", icon: "🌧️", hazard: "MEDIUM", bg: "linear-gradient(135deg, #1e293b 0%, #0284c7 100%)" },
  57: { label: "Dense Freezing Drizzle", icon: "🌧️", hazard: "HIGH", bg: "linear-gradient(135deg, #0f172a 0%, #1e40af 100%)" },
  61: { label: "Slight Rain", icon: "🌧️", hazard: "LOW", bg: "linear-gradient(135deg, #1e293b 0%, #2563eb 100%)" },
  63: { label: "Moderate Rain", icon: "🌧️", hazard: "MEDIUM", bg: "linear-gradient(135deg, #1e293b 0%, #1d4ed8 100%)" },
  65: { label: "Heavy Rain", icon: "🌧️", hazard: "HIGH", bg: "linear-gradient(135deg, #0f172a 0%, #b91c1c 100%)" },
  66: { label: "Light Freezing Rain", icon: "🌨️", hazard: "HIGH", bg: "linear-gradient(135deg, #0f172a 0%, #4338ca 100%)" },
  67: { label: "Heavy Freezing Rain", icon: "🌨️", hazard: "CRITICAL", bg: "linear-gradient(135deg, #450a0a 0%, #991b1b 100%)" },
  71: { label: "Slight Snow Fall", icon: "❄️", hazard: "LOW", bg: "linear-gradient(135deg, #1e293b 0%, #64748b 100%)" },
  73: { label: "Moderate Snow Fall", icon: "❄️", hazard: "MEDIUM", bg: "linear-gradient(135deg, #1e293b 0%, #475569 100%)" },
  75: { label: "Heavy Snow Fall", icon: "❄️", hazard: "HIGH", bg: "linear-gradient(135deg, #0f172a 0%, #b91c1c 100%)" },
  77: { label: "Snow Grains", icon: "❄️", hazard: "LOW", bg: "linear-gradient(135deg, #1e293b 0%, #64748b 100%)" },
  80: { label: "Slight Rain Showers", icon: "🌦️", hazard: "LOW", bg: "linear-gradient(135deg, #1e293b 0%, #2563eb 100%)" },
  81: { label: "Moderate Rain Showers", icon: "🌧️", hazard: "MEDIUM", bg: "linear-gradient(135deg, #1e293b 0%, #1d4ed8 100%)" },
  82: { label: "Violent Rain Showers", icon: "⛈️", hazard: "CRITICAL", bg: "linear-gradient(135deg, #450a0a 0%, #b91c1c 100%)" },
  85: { label: "Slight Snow Showers", icon: "🌨️", hazard: "MEDIUM", bg: "linear-gradient(135deg, #1e293b 0%, #475569 100%)" },
  86: { label: "Heavy Snow Showers", icon: "🌨️", hazard: "HIGH", bg: "linear-gradient(135deg, #0f172a 0%, #b91c1c 100%)" },
  95: { label: "Thunderstorm", icon: "⛈️", hazard: "HIGH", bg: "linear-gradient(135deg, #2e1065 0%, #7e22ce 100%)" },
  96: { label: "Thunderstorm with Slight Hail", icon: "⛈️", hazard: "CRITICAL", bg: "linear-gradient(135deg, #450a0a 0%, #7e22ce 100%)" },
  99: { label: "Thunderstorm with Heavy Hail", icon: "⛈️", hazard: "CRITICAL", bg: "linear-gradient(135deg, #450a0a 0%, #991b1b 100%)" },
};

export function getWmoWeatherInfo(code) {
  return WMO_CODE_MAP[code] || {
    label: "Variable Weather",
    icon: "⛅",
    hazard: "NONE",
    bg: "linear-gradient(135deg, #334155 0%, #64748b 100%)",
  };
}

export function getWindDirection(degrees) {
  if (degrees === undefined || degrees === null) return "N";
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

/**
 * Fetch real-time weather and 12-hour hourly forecast for given coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Formatted weather telemetry data
 */
export async function fetchRealtimeWeather(lat, lng) {
  if (!lat || !lng) {
    throw new Error("Latitude and longitude are required");
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&forecast_days=2&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API returned status ${response.status}`);
  }

  const data = await response.json();
  const current = data.current;
  const hourly = data.hourly;

  const weatherInfo = getWmoWeatherInfo(current.weather_code);

  // Compute severity and hazard warnings
  let alertLevel = "NORMAL";
  let alertMessage = null;

  if (current.precipitation > 15 || current.weather_code >= 95 || current.wind_speed_10m > 50) {
    alertLevel = "CRITICAL";
    if (current.precipitation > 15) {
      alertMessage = `Extreme rainfall rate (${current.precipitation} mm/h) - High Flash Flood Risk!`;
    } else if (current.weather_code >= 95) {
      alertMessage = `Severe Thunderstorm & Hail activity detected in this zone.`;
    } else {
      alertMessage = `Gale-force wind speeds (${current.wind_speed_10m} km/h) - Structural hazard.`;
    }
  } else if (current.precipitation > 5 || current.weather_code >= 65 || current.wind_speed_10m > 30) {
    alertLevel = "ELEVATED";
    alertMessage = `Elevated precipitation (${current.precipitation} mm/h) / Gusty winds (${current.wind_speed_10m} km/h).`;
  }

  // Match starting hourly slot with the API's current local timestamp
  let startIndex = 0;
  if (hourly && hourly.time && hourly.time.length > 0) {
    const currentTimeStr = current.time || "";
    const currentHourStr = currentTimeStr.slice(0, 13); // e.g. "2026-09-01T11"
    const matchIdx = hourly.time.findIndex(t => t.startsWith(currentHourStr));

    if (matchIdx !== -1) {
      startIndex = matchIdx;
    } else {
      // Find the first hourly entry that is >= current time, or closest
      const nowMs = new Date().getTime();
      let bestIdx = 0;
      let minDiff = Infinity;
      hourly.time.forEach((t, idx) => {
        const diff = Math.abs(new Date(t).getTime() - nowMs);
        if (diff < minDiff) {
          minDiff = diff;
          bestIdx = idx;
        }
      });
      startIndex = bestIdx;
    }
  }

  // Helper to format "2026-09-01T14:00" to "2 PM"
  const formatHour = (isoStr) => {
    try {
      const timePart = isoStr.split("T")[1];
      if (timePart) {
        let hour = parseInt(timePart.split(":")[0], 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${hour} ${ampm}`;
      }
    } catch {
      // fallback
    }
    return new Date(isoStr).toLocaleTimeString([], { hour: 'numeric', hour12: true });
  };

  // Extract next 12 consecutive hours starting from the active hour
  const next12Hours = [];
  if (hourly && hourly.time) {
    for (let i = startIndex; i < Math.min(startIndex + 12, hourly.time.length); i++) {
      const timeStr = hourly.time[i];
      const hourFormatted = formatHour(timeStr);
      const wCode = hourly.weather_code[i];
      const wInfo = getWmoWeatherInfo(wCode);

      next12Hours.push({
        time: timeStr,
        hourDisplay: hourFormatted,
        isCurrent: i === startIndex,
        temperature: Math.round(hourly.temperature_2m[i]),
        precipitationProb: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
        precipitation: hourly.precipitation ? hourly.precipitation[i] : 0,
        windSpeed: Math.round(hourly.wind_speed_10m[i]),
        humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : null,
        weatherCode: wCode,
        label: wInfo.label,
        icon: wInfo.icon,
      });
    }
  }

  return {
    latitude: lat,
    longitude: lng,
    timezone: data.timezone,
    elevation: data.elevation,
    current: {
      temperature: Math.round(current.temperature_2m * 10) / 10,
      apparentTemperature: Math.round(current.apparent_temperature * 10) / 10,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      rain: current.rain,
      weatherCode: current.weather_code,
      label: weatherInfo.label,
      icon: weatherInfo.icon,
      bg: weatherInfo.bg,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      windDirection: getWindDirection(current.wind_direction_10m),
      windDegrees: current.wind_direction_10m,
      windGusts: current.wind_gusts_10m ? Math.round(current.wind_gusts_10m * 10) / 10 : null,
      surfacePressure: Math.round(current.surface_pressure),
      cloudCover: current.cloud_cover,
      isDay: current.is_day === 1,
      fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    },
    alert: {
      level: alertLevel,
      message: alertMessage,
    },
    forecast12h: next12Hours,
  };
}

// In-memory weather cache for search previews
const quickWeatherCache = new Map();

/**
 * Fetch a quick weather snapshot (temperature, condition icon, precipitation) for search items
 */
export async function fetchQuickWeather(lat, lng) {
  if (!lat || !lng) return null;
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  if (quickWeatherCache.has(key)) {
    return quickWeatherCache.get(key);
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current;
    if (!current) return null;

    const wInfo = getWmoWeatherInfo(current.weather_code);
    const result = {
      temperature: Math.round(current.temperature_2m),
      precipitation: current.precipitation,
      icon: wInfo.icon,
      label: wInfo.label,
    };
    quickWeatherCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

/**
 * Search any location / town / district in India using Open-Meteo Geocoding API
 */
export async function searchGeocodedLocations(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=4&language=en&format=json&countryCode=IN`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item) => ({
      id: `GEO-${item.id}`,
      name: item.name,
      district: item.admin2 || item.admin1 || "India",
      state: item.admin1 || "India",
      lat: item.latitude,
      lng: item.longitude,
      isCustomLocation: true,
      riskLevel: "ADVISORY",
      priority: "MONITORING",
      isGeocoded: true,
    }));
  } catch {
    return [];
  }
}
