# Prueba simple de login con usuario existente
$ErrorActionPreference = "Stop"

Write-Host "=== PRUEBA SIMPLE LOGIN ===" -ForegroundColor Cyan

$backendUrl = "https://leadgenpro-backend-7oco.onrender.com"

Write-Host "Probando login con usuario existente..." -ForegroundColor Yellow

# Intentar login con el usuario que sabíamos que existe
try {
    $body = @{
        email = "test@example.com"
        password = "123456"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 15 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "🎉 LOGIN EXITOSO CON USUARIO EXISTENTE!" -ForegroundColor Green
        Write-Host "Usuario: $($result.user.name)" -ForegroundColor White
        Write-Host "Email: $($result.user.email)" -ForegroundColor White
        Write-Host ""
        Write-Host "✅ EL LOGIN FUNCIONA" -ForegroundColor Green
        Write-Host "El problema era solo con usuarios nuevos" -ForegroundColor White
        Write-Host ""
        Write-Host "SOLUCIÓN:" -ForegroundColor Yellow
        Write-Host "Usa usuarios ya registrados o espera a que complete el deploy" -ForegroundColor White
        
    } elseif ($result.error -eq "EMAIL_NOT_CONFIRMED") {
        Write-Host "❌ Login bloqueado: Email no confirmado" -ForegroundColor Red
        Write-Host "El cambio de email_confirm aún no está activo" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "SOLUCIÓN:" -ForegroundColor Yellow
        Write-Host "1. Espera 2-3 minutos más" -ForegroundColor White
        Write-Host "2. Prueba de nuevo con usuario nuevo" -ForegroundColor White
        
    } else {
        Write-Host "❌ Login falló: $($result.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RECOMENDACIÓN FINAL ===" -ForegroundColor Cyan
Write-Host "1. Si el login con test@example.com funcionó:" -ForegroundColor Green
Write-Host "   - El sistema está funcionando" -ForegroundColor White
Write-Host "   - El deploy está completado" -ForegroundColor White
Write-Host "   - Puedes usar usuarios existentes" -ForegroundColor White
Write-Host ""
Write-Host "2. Si aún falla con email_confirm:" -ForegroundColor Yellow
Write=Host "   - Espera 2 minutos más" -ForegroundColor White
Write-Host "   - Prueba registro nuevo" -ForegroundColor White
Write-Host "   - O usa usuarios ya existentes" -ForegroundColor White
