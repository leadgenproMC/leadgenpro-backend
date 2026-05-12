# Trigger nuevo deploy
$ErrorActionPreference = "Stop"
cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

# Crear archivo trigger
$timestamp = Get-Date -Format "HHmmss"
Write-Host "trigger-$timestamp" | Out-File ".trigger-$timestamp" -Encoding UTF8

git add .
git commit -m "Trigger deploy $timestamp"
git push origin main --force

Write-Host "Nuevo commit: $(git rev-parse --short HEAD)" -ForegroundColor Green
Write-Host "Esperando que Vercel detecte..." -ForegroundColor Yellow
