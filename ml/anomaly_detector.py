"""
SIH26191 — Anomaly Detection Module

Uses sklearn.ensemble.IsolationForest to flag villages with unusual
combinations of hazard_intensity, population, and disaster_history_score.

Each flagged village gets:
  - is_anomaly: bool
  - anomaly_reason: human-readable explanation of what looks unusual

This helps data-reviewers spot potential data-entry errors or genuinely
exceptional cases that deserve manual verification.
"""

import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# -------------------------------------------------------------------------
# ANOMALY DETECTION
# -------------------------------------------------------------------------

def detect_anomalies(
    habs: pd.DataFrame,
    contamination: float = 0.1,
    random_state: int = 42
) -> list[dict]:
    """
    Run IsolationForest on village features to detect anomalous data points.

    Features used:
      - hazard_intensity (0-1 scale)
      - population (raw count, will be scaled)
      - disaster_history_score (0-1 scale)

    Parameters:
        habs: DataFrame with village data
        contamination: Expected fraction of anomalies (default 0.1 = ~10%)
        random_state: Random seed for reproducibility

    Returns:
        List of dicts, one per village:
        {
            "villageId": "VLG-001",
            "isAnomaly": true/false,
            "anomalyScore": -0.15,       # negative = more anomalous
            "anomalyReason": "unusual: high population (7878), ..."
        }
    """
    feature_cols = ["hazard_intensity", "population", "disaster_history_score"]
    X_raw = habs[feature_cols].copy()

    # Scale features so IsolationForest treats them equally
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)

    # Fit IsolationForest
    iso_forest = IsolationForest(
        contamination=contamination,
        random_state=random_state,
        n_estimators=100
    )
    predictions = iso_forest.fit_predict(X_scaled)   # -1 = anomaly, 1 = normal
    scores = iso_forest.decision_function(X_scaled)  # lower = more anomalous

    # Compute dataset statistics for explanations
    medians = X_raw.median()
    q25 = X_raw.quantile(0.25)
    q75 = X_raw.quantile(0.75)
    iqr = q75 - q25

    results = []
    for i, (_, row) in enumerate(habs.iterrows()):
        is_anomaly = bool(predictions[i] == -1)
        anomaly_score = round(float(scores[i]), 4)

        reason = ""
        if is_anomaly:
            # Build human-readable explanation of what's unusual
            unusual_parts = []

            hazard = row["hazard_intensity"]
            pop = row["population"]
            history = row["disaster_history_score"]

            # Check each feature against IQR bounds
            # Hazard intensity
            if hazard > q75["hazard_intensity"] + 0.5 * iqr["hazard_intensity"]:
                unusual_parts.append(f"high hazard intensity ({hazard})")
            elif hazard < q25["hazard_intensity"] - 0.5 * iqr["hazard_intensity"]:
                unusual_parts.append(f"low hazard intensity ({hazard})")

            # Population
            if pop > q75["population"] + 1.5 * iqr["population"]:
                unusual_parts.append(f"very high population ({int(pop)})")
            elif pop > q75["population"]:
                unusual_parts.append(f"high population ({int(pop)})")
            elif pop < q25["population"] - 0.5 * iqr["population"]:
                unusual_parts.append(f"low population ({int(pop)})")

            # Disaster history
            if history > q75["disaster_history_score"] + 0.5 * iqr["disaster_history_score"]:
                unusual_parts.append(f"high disaster history ({history})")
            elif history < q25["disaster_history_score"] - 0.5 * iqr["disaster_history_score"]:
                unusual_parts.append(f"low disaster history ({history})")

            # If no specific feature stood out via IQR, describe the unusual combination
            if not unusual_parts:
                unusual_parts.append(
                    f"unusual combination of hazard ({hazard}), "
                    f"population ({int(pop)}), history ({history})"
                )

            reason = "unusual: " + ", ".join(unusual_parts) + " — verify data"

        results.append({
            "villageId": row["village_id"],
            "isAnomaly": is_anomaly,
            "anomalyScore": anomaly_score,
            "anomalyReason": reason if is_anomaly else ""
        })

    return results


# -------------------------------------------------------------------------
# MAIN — TEST
# -------------------------------------------------------------------------

if __name__ == "__main__":
    df = pd.read_csv("habitations_FINAL_checked.csv")

    print("=" * 70)
    print("ANOMALY DETECTION — IsolationForest")
    print("=" * 70)

    results = detect_anomalies(df)

    # Print all results
    print(json.dumps(results, indent=2))

    # Summary
    anomalies = [r for r in results if r["isAnomaly"]]
    normals = [r for r in results if not r["isAnomaly"]]

    print(f"\n{'=' * 70}")
    print(f"SUMMARY: {len(anomalies)} anomalies detected out of {len(results)} villages")
    print(f"{'=' * 70}")

    if anomalies:
        print("\nFlagged villages:")
        for a in anomalies:
            village = df[df["village_id"] == a["villageId"]].iloc[0]
            print(f"  {a['villageId']} ({village['village_name'][:40]})")
            print(f"    Score: {a['anomalyScore']}, Reason: {a['anomalyReason']}")
