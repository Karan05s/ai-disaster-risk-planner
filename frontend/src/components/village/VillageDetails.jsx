import { relocationSites } from "../../utils/relocationSites";
import { calculateDistance } from "../../utils/mapHelpers";

const VillageDetails = ({
  village,
  onClose,
  onViewOnMap,
}) => {
  if (!village) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          color: "#64748b",
          textAlign: "center",
        }}
      >
        Select a village to view details
      </div>
    );
  }

  // -----------------------------
  // FIND SUITABLE RELOCATION SITE
  // -----------------------------

  const suitableSites = relocationSites
    .filter(
      (site) =>
        site.status === "AVAILABLE" &&
        site.availableCapacity >= village.population
    )
    .map((site) => ({
      ...site,

      distance: calculateDistance(
        village.lat,
        village.lng,
        site.lat,
        site.lng
      ),
    }))
    .sort(
      (a, b) => a.distance - b.distance
    );

  const recommendedSite =
    suitableSites.length > 0
      ? suitableSites[0]
      : null;

  // -----------------------------
  // RISK COLOR
  // -----------------------------

  const getRiskColor = (risk) => {
    switch (risk) {
      case "CRITICAL":
        return "#dc2626";

      case "HIGH":
        return "#ea580c";

      case "MEDIUM":
        return "#ca8a04";

      case "LOW":
        return "#16a34a";

      default:
        return "#64748b";
    }
  };

  const riskColor = getRiskColor(
    village.riskLevel
  );

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
        boxShadow:
          "0 4px 12px rgba(0, 0, 0, 0.12)",
        position: "relative",
      }}
    >

      {/* ============================= */}
      {/* CLOSE BUTTON */}
      {/* ============================= */}

      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          border: "none",
          background: "#f1f5f9",
          borderRadius: "6px",
          width: "30px",
          height: "30px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        ×
      </button>

      {/* ============================= */}
      {/* VILLAGE TITLE */}
      {/* ============================= */}

      <h2
        style={{
          margin: "0 0 5px 0",
          color: "#0f172a",
        }}
      >
        {village.name}
      </h2>

      <p
        style={{
          margin: "0 0 18px 0",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {village.district}
      </p>

      {/* ============================= */}
      {/* RISK */}
      {/* ============================= */}

      <div
        style={{
          marginBottom: "18px",
          padding: "12px",
          background: "#f8fafc",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#64748b",
            marginBottom: "5px",
          }}
        >
          Risk Level
        </div>

        <strong
          style={{
            color: riskColor,
            fontSize: "18px",
          }}
        >
          {village.riskLevel}
        </strong>
      </div>

      {/* ============================= */}
      {/* VILLAGE DETAILS */}
      {/* ============================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >

        <div>
          <small>Population</small>

          <strong
            style={{
              display: "block",
              marginTop: "4px",
              color: "#0f172a",
            }}
          >
            {village.population}
          </strong>
        </div>

        <div>
          <small>Hazard Type</small>

          <strong
            style={{
              display: "block",
              marginTop: "4px",
              color: "#0f172a",
            }}
          >
            {village.hazardType || "N/A"}
          </strong>
        </div>

        <div>
          <small>Priority</small>

          <strong
            style={{
              display: "block",
              marginTop: "4px",
              color: "#0f172a",
            }}
          >
            {village.priority || "N/A"}
          </strong>
        </div>

        <div>
          <small>Coordinates</small>

          <strong
            style={{
              display: "block",
              marginTop: "4px",
              color: "#0f172a",
              fontSize: "12px",
            }}
          >
            {village.lat}, {village.lng}
          </strong>
        </div>

      </div>

      {/* ============================= */}
      {/* RECOMMENDED ACTION */}
      {/* ============================= */}

      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          background:
            village.priority === "IMMEDIATE"
              ? "#fef2f2"
              : "#f8fafc",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#64748b",
            marginBottom: "5px",
          }}
        >
          Recommended Action
        </div>

        <strong
          style={{
            color:
              village.priority === "IMMEDIATE"
                ? "#dc2626"
                : "#334155",
          }}
        >
          {village.priority === "IMMEDIATE"
            ? "Immediate Relocation Required"
            : "Monitor & Assess"}
        </strong>
      </div>

      {/* ============================= */}
      {/* RELOCATION RECOMMENDATION */}
      {/* ============================= */}

      <div
        style={{
          marginTop: "15px",
          padding: "15px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "10px",
        }}
      >

        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "15px",
            color: "#166534",
          }}
        >
          Recommended Relocation Site
        </h3>

        {recommendedSite ? (
          <>
            {/* SITE NAME */}

            <strong
              style={{
                display: "block",
                color: "#14532d",
                marginBottom: "8px",
              }}
            >
              🏠 {recommendedSite.name}
            </strong>

            {/* DISTANCE */}

            <p
              style={{
                margin: "5px 0",
                fontSize: "13px",
              }}
            >
              Distance:{" "}
              <strong>
                {recommendedSite.distance.toFixed(2)} km
              </strong>
            </p>

            {/* CAPACITY */}

            <p
              style={{
                margin: "5px 0",
                fontSize: "13px",
              }}
            >
              Available Capacity:{" "}
              <strong>
                {recommendedSite.availableCapacity}
              </strong>
            </p>

            {/* STATUS */}

            <p
              style={{
                margin: "5px 0",
                fontSize: "13px",
              }}
            >
              Status:{" "}
              <strong>
                {recommendedSite.status}
              </strong>
            </p>

            {/* ============================= */}
            {/* VIEW ON MAP */}
            {/* ============================= */}

            <button
              onClick={() =>
                onViewOnMap({
                  lat: recommendedSite.lat,
                  lng: recommendedSite.lng,
                })
              }
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "10px",
                border: "none",
                borderRadius: "7px",
                background: "#166534",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              📍 View on Map
            </button>
          </>
        ) : (
          <p
            style={{
              margin: 0,
              color: "#991b1b",
              fontSize: "13px",
            }}
          >
            No suitable relocation site available.
          </p>
        )}

      </div>

    </div>
  );
};

export default VillageDetails;