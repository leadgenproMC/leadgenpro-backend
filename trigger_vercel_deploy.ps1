# Forzar nuevo deploy en Vercel
$ErrorActionPreference = "Stop"

Write-Host "=== FORZANDO NUEVO DEPLOY EN VERCEL ===" -ForegroundColor Cyan

cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

# Verificar estado
Write-Host "`n1. Verificando estado..." -ForegroundColor Yellow
git status

# Agregar cambio menor (comentario en package.json)
Write-Host "`n2. Agregando cambio menor..." -ForegroundColor Yellow
$packageJson = Get-Content package.json -Raw
if ($packageJson -notmatch "vercel-deploy") {
    $newContent = $packageJson -replace '"name": "leadgenpro-frontend"', '"name": "leadgenpro-frontend",\n  "deploy": "vercel-deploy"'
    $newContent | Out-File package.json -Encoding UTF8
    Write-Host "   ✅ Cambio agregado a package.json" -ForegroundColor Green
}

# Commit y push
Write-Host "`n3. Haciendo commit..." -ForegroundColor Yellow
git add package.json
git commit -m "Trigger Vercel deploy - vercel-deploy"

Write-Host "`n4. Subiendo a GitHub..." -ForegroundColor Yellow
git push origin main --force

$commit = git rev-parse --short HEAD
Write-Host "`n✅ Nuevo commit: $commit" -ForegroundColor Green
Write-Host "`nVercel debería detectar el push y hacer deploy automáticamente" -ForegroundColor Yellow
Write-Host "Ve a: https://vercel.com/dashboard" -ForegroundColor Cyan
