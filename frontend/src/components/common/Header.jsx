const Header = () => {
  return (
    <header
      style={{
        height: "62px",
        background: "#ffffff",
        color: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* BRAND & TITLE */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
            color: "#ffffff",
          }}
        >
          🛡️
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.2px" }}>
            AI Disaster Risk Assessment & Relocation Platform
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>
            SIH26191 • Real-Time Spatial Optimization & Multi-Hazard AI Diagnostics
          </div>
        </div>
      </div>

      {/* SYSTEM STATUS PILLS */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            color: "#166534",
            fontWeight: "600",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
          ML Engine v2 (Hungarian + Groq)
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            color: "#0369a1",
            fontWeight: "600",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0284c7" }} />
          PostGIS 71 Habitations
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            color: "#991b1b",
            fontWeight: "600",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#dc2626" }} />
          17 Critical Zones
        </div>
      </div>
    </header>
  );
};

export default Header;