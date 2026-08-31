"""
SIH26191 — LLM Risk Summarizer Module (Enhanced v2)

Generates authoritative, expert-grade disaster risk diagnostics and mitigation
recommendations using Groq AI (groq/compound-mini).

Each summary provides:
  1. Specific geological/environmental hazard mechanics & vulnerability analysis
  2. Population impact and disaster history context
  3. Concrete, actionable mitigation and administrative directives
"""

import os
import json
import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "groq/compound-mini"


def generate_ai_summary(village_data: dict) -> str:
    """
    Generate an authoritative, expert-level 2-3 sentence disaster risk diagnostic
    using Groq LLM API.
    """
    name = village_data.get("village_name", village_data.get("villageName", "Unknown"))
    state = village_data.get("state", "Unknown")
    district = village_data.get("district", "Unknown")
    hazard = village_data.get("hazard_type", village_data.get("hazardType", "Natural Hazard"))
    hazard_intensity = village_data.get("hazard_intensity", village_data.get("hazardIntensity", 0.5))
    pop = village_data.get("population", 0)
    risk_level = village_data.get("risk_level", village_data.get("riskLevel", "MEDIUM"))
    dominant_factor = village_data.get("dominantFactor", "Hazard Intensity")
    disaster_hist = village_data.get("disaster_history_score", 0.3)
    source_notes = village_data.get("source_notes", "")

    # Clean source notes (take first clause)
    if "|" in str(source_notes):
        context_hint = str(source_notes).split("|")[0].strip()
    else:
        context_hint = str(source_notes)[:100].strip()

    prompt = (
        f"Generate an expert disaster risk diagnostic report (2-3 complete, flowing sentences) for {name}, {district} ({state}).\n"
        f"Settlement Data:\n"
        f"- Hazard: {hazard} (Intensity: {hazard_intensity:.2f}/1.00)\n"
        f"- Affected Population: {pop:,} residents\n"
        f"- Disaster Recurrence History Score: {disaster_hist:.2f}/1.00\n"
        f"- Overall Risk Category: {risk_level} (Main Driver: {dominant_factor})\n"
        f"- Field Context: {context_hint}\n\n"
        f"Instructions:\n"
        f"1. Clearly explain WHY this settlement is at risk, highlighting the specific hazard mechanism (e.g. slope instability, coastal erosion, mining fire/subsidence).\n"
        f"2. Reference how the population scale ({pop:,} people) and past disaster exposure amplify this vulnerability.\n"
        f"3. Provide a crisp, decisive disaster management recommendation (evacuation priority, engineering reinforcement, or monitoring).\n"
        f"Output ONLY the 2-3 sentence diagnostic paragraph without headers, greetings, or bullet points."
    )

    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a Chief Disaster Management & Geospatial Risk Assessment Officer. Write highly articulate, professional, and convincing risk evaluations that explain the technical causes and urgency clearly."
                },
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 160,
            "temperature": 0.35
        }
        res = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=6)
        if res.status_code == 200:
            content = res.json()["choices"][0]["message"]["content"].strip()
            if content and len(content) > 30:
                # Remove quotes if wrapped
                if content.startswith('"') and content.endswith('"'):
                    content = content[1:-1]
                return content
    except Exception:
        pass

    # High-quality deterministic fallback
    return (
        f"{name} in {district}, {state} exhibits a {risk_level} vulnerability profile primarily driven by {dominant_factor} "
        f"and severe exposure to {hazard} (intensity: {hazard_intensity}). With a resident population of {pop:,} "
        f"and recurring disaster history score of {disaster_hist}, immediate site stabilization and priority evacuation "
        f"planning must be enforced by district disaster management authorities."
    )


from concurrent.futures import ThreadPoolExecutor

def summarize_all_villages(habs: pd.DataFrame) -> dict[str, str]:
    """
    Generate rich AI summaries for all villages concurrently using ThreadPoolExecutor.
    """
    summaries = {}
    villages = [row.to_dict() for _, row in habs.iterrows()]

    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(generate_ai_summary, villages))

    for v, summary in zip(villages, results):
        summaries[v["village_id"]] = summary

    return summaries


if __name__ == "__main__":
    df = pd.read_csv("habitations_FINAL_checked.csv")
    
    print("=" * 75)
    print("TESTING ENHANCED AI RISK REASONING (Groq)")
    print("=" * 75)
    
    for idx in [0, 4, 22]:  # Guwahati, Haflong, Kuttanad
        v = df.iloc[idx].to_dict()
        v["risk_level"] = "CRITICAL" if idx == 0 else "HIGH"
        v["dominantFactor"] = "Hazard Intensity"
        
        print(f"\n📍 Village: {v['village_name']} ({v['district']}, {v['state']})")
        print(f"Hazard: {v['hazard_type']} | Pop: {v['population']}")
        print("🧠 AI Reasoning:")
        print(generate_ai_summary(v))
        print("-" * 75)
