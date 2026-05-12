# Script para subir archivos necesarios a GitHub
# Ejecutar: .\upload_to_github.ps1

$projectPath = "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro"
$repoUrl = "https://github.com/MichellCaro/leadgenpro-backend.git"

Write-Host "=== Subiendo archivos a GitHub ===" -ForegroundColor Cyan
Write-Host "Repositorio: $repoUrl" -ForegroundColor Gray

# Cambiar al directorio del proyecto
Set-Location $projectPath

# Verificar estado de git
Write-Host "`nVerificando estado de git..." -ForegroundColor Yellow
git status

# Configurar remote origin (forzar actualización)
Write-Host "`nConfigurando remote origin..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $repoUrl

# Verificar remote
Write-Host "Remote configurado:" -ForegroundColor Cyan
git remote -v

# Agregar solo los archivos necesarios (no todo)
Write-Host "`nAgregando archivos esenciales..." -ForegroundColor Yellow
git add Dockerfile
git add requirements.txt
git add railway.toml
git add render.yaml
git add backend/Dockerfile
git add backend/requirements.txt
git add backend/.dockerignore
git add backend/app/

# Verificar qué se va a commitear
Write-Host "`nArchivos a subir:" -ForegroundColor Cyan
git status --short

# Hacer commit
Write-Host "`nCreando commit..." -ForegroundColor Yellow
git commit -m "Add backend files for Render deployment" --allow-empty

# Push con verbose para ver errores
Write-Host "`nSubiendo a GitHub (esto puede tomar un momento)..." -ForegroundColor Green
git push -u origin main --force --verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== ÉXITO ===" -ForegroundColor Green
    Write-Host "Archivos subidos correctamente a:" -ForegroundColor White
    Write-Host "https://github.com/MichellCaro/leadgenpro-backend" -ForegroundColor Cyan
    Write-Host "`nAhora puedes conectar Render:" -ForegroundColor Yellow
    Write-Host "https://dashboard.render.com" -ForegroundColor Cyan
} else {
    Write-Host "`n=== ERROR ===" -ForegroundColor Red
    Write-Host "El push falló. Posibles causas:" -ForegroundColor Yellow
    Write-Host "1. No has creado el repositorio en GitHub" -ForegroundColor White
    Write-Host "2. Problemas de autenticación" -ForegroundColor White
    Write-Host "3. Problemas de red/conexión" -ForegroundColor White
    Write-Host "`nCrea el repositorio primero en:" -ForegroundColor Cyan
    Write-Host "https://github.com/new" -ForegroundColor Cyan
}
