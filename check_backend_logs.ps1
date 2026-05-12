# Script para verificar logs del backend
$ErrorActionPreference = "Stop"

Write-Host "=== VERIFICANDO LOGS DEL BACKEND ===" -ForegroundColor Cyan

$API_URL = "https://leadgenpro-backend-7oco.onrender.com"

Write-Host "1. Probando health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/healthz" -Method GET -TimeoutSec 5
    Write-Host "✅ Health: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health: ERROR" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Probando registro con timeout extendido..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
        password = "123456"
        name = "Test User"
        agreed_to_terms = $true
    } | ConvertTo-Json
    
    Write-Host "Enviando petición..." -ForegroundColor Gray
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $response = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    
    $stopwatch.Stop()
    $time = $stopwatch.Elapsed.TotalSeconds
    
    Write-Host "✅ Registro completado en: $time segundos" -ForegroundColor Green
    Write-Host "Success: $($response.success)" -ForegroundColor White
    Write-Host "User: $($response.user.email)" -ForegroundColor White
    
    if ($response.verification_token) {
        Write-Host "Token: $($response.verification_token.Substring(0, 10))..." -ForegroundColor Green
    } else {
        Write-Host "❌ No verification_token en respuesta" -ForegroundColor Red
        Write-Host "Respuesta completa: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
    }
    
} catch {
    $stopwatch.Stop()
    $time = $stopwatch.Elapsed.TotalSeconds
    Write-Host "❌ Registro: ERROR después de $time segundos" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Response: $errorBody" -ForegroundColor Yellow
        } catch {
            Write-Host "No se pudo leer el response body" -ForegroundColor Gray
        }
    }
}

Write-Host "`n=== FIN DE VERIFICACIÓN ===" -ForegroundColor Cyan
