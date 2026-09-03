# Start All Services for AI Disaster Risk Planner
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting AI Disaster Risk Planner Services " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start ML Service (Port 8001)
Write-Host "[1/3] Launching ML Service (FastAPI) on port 8001..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$Root\ml'; python -m uvicorn final_api_v2:app --reload --port 8001" -WindowStyle Normal

# 2. Start Frontend App (Port 5173)
Write-Host "[2/3] Launching Frontend Dashboard on port 5173..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev" -WindowStyle Normal

# 3. Start Relocation Admin Panel (Port 5174)
Write-Host "[3/3] Launching Relocation Admin Panel on port 5174..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$Root\relocation-admin'; npx vite --port 5174" -WindowStyle Normal

Write-Host "`nAll services have been started in separate windows!" -ForegroundColor Green
Write-Host "- Frontend:         http://localhost:5173" -ForegroundColor Cyan
Write-Host "- Relocation Admin: http://localhost:5174" -ForegroundColor Cyan
Write-Host "- ML Service API:   http://localhost:8001/docs" -ForegroundColor Cyan
