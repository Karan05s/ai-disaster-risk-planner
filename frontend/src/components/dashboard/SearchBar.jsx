import { useState, useEffect, useRef } from "react";
import { fetchQuickWeather, searchGeocodedLocations } from "../../services/weatherService";

const riskColors = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#d97706",
  LOW: "#16a34a",
  ADVISORY: "#0284c7",
};

const SearchItemWeather = ({ lat, lng }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchQuickWeather(lat, lng).then((data) => {
      if (isMounted) {
        setWeather(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  if (loading) {
    return (
      <span style={{ fontSize: "10px", color: "#94a3b8" }}>
        Fetching...
      </span>
    );
  }

  if (!weather) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: "#f0f9ff",
        border: "1px solid #bae6fd",
        padding: "2px 6px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: "600",
        color: "#0369a1",
        whiteSpace: "nowrap",
      }}
    >
      <span>{weather.icon}</span>
      <span>{weather.temperature}°C</span>
      {weather.precipitation > 0 && (
        <span style={{ color: "#0284c7", fontSize: "10px" }}>
          💧 {weather.precipitation}mm
        </span>
      )}
    </div>
  );
};

const SearchBar = ({ villages, onSelectVillage }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [geoResults, setGeoResults] = useState([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const containerRef = useRef(null);

  // Filter local habitations
  const localResults = (villages || []).filter((village) => {
    if (!query) return false;
    const q = query.toLowerCase();
    return (
      (village.name && village.name.toLowerCase().includes(q)) ||
      (village.district && village.district.toLowerCase().includes(q)) ||
      (village.state && village.state.toLowerCase().includes(q))
    );
  });

  // Fetch geocoded places if local matches are limited and query >= 2
  useEffect(() => {
    if (query.trim().length < 2) {
      setGeoResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGeo(true);
      const results = await searchGeocodedLocations(query);
      // Filter out locations already in local results
      const uniqueGeo = results.filter(
        (g) => !localResults.some((l) => l.name.toLowerCase() === g.name.toLowerCase())
      );
      setGeoResults(uniqueGeo);
      setIsSearchingGeo(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setQuery(item.name);
    setIsOpen(false);
    if (onSelectVillage) {
      onSelectVillage({
        ...item,
        openWeather: true,
      });
    }
  };

  const totalResultsCount = localResults.length + geoResults.length;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: isOpen ? "270px" : "220px",
        transition: "width 0.2s ease",
        background: "#ffffff",
        padding: "3px 8px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
        border: "1px solid #cbd5e1",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: "12px", marginRight: "5px", color: "#0284c7" }}>🔍</span>
      <input
        type="text"
        placeholder="Search location & weather..."
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "5px 2px",
          border: "none",
          outline: "none",
          borderRadius: "6px",
          fontSize: "12px",
          background: "#ffffff",
          color: "#0f172a",
        }}
      />

      {query && (
        <button
          onClick={() => {
            setQuery("");
            setGeoResults([]);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "13px",
            padding: "0 2px",
          }}
        >
          ×
        </button>
      )}

      {/* SEARCH DROPDOWN RESULTS WITH LIVE WEATHER PREVIEWS */}
      {isOpen && query.trim().length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "38px",
            left: "0",
            right: "0",
            width: "310px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            zIndex: 10000,
            maxHeight: "320px",
            overflowY: "auto",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "6px 10px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontSize: "10.5px",
              color: "#64748b",
              fontWeight: "600",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>SEARCH RESULTS & LIVE WEATHER</span>
            <span>{totalResultsCount} found</span>
          </div>

          {/* LOCAL HABITATIONS / RISK ZONES */}
          {localResults.length > 0 && (
            <div>
              <div
                style={{
                  padding: "4px 10px",
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#0284c7",
                  background: "#f0f9ff",
                  borderBottom: "1px solid #e0f2fe",
                }}
              >
                HABITATIONS & DISASTER ZONES
              </div>

              {localResults.slice(0, 5).map((village) => (
                <div
                  key={village.id}
                  onClick={() => handleSelect(village)}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    background: "#ffffff",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                >
                  <div style={{ paddingRight: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <strong style={{ color: "#0f172a", fontSize: "12px" }}>
                        {village.name}
                      </strong>
                      <span
                        style={{
                          fontSize: "9.5px",
                          fontWeight: "700",
                          color: riskColors[village.riskLevel] || "#64748b",
                          background: "#f1f5f9",
                          padding: "1px 4px",
                          borderRadius: "4px",
                        }}
                      >
                        {village.riskLevel}
                      </span>
                    </div>

                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                      📍 {village.district}, {village.state || "Assam"}
                    </div>
                  </div>

                  {/* LIVE WEATHER PREVIEW */}
                  <SearchItemWeather lat={village.lat} lng={village.lng} />
                </div>
              ))}
            </div>
          )}

          {/* OTHER GEOCODED LOCATIONS IN INDIA */}
          {geoResults.length > 0 && (
            <div>
              <div
                style={{
                  padding: "4px 10px",
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#475569",
                  background: "#f1f5f9",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                OTHER LOCATIONS IN INDIA
              </div>

              {geoResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    background: "#ffffff",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                >
                  <div>
                    <strong style={{ color: "#0f172a", fontSize: "12px" }}>
                      📍 {item.name}
                    </strong>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                      {item.district}, {item.state}
                    </div>
                  </div>

                  {/* LIVE WEATHER PREVIEW */}
                  <SearchItemWeather lat={item.lat} lng={item.lng} />
                </div>
              ))}
            </div>
          )}

          {/* LOADING GEOCODING INDICATOR */}
          {isSearchingGeo && (
            <div style={{ padding: "6px 10px", fontSize: "10.5px", color: "#64748b", textAlign: "center" }}>
              Searching regional places...
            </div>
          )}

          {/* NO RESULTS FOUND */}
          {totalResultsCount === 0 && !isSearchingGeo && (
            <div
              style={{
                padding: "16px 10px",
                color: "#64748b",
                fontSize: "11.5px",
                textAlign: "center",
              }}
            >
              No locations found matching "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;