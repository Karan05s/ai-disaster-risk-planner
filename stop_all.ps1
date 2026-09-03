# Stop All Services for AI Disaster Risk Planner
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Stopping AI Disaster Risk Planner Services " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$Ports = @(8001, 5173, 5174, 8080)

foreach ($Port in $Ports) {
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections.OwningProcess | Select-Object -Unique
        foreach ($p in $pids) {
            try {
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                Write-Host "Terminated process $p on port $Port" -ForegroundColor Green
            } catch {
                Write-Host "Could not terminate process $p on port $Port" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "No active process found on port $Port" -ForegroundColor DarkGray
    }
}

Write-Host "`nAll target services stopped." -ForegroundColor Green
