# Solución simple para el problema de email_confirm
$ErrorActionPreference = "Stop"

Write-Host "=== SOLUCIÓN SIMPLE EMAIL_CONFIRM ===" -ForegroundColor Cyan

$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
}

$authPyPath = "app\routers\auth.py"
if (Test-Path $authPyPath) {
    $content = Get-Content $authPyPath -Raw
    
    # Buscar la línea donde se inserta en tabla users y cambiar email_confirmed: False a True
    if ($content -match '"email_confirmed": False') {
        $content = $content -replace '"email_confirmed": False', '"email_confirmed": True'
        Set-Content -Path $authPyPath -Value $content -Encoding UTF8
        Write-Host "✅ Cambiado email_confirmed: False -> True en tabla users" -ForegroundColor Green
        
        # Hacer deploy
        Write-Host "Haciendo deploy del cambio..." -ForegroundColor Yellow
        
        git add app\routers\auth.py
        git commit -m "Fix: Set email_confirmed=True in users table for immediate login"
        git push origin main
        
        Write-Host "✅ Deploy completado" -ForegroundColor Green
        Write-Host "Esperando 45 segundos para que active..." -ForegroundColor Yellow
        Start-Sleep -Seconds 45
        
        Write-Host ""
        Write-Host "=== PRUEBA FINAL ===" -ForegroundColor Cyan
        Write-Host "Ahora el login debería funcionar inmediatamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Prueba en:" -ForegroundColor White
        Write-Host "https://leadgenpro-frontend.netlify.app" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usa email nuevo:" -ForegroundColor Yellow
        $newTimestamp = Get-Date -Format "yyyyMMddHHmmss"
        Write-Host "Email: test$newTimestamp@test.com" -ForegroundColor White
        Write-Host "Contraseña: 123456" -ForegroundColor White
        Write-Host ""
        Write-Host "Flujo esperado:" -ForegroundColor Green
        Write-Host "1. Registro: Crea usuario con email_confirmed = True" -ForegroundColor White
        Write-Host "2. Login: Verifica email_confirmed = True y permite acceso" -ForegroundColor White
        Write-Host "3. Acceso: Inmediato sin confirmación de email" -ForegroundColor White
        
    } else {
        Write-Host "❌ No se encontró 'email_confirmed: False' en el código" -ForegroundColor Red
        Write-Host "Buscando configuración actual..." -ForegroundColor Yellow
        
        # Mostrar las líneas relevantes
        $lines = Get-Content $authPyPath
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "email_confirmed") {
                Write-Host "Línea $($i+1): $($lines[$i])" -ForegroundColor White
            }
        }
    }
    
} else {
    Write-Host "❌ No se encontró auth.py" -ForegroundColor Red
}
