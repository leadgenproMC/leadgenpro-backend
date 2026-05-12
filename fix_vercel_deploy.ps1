# Script para diagnosticar y arreglar deploy de Vercel
$ErrorActionPreference = "Stop"

Write-Host "=== DIAGNOSTICO VERCEL DEPLOY ===" -ForegroundColor Cyan

# 1. Verificar estado local
Write-Host "`n1. Verificando estado local..." -ForegroundColor Yellow
cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

$localCommit = git rev-parse --short HEAD
Write-Host "   Commit local: $localCommit" -ForegroundColor Gray

$lastCommitMsg = git log -1 --pretty=%B
Write-Host "   Mensaje: $lastCommitMsg" -ForegroundColor Gray

# 2. Verificar conexion con GitHub
Write-Host "`n2. Verificando conexion con GitHub..." -ForegroundColor Yellow
git fetch origin main 2>$null

$remoteCommit = git rev-parse --short origin/main
Write-Host "   Commit en GitHub: $remoteCommit" -ForegroundColor Gray

# 3. Comparar commits
Write-Host "`n3. Comparando commits..." -ForegroundColor Yellow
if ($localCommit -eq $remoteCommit) {
    Write-Host "   ✅ Local y remoto estan sincronizados" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Desincronizado! Local: $localCommit, Remoto: $remoteCommit" -ForegroundColor Red
    Write-Host "   Subiendo cambios..." -ForegroundColor Yellow
    git push origin main --force
    Write-Host "   ✅ Cambios subidos" -ForegroundColor Green
}

# 4. Verificar ultimos commits en GitHub
Write-Host "`n4. Ultimos commits en GitHub:" -ForegroundColor Yellow
git log origin/main --oneline -5 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }

# 5. Instrucciones para Vercel
Write-Host "`n=== INSTRUCCIONES PARA VERCEL ===" -ForegroundColor Cyan
Write-Host "`n1. Ve a: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Selecciona el proyecto 'Leadgenpro-app'" -ForegroundColor White
Write-Host "3. Ve a 'Deployments'" -ForegroundColor White
Write-Host "4. Click 'Redeploy' en el commit: $remoteCommit" -ForegroundColor White
Write-Host "5. IMPORTANTE: Desmarca 'Use existing Build Cache'" -ForegroundColor Yellow
Write-Host "6. Click 'Redeploy'" -ForegroundColor White

Write-Host "`nURL del repo: https://github.com/leadgenproMC/Leadgenpro-app" -ForegroundColor Cyan
Write-Host "Commit actual: $remoteCommit" -ForegroundColor Cyan

Write-Host "`nPresiona Enter para abrir Vercel..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir navegador
Start-Process "https://vercel.com/dashboard"
