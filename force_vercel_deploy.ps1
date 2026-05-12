# Forzar deploy correcto en Vercel
$ErrorActionPreference = "Stop"

Write-Host "=== DIAGNOSTICO Y FUERZA DEPLOY ===" -ForegroundColor Cyan

cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

# 1. Verificar estado
Write-Host "`n1. Estado Git local:" -ForegroundColor Yellow
git status
$localCommit = git rev-parse HEAD
Write-Host "Local HEAD: $localCommit" -ForegroundColor Green

# 2. Verificar remoto
Write-Host "`n2. Verificando remoto..." -ForegroundColor Yellow
git remote -v

# 3. Hacer fetch
Write-Host "`n3. Fetch desde origin..." -ForegroundColor Yellow
git fetch origin

# 4. Ver commits
Write-Host "`n4. Commits:" -ForegroundColor Yellow
Write-Host "Local:"
git log --oneline -3
Write-Host "`nOrigin/main:"
git log origin/main --oneline -3

# 5. Verificar package.json
Write-Host "`n5. Verificando package.json..." -ForegroundColor Yellow
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
Write-Host "   Name: $($pkg.name)"
if ($pkg.dependencies.next) {
    Write-Host "   ✅ Next.js version: $($pkg.dependencies.next)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Next.js NO encontrado" -ForegroundColor Red
}

# 6. Forzar push si hay diferencias
$diff = git diff origin/main --name-only
if ($diff -or ($localCommit -ne (git rev-parse origin/main))) {
    Write-Host "`n6. Hay diferencias con origin/main - Forzando push..." -ForegroundColor Yellow
    git push origin main --force
    Write-Host "   ✅ Push forzado" -ForegroundColor Green
} else {
    Write-Host "`n6. Todo sincronizado con origin/main" -ForegroundColor Green
}

# 7. Hacer un nuevo commit para trigger
Write-Host "`n7. Creando nuevo commit trigger..." -ForegroundColor Yellow
$triggerContent = "trigger-$(Get-Random)"
Write-Host "$triggerContent" | Out-File .trigger -Encoding ASCII
git add .trigger
git commit -m "Force Vercel trigger: $triggerContent"
$forceCommit = git rev-parse --short HEAD
Write-Host "   ✅ Nuevo commit: $forceCommit" -ForegroundColor Green

# 8. Push final
Write-Host "`n8. Subiendo commit trigger..." -ForegroundColor Yellow
git push origin main --force

Write-Host "`n=== COMPLETADO ===" -ForegroundColor Cyan
Write-Host "Nuevo commit en GitHub: $(git rev-parse --short HEAD)" -ForegroundColor Green
Write-Host "`nVercel debería detectar este commit y hacer deploy" -ForegroundColor Yellow
Write-Host "URL Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
