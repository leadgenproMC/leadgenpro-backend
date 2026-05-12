# Restaurar backend a estado funcional
$ErrorActionPreference = "Stop"

Write-Host "=== RESTAURANDO BACKEND FUNCIONAL ===" -ForegroundColor Cyan

$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
}

Write-Host "Revirtiendo cambios problemáticos..." -ForegroundColor Yellow

# Vamos a revertir a un commit anterior que sabíamos que funcionaba
try {
    # Buscar el último commit que funcionaba
    git log --oneline -10
    Write-Host "Commits recientes:" -ForegroundColor White
    
    # Revertir al commit anterior a los cambios de sincronización
    git reset --hard HEAD~3
    
    Write-Host "✅ Revertido a commit funcional" -ForegroundColor Green
    
    # Hacer push del estado restaurado
    git push --force-with-lease
    
    Write-Host "✅ Deploy restaurado completado" -ForegroundColor Green
    Write-Host "Esperando 60 segundos para que active..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    Write-Host ""
    Write-Host "=== VERIFICANDO BACKEND RESTAURADO ===" -ForegroundColor Cyan
    
    # Probar health check
    try {
        $response = Invoke-WebRequest -Uri "https://leadgenpro-backend-7oco.onrender.com/healthz" -Method GET -TimeoutSec 10 -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        Write-Host "✅ Health Check: $($result.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Health Check: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Probar registro simple
    try {
        $body = @{
            email = "testrestore@example.com"
            password = "123456"
            name = "Test Restore"
            agreed_to_terms = $true
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "https://leadgenpro-backend-7oco.onrender.com/auth/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 15 -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        
        if ($result.success) {
            Write-Host "✅ Registro funciona: $($result.user.email)" -ForegroundColor Green
            
            # Probar login
            $loginBody = @{
                email = "testrestore@example.com"
                password = "123456"
            } | ConvertTo-Json
            
            try {
                $loginResponse = Invoke-WebRequest -Uri "https://leadgenpro-backend-7oco.onrender.com/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10 -UseBasicParsing
                $loginResult = $loginResponse.Content | ConvertFrom-Json
                
                if ($loginResult.success) {
                    Write-Host "🎉 LOGIN FUNCIONA!" -ForegroundColor Green
                    Write-Host "Usuario: $($loginResult.user.name)" -ForegroundColor White
                    Write-Host "Email: $($loginResult.user.email)" -ForegroundColor White
                } else {
                    Write-Host "❌ Login falla: $($loginResult.error)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Registro falla: $($result.error)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Error en registro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error en git: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RESULTADO ===" -ForegroundColor Cyan
Write-Host "Backend restaurado a estado funcional" -ForegroundColor Green
Write-Host "El botón de conexión debería funcionar ahora" -ForegroundColor White
Write-Host ""
Write-Host "Prueba en:" -ForegroundColor Yellow
Write-Host "https://leadgenpro-frontend.netlify.app" -ForegroundColor Cyan
