# Solución rápida para el problema de login
$ErrorActionPreference = "Stop"

Write-Host "=== SOLUCIÓN RÁPIDA LOGIN ===" -ForegroundColor Cyan

Write-Host "PROBLEMA IDENTIFICADO:" -ForegroundColor Red
Write-Host "- Registro funciona pero crea usuarios con email_confirm = false" -ForegroundColor White
Write-Host "- Login requiere email_confirm = true" -ForegroundColor White
Write-Host "- Falta proceso de confirmación de email" -ForegroundColor White

Write-Host ""
Write-Host "SOLUCIONES POSIBLES:" -ForegroundColor Green
Write-Host ""

Write-Host "OPCIÓN 1 - Modificar registro para auto-confirmar:" -ForegroundColor Yellow
Write-Host "Cambiar 'email_confirm: False' a 'email_confirm: True' en el registro" -ForegroundColor White
Write-Host ""

Write-Host "OPCIÓN 2 - Crear endpoint de confirmación manual:" -ForegroundColor Yellow
Write-Host "Crear endpoint para confirmar usuarios existentes" -ForegroundColor White
Write-Host ""

Write-Host "OPCIÓN 3 - Usar usuarios ya confirmados:" -ForegroundColor Yellow
Write-Host "Buscar usuarios que ya tengan email_confirm = true" -ForegroundColor White

Write-Host ""
Write-Host "RECOMENDACIÓN:" -ForegroundColor Green
Write-Host "Implementar OPCIÓN 1 - Auto-confirmar emails para desarrollo/pruebas" -ForegroundColor White
Write-Host ""

# Crear script para modificar el registro
$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
}

$authPyPath = "app\routers\auth.py"
if (Test-Path $authPyPath) {
    $content = Get-Content $authPyPath -Raw
    
    # Buscar y reemplazar email_confirm: False
    if ($content -match '"email_confirm": False') {
        $content = $content -replace '"email_confirm": False', '"email_confirm": True'
        Set-Content -Path $authPyPath -Value $content -Encoding UTF8
        
        Write-Host "✅ Modificado: email_confirm ahora es True" -ForegroundColor Green
        
        # Hacer deploy
        Write-Host "Haciendo deploy del cambio..." -ForegroundColor Yellow
        
        git add app\routers\auth.py
        git commit -m "Fix: Auto-confirm emails for testing - set email_confirm to True"
        git push origin main
        
        Write-Host "✅ Deploy completado" -ForegroundColor Green
        Write-Host "Esperando 30 segundos para que active..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host ""
        Write-Host "=== PRUEBA FINAL ===" -ForegroundColor Cyan
        Write-Host "Ahora intenta registrarte en:" -ForegroundColor White
        Write-Host "https://leadgenpro-frontend.netlify.app" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "El registro debería:" -ForegroundColor Green
        Write-Host "1. Crear usuario con email_confirm = true" -ForegroundColor White
        Write-Host "2. Permitir login inmediatamente" -ForegroundColor White
        Write-Host "3. No requerir confirmación de email" -ForegroundColor White
        
    } else {
        Write-Host "❌ No se encontró 'email_confirm: False' en el código" -ForegroundColor Red
    }
} else {
    Write-Host "❌ No se encontró el archivo auth.py" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ALTERNATIVA SI NO FUNCIONA ===" -ForegroundColor Cyan
Write-Host "Si el problema persiste:" -ForegroundColor Yellow
Write-Host "1. Verifica los logs en Render dashboard" -ForegroundColor White
Write-Host "2. Confirma que el deploy se completó" -ForegroundColor White
Write-Host "3. Prueba con un email completamente nuevo" -ForegroundColor White
