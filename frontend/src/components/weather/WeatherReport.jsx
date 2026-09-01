import { useState, useEffect } from "react";
import { fetchRealtimeWeather } from "../../services/weatherService";

export const WeatherReport = ({ lat, lng, locationName, district, state }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWeather = async () => {
    if (!lat || !lng) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRealtimeWeather(lat, lng);
      setWeatherData(data);
    } catch (err) {
      console.error("Failed to load real-time weather:", err);
      setError("Unable to connect to live atmospheric telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "24px 16px",
          color: "#0f172a",
          textAlign: "center",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ fontSize: "28px", animation: "spin 2s linear infinite", display: "inline-block" }}>
          🌀
        </div>
        <div style={{ fontWeight: "700", fontSize: "13px", marginTop: "8px", color: "#0284c7" }}>
          Acquiring Live Meteorological Telemetry...
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
          Connecting to Open-Meteo High-Resolution Satellite & Radar Models
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "10px",
          padding: "12px",
          color: "#991b1b",
          fontSize: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <strong>Weather Telemetry Offline:</strong> {error || "No data available."}
        </div>
        <button
          onClick={loadWeather}
          style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "4px 8px",
            fontSize: "11px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Retry 🔄
        </button>
      </div>
    );
  }

  const { current, alert, forecast12h } = weatherData;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        color: "#0f172a",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* HEADER BAR */}
      <div
        style={{
          padding: "9px 12px",
          background: "#ffffff",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              display: "inline-block",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#16a34a",
              boxShadow: "0 0 6px rgba(22, 163, 74, 0.6)",
            }}
          />
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.3px", color: "#0369a1" }}>
            REAL-TIME ATMOSPHERIC TELEMETRY
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "10px", color: "#64748b" }}>
            Live @ {current.fetchedAt}
          </span>
          <button
            onClick={loadWeather}
            title="Refresh Live Data"
            style={{
              background: "#f0f9ff",
              color: "#0284c7",
              border: "1px solid #bae6fd",
              borderRadius: "5px",
              padding: "2px 6px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* SEVERE WEATHER DISASTER ALERT BANNER */}
      {alert.level !== "NORMAL" && (
        <div
          style={{
            background: alert.level === "CRITICAL" ? "#fef2f2" : "#fffbeb",
            borderBottom: alert.level === "CRITICAL" ? "1px solid #fecaca" : "1px solid #fde68a",
            padding: "7px 12px",
            fontSize: "11px",
            fontWeight: "600",
            color: alert.level === "CRITICAL" ? "#991b1b" : "#92400e",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "13px" }}>⚠️</span>
          <span>{alert.message}</span>
        </div>
      )}

      {/* HERO CURRENT WEATHER SECTION */}
      <div
        style={{
          margin: "10px 12px",
          padding: "12px 14px",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          border: "1px solid #bae6fd",
          borderRadius: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "30px", fontWeight: "800", color: "#0f172a", letterSpacing: "-1px" }}>
              {current.temperature}°C
            </span>
            <span style={{ fontSize: "11.5px", color: "#475569", fontWeight: "500" }}>
              Feels {current.apparentTemperature}°C
            </span>
          </div>

          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0369a1", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
            <span>{current.icon}</span>
            <span>{current.label}</span>
          </div>

          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
            📍 {locationName ? `${locationName}, ` : ""}{district || "Coordinates"}: {lat.toFixed(3)}°N, {lng.toFixed(3)}°E
          </div>
        </div>

        <div
          style={{
            fontSize: "40px",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
          }}
        >
          {current.icon}
        </div>
      </div>

      {/* REAL-TIME METRICS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "6px",
          padding: "0 12px 10px 12px",
        }}
      >
        {/* Metric 1: Precipitation */}
        <div
          style={{
            background: "#f8fafc",
            padding: "7px 8px",
            borderRadius: "7px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "10px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
            <span>💧</span> Rainfall
          </div>
          <div style={{ fontSize: "12px", fontWeight: "700", color: current.precipitation > 0 ? "#0284c7" : "#0f172a", marginTop: "2px" }}>
            {current.precipitation} mm/h
          </div>
        </div>

        {/* Metric 2: Wind Speed & Direction */}
        <div
          style={{
            background: "#f8fafc",
            padding: "7px 8px",
            borderRadius: "7px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "10px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
            <span>💨</span> Wind
          </div>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
            {current.windSpeed} km/h <span style={{ fontSize: "10px", color: "#0284c7" }}>{current.windDirection}</span>
          </div>
        </div>

        {/* Metric 3: Relative Humidity */}
        <div
          style={{
            background: "#f8fafc",
            padding: "7px 8px",
            borderRadius: "7px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "10px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
            <span>🌫️</span> Humidity
          </div>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
            {current.humidity}%
          </div>
        </div>

        {/* Metric 4: Surface Pressure */}
        <div
          style={{
            background: "#f8fafc",
            padding: "7px 8px",
            borderRadius: "7px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "10px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
            <span>⏲️</span> Pressure
          </div>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
            {current.surfacePressure} hPa
          </div>
        </div>

        {/* Metric 5: Cloud Cover */}
        <div
          style={{
            background: "#f8fafc",
            padding: "7px 8px",
            borderRadius: "7px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "10px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
            <span>☁️</span> Clouds
          </div>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
            {current.cloudCover}%
          </div>
        </div>

        {/* Metric 6: Wind Gusts */}
        <div
          style={{
            background: "#f8fafc",
            padding: "7px 8px",
            borderRadius: "7px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "10px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
            <span>🌪️</span> Gusts
          </div>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
            {current.windGusts ? `${current.windGusts} km/h` : "Mild"}
          </div>
        </div>
      </div>

      {/* 12-HOUR HOURLY FORECAST SECTION */}
      <div
        style={{
          padding: "10px 12px 12px 12px",
          background: "#ffffff",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "12px" }}>⏱️</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
              Next 12-Hours Forecast Timeline
            </span>
          </div>

          <span style={{ fontSize: "10px", color: "#0284c7", fontWeight: "600" }}>
            Hourly Projections
          </span>
        </div>

        {/* HORIZONTAL SCROLLABLE HOURLY CARDS STRIP */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            paddingBottom: "4px",
            scrollbarWidth: "thin",
          }}
        >
          {forecast12h.map((hour, idx) => (
            <div
              key={idx}
              style={{
                flex: "0 0 62px",
                background: hour.isCurrent ? "#f0f9ff" : "#f8fafc",
                border: hour.isCurrent ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "6px 2px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              {/* Hour */}
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: hour.isCurrent ? "700" : "500",
                  color: hour.isCurrent ? "#0284c7" : "#64748b",
                }}
              >
                {hour.isCurrent ? "Now" : hour.hourDisplay}
              </div>

              {/* Weather Icon */}
              <div style={{ fontSize: "16px", margin: "1px 0" }}>
                {hour.icon}
              </div>

              {/* Temperature */}
              <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#0f172a" }}>
                {hour.temperature}°
              </div>

              {/* Rain Probability / Droplet */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                  fontSize: "9px",
                  color: hour.precipitationProb > 30 ? "#0284c7" : "#94a3b8",
                  fontWeight: hour.precipitationProb > 30 ? "700" : "500",
                }}
              >
                <span>💧</span>
                <span>{hour.precipitationProb}%</span>
              </div>

              {/* Wind Speed */}
              <div style={{ fontSize: "8.5px", color: "#64748b" }}>
                {hour.windSpeed} km/h
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherReport;
