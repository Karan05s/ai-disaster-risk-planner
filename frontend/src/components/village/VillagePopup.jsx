

const VillagePopup = ({ village, onViewDetails }) => {
  return (
    <div>
      <h3>{village.name}</h3>

      <p>
        <strong>Risk:</strong>{" "}
        {village.riskLevel}
      </p>

      <p>
        <strong>Population:</strong>{" "}
        {village.population}
      </p>

      <button onClick={() => onViewDetails(village)}>
        View Details
      </button>
    </div>
  );
};

export default VillagePopup;