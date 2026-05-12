# Script para probar la conexión al backend
$ErrorActionPreference = "Stop"

Write-Host "=== PRUEBA DE CONEXIÓN AL BACKEND ===" -ForegroundColor Cyan

$API_URL = "https://leadgenpro-backend-7oco.onrender.com"

Write-Host "Probando conexión básica..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/healthz" -Method GET -TimeoutSec 10
    Write-Host "✅ Conexión básica: OK" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Conexión básica: ERROR" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nProbando endpoint de registro..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
        password = "123456"
        name = "Test User"
        agreed_to_terms = $true
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 15
    Write-Host "✅ Registro: OK" -ForegroundColor Green
    Write-Host "Success: $($response.success)" -ForegroundColor White
    if ($response.verification_token) {
        Write-Host "Token: $($response.verification_token.Substring(0, 10))..." -ForegroundColor White
    }
} catch {
    Write-Host "❌ Registro: ERROR" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response: $errorBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== FIN DE PRUEBA ===" -ForegroundColor Cyan
