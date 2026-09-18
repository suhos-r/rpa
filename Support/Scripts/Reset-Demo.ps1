$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$results = Join-Path $projectRoot 'Data\Output\results.csv'
if (Test-Path $results) { Remove-Item -LiteralPath $results -Force }
$evidence = Join-Path $projectRoot 'Evidence'
Get-ChildItem -LiteralPath $evidence -Filter '*.png' -File -ErrorAction SilentlyContinue | Remove-Item -Force
Write-Host 'AutoChaos outputs cleared.' -ForegroundColor Green
Write-Host 'Open the portal once with reset=1 to clear browser localStorage:' -ForegroundColor Cyan
Write-Host 'http://localhost:8080/Support/Portal/index.html?fault=none&reset=1'

