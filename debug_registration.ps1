# Crear endpoint de debug para registro
$ErrorActionPreference = "Stop"

Write-Host "=== DEBUG REGISTRO ===" -ForegroundColor Cyan

$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
}

$authPyPath = "app\routers\auth.py"
if (Test-Path $authPyPath) {
    $content = Get-Content $authPyPath -Raw
    
    # Agregar endpoint de debug
    $debugEndpoint = @'

# ============ ENDPOINT DEBUG REGISTRO ============

@router.post("/debug-register")
def debug_register(request: dict):
    """Endpoint para debug del proceso de registro completo."""
    import os
    import requests
    import json
    from datetime import datetime
    
    try:
        # 1. Verificar variables de entorno
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SECRET_KEY")
        
        debug_info = {
            "step": "env_check",
            "supabase_url": supabase_url[:20] + "..." if supabase_url else "NOT_SET",
            "supabase_key": "SET" if supabase_key else "NOT_SET",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if not supabase_url or not supabase_key:
            return {"success": False, "debug": debug_info, "error": "Supabase not configured"}
        
        # 2. Probar conexión básica
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        
        # 3. Probar acceso a auth users
        auth_url = f"{supabase_url}/auth/v1/admin/users"
        auth_response = requests.get(auth_url, headers=headers, timeout=10)
        
        debug_info["step"] = "auth_connection"
        debug_info["auth_status"] = auth_response.status_code
        
        if auth_response.status_code != 200:
            return {"success": False, "debug": debug_info, "error": f"Auth connection failed: {auth_response.status_code}"}
        
        # 4. Probar inserción en tabla users
        users_url = f"{supabase_url}/rest/v1/users"
        test_user = {
            "id": "00000000-0000-0000-0000-000000000000",
            "email": "debug@test.com",
            "name": "Debug User",
            "email_confirmed": True,
            "created_at": datetime.utcnow().isoformat()
        }
        
        users_response = requests.post(users_url, json=test_user, headers=headers, timeout=10)
        
        debug_info["step"] = "users_insert"
        debug_info["users_status"] = users_response.status_code
        debug_info["users_response"] = users_response.text[:200] + "..." if len(users_response.text) > 200 else users_response.text
        
        if users_response.status_code not in [201, 409]:  # 409 = duplicate (OK)
            return {"success": False, "debug": debug_info, "error": f"Users insert failed: {users_response.status_code}"}
        
        # 5. Limpiar usuario de prueba si se creó
        if users_response.status_code == 201:
            delete_response = requests.delete(f"{users_url}?id=eq.00000000-0000-0000-0000-000000000000", headers=headers, timeout=10)
            debug_info["cleanup_status"] = delete_response.status_code
        
        debug_info["step"] = "complete"
        debug_info["result"] = "All checks passed"
        
        return {"success": True, "debug": debug_info}
        
    except Exception as e:
        debug_info["step"] = "exception"
        debug_info["error"] = str(e)
        return {"success": False, "debug": debug_info, "error": f"Exception: {str(e)}"}
'@
    
    if ($content -notmatch "debug-register") {
        $content = $content + $debugEndpoint
        Set-Content -Path $authPyPath -Value $content -Encoding UTF8
        Write-Host "✅ Endpoint debug agregado" -ForegroundColor Green
        
        # Hacer deploy
        Write-Host "Haciendo deploy..." -ForegroundColor Yellow
        
        git add app\routers\auth.py
        git commit -m "Add debug endpoint for registration troubleshooting"
        git push origin main
        
        Write-Host "✅ Deploy completado" -ForegroundColor Green
        Write-Host "Esperando 45 segundos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 45
        
        Write-Host ""
        Write-Host "=== EJECUTANDO DEBUG ===" -ForegroundColor Cyan
        
        # Probar el endpoint
        try {
            $response = Invoke-WebRequest -Uri "https://leadgenpro-backend-7oco.onrender.com/auth/debug-register" -Method POST -ContentType "application/json" -TimeoutSec 20 -UseBasicParsing
            $result = $response.Content | ConvertFrom-Json
            
            Write-Host "Resultado del debug:" -ForegroundColor White
            Write-Host ($result | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
            
            if ($result.success) {
                Write-Host "✅ Todo funciona correctamente" -ForegroundColor Green
                Write-Host "El problema está en el flujo de registro normal" -ForegroundColor White
            } else {
                Write-Host "❌ Problema encontrado:" -ForegroundColor Red
                Write-Host $result.error -ForegroundColor Red
                Write-Host "Debug info:" -ForegroundColor Yellow
                Write-Host ($result.debug | ConvertTo-Json -Depth 5) -ForegroundColor White
            }
        } catch {
            Write-Host "❌ Error ejecutando debug: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "✅ Endpoint debug ya existe" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ No se encontró auth.py" -ForegroundColor Red
}
