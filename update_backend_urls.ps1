# Actualizar URLs del backend para Render
$ErrorActionPreference = "Stop"

Write-Host "=== ACTUALIZANDO URLs DEL BACKEND ===" -ForegroundColor Cyan

# Pedir la URL del backend en Render
$backendUrl = Read-Host "Ingresa la URL de tu backend en Render (ej: https://tu-app.onrender.com)"

if (-not $backendUrl) {
    Write-Host "Error: Debes ingresar una URL valida" -ForegroundColor Red
    exit 1
}

# Eliminar slash final si existe
if ($backendUrl.EndsWith("/")) {
    $backendUrl = $backendUrl.Substring(0, $backendUrl.Length - 1)
}

Write-Host "URL configurada: $backendUrl" -ForegroundColor Green

# Actualizar .env.production
$envProductionPath = "frontend\.env.production"
$envContent = @"
# Force rebuild: $(Get-Date -Format 'MM/dd/yyyy HH:mm:ss')
NEXT_PUBLIC_API_URL=$backendUrl
"@

Set-Content -Path $envProductionPath -Value $envContent -Encoding UTF8
Write-Host "✅ .env.production actualizado" -ForegroundColor Green

# Actualizar .env.local
$envLocalPath = "frontend\.env.local"
$envLocalContent = "NEXT_PUBLIC_API_URL=$backendUrl"

Set-Content -Path $envLocalPath -Value $envLocalContent -Encoding UTF8
Write-Host "✅ .env.local actualizado" -ForegroundColor Green

Write-Host ""
Write-Host "=== ARCHIVOS ACTUALIZADOS ===" -ForegroundColor Cyan
Write-Host "Frontend .env.production: $backendUrl" -ForegroundColor White
Write-Host "Frontend .env.local: $backendUrl" -ForegroundColor White
Write-Host ""
Write-Host "=== SIGUIENTES PASOS ===" -ForegroundColor Cyan
Write-Host "1. Revisa los archivos actualizados" -ForegroundColor Yellow
Write-Host "2. Haz commit de los cambios:" -ForegroundColor Yellow
Write-Host "   git add frontend/.env.production frontend/.env.local" -ForegroundColor White
Write-Host "   git commit -m 'Update backend URLs to Render'" -ForegroundColor White
Write-Host "3. Haz push:" -ForegroundColor Yellow
Write-Host "   git push" -ForegroundColor White
Write-Host "4. Espera el despliegue en Netlify" -ForegroundColor Yellow
