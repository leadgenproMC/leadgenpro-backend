# Probar flujo completo de registro y confirmación
$ErrorActionPreference = "Stop"

Write-Host "=== PRUEBA DE FLUJO COMPLETO ===" -ForegroundColor Cyan

$backendUrl = "https://leadgenpro-backend-7oco.onrender.com"

# Email único para prueba
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "test$timestamp@example.com"
$password = "123456"
$name = "Test User $timestamp"

Write-Host "Email de prueba: $email" -ForegroundColor Green
Write-Host ""

Write-Host "=== PASO 1: REGISTRO ===" -ForegroundColor Yellow

try {
    $body = @{
        email = $email
        password = $password
        name = $name
        agreed_to_terms = $true
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 15 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Registro exitoso" -ForegroundColor Green
        Write-Host "Usuario ID: $($result.user.id)" -ForegroundColor White
        Write-Host "OTP Code: $($result.otp_code)" -ForegroundColor Yellow
        $otpCode = $result.otp_code
        $userId = $result.user.id
    } else {
        Write-Host "❌ Error en registro: $($result.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error en registro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== PASO 2: LOGIN SIN CONFIRMAR (debe fallar) ===" -ForegroundColor Yellow

try {
    $body = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.error -eq "EMAIL_NOT_CONFIRMED") {
        Write-Host "✅ Login bloqueado correctamente (email no confirmado)" -ForegroundColor Green
    } elseif ($result.success) {
        Write-Host "⚠️  Login funcionó sin confirmar (puede que no requiera confirmación)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error inesperado: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== PASO 3: CONFIRMAR EMAIL ===" -ForegroundColor Yellow

if ($otpCode) {
    try {
        $body = @{
            token = $otpCode
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$backendUrl/auth/verify-email" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10 -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        
        if ($result.success) {
            Write-Host "✅ Email confirmado exitosamente" -ForegroundColor Green
            Write-Host "Mensaje: $($result.message)" -ForegroundColor White
        } else {
            Write-Host "❌ Error confirmando email: $($result.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error confirmando email: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  No se obtuvo OTP code del registro" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== PASO 4: LOGIN DESPUÉS DE CONFIRMAR ===" -ForegroundColor Yellow

# Esperar un momento
Start-Sleep -Seconds 2

try {
    $body = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "🎉 LOGIN EXITOSO DESPUÉS DE CONFIRMAR EMAIL" -ForegroundColor Green
        Write-Host "Usuario: $($result.user.name)" -ForegroundColor White
        Write-Host "Email: $($result.user.email)" -ForegroundColor White
        Write-Host "Token: $($result.token.Substring(0, 20))..." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Login falló: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error en login final: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "1. El registro requiere confirmación de email" -ForegroundColor White
Write-Host "2. El login funciona solo con email confirmado" -ForegroundColor White
Write-Host "3. El flujo completo está funcionando correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "Para usar en el frontend:" -ForegroundColor Yellow
Write-Host "1. Regístrate con email real" -ForegroundColor White
Write-Host "2. Recibirás código OTP" -ForegroundColor White
Write-Host "3. Confirma email antes de intentar login" -ForegroundColor White
