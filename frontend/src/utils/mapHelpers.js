export const calculateDistance = (
  lat1,
  lng1,
  lat2,
  lng2
) => {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLng =
    ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};

// =====================================
// FIND NEAREST RELOCATION SITE
// =====================================

export const findNearestSite = (
  village,
  relocationSites
) => {
  return relocationSites
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
      (a, b) =>
        a.distance - b.distance
    )[0];
};

// =====================================
// FILTER AVAILABLE SITES
// =====================================

export const getAvailableSites =
  (sites) => {
    return sites.filter(
      (site) =>
        site.status === "AVAILABLE"
    );
  };

// =====================================
// FILTER SITES BY CAPACITY
// =====================================

export const getSuitableSites = (
  village,
  sites
) => {
  return sites.filter(
    (site) =>
      site.availableCapacity >=
      village.population
  );
};

// =====================================
// GET RISK COLOR
// =====================================

export const getRiskColor = (
  riskLevel
) => {
  switch (riskLevel) {
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

// =====================================
// GET PRIORITY COLOR
// =====================================

export const getPriorityColor =
  (priority) => {
    switch (priority) {
      case "IMMEDIATE":
        return "#dc2626";

      case "HIGH":
        return "#ea580c";

      case "NORMAL":
        return "#2563eb";

      default:
        return "#64748b";
    }
  };

// =====================================
// MAP CENTER OF INDIA
// =====================================

export const INDIA_CENTER = [
  22.5,
  79.0,
];

// =====================================
// INDIA BOUNDS
// =====================================

export const INDIA_BOUNDS = [
  [6.5, 68.0],
  [37.5, 97.5],
];