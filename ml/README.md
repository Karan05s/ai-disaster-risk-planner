# SIH26191 — ML Service (v2)

Machine Learning, Geospatial Optimization & AI Risk Reasoning module for the **AI Disaster Risk Assessment & Relocation Planning System**.

## Features
1. **Explainable Risk Scoring (XAI)**: Multi-factor risk breakdown (Hazard Intensity 50%, Population Density 30%, Disaster History 20%) with dominant factor analysis and plain English rationale.
2. **Hungarian Algorithm Optimization**: Global optimal settlement-to-relocation site assignment minimizing distance and avoiding cross-state/capacity overflows (`scipy.optimize.linear_sum_assignment`).
3. **IsolationForest Anomaly Detection**: Unsupervised detection of outlier habitations requiring manual field inspection.
4. **Groq AI Risk Diagnostics**: Automated 2-3 sentence executive reasoning generated via Groq LLM.
5. **Spring Boot Auto-Sync Bridge**: Authenticated JWT push endpoint (`POST /api/push-to-backend`) to persist scores and prioritizations directly into PostgreSQL.

## Setup & Running

```bash
# 1. Navigate to ML directory
cd ml

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env from template
cp .env.example .env
# Edit .env and put your GROQ_API_KEY

# 5. Start the ML service
uvicorn final_api_v2:app --reload --port 8001
```

## API Documentation
Once running, open interactive Swagger docs at:
- **Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

## Key Endpoints
- `GET /api/risk-scores` — Get all scored habitations + explainability + AI summaries
- `GET /api/prioritization` — Get optimal relocation site allocations
- `GET /api/anomalies` — Get flagged anomalous habitations
- `GET /api/backend-status` — Check Spring Boot connection & auth status
- `POST /api/push-to-backend` — Sync ML data into Spring Boot backend & Postgres DB
