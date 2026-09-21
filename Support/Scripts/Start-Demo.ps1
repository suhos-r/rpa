$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$portalUrl = 'http://localhost:8080/Support/Portal/index.html?fault=none&reset=1'
$dashboardUrl = 'http://localhost:8080/Support/Dashboard/index.html'

function Test-DemoServer {
    try {
        $response = Invoke-WebRequest -Uri $portalUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200 -and $response.Content -match 'ACME Employee Operations'
    } catch {
        return $false
    }
}

if (Test-DemoServer) {
    Write-Host 'AutoChaos demo server is already running on port 8080.' -ForegroundColor Yellow
    Write-Host "Portal:    $portalUrl" -ForegroundColor Cyan
    Write-Host "Dashboard: $dashboardUrl" -ForegroundColor Cyan
    exit 0
}

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCommand) {
    $pythonExe = $pythonCommand.Source
} else {
    $pythonLauncher = Get-Command py -ErrorAction SilentlyContinue
    if (-not $pythonLauncher) { throw 'Python 3 was not found. Install Python or add py/python to PATH.' }
    $pythonExe = (& $pythonLauncher.Source -3 -c 'import sys; print(sys.executable)').Trim()
}
if (-not (Test-Path -LiteralPath $pythonExe)) { throw "Python interpreter was not found at '$pythonExe'." }
$server = Start-Process -FilePath $pythonExe -ArgumentList @('-m','http.server','8080','--directory',$projectRoot) -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
$ready = $false
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    if (Test-DemoServer) { $ready = $true; break }
    Start-Sleep -Milliseconds 500
}
if (-not $ready) {
    if ($server.HasExited) {
        throw "The demo server process exited before serving the portal (PID $($server.Id), exit code $($server.ExitCode)). Port 8080 may be occupied by another application."
    }
    throw "The demo server did not serve the portal on port 8080 (PID $($server.Id)). Port 8080 may be occupied by another application."
}
Write-Host "AutoChaos demo server started (PID $($server.Id))." -ForegroundColor Green
Write-Host "Portal:    $portalUrl" -ForegroundColor Cyan
Write-Host "Dashboard: $dashboardUrl" -ForegroundColor Cyan
Write-Host 'Open the dashboard URL above in Chrome when ready.' -ForegroundColor Cyan
