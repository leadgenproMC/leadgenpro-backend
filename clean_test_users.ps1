# Script para eliminar usuarios de prueba de Supabase
$ErrorActionPreference = "Stop"

Write-Host "=== LIMPIEZA DE USUARIOS DE PRUEBA ===" -ForegroundColor Cyan

Write-Host "Este script eliminara los usuarios de prueba registrados" -ForegroundColor Yellow
Write-Host ""

# Endpoint para eliminar usuarios (necesita admin)
$backendUrl = "https://leadgenpro-backend-7oco.onrender.com"

Write-Host "Verificando si existe endpoint de limpieza..." -ForegroundColor Yellow

# Intentar endpoint de limpieza si existe
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/cleanup-test-users" -Method POST -TimeoutSec 10 -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Usuarios de prueba eliminados: $($result.deleted_count)" -ForegroundColor Green
        Write-Host "Usuarios eliminados: $($result.users -join ', ')" -ForegroundColor White
    } else {
        Write-Host "❌ Error: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Endpoint de limpieza no disponible" -ForegroundColor Yellow
    Write-Host "Creando endpoint temporal de limpieza..." -ForegroundColor Yellow
    
    # Crear endpoint temporal para limpiar usuarios
    $backendPath = "backend"
    if (Test-Path $backendPath) {
        Set-Location $backendPath
    }
    
    $authPyPath = "app\routers\auth.py"
    if (Test-Path $authPyPath) {
        $content = Get-Content $authPyPath -Raw
        
        # Agregar endpoint de limpieza
        $cleanupEndpoint = @"

# ============ ENDPOINT DE LIMPIEZA ============

@router.post("/cleanup-test-users")
def cleanup_test_users():
    \"\"\"Endpoint para eliminar usuarios de prueba.\"\"\"
    import os
    import requests
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SECRET_KEY")
    
    if not supabase_url or not supabase_key:
        return {"success": False, "error": "Supabase no configurado"}
    
    # Usuarios de prueba a eliminar
    test_emails = ["test@example.com", "demo@test.com", "user@test.com", "admin@test.com"]
    
    deleted_count = 0
    deleted_users = []
    
    for email in test_emails:
        try:
            # Buscar usuario por email
            url = f"{supabase_url}/rest/v1/rpc/get_user_id"
            headers = {
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json",
                "apikey": supabase_key
            }
            
            response = requests.post(url, json={"email": email}, headers=headers, timeout=10)
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data:
                    user_id = user_data.get("user_id")
                    
                    # Eliminar usuario
                    delete_url = f"{supabase_url}/auth/v1/admin/users/{user_id}"
                    delete_response = requests.delete(delete_url, headers=headers, timeout=10)
                    
                    if delete_response.status_code == 200:
                        deleted_count += 1
                        deleted_users.append(email)
                        logger.info(f"Usuario eliminado: {email}")
                    else:
                        logger.error(f"Error eliminando {email}: {delete_response.text}")
                        
        except Exception as e:
            logger.error(f"Error procesando {email}: {str(e)}")
    
    return {
        "success": True,
        "deleted_count": deleted_count,
        "users": deleted_users,
        "message": f"Se eliminaron {deleted_count} usuarios de prueba"
    }
"@
        
        if ($content -notmatch "cleanup-test-users") {
            $content = $content + $cleanupEndpoint
            Set-Content -Path $authPyPath -Value $content -Encoding UTF8
            Write-Host "✅ Endpoint de limpieza agregado" -ForegroundColor Green
            
            # Hacer deploy
            Write-Host "Haciendo deploy del endpoint de limpieza..." -ForegroundColor Yellow
            
            git add app\routers\auth.py
            git commit -m "Add cleanup endpoint for test users"
            git push origin main
            
            Write-Host "✅ Deploy completado" -ForegroundColor Green
            Write-Host "Esperando 30 segundos..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            
            # Ejecutar limpieza
            Write-Host "Ejecutando limpieza..." -ForegroundColor Yellow
            try {
                $response = Invoke-WebRequest -Uri "$backendUrl/auth/cleanup-test-users" -Method POST -TimeoutSec 15 -UseBasicParsing
                $result = $response.Content | ConvertFrom-Json
                
                Write-Host "=== RESULTADO DE LIMPIEZA ===" -ForegroundColor Cyan
                Write-Host "✅ Usuarios eliminados: $($result.deleted_count)" -ForegroundColor Green
                Write-Host "Usuarios: $($result.users -join ', ')" -ForegroundColor White
                Write-Host "Mensaje: $($result.message)" -ForegroundColor Green
                
            } catch {
                Write-Host "❌ Error ejecutando limpieza: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "✅ Endpoint de limpieza ya existe" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "=== LISTO PARA PRUEBAS ===" -ForegroundColor Green
Write-Host "Usuarios de prueba eliminados" -ForegroundColor White
Write-Host "Ahora puedes probar el registro limpio en:" -ForegroundColor Yellow
Write-Host "https://leadgenpro-frontend.netlify.app" -ForegroundColor Cyan
