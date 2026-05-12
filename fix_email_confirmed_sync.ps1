# Sincronizar email_confirm con email_confirmed
$ErrorActionPreference = "Stop"

Write-Host "=== SINCRONIZANDO EMAIL_CONFIRM ===" -ForegroundColor Cyan

$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
}

$authPyPath = "app\routers\auth.py"
if (Test-Path $authPyPath) {
    $content = Get-Content $authPyPath -Raw
    
    # Buscar la sección donde se crea el usuario en la tabla users
    $pattern = '# Crear registro en tabla users.*?}(?=\n\n|\n#|\Z)'
    
    # Agregar código para crear registro en tabla users con email_confirmed = True
    $newCode = @'

        # Crear registro en tabla users con email_confirmed = True
        try:
            users_table_url = f"{supabase_url}/rest/v1/users"
            user_payload = {
                "id": user_id,
                "email": email,
                "name": user_metadata.get("name", ""),
                "email_confirmed": True,  # Importante: sincronizado con email_confirm
                "created_at": datetime.utcnow().isoformat()
            }
            
            user_response = requests.post(
                users_table_url,
                json=user_payload,
                headers=headers,
                timeout=timeout_seconds
            )
            
            if user_response.status_code == 201:
                logger.info(f"[Users Table] Registro creado exitosamente: {email}")
            else:
                logger.warning(f"[Users Table] Error creando registro: {user_response.text}")
                
        except Exception as e:
            logger.error(f"[Users Table] Error: {str(e)}")
'@
    
    # Buscar dónde insertar el nuevo código (después del registro en auth)
    if ($content -match 'return returned_id, None') {
        $insertPoint = $content.IndexOf('return returned_id, None')
        if ($insertPoint -gt -1) {
            # Insertar el nuevo código antes del return
            $beforeReturn = $content.Substring(0, $insertPoint)
            $afterReturn = $content.Substring($insertPoint)
            $newContent = $beforeReturn + $newCode + $afterReturn
            
            Set-Content -Path $authPyPath -Value $newContent -Encoding UTF8
            Write-Host "✅ Código sincronización agregado" -ForegroundColor Green
            
            # Hacer deploy
            Write-Host "Iniciando deploy..." -ForegroundColor Yellow
            
            git add app\routers\auth.py
            git commit -m "Fix: Sync email_confirm with email_confirmed in users table"
            git push origin main
            
            Write-Host "✅ Deploy completado" -ForegroundColor Green
            Write-Host "Esperando 60 segundos..." -ForegroundColor Yellow
            Start-Sleep -Seconds 60
            
            Write-Host ""
            Write-Host "=== PRUEBA FINAL ===" -ForegroundColor Cyan
            Write-Host "Ahora el login debería funcionar" -ForegroundColor Green
            Write-Host "Prueba en: https://leadgenpro-frontend.netlify.app" -ForegroundColor White
            Write-Host ""
            Write-Host "Usa email nuevo:" -ForegroundColor Yellow
            $newTimestamp = Get-Date -Format "yyyyMMddHHmmss"
            Write-Host "Email: test$newTimestamp@test.com" -ForegroundColor White
            Write-Host "Contraseña: 123456" -ForegroundColor White
            
        } else {
            Write-Host "❌ No se encontró el punto de inserción" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ No se encontró el patrón esperado" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ No se encontró auth.py" -ForegroundColor Red
}
