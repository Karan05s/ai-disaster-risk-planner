




const SummaryCards = ({ villages }) => {
  const totalVillages = villages.length;

  const criticalVillages = villages.filter(
    (village) => village.riskLevel === "CRITICAL"
  ).length;

  const immediateRelocation = villages.filter(
    (village) => village.priority === "IMMEDIATE"
  ).length;

  const cards = [
    {
      title: "Total Villages",
      value: totalVillages,
    },
    {
      title: "Critical Villages",
      value: criticalVillages,
    },
    {
      title: "Immediate Relocation",
      value: immediateRelocation,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
        marginBottom: "10px",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.title}
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "8px 12px",

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            height: "48px",

            boxShadow:
              "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            {card.title}
          </span>

          <strong
            style={{
              fontSize: "20px",
              color: "#0f172a",
            }}
          >
            {card.value}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;