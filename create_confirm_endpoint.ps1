# Crear endpoint para confirmar usuarios manualmente
$ErrorActionPreference = "Stop"

Write-Host "=== CREANDO ENDPOINT DE CONFIRMACIÓN ===" -ForegroundColor Cyan

$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
}

$authPyPath = "app\routers\auth.py"
if (Test-Path $authPyPath) {
    $content = Get-Content $authPyPath -Raw
    
    # Agregar endpoint para confirmar usuarios manualmente
    $confirmEndpoint = @"

# ============ ENDPOINT DE CONFIRMACIÓN MANUAL ============

@router.post("/confirm-user-manual")
def confirm_user_manual(request: dict):
    \"\"\"Endpoint para confirmar manualmente un usuario existente.\"\"\"
    import os
    import requests
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SECRET_KEY")
    
    if not supabase_url or not supabase_key:
        return {"success": False, "error": "Supabase no configurado"}
    
    email = request.get("email")
    if not email:
        return {"success": False, "error": "Email requerido"}
    
    try:
        # Buscar usuario por email
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        
        # Obtener usuario de auth
        auth_url = f"{supabase_url}/auth/v1/admin/users"
        response = requests.get(auth_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            users = response.json()
            user_found = None
            
            for user in users:
                if user.get("email") == email:
                    user_found = user
                    break
            
            if user_found:
                # Actualizar email_confirm en la tabla users
                update_url = f"{supabase_url}/rest/v1/users?id=eq.{user_found['id']}"
                update_data = {"email_confirmed": True}
                
                update_response = requests.patch(update_url, json=update_data, headers=headers, timeout=10)
                
                if update_response.status_code == 204:
                    return {
                        "success": True,
                        "message": f"Usuario {email} confirmado exitosamente",
                        "user_id": user_found['id']
                    }
                else:
                    return {"success": False, "error": f"Error actualizando: {update_response.text}"}
            else:
                return {"success": False, "error": "Usuario no encontrado"}
        else:
            return {"success": False, "error": "Error obteniendo usuarios"}
            
    except Exception as e:
        return {"success": False, "error": f"Error: {str(e)}"}
"@
    
    if ($content -notmatch "confirm-user-manual") {
        $content = $content + $confirmEndpoint
        Set-Content -Path $authPyPath -Value $content -Encoding UTF8
        Write-Host "✅ Endpoint de confirmación manual agregado" -ForegroundColor Green
        
        # Hacer deploy
        Write-Host "Haciendo deploy..." -ForegroundColor Yellow
        
        git add app\routers\auth.py
        git commit -m "Add manual user confirmation endpoint"
        git push origin main
        
        Write-Host "✅ Deploy completado" -ForegroundColor Green
        Write-Host "Esperando 30 segundos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host ""
        Write-Host "=== USANDO EL ENDPOINT ===" -ForegroundColor Cyan
        Write-Host "Ahora ejecuta:" -ForegroundColor White
        Write-Host "curl -X POST https://leadgenpro-backend-7oco.onrender.com/auth/confirm-user-manual -H \"Content-Type: application/json\" -d '{\"email\":\"test@example.com\"}'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Luego prueba el login:" -ForegroundColor White
        Write-Host "curl -X POST https://leadgenpro-backend-7oco.onrender.com/auth/login -H \"Content-Type: application/json\" -d '{\"email\":\"test@example.com\",\"password\":\"123456\"}'" -ForegroundColor Gray
        
    } else {
        Write-Host "✅ Endpoint ya existe" -ForegroundColor Green
    }
} else {
    Write-Host "❌ No se encontró auth.py" -ForegroundColor Red
}
