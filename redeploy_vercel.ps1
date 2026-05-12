# Script PowerShell para redeployar frontend en Vercel
# NOTA: Asegurate de haber configurado NEXT_PUBLIC_API_URL en Vercel primero!

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Redeploy Vercel Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (-not (Test-Path $frontendPath)) {
    Write-Error "No se encontró la carpeta 'frontend'. Ejecuta este script desde la raíz del proyecto."
    exit 1
}

Write-Host "IMPORTANTE:" -ForegroundColor Yellow -BackgroundColor Black
Write-Host "Antes de redeployar, asegurate de haber configurado en Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "  Variable: NEXT_PUBLIC_API_URL = https://leadgenpro-backend-7oco.onrender.com" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "¿Ya configuraste la variable en Vercel? (s/n)"
if ($confirm -ne 's' -and $confirm -ne 'S') {
    Write-Host ""
    Write-Host "Configuracion necesaria en Vercel:" -ForegroundColor Red
    Write-Host "1. Ve a https://vercel.com/dashboard -> leadgenpro-app" -ForegroundColor White
    Write-Host "2. Settings -> Environment Variables" -ForegroundColor White
    Write-Host "3. Agrega: NEXT_PUBLIC_API_URL = https://leadgenpro-backend-7oco.onrender.com" -ForegroundColor White
    Write-Host "4. Guarda y vuelve a ejecutar este script" -ForegroundColor White
    exit 0
}

Write-Host ""
Write-Host "Creando trigger commit para redeploy..." -ForegroundColor Cyan

# Crear archivo trigger con timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$triggerFile = Join-Path $frontendPath ".vercel-trigger"
"Trigger deploy: $timestamp" | Out-File -FilePath $triggerFile -Encoding UTF8

Set-Location $frontendPath

Write-Host "Agregando cambios..." -ForegroundColor Gray
git add .vercel-trigger

Write-Host "Creando commit..." -ForegroundColor Gray
git commit -m "Trigger redeploy with API connection - $timestamp"

Write-Host "Haciendo push a GitHub..." -ForegroundColor Gray
git push origin main --force

$commitHash = git rev-parse --short HEAD
Write-Host ""
Write-Host "✅ Push completado!" -ForegroundColor Green
Write-Host "   Commit: $commitHash" -ForegroundColor White
Write-Host ""
Write-Host "Vercel debería estar construyendo ahora..." -ForegroundColor Cyan
Write-Host "Ve a https://vercel.com/dashboard para ver el progreso" -ForegroundColor White
Write-Host ""

# Opcional: abrir dashboard de Vercel
$openDashboard = Read-Host "¿Abrir dashboard de Vercel? (s/n)"
if ($openDashboard -eq 's' -or $openDashboard -eq 'S') {
    Start-Process "https://vercel.com/dashboard"
}

Write-Host ""
Write-Host "Para verificar la conexion despues del deploy:" -ForegroundColor Yellow
Write-Host "  1. Visita: https://leadgenpro-app.vercel.app/es/lead-finder" -ForegroundColor White
Write-Host "  2. Abre DevTools (F12) -> Network" -ForegroundColor White
Write-Host "  3. Intenta buscar leads y verifica que las peticiones van al backend" -ForegroundColor White
