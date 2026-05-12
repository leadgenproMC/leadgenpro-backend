# Script para subir proyecto a GitHub usando PowerShell
# Ejecutar: .\push_to_github.ps1

$projectPath = "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro"
$repoUrl = "https://github.com/leadgenproMC/Leadgenpro-app.git"

Write-Host "=== Subiendo proyecto a GitHub ===" -ForegroundColor Cyan

# Cambiar al directorio del proyecto
Set-Location $projectPath

# Verificar si es un repositorio git
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositorio git..." -ForegroundColor Yellow
    git init
}

# Configurar remote origin
git remote remove origin 2>$null
git remote add origin $repoUrl

# Crear .gitignore si no existe
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creando .gitignore..." -ForegroundColor Yellow
    @"
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/
env/
.venv/

# Node
node_modules/
.next/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Project
*.zip
*.tar.gz
backup/
.windsurf/

# Logs
*.log
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
}

# Agregar archivos al staging
Write-Host "Agregando archivos..." -ForegroundColor Yellow
git add .gitignore
git add Dockerfile
git add requirements.txt
git add railway.toml
git add render.yaml
git add backend/
git add frontend/ -- ':!frontend/node_modules' ':!frontend/.next'

# Verificar status
Write-Host "`nStatus del repositorio:" -ForegroundColor Cyan
git status --short

# Hacer commit
Write-Host "`nHaciendo commit..." -ForegroundColor Yellow
git commit -m "Initial commit - LeadGenPro full project structure"

# Push a GitHub
Write-Host "`nSubiendo a GitHub..." -ForegroundColor Green
git push -u origin main --force

Write-Host "`n=== Proceso completado ===" -ForegroundColor Green
Write-Host "Verifica en: $repoUrl" -ForegroundColor Cyan
