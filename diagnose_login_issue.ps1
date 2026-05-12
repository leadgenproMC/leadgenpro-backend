# Diagnóstico completo del problema de login
$ErrorActionPreference = "Stop"

Write-Host "=== DIAGNÓSTICO COMPLETO LOGIN ===" -ForegroundColor Cyan

$backendUrl = "https://leadgenpro-backend-7oco.onrender.com"

Write-Host "VERIFICANDO ESTADO DEL BACKEND..." -ForegroundColor Yellow

# 1. Verificar health check
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/healthz" -Method GET -TimeoutSec 10 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Health Check: $($result.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Verificar si el cambio está activo
Write-Host ""
Write-Host "VERIFICANDO CAMBIO DE EMAIL_CONFIRM..." -ForegroundColor Yellow

# Intentar registrar un usuario simple
try {
    $body = @{
        email = "simpletest@example.com"
        password = "123456"
        name = "Simple Test"
        agreed_to_terms = $true
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Registro funciona" -ForegroundColor Green
        Write-Host "Usuario ID: $($result.user.id)" -ForegroundColor White
        
        # Probar login inmediatamente
        Write-Host ""
        Write-Host "PROBANDO LOGIN INMEDIATO..." -ForegroundColor Yellow
        
        $loginBody = @{
            email = "simpletest@example.com"
            password = "123456"
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-WebRequest -Uri "$backendUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10 -UseBasicParsing
            $loginResult = $loginResponse.Content | ConvertFrom-Json
            
            if ($loginResult.success) {
                Write-Host "🎉 LOGIN EXITOSO!" -ForegroundColor Green
                Write-Host "Usuario: $($loginResult.user.name)" -ForegroundColor White
                Write-Host "Email: $($loginResult.user.email)" -ForegroundColor White
                Write-Host ""
                Write-Host "✅ EL PROBLEMA ESTÁ RESUELTO" -ForegroundColor Green
                Write-Host "El frontend debería funcionar ahora" -ForegroundColor White
            } else {
                Write-Host "❌ Login falló: $($loginResult.error)" -ForegroundColor Red
                if ($loginResult.error -eq "EMAIL_NOT_CONFIRMED") {
                    Write-Host "⚠️  El cambio de email_confirm no está activo todavía" -ForegroundColor Yellow
                    Write-Host "El deploy puede estar tardando más" -ForegroundColor White
                }
            }
        } catch {
            Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Registro falló: $($result.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error en registro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "POSIBLES CAUSAS:" -ForegroundColor Yellow
    Write-Host "1. El deploy aún está en progreso" -ForegroundColor White
    Write-Host "2. Hay inestabilidad temporal en Render" -ForegroundColor White
    Write-Host "3. El cambio necesita más tiempo para activarse" -ForegroundColor White
}

Write-Host ""
Write-Host "=== SOLUCIONES INMEDIATAS ===" -ForegroundColor Cyan
Write-Host "OPCIÓN 1 - Esperar más tiempo:" -ForegroundColor Yellow
Write-Host "Esperar 2-3 minutos más a que complete el deploy" -ForegroundColor White
Write-Host ""

Write-Host "OPCIÓN 2 - Verificar en dashboard:" -ForegroundColor Yellow
Write-Host "1. Ve a https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Busca leadgenpro-backend" -ForegroundColor White
Write-Host "3. Verifica que el deploy esté 'Live'" -ForegroundColor White
Write-Host "4. Revisa logs si hay errores" -ForegroundColor White
Write-Host ""

Write-Host "OPCIÓN 3 - Forzar reinicio:" -ForegroundColor Yellow
Write-Host "1. En Render dashboard, haz click en 'Manual Deploy'" -ForegroundColor White
Write-Host "2. O haz un pequeño cambio y push again" -ForegroundColor White
Write-Host ""

Write-Host "OPCIÓN 4 - Prueba con usuario existente:" -ForegroundColor Yellow
Write-Host "Si tienes un usuario ya registrado, intenta login con él" -ForegroundColor White
Write-Host "Puede que ya tenga email_confirm = true" -ForegroundColor White

Write-Host ""
Write-Host "=== RECOMENDACIÓN ===" -ForegroundColor Green
Write-Host "Espera 2 minutos y prueba de nuevo en el frontend" -ForegroundColor White
Write-Host "https://leadgenpro-frontend.netlify.app" -ForegroundColor Cyan
