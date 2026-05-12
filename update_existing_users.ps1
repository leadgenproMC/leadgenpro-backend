# Actualizar usuarios existentes a email_confirmed = True
$ErrorActionPreference = "Stop"

Write-Host "=== ACTUALIZANDO USUARIOS EXISTENTES ===" -ForegroundColor Cyan

Write-Host "CREANDO ENDPOINT PARA ACTUALIZAR USUARIOS..." -ForegroundColor Yellow

$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
}

$authPyPath = "app\routers\auth.py"
if (Test-Path $authPyPath) {
    $content = Get-Content $authPyPath -Raw
    
    # Agregar endpoint para actualizar usuarios existentes
    $updateEndpoint = @'

# ============ ENDPOINT PARA ACTUALIZAR USUARIOS EXISTENTES ============

@router.post("/update-all-users-confirmed")
def update_all_users_confirmed():
    """Actualiza todos los usuarios existentes a email_confirmed = True"""
    import os
    import requests
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SECRET_KEY")
    
    if not supabase_url or not supabase_key:
        return {"success": False, "error": "Supabase no configurado"}
    
    try:
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        
        # Actualizar todos los usuarios a email_confirmed = True
        update_url = f"{supabase_url}/rest/v1/users"
        update_data = {"email_confirmed": True}
        
        response = requests.patch(
            update_url,
            json=update_data,
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 204:
            return {
                "success": True,
                "message": "Todos los usuarios actualizados a email_confirmed = True"
            }
        else:
            return {
                "success": False,
                "error": f"Error actualizando: {response.text}"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Error: {str(e)}"
        }
'@
    
    if ($content -notmatch "update-all-users-confirmed") {
        $content = $content + $updateEndpoint
        Set-Content -Path $authPyPath -Value $content -Encoding UTF8
        Write-Host "✅ Endpoint de actualización agregado" -ForegroundColor Green
        
        # Hacer deploy
        Write-Host "Haciendo deploy..." -ForegroundColor Yellow
        
        git add app\routers\auth.py
        git commit -m "Add endpoint to update all users to email_confirmed = True"
        git push origin main
        
        Write-Host "✅ Deploy completado" -ForegroundColor Green
        Write-Host "Esperando 60 segundos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
        
        Write-Host ""
        Write-Host "=== EJECUTANDO ACTUALIZACIÓN ===" -ForegroundColor Cyan
        
        # Ejecutar el endpoint
        try {
            $response = Invoke-WebRequest -Uri "https://leadgenpro-backend-7oco.onrender.com/auth/update-all-users-confirmed" -Method POST -ContentType "application/json" -TimeoutSec 20 -UseBasicParsing
            $result = $response.Content | ConvertFrom-Json
            
            if ($result.success) {
                Write-Host "🎉 USUARIOS ACTUALIZADOS!" -ForegroundColor Green
                Write-Host "Mensaje: $($result.message)" -ForegroundColor White
            } else {
                Write-Host "❌ Error actualizando: $($result.error)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error ejecutando actualización: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "=== PRUEBA FINAL ===" -ForegroundColor Cyan
        Write-Host "Ahora prueba el login con usuarios existentes:" -ForegroundColor White
        Write-Host "Email: test@example.com" -ForegroundColor Yellow
        Write-Host "Contraseña: 123456" -ForegroundColor White
        Write-Host ""
        Write-Host "O crea un usuario nuevo:" -ForegroundColor White
        Write-Host "https://leadgenpro-frontend.netlify.app" -ForegroundColor Cyan
        
    } else {
        Write-Host "✅ Endpoint ya existe" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ No se encontró auth.py" -ForegroundColor Red
}
