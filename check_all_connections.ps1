# Revisión completa de todas las conexiones del sistema
$ErrorActionPreference = "Stop"

Write-Host "=== REVISIÓN COMPLETA DE CONEXIONES ===" -ForegroundColor Cyan

# URLs del sistema
$frontendUrl = "https://leadgenpro-frontend.netlify.app"
$backendUrl = "https://leadgenpro-backend-7oco.onrender.com"

Write-Host "FRONTEND: $frontendUrl" -ForegroundColor Green
Write-Host "BACKEND: $backendUrl" -ForegroundColor Green
Write-Host ""

Write-Host "=== 1. CONEXIÓN FRONTEND → NETLIFY ===" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 15 -UseBasicParsing
    Write-Host "✅ Frontend accesible: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Status: Netlify funcionando" -ForegroundColor White
} catch {
    Write-Host "❌ Frontend no accesible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 2. CONEXIÓN BACKEND → RENDER ===" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/healthz" -Method GET -TimeoutSec 10 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Backend accesible: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Health Status: $($result.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend no accesible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 3. CONEXIÓN BACKEND → SUPABASE ===" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/test-supabase" -Method GET -TimeoutSec 15 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Endpoint de diagnóstico accesible" -ForegroundColor Green
    Write-Host "   SUPABASE_URL: $($result.env_vars.SUPABASE_URL)" -ForegroundColor White
    Write-Host "   SUPABASE_KEY_PRESENT: $($result.env_vars.SUPABASE_KEY_PRESENT)" -ForegroundColor White
    Write-Host "   SUPABASE_CLIENT: $($result.supabase_client)" -ForegroundColor White
    
    if ($result.env_vars.SUPABASE_URL -eq "NO CONFIGURADO") {
        Write-Host "❌ Variables de Supabase no configuradas" -ForegroundColor Red
    } else {
        Write-Host "✅ Variables de Supabase configuradas" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error verificando Supabase: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 4. CONEXIÓN FRONTEND → BACKEND ===" -ForegroundColor Yellow
# Verificar que el frontend tenga la URL correcta del backend
Write-Host "Verificando configuración del frontend..." -ForegroundColor White

$envProdPath = "frontend\.env.production"
if (Test-Path $envProdPath) {
    $content = Get-Content $envProdPath
    $apiUrl = $content | Where-Object { $_ -match "NEXT_PUBLIC_API_URL" }
    Write-Host "✅ .env.production encontrado" -ForegroundColor Green
    Write-Host "   API URL: $apiUrl" -ForegroundColor White
    
    if ($apiUrl -match $backendUrl) {
        Write-Host "✅ Frontend apunta al backend correcto" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend no apunta al backend correcto" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env.production no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 5. ENDPOINTS CRÍTICOS ===" -ForegroundColor Yellow

$endpoints = @(
    @{Name="Health Check"; Url="/healthz"; Method="GET"},
    @{Name="Registro"; Url="/auth/register"; Method="POST"},
    @{Name="Login"; Url="/auth/login"; Method="POST"},
    @{Name="Docs"; Url="/docs"; Method="GET"}
)

foreach ($endpoint in $endpoints) {
    try {
        if ($endpoint.Method -eq "POST") {
            # Para POST, solo verificar que el endpoint exista (esperamos error 422)
            $response = Invoke-WebRequest -Uri "$backendUrl$($endpoint.Url)" -Method POST -Body "{}" -ContentType "application/json" -TimeoutSec 5 -UseBasicParsing
            Write-Host "✅ $($endpoint.Name): $($response.StatusCode)" -ForegroundColor Green
        } else {
            $response = Invoke-WebRequest -Uri "$backendUrl$($endpoint.Url)" -Method $endpoint.Method -TimeoutSec 5 -UseBasicParsing
            Write-Host "✅ $($endpoint.Name): $($response.StatusCode)" -ForegroundColor Green
        }
    } catch {
        if ($_.Exception.Message -match "422") {
            Write-Host "✅ $($endpoint.Name): Endpoint existe (error 422 esperado)" -ForegroundColor Green
        } else {
            Write-Host "❌ $($endpoint.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== 6. CONFIGURACIÓN DE RENDER ===" -ForegroundColor Yellow
Write-Host "Verificando render.yaml..." -ForegroundColor White

$renderPath = "render.yaml"
if (Test-Path $renderPath) {
    $content = Get-Content $renderPath
    $envGroup = $content | Where-Object { $_ -match "envGroup" }
    Write-Host "✅ render.yaml encontrado" -ForegroundColor Green
    Write-Host "   Environment Group: $envGroup" -ForegroundColor White
    
    if ($envGroup -match "evg-d806khho3t8c73dg66og") {
        Write-Host "✅ Environment group correcto configurado" -ForegroundColor Green
    } else {
        Write-Host "❌ Environment group incorrecto" -ForegroundColor Red
    }
} else {
    Write-Host "❌ render.yaml no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RESUMEN DE CONEXIONES ===" -ForegroundColor Cyan
Write-Host "1. Frontend → Netlify: Acceso web" -ForegroundColor White
Write-Host "2. Backend → Render: Servicio API" -ForegroundColor White
Write-Host "3. Backend → Supabase: Base de datos y auth" -ForegroundColor White
Write-Host "4. Frontend → Backend: Llamadas API" -ForegroundColor White
Write-Host "5. Variables de entorno: Configuración" -ForegroundColor White
Write-Host ""
Write-Host "Si todas las conexiones están ✅, el problema puede estar en:" -ForegroundColor Yellow
Write-Host "- Lógica de negocio (email_confirmed sync)" -ForegroundColor White
Write-Host "- Timing de deploy" -ForegroundColor White
Write-Host "- Configuración específica de endpoints" -ForegroundColor White
