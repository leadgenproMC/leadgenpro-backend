# Verificar todas las variables de entorno del backend
$ErrorActionPreference = "Stop"

Write-Host "=== VERIFICANDO TODAS LAS VARIABLES DE ENTORNO ===" -ForegroundColor Cyan

Write-Host "Verificando variables disponibles en el backend..." -ForegroundColor Yellow

# Crear endpoint temporal para ver todas las variables
$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
}

# Leer el auth.py
$authPyPath = "app\routers\auth.py"
if (Test-Path $authPyPath) {
    $content = Get-Content $authPyPath -Raw
    
    # Agregar endpoint para ver todas las variables de entorno
    $newEndpoint = @"

# ============ ENDPOINT PARA VER TODAS LAS VARIABLES ============

@router.get("/debug-env")
def debug_all_env():
    \"\"\"Endpoint de depuración para ver todas las variables de entorno.\"\"\"
    import os
    
    # Variables específicas que buscamos
    target_vars = [
        "SUPABASE_URL",
        "SUPABASE_SECRET_KEY", 
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASSWORD",
        "SMTP_FROM",
        "SMTP_FROM_NAME",
        "FRONTEND_URL",
        "CORS_ALLOW_ORIGINS",
        "PYTHON_VERSION"
    ]
    
    result = {
        "target_variables": {},
        "all_env_vars_count": len(os.environ),
        "sample_env_vars": {}
    }
    
    # Verificar variables específicas
    for var in target_vars:
        value = os.getenv(var)
        if value:
            # Ocultar valores sensibles
            if "SECRET" in var or "PASSWORD" in var:
                result["target_variables"][var] = f"***{len(value)} chars***"
            else:
                result["target_variables"][var] = value
        else:
            result["target_variables"][var] = "NOT_FOUND"
    
    # Mostrar algunas variables del sistema (sin sensibles)
    safe_vars = ["PATH", "HOME", "PWD", "PORT", "PYTHONPATH"]
    for var in safe_vars:
        if var in os.environ:
            result["sample_env_vars"][var] = str(os.environ[var])[:100] + "..." if len(str(os.environ[var])) > 100 else os.environ[var]
    
    return result
"@
    
    # Verificar si el endpoint ya existe
    if ($content -notmatch "debug-env") {
        # Insertar antes del último return
        $content = $content + $newEndpoint
        Set-Content -Path $authPyPath -Value $content -Encoding UTF8
        Write-Host "✅ Endpoint de depuración agregado" -ForegroundColor Green
    } else {
        Write-Host "✅ Endpoint de depuración ya existe" -ForegroundColor Green
    }
} else {
    Write-Host "❌ auth.py no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== COMMIT Y PUSH ===" -ForegroundColor Cyan

try {
    git add app\routers\auth.py
    git commit -m "Add debug endpoint to check all environment variables"
    git push origin main
    
    Write-Host "✅ Deploy con endpoint de depuración completado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en git push: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ESPERANDO DEPLOY ===" -ForegroundColor Cyan
Write-Host "Esperando 30 segundos para que complete el deploy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "=== VERIFICANDO VARIABLES ===" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "https://leadgenpro-backend-7oco.onrender.com/auth/debug-env" -Method GET -TimeoutSec 10 -UseBasicParsing
    $envData = $response.Content | ConvertFrom-Json
    
    Write-Host "=== VARIABLES ESPECIFICAS ===" -ForegroundColor Green
    foreach ($var in $envData.target_variables.PSObject.Properties) {
        $name = $var.Name
        $value = $var.Value
        
        if ($value -eq "NOT_FOUND") {
            Write-Host "❌ $name : $value" -ForegroundColor Red
        } else {
            Write-Host "✅ $name : $value" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "=== INFO DEL SISTEMA ===" -ForegroundColor Cyan
    Write-Host "Total variables de entorno: $($envData.all_env_vars_count)" -ForegroundColor White
    Write-Host "Variables de muestra:" -ForegroundColor White
    foreach ($var in $envData.sample_env_vars.PSObject.Properties) {
        Write-Host "  $($var.Name): $($var.Value)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Error verificando endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ANALISIS ===" -ForegroundColor Cyan
Write-Host "Si SUPABASE_URL y SUPABASE_SECRET_KEY aparecen como NOT_FOUND:" -ForegroundColor Red
Write-Host "1. Las variables no están configuradas en Render dashboard" -ForegroundColor White
Write-Host "2. Están en el servicio incorrecto" -ForegroundColor White
Write-Host "3. Hay un problema de sincronización" -ForegroundColor White
