import json
import pandas as pd

def explain_risk_score(row: pd.Series, pop_norm: float, risk_level: str) -> dict:
    """
    Explains the risk score of a village by breaking down the contributions
    of the three input factors: Hazard Intensity, Population Density, and Disaster History.
    
    Parameters:
        row (pd.Series): A pandas Series containing the village data.
        pop_nor
        m (float): The pre-computed normalized population value (0 to 1).
        risk_level (str): The pre-computed risk level (e.g., 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW').
        
    Returns:
        dict: A dictionary breakdown of the total score, weights, contribution points,
              percentage contribution of each factor, dominant factor, and a plain English explanation.
    """
    hazard_val = float(row["hazard_intensity"])
    pop_val = float(pop_norm)
    history_val = float(row["disaster_history_score"])

    # Define weights
    w_hazard = 0.5
    w_pop = 0.3
    w_history = 0.2

    # Contribution points (rounded to 2 decimals)
    cp_hazard = round(hazard_val * w_hazard * 100, 2)
    cp_pop = round(pop_val * w_pop * 100, 2)
    cp_history = round(history_val * w_history * 100, 2)

    # Sanity check: total score equals sum of all contribution points
    total_score = round(cp_hazard + cp_pop + cp_history, 2)

    # Contribution percentages
    if total_score > 0:
        pct_hazard = round((cp_hazard / total_score) * 100, 2)
        pct_pop = round((cp_pop / total_score) * 100, 2)
        pct_history = round((cp_history / total_score) * 100, 2)
    else:
        pct_hazard = 0.0
        pct_pop = 0.0
        pct_history = 0.0

    # Build factors data
    factors = [
        {
            "factor": "Hazard Intensity",
            "rawValue": hazard_val,
            "weight": w_hazard,
            "contributionPoints": cp_hazard,
            "contributionPercent": pct_hazard
        },
        {
            "factor": "Population Density",
            "rawValue": pop_val,
            "weight": w_pop,
            "contributionPoints": cp_pop,
            "contributionPercent": pct_pop
        },
        {
            "factor": "Disaster History",
            "rawValue": history_val,
            "weight": w_history,
            "contributionPoints": cp_history,
            "contributionPercent": pct_history
        }
    ]

    # Sort factors by contributionPoints descending to find order of dominance
    sorted_factors = sorted(factors, key=lambda x: x["contributionPoints"], reverse=True)
    
    dominant_factor = sorted_factors[0]["factor"]
    dominant_percent = sorted_factors[0]["contributionPercent"]
    
    second_factor = sorted_factors[1]["factor"]
    third_factor = sorted_factors[2]["factor"]

    # Plain English explanation using risk_level, dominantFactor, and order of contribution
    plain_english = (
        f"This village's {risk_level} risk score is driven mainly by {dominant_factor} "
        f"({dominant_percent}% of the score), followed by {second_factor} and {third_factor}."
    )

    return {
        "totalScore": total_score,
        "breakdown": factors,
        "dominantFactor": dominant_factor,
        "plainEnglishExplanation": plain_english
    }

if __name__ == "__main__":
    # 1. Read habitations_FINAL_checked.csv with pandas
    df = pd.read_csv("habitations_FINAL_checked.csv")

    # 2. Computes pop_norm for all rows (population / population.max())
    max_pop = df["population"].max()
    if pd.isna(max_pop) or max_pop == 0:
        pop_norms = df["population"].fillna(0.0)
    else:
        pop_norms = df["population"] / max_pop

    # Get the first row
    first_row = df.iloc[0]
    first_pop_norm = pop_norms.iloc[0]

    # Compute risk score raw score for the first row to determine risk level
    # Formula: raw_score = (hazard_intensity * 0.5 + pop_norm * 0.3 + disaster_history_score * 0.2) * 100
    hazard = float(first_row["hazard_intensity"])
    history = float(first_row["disaster_history_score"])
    raw_score = (hazard * 0.5 + first_pop_norm * 0.3 + history * 0.2) * 100
    
    risk_level = ("CRITICAL" if raw_score >= 75 else
                  "HIGH" if raw_score >= 55 else
                  "MEDIUM" if raw_score >= 30 else "LOW")

    # 3. Runs explain_risk_score on the FIRST row as a test
    explanation = explain_risk_score(first_row, first_pop_norm, risk_level)

    # 4. Pretty-prints the result as JSON
    print(json.dumps(explanation, indent=2))
