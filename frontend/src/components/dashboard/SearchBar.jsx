import { useState } from "react";

const SearchBar = ({ villages, onSelectVillage }) => {
  const [query, setQuery] = useState("");

  const results = villages.filter((village) =>
    village.name
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const handleSelect = (village) => {
    setQuery(village.name);
    onSelectVillage(village);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "350px",
        background: "#ffffff",
        padding: "6px",
        borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.25)",
        border: "1px solid #e2e8f0",
        zIndex: 9999,
      }}
    >
      <input
        type="text"
        placeholder="Search village..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 14px",
          border: "none",
          outline: "none",
          borderRadius: "7px",
          fontSize: "14px",
          background: "#ffffff",
          color: "#1e293b",
        }}
      />

      {query && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "52px",
            left: "6px",
            right: "6px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            zIndex: 10000,
          }}
        >
          {results.map((village) => (
            <div
              key={village.id}
              onClick={() => handleSelect(village)}
              style={{
                padding: "12px",
                cursor: "pointer",
                background: "#ffffff",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <strong
                style={{
                  color: "#0f172a",
                  fontSize: "14px",
                }}
              >
                {village.name}
              </strong>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "3px",
                }}
              >
                {village.district} · {village.riskLevel}
              </div>
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "52px",
            left: "6px",
            right: "6px",
            background: "#ffffff",
            padding: "12px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            color: "#64748b",
            fontSize: "13px",
            zIndex: 10000,
          }}
        >
          No villages found
        </div>
      )}
    </div>
  );
};

export default SearchBar;