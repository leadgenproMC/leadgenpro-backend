# Verificar backend en Render
$ErrorActionPreference = "Stop"

Write-Host "=== VERIFICANDO BACKEND EN RENDER ===" -ForegroundColor Cyan

# Posibles URLs de Render (reemplazar con la URL real)
$renderUrls = @(
    "https://leadgenpro-backend.onrender.com",
    "https://leadgenpro-backend.render.com",
    "https://api.leadgenpro.com"
)

Write-Host "Verificando posibles URLs de Render..." -ForegroundColor Yellow

foreach ($url in $renderUrls) {
    Write-Host "Probando: $url" -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri "$url/healthz" -Method GET -TimeoutSec 10
        Write-Host "✅ $url/healthz : $($response.StatusCode)" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($content.status)" -ForegroundColor White
        Write-Host "   Message: $($content.message)" -ForegroundColor White
        
        # Si funciona, verificar endpoints principales
        Write-Host "Verificando endpoints principales..." -ForegroundColor Yellow
        $endpoints = @("/docs", "/auth/register")
        foreach ($endpoint in $endpoints) {
            try {
                $resp = Invoke-WebRequest -Uri "$url$endpoint" -Method GET -TimeoutSec 5
                Write-Host "   ✅ GET $endpoint : $($resp.StatusCode)" -ForegroundColor Green
            } catch {
                Write-Host "   ❌ GET $endpoint : Error" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "❌ $url/healthz : Error" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== ACCIONES REQUERIDAS ===" -ForegroundColor Cyan
Write-Host "1. Identifica la URL correcta de tu backend en Render" -ForegroundColor Yellow
Write-Host "2. Actualiza .env.production con la URL correcta" -ForegroundColor Yellow
Write-Host "3. Actualiza .env.local para desarrollo" -ForegroundColor Yellow
Write-Host "4. Haz push de los cambios" -ForegroundColor Yellow
