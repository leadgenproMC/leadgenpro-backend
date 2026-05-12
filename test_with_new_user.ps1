# Probar con nuevo usuario para evitar conflictos
$ErrorActionPreference = "Stop"

Write-Host "=== PRUEBA CON NUEVO USUARIO ===" -ForegroundColor Cyan

$backendUrl = "https://leadgenpro-backend-7oco.onrender.com"

# Generar email único con timestamp
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$newEmail = "test$timestamp@example.com"

Write-Host "Email de prueba: $newEmail" -ForegroundColor Green
Write-Host ""

Write-Host "Probando registro con nuevo usuario..." -ForegroundColor Yellow

try {
    $body = @{
        email = $newEmail
        password = "123456"
        name = "Test User $timestamp"
        agreed_to_terms = $true
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 15 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "=== RESULTADO DEL REGISTRO ===" -ForegroundColor Cyan
    
    if ($result.success) {
        Write-Host "✅ REGISTRO EXITOSO" -ForegroundColor Green
        Write-Host "Email: $($result.user.email)" -ForegroundColor White
        Write-Host "ID: $($result.user.id)" -ForegroundColor White
        Write-Host "Nombre: $($result.user.name)" -ForegroundColor White
        Write-Host "OTP Code: $($result.otp_code)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "✅ El backend está funcionando perfectamente" -ForegroundColor Green
        Write-Host "✅ Conexión con Supabase establecida" -ForegroundColor Green
        Write-Host "✅ Registro de usuarios funcionando" -ForegroundColor Green
    } else {
        Write-Host "❌ Error en registro: $($result.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error en la petición: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== PRUEBA EN FRONTEND ===" -ForegroundColor Cyan
Write-Host "1. Ve a: https://leadgenpro-frontend.netlify.app" -ForegroundColor Yellow
Write-Host "2. Usa este email: $newEmail" -ForegroundColor White
Write-Host "3. Contraseña: 123456" -ForegroundColor White
Write-Host "4. Nombre: Test User $timestamp" -ForegroundColor White
Write-Host "5. Completa el registro" -ForegroundColor Green
Write-Host ""
Write-Host "El registro debería funcionar sin errores de conexión" -ForegroundColor Magenta
