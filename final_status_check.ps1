# Verificación final del estado del sistema
$ErrorActionPreference = "Stop"

Write-Host "=== VERIFICACIÓN FINAL DEL SISTEMA ===" -ForegroundColor Cyan

$backendUrl = "https://leadgenpro-backend-7oco.onrender.com"
$frontendUrl = "https://leadgenpro-frontend.netlify.app"

Write-Host "Backend URL: $backendUrl" -ForegroundColor Green
Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Green
Write-Host ""

# Verificar backend
Write-Host "=== ESTADO BACKEND ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/healthz" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend Health: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   Status: $($content.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend Health: Error" -ForegroundColor Red
}

# Verificar endpoint de registro
Write-Host "=== ENDPOINT REGISTRO ===" -ForegroundColor Cyan
try {
    $body = @{
        email = "test@example.com"
        password = "123456"
        name = "Test User"
        agreed_to_terms = $true
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Register Endpoint: $($response.StatusCode)" -ForegroundColor Green
    $result = $response.Content | ConvertFrom-Json
    if ($result.detail -eq "Supabase no configurado") {
        Write-Host "⚠️  Supabase necesita configurarse en Render" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Registro funcionando" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Register Endpoint: Error" -ForegroundColor Red
}

# Verificar frontend
Write-Host "=== ESTADO FRONTEND ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 15
    Write-Host "✅ Frontend: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: Error" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "✅ Backend URL actualizada a Render" -ForegroundColor Green
Write-Host "✅ Frontend configurado para producción" -ForegroundColor Green
Write-Host "⚠️  Supabase necesita configurarse en Render" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para completar la configuración:" -ForegroundColor White
Write-Host "1. Configura variables SUPABASE_URL y SUPABASE_SECRET_KEY en Render" -ForegroundColor Yellow
Write-Host "2. Configura variables SMTP en Render" -ForegroundColor Yellow
Write-Host "3. Espera el despliegue de Netlify (2-3 minutos)" -ForegroundColor Yellow
