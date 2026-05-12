# Script completo para limpiar entorno y deployar a Render
# Ejecutar: .\deploy_clean.ps1

$projectPath = "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro"
$repoUrl = "https://github.com/leadgenproMC/leadgenpro-backend.git"

Write-Host "=== LIMPIANDO ENTORNO ===" -ForegroundColor Cyan

Set-Location $projectPath

# 1. LIMPIAR
Write-Host "`n1. Limpiando archivos innecesarios..." -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "   - Borrando .git/" -ForegroundColor Gray
    Remove-Item -Recurse -Force .git
}

$folders = @("frontend/node_modules", "frontend/.next", "backend/__pycache__", ".venv", "venv")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
        Write-Host "   - Borrado: $folder" -ForegroundColor Gray
    }
}

Get-ChildItem -Filter "*.zip" -ErrorAction SilentlyContinue | Remove-Item -Force

# 2. .GITIGNORE
Write-Host "`n2. Creando .gitignore..." -ForegroundColor Yellow
@"
node_modules/
venv/
.venv/
__pycache__/
*.pyc
.next/
.env
.env.local
.vscode/
.idea/
.DS_Store
*.log
*.zip
backup/
.windsurf/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8 -Force

# 3. GIT INIT
Write-Host "`n3. Inicializando git..." -ForegroundColor Yellow
git init
git remote add origin $repoUrl
git config user.email "michell.mc28@gmail.com"
git config user.name "MichellCaro"

# 4. AGREGAR ARCHIVOS
Write-Host "`n4. Agregando archivos esenciales..." -ForegroundColor Yellow
git add .gitignore
git add Dockerfile requirements.txt railway.toml render.yaml test_basic.py
git add backend/.dockerignore backend/Dockerfile backend/requirements.txt
git add backend/app/

# 5. COMMIT Y PUSH
Write-Host "`n5. Haciendo commit y push..." -ForegroundColor Yellow
git commit -m "LeadGenPro backend - clean deploy"
git branch -M main

Write-Host "`n6. Subiendo a GitHub..." -ForegroundColor Green
try {
    git push -u origin main --force
    Write-Host "`n✅ SUCCESS! Repositorio actualizado" -ForegroundColor Green
    Write-Host "URL: $repoUrl" -ForegroundColor Cyan
    Write-Host "`nAhora ve a Render y conecta el repositorio" -ForegroundColor Yellow
} catch {
    Write-Host "`n❌ Error en push. Intenta manualmente:" -ForegroundColor Red
    Write-Host "git push -u origin main --force" -ForegroundColor Cyan
}
