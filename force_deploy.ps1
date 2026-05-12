# Forzar nuevo deploy para activar el cambio
$ErrorActionPreference = "Stop"

Write-Host "=== FORZANDO NUEVO DEPLOY ===" -ForegroundColor Cyan

$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
}

# Hacer un cambio visible para forzar deploy
$authPyPath = "app\routers\auth.py"
if (Test-Path $authPyPath) {
    $content = Get-Content $authPyPath -Raw
    
    # Agregar comentario con timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $newComment = "# Force deploy for email_confirm fix - $timestamp"
    
    if ($content -match "# Force deploy for email_confirm fix") {
        # Actualizar timestamp existente
        $content = $content -replace "# Force deploy for email_confirm fix - .*", $newComment
    } else {
        # Agregar nuevo comentario
        $content = $newComment + "`n`n" + $content
    }
    
    Set-Content -Path $authPyPath -Value $content -Encoding UTF8
    Write-Host "✅ Cambio agregado para forzar deploy" -ForegroundColor Green
    
    # Hacer deploy
    Write-Host "Iniciando deploy..." -ForegroundColor Yellow
    
    git add app\routers\auth.py
    git commit -m "Force deploy: Activate email_confirm=true fix - $timestamp"
    git push origin main
    
    Write-Host "✅ Deploy iniciado" -ForegroundColor Green
    Write-Host "Esperando 60 segundos para que complete..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    Write-Host ""
    Write-Host "=== VERIFICANDO DEPLOY ===" -ForegroundColor Cyan
    
    # Verificar health check
    try {
        $response = Invoke-WebRequest -Uri "https://leadgenpro-backend-7oco.onrender.com/healthz" -Method GET -TimeoutSec 10 -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        Write-Host "✅ Backend funcionando: $($result.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backend no responde: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "=== PRUEBA FINAL ===" -ForegroundColor Cyan
    Write-Host "Ahora prueba de nuevo en el frontend:" -ForegroundColor White
    Write-Host "https://leadgenpro-frontend.netlify.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usa email nuevo:" -ForegroundColor Yellow
    $newTimestamp = Get-Date -Format "yyyyMMddHHmmss"
    Write-Host "Email: test$newTimestamp@test.com" -ForegroundColor White
    Write-Host "Contraseña: 123456" -ForegroundColor White
    Write-Host ""
    Write-Host "El login debería funcionar ahora" -ForegroundColor Green
    
} else {
    Write-Host "❌ No se encontró auth.py" -ForegroundColor Red
}
