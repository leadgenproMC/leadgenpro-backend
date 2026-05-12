# Subir archivos esenciales a GitHub - Version simple
Set-Location "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro"

Write-Host "=== SUBIENDO A GITHUB ===" -ForegroundColor Cyan

# Configurar git
git config user.email "michell.mc28@gmail.com"
git config user.name "MichellCaro"
git config core.autocrlf true

# Agregar archivos
Write-Host "`n1. Agregando archivos..." -ForegroundColor Yellow
cmd /c "git add requirements.txt 2>nul"
cmd /c "git add Dockerfile 2>nul"
cmd /c "git add railway.toml 2>nul"
cmd /c "git add render.yaml 2>nul"
cmd /c "git add .gitignore 2>nul"
cmd /c "git add backend/requirements.txt 2>nul"
cmd /c "git add backend/.dockerignore 2>nul"
cmd /c "git add backend/app/ 2>nul"

# Verificar estado
Write-Host "`n2. Archivos listos para subir:" -ForegroundColor Cyan
git status --short

# Commit
Write-Host "`n3. Creando commit..." -ForegroundColor Yellow
git commit -m "Add backend files: requirements.txt, Dockerfile, backend/"

# Push
Write-Host "`n4. Subiendo a GitHub..." -ForegroundColor Green
Write-Host "   Esto puede tardar unos minutos..." -ForegroundColor Gray

git push -u origin main --force

Write-Host "`n✅ Listo!" -ForegroundColor Green
