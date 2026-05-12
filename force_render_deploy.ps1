# Forzar nuevo deploy en Render para sincronizar variables
$ErrorActionPreference = "Stop"

Write-Host "=== FORZAR NUEVO DEPLOY EN RENDER ===" -ForegroundColor Cyan

Write-Host "Este script hara un cambio pequeno y forzara nuevo deploy" -ForegroundColor Yellow
Write-Host ""

# Cambiar al directorio del backend
$backendPath = "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "✅ Directorio backend encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Directorio backend no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "Haciendo cambio pequeno para forzar deploy..." -ForegroundColor Yellow

# Leer el archivo main.py
$mainPyPath = "app\main.py"
if (Test-Path $mainPyPath) {
    $content = Get-Content $mainPyPath -Raw
    
    # Agregar un comentario con timestamp para forzar cambio
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $newComment = "# Auto-deploy trigger - $timestamp"
    
    # Verificar si el comentario ya existe
    if ($content -notmatch "# Auto-deploy trigger") {
        $content = $newComment + "`n`n" + $content
        Set-Content -Path $mainPyPath -Value $content -Encoding UTF8
        Write-Host "✅ Comentario de deploy agregado" -ForegroundColor Green
    } else {
        # Actualizar timestamp existente
        $content = $content -replace "# Auto-deploy trigger - .*", $newComment
        Set-Content -Path $mainPyPath -Value $content -Encoding UTF8
        Write-Host "✅ Timestamp de deploy actualizado" -ForegroundColor Green
    }
} else {
    Write-Host "❌ app\main.py no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== COMMIT Y PUSH ===" -ForegroundColor Cyan

try {
    # Ejecutar comandos git
    git add .
    git commit -m "Auto-deploy trigger: Force environment sync - $timestamp"
    git push origin main
    
    Write-Host "✅ Git push completado" -ForegroundColor Green
    Write-Host "Esto forzara nuevo deploy en Render" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error en git push: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== SIGUIENTES PASOS ===" -ForegroundColor Cyan
Write-Host "1. Espera 3-5 minutos a que complete el deploy" -ForegroundColor Yellow
Write-Host "2. Verifica el deploy en: https://dashboard.render.com" -ForegroundColor White
Write-Host "3. Ejecuta para verificar:" -ForegroundColor White
Write-Host "curl https://leadgenpro-backend-7oco.onrender.com/auth/test-supabase" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Si funciona, prueba el registro:" -ForegroundColor Green
Write-Host "https://leadgenpro-frontend.netlify.app" -ForegroundColor White
Write-Host ""

Write-Host "=== RESULTADO ESPERADO ===" -ForegroundColor Green
Write-Host 'SUPABASE_URL: "https://..."' -ForegroundColor White
Write-Host 'SUPABASE_KEY_PRESENT: true' -ForegroundColor White
Write-Host 'supabase_client: "CONECTADO"' -ForegroundColor White
