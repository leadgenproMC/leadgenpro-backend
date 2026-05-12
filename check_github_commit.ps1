# Verificar qué commit está en GitHub
$ErrorActionPreference = "Stop"

Write-Host "=== VERIFICANDO COMMIT EN GITHUB ===" -ForegroundColor Cyan

cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

# Fetch desde origin
Write-Host "`n1. Haciendo fetch desde origin..." -ForegroundColor Yellow
git fetch origin main

# Ver commits
Write-Host "`n2. Commits en local vs remote:" -ForegroundColor Yellow
git log --oneline -5
Write-Host "`nRemote (origin/main):" -ForegroundColor Yellow
git log origin/main --oneline -5

# Verificar package.json
Write-Host "`n3. Verificando package.json..." -ForegroundColor Yellow
if (Test-Path package.json) {
    $content = Get-Content package.json -Raw
    if ($content -match '"next"') {
        Write-Host "   ✅ 'next' está en package.json" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 'next' NO está en package.json" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ No hay package.json en frontend/" -ForegroundColor Red
}

$localCommit = git rev-parse --short HEAD
Write-Host "`nLocal HEAD: $localCommit" -ForegroundColor Cyan

$remoteCommit = git rev-parse --short origin/main
Write-Host "Remote HEAD: $remoteCommit" -ForegroundColor Cyan
