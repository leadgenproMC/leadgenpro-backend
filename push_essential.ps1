# Subir archivos esenciales a GitHub
$ErrorActionPreference = "Stop"

Set-Location "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro"

Write-Host "=== SUBIENDO ARCHIVOS ESENCIALES ===" -ForegroundColor Cyan

# Configurar git
git config user.email "michell.mc28@gmail.com"
git config user.name "MichellCaro"

# Agregar archivos esenciales uno por uno
Write-Host "`nAgregando archivos..." -ForegroundColor Yellow

git add requirements.txt 2>$null
git add Dockerfile 2>$null
git add railway.toml 2>$null
git add render.yaml 2>$null
git add .gitignore 2>$null
git add backend/requirements.txt 2>$null
git add backend/Dockerfile 2>$null
git add backend/.dockerignore 2>$null
git add backend/app/ 2>$null

# Verificar estado
Write-Host "`nEstado:" -ForegroundColor Cyan
git status --short

# Commit
Write-Host "`nHaciendo commit..." -ForegroundColor Yellow
git commit -m "Add essential backend files: requirements.txt, Dockerfile, backend/"

# Push con configuración para conexiones lentas
Write-Host "`nSubiendo a GitHub..." -ForegroundColor Green
git config http.postBuffer 524288000
git config http.maxRequestBuffer 100M
git config http.lowSpeedLimit 0
git config http.lowSpeedTime 999999

try {
    git push -u origin main --force
    Write-Host "`n✅ EXITO! Archivos subidos" -ForegroundColor Green
} catch {
    Write-Host "`n⚠️  Intento fallido. Reintentando..." -ForegroundColor Yellow
    git push -u origin main --force
}
