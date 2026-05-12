# Guia para configurar variables en Render Dashboard
$ErrorActionPreference = "Stop"

Write-Host "=== GUIA PARA CONFIGURAR RENDER DASHBOARD ===" -ForegroundColor Cyan

Write-Host "PASO 1: Acceder al dashboard" -ForegroundColor Yellow
Write-Host "1. Abre tu navegador" -ForegroundColor White
Write-Host "2. Ve a: https://dashboard.render.com" -ForegroundColor White
Write-Host "3. Inicia sesion" -ForegroundColor White
Write-Host ""

Write-Host "PASO 2: Encontrar tu servicio" -ForegroundColor Yellow
Write-Host "1. Busca: leadgenpro-backend" -ForegroundColor White
Write-Host "2. Haz click en el servicio" -ForegroundColor White
Write-Host ""

Write-Host "PASO 3: Configurar variables" -ForegroundColor Yellow
Write-Host "1. Haz click en la pestaña 'Environment'" -ForegroundColor White
Write-Host "2. Revisa estas variables EXACTAMENTE:" -ForegroundColor White
Write-Host ""

Write-Host "=== VARIABLES REQUERIDAS ===" -ForegroundColor Red
Write-Host "SUPABASE_URL" -ForegroundColor Gray
Write-Host "- Debe ser: https://tu-proyecto.supabase.co" -ForegroundColor White
Write-Host "- Sin slash al final" -ForegroundColor White
Write-Host ""

Write-Host "SUPABASE_SECRET_KEY" -ForegroundColor Gray
Write-Host "- Tu key secreta de Supabase" -ForegroundColor White
Write-Host "- Empieza con ey..." -ForegroundColor White
Write-Host ""

Write-Host "SMTP_HOST = smtp.gmail.com" -ForegroundColor Gray
Write-Host "SMTP_PORT = 587" -ForegroundColor Gray
Write-Host "SMTP_USER = tu-email@gmail.com" -ForegroundColor Gray
Write-Host "SMTP_PASSWORD = tu-app-password" -ForegroundColor Gray
Write-Host "SMTP_FROM = tu-email@gmail.com" -ForegroundColor Gray
Write-Host "SMTP_FROM_NAME = LeadGenPro" -ForegroundColor Gray
Write-Host ""

Write-Host "PASO 4: Acciones criticas" -ForegroundColor Yellow
Write-Host "1. Verifica que NO haya errores en las variables" -ForegroundColor Red
Write-Host "2. Haz click en 'Save Changes'" -ForegroundColor White
Write-Host "3. Haz click en 'Restart Service'" -ForegroundColor White
Write-Host "4. Espera 2-3 minutos" -ForegroundColor White
Write-Host ""

Write-Host "PASO 5: Verificar" -ForegroundColor Green
Write-Host "1. Ejecuta este comando en PowerShell:" -ForegroundColor White
Write-Host "curl https://leadgenpro-backend-7oco.onrender.com/auth/test-supabase" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deberia mostrar:" -ForegroundColor White
Write-Host 'SUPABASE_URL: "https://..."' -ForegroundColor Green
Write-Host 'SUPABASE_KEY_PRESENT: true' -ForegroundColor Green
Write-Host ""

Write-Host "PASO 6: Probar registro" -ForegroundColor Green
Write-Host "1. Ve a: https://leadgenpro-frontend.netlify.app" -ForegroundColor White
Write-Host "2. Intenta crear una cuenta" -ForegroundColor White
Write-Host "3. Si funciona, listo!" -ForegroundColor Green
Write-Host ""

Write-Host "=== POSIBLES PROBLEMAS ===" -ForegroundColor Red
Write-Host "Si aun dice 'NO CONFIGURADO':" -ForegroundColor Yellow
Write-Host "- Las variables tienen espacios extra" -ForegroundColor White
Write-Host "- Hay caracteres especiales" -ForegroundColor White
Write-Host "- El servicio no reinicio completamente" -ForegroundColor White
Write-Host "- Las variables estan en el servicio equivocado" -ForegroundColor White
Write-Host ""

Write-Host "=== ALTERNATIVA: NUEVO DEPLOY ===" -ForegroundColor Cyan
Write-Host "Si nada funciona:" -ForegroundColor Yellow
Write-Host "1. Haz un cambio pequeno en backend" -ForegroundColor White
Write-Host "2. Git add, commit, push" -ForegroundColor White
Write-Host "3. Esto forzara nuevo deploy en Render" -ForegroundColor White
