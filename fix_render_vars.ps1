# Script para diagnosticar y arreglar variables de Render
$ErrorActionPreference = "Stop"

Write-Host "=== DIAGNOSTICO DE VARIABLES EN RENDER ===" -ForegroundColor Cyan

Write-Host "Verificando configuracion actual del backend..." -ForegroundColor Yellow

# Verificar endpoint de diagnostico
try {
    $response = Invoke-WebRequest -Uri "https://leadgenpro-backend-7oco.onrender.com/auth/test-supabase" -Method GET -TimeoutSec 10
    $diagnostic = $response.Content | ConvertFrom-Json
    
    Write-Host "=== ESTADO ACTUAL ===" -ForegroundColor Red
    Write-Host "SUPABASE_URL: $($diagnostic.env_vars.SUPABASE_URL)" -ForegroundColor White
    Write-Host "SUPABASE_KEY_PRESENT: $($diagnostic.env_vars.SUPABASE_KEY_PRESENT)" -ForegroundColor White
    Write-Host "SUPABASE_CLIENT: $($diagnostic.supabase_client)" -ForegroundColor White
    
    if ($diagnostic.env_vars.SUPABASE_URL -eq "NO CONFIGURADO") {
        Write-Host ""
        Write-Host "❌ PROBLEMA: Variables no configuradas correctamente" -ForegroundColor Red
        Write-Host ""
        Write-Host "=== SOLUCIONES POSIBLES ===" -ForegroundColor Cyan
        Write-Host "1. Las variables no se guardaron correctamente en Render" -ForegroundColor Yellow
        Write-Host "2. El servicio necesita reiniciarse" -ForegroundColor Yellow
        Write-Host "3. Hay un problema de sincronizacion" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "=== ACCIONES INMEDIATAS ===" -ForegroundColor Cyan
        
        Write-Host "OPCION 1 - Verificar en dashboard:" -ForegroundColor Green
        Write-Host "1. Ve a https://dashboard.render.com" -ForegroundColor White
        Write-Host "2. Busca leadgenpro-backend" -ForegroundColor White
        Write-Host "3. Environment tab" -ForegroundColor White
        Write-Host "4. Verifica que SUPABASE_URL y SUPABASE_SECRET_KEY existan" -ForegroundColor White
        Write-Host "5. Haz click en 'Restart Service'" -ForegroundColor White
        Write-Host ""
        
        Write-Host "OPCION 2 - Forzar con CLI:" -ForegroundColor Green
        Write-Host "Si tienes Render CLI:" -ForegroundColor White
        Write-Host "render restart leadgenpro-backend" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "OPCION 3 - Re-deploy:" -ForegroundColor Green
        Write-Host "git push origin main" -ForegroundColor Gray
        Write-Host "Esto forzara un nuevo deploy en Render" -ForegroundColor Gray
    } else {
        Write-Host "✅ Variables configuradas correctamente" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error verificando el backend" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== PASOS SIGUIENTES ===" -ForegroundColor Cyan
Write-Host "1. Verifica las variables en dashboard de Render" -ForegroundColor Yellow
Write-Host "2. Reinicia el servicio" -ForegroundColor Yellow
Write-Host "3. Espera 2-3 minutos" -ForegroundColor Yellow
Write-Host "4. Prueba de nuevo: https://leadgenpro-frontend.netlify.app" -ForegroundColor Green
Write-Host ""
Write-Host "Si el problema persiste, puede ser necesario:" -ForegroundColor Magenta
Write-Host "- Re-deploy completo del backend" -ForegroundColor White
Write-Host "- Verificar permisos del servicio en Render" -ForegroundColor White
