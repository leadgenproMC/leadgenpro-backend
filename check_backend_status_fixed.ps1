# Verificar estado del backend y frontend
$ErrorActionPreference = "Stop"

Write-Host "=== VERIFICANDO ESTADO DEL SISTEMA ===" -ForegroundColor Cyan

$backendUrl = "https://stellar-determination-production-fc74.up.railway.app"
$frontendUrl = "https://leadgenpro-frontend.netlify.app"

Write-Host "Backend URL: $backendUrl" -ForegroundColor Yellow
Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Yellow
Write-Host ""

# Verificar backend
Write-Host "=== VERIFICANDO BACKEND ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/healthz" -Method GET -TimeoutSec 10
    Write-Host "Backend Health Check: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($content.status)" -ForegroundColor White
    Write-Host "Message: $($content.message)" -ForegroundColor White
} catch {
    Write-Host "Backend Health Check: Error" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Verificar endpoints principales
Write-Host "=== VERIFICANDO ENDPOINTS PRINCIPALES ===" -ForegroundColor Cyan
$endpoints = @("/", "/docs", "/auth/register", "/auth/login")

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$backendUrl$endpoint" -Method GET -TimeoutSec 5
        Write-Host "GET $endpoint : $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "GET $endpoint : Error" -ForegroundColor Red
    }
}

Write-Host ""

# Verificar frontend
Write-Host "=== VERIFICANDO FRONTEND ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
    Write-Host "Frontend: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Frontend: Error" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== INFORMACION DE DESPLIEGUE ===" -ForegroundColor Cyan
Write-Host "Backend Railway: https://railway.app/project/" -ForegroundColor White
Write-Host "Frontend Netlify: https://app.netlify.com/sites/leadgenpro-frontend" -ForegroundColor White
Write-Host ""
Write-Host "Si el backend esta caido, verifica:" -ForegroundColor Yellow
Write-Host "1. El despliegue en Railway esta activo" -ForegroundColor White
Write-Host "2. Las variables de entorno estan configuradas" -ForegroundColor White
Write-Host "3. El build completo exitosamente" -ForegroundColor White
