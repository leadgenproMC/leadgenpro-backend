# Verificar estado del despliegue en Netlify
$ErrorActionPreference = "Stop"

Write-Host "=== VERIFICANDO ESTADO DE DESPLIEGUE NETLIFY ===" -ForegroundColor Cyan
Write-Host "Ultimo commit: $(git -C frontend rev-parse --short HEAD)" -ForegroundColor Green
Write-Host "Branch actual: $(git -C frontend branch --show-current)" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== ESTADO DEL REPOSITORIO ===" -ForegroundColor Cyan
git -C frontend status
Write-Host ""

Write-Host "=== COMMITS RECIENTES ===" -ForegroundColor Cyan
git -C frontend log --oneline -n 5
Write-Host ""

Write-Host "=== INFORMACION DE NETLIFY ===" -ForegroundColor Cyan
Write-Host "URL del sitio: https://leadgenpro-frontend.netlify.app" -ForegroundColor Green
Write-Host "Repo: https://github.com/leadgenproMC/Leadgenpro-Frontend" -ForegroundColor Green
Write-Host ""

Write-Host "El despliegue deberia activarse automaticamente en Netlify." -ForegroundColor Yellow
Write-Host "Puedes verificar el estado en: https://app.netlify.com/sites/leadgenpro-frontend/deploys" -ForegroundColor White
