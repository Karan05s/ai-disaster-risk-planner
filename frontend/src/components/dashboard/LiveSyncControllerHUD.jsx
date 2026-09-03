import { useState, useEffect } from "react";

const LiveSyncControllerHUD = ({
  lastSyncedAt,
  isSyncing,
  onForceSync,
  totalHazardsCount,
  criticalVillagesCount,
  immediateRelocationCount,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(2 * 60 * 60); // 2 hours = 7200 seconds

  // 2-Hour Countdown timer
  useEffect(() => {
    setSecondsRemaining(2 * 60 * 60);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (onForceSync) onForceSync();
          return 2 * 60 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSyncedAt, onForceSync]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formatTwoDigits = (num) => String(num).padStart(2, "0");
  const timeFormatted = `${hours}h ${formatTwoDigits(minutes)}m ${formatTwoDigits(seconds)}s`;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "7px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* LEFT: LIVE STATUS & 2-HOUR CYCLE */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "3px 8px",
            borderRadius: "14px",
            fontSize: "11px",
            fontWeight: "700",
            color: "#166534",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#16a34a",
              boxShadow: "0 0 6px rgba(22, 163, 74, 0.8)",
              display: "inline-block",
            }}
          />
          <span>ALL-INDIA REAL-TIME TELEMETRY (2H CYCLE)</span>
        </div>

        <span style={{ fontSize: "11px", color: "#64748b" }}>
          Synced: <strong style={{ color: "#0f172a" }}>{lastSyncedAt || "Live"}</strong> • Next Sync: <strong style={{ color: "#0284c7" }}>{timeFormatted}</strong>
        </span>
      </div>

      {/* RIGHT: REAL-TIME DYNAMIC STATS & SYNC BUTTON */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ display: "flex", gap: "6px", fontSize: "11px" }}>
          <span style={{ background: "#eff6ff", border: "1px solid #dbeafe", padding: "2px 6px", borderRadius: "5px", color: "#1e40af", fontWeight: "600" }}>
            🌊 {totalHazardsCount || 12} Active Zones
          </span>
          <span style={{ background: "#fef2f2", border: "1px solid #fee2e2", padding: "2px 6px", borderRadius: "5px", color: "#991b1b", fontWeight: "600" }}>
            🚨 {criticalVillagesCount || 14} Critical
          </span>
        </div>

        <button
          onClick={onForceSync}
          disabled={isSyncing}
          style={{
            background: isSyncing ? "#e2e8f0" : "#0284c7",
            color: isSyncing ? "#64748b" : "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "4px 10px",
            fontSize: "11px",
            fontWeight: "700",
            cursor: isSyncing ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            boxShadow: isSyncing ? "none" : "0 2px 5px rgba(2, 132, 199, 0.3)",
            transition: "all 0.15s ease",
          }}
        >
          <span style={{ display: "inline-block", transform: isSyncing ? "rotate(180deg)" : "none", transition: "transform 0.5s" }}>
            🔄
          </span>
          <span>{isSyncing ? "Scanning India NWP..." : "Sync Live Data"}</span>
        </button>
      </div>
    </div>
  );
};

export default LiveSyncControllerHUD;
