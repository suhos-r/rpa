$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
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
    if (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) { $ready = $true; break }
    Start-Sleep -Milliseconds 500
}
if (-not $ready) {
    throw "The demo server did not start on port 8080 (PID $($server.Id))."
}
Write-Host "AutoChaos demo server started (PID $($server.Id))." -ForegroundColor Green
Write-Host 'Portal:    http://localhost:8080/Support/Portal/index.html?fault=none&reset=1' -ForegroundColor Cyan
Write-Host 'Dashboard: http://localhost:8080/Support/Dashboard/index.html' -ForegroundColor Cyan
Start-Process 'http://localhost:8080/Support/Dashboard/index.html'
