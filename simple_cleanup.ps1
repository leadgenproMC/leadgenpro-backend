# Limpieza simple de usuarios de prueba
$ErrorActionPreference = "Stop"

Write-Host "=== LIMPIEZA SIMPLE DE USUARIOS ===" -ForegroundColor Cyan

$backendUrl = "https://leadgenpro-backend-7oco.onrender.com"

Write-Host "Verificando usuarios existentes..." -ForegroundColor Yellow

# Intentar eliminar el usuario de prueba que creamos
try {
    # Primero verificar si el usuario existe intentando registrarlo de nuevo
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/register" -Method POST -Body '{"email":"test@example.com","password":"123456","name":"Test User","agreed_to_terms":true}' -ContentType "application/json" -TimeoutSec 10 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "⚠️  El usuario test@example.com aun existe" -ForegroundColor Yellow
        Write-Host "ID: $($result.user.id)" -ForegroundColor White
    } else {
        if ($result.error -like "*already exists*" -or $result.error -like "*ya existe*") {
            Write-Host "✅ Usuario test@example.com ya fue eliminado o no existe" -ForegroundColor Green
        } else {
            Write-Host "Error: $($result.error)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Error verificando usuario: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== OPCIONES DE LIMPIEZA ===" -ForegroundColor Cyan
Write-Host "Opcion 1: Manual en Supabase Dashboard" -ForegroundColor Yellow
Write-Host "1. Ve a: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Tu proyecto → Authentication → Users" -ForegroundColor White
WriteHost "3. Busca y elimina usuarios de prueba" -ForegroundColor White
Write-Host ""

Write-Host "Opcion 2: Usar Swagger UI" -ForegroundColor Yellow
Write-Host "1. Ve a: https://leadgenpro-backend-7oco.onrender.com/docs" -ForegroundColor White
Write-Host "2. Busca endpoints de auth" -ForegroundColor White
Write-Host "3. Prueba endpoints disponibles" -ForegroundColor White
Write-Host ""

Write-Host "Opcion 3: Continuar sin limpiar" -ForegroundColor Green
Write-Host "1. Usa un email diferente para pruebas" -ForegroundColor White
Write-Host "2. Ejemplo: test2@example.com" -ForegroundColor White
Write-Host "3. O usa tu email real" -ForegroundColor White

Write-Host ""
Write-Host "=== RECOMENDACION ===" -ForegroundColor Green
Write-Host "Para pruebas rapidas:" -ForegroundColor Yellow
Write-Host "1. Ve a: https://leadgenpro-frontend.netlify.app" -ForegroundColor Cyan
Write-Host "2. Usa un email nuevo (ej: test2@example.com)" -ForegroundColor White
Write-Host "3. Prueba el flujo completo de registro" -ForegroundColor White
Write-Host ""
Write-Host "Luego puedes limpiar manualmente en Supabase si es necesario" -ForegroundColor Gray
