# Configuracion simple para Render
$ErrorActionPreference = "Stop"

Write-Host "=== CONFIGURAR VARIABLES EN RENDER ===" -ForegroundColor Cyan

Write-Host "Opcion 1: Usar Render CLI" -ForegroundColor Yellow
Write-Host "Opcion 2: Configuracion manual en dashboard" -ForegroundColor Yellow
Write-Host ""

$opcion = Read-Host "Elige una opcion (1 o 2)"

if ($opcion -eq "1") {
    Write-Host ""
    Write-Host "=== INSTALAR RENDER CLI (si no lo tienes) ===" -ForegroundColor Cyan
    Write-Host "npm install -g @render/cli" -ForegroundColor Gray
    Write-Host ""
    Write-Host "=== COMANDOS PARA EJECUTAR ===" -ForegroundColor Cyan
    Write-Host "render login" -ForegroundColor White
    Write-Host "render env set SUPABASE_URL=tu_url_supabase --service leadgenpro-backend" -ForegroundColor Gray
    Write-Host "render env set SUPABASE_SECRET_KEY=tu_key_secreta --service leadgenpro-backend" -ForegroundColor Gray
    Write-Host "render env set SMTP_USER=tu_email@gmail.com --service leadgenpro-backend" -ForegroundColor Gray
    Write-Host "render env set SMTP_PASSWORD=tu_app_password --service leadgenpro-backend" -ForegroundColor Gray
    Write-Host "render env set SMTP_FROM=tu_email@gmail.com --service leadgenpro-backend" -ForegroundColor Gray
    Write-Host "render restart leadgenpro-backend" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Reemplaza los valores con tus credenciales reales" -ForegroundColor Yellow
    
} elseif ($opcion -eq "2") {
    Write-Host ""
    Write-Host "=== CONFIGURACION MANUAL EN DASHBOARD ===" -ForegroundColor Cyan
    Write-Host "1. Ve a: https://dashboard.render.com" -ForegroundColor White
    Write-Host "2. Busca: leadgenpro-backend" -ForegroundColor White
    Write-Host "3. Click en Environment tab" -ForegroundColor White
    Write-Host "4. Agrega estas variables:" -ForegroundColor White
    Write-Host ""
    
    Write-Host "VARIABLES REQUERIDAS:" -ForegroundColor Yellow
    Write-Host "SUPABASE_URL = https://tu-proyecto.supabase.co" -ForegroundColor Gray
    Write-Host "SUPABASE_SECRET_KEY = tu_key_secreta_supabase" -ForegroundColor Gray
    Write-Host "SMTP_HOST = smtp.gmail.com" -ForegroundColor Gray
    Write-Host "SMTP_PORT = 587" -ForegroundColor Gray
    Write-Host "SMTP_USER = tu_email@gmail.com" -ForegroundColor Gray
    Write-Host "SMTP_PASSWORD = tu_app_password_gmail" -ForegroundColor Gray
    Write-Host "SMTP_FROM = tu_email@gmail.com" -ForegroundColor Gray
    Write-Host "SMTP_FROM_NAME = LeadGenPro" -ForegroundColor Gray
    Write-Host "FRONTEND_URL = https://leadgenpro-frontend.netlify.app" -ForegroundColor Gray
    Write-Host "CORS_ALLOW_ORIGINS = https://leadgenpro-frontend.netlify.app" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "5. Click Save" -ForegroundColor White
    Write-Host "6. Click Restart Service" -ForegroundColor White
    
} else {
    Write-Host "Opcion no valida" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== DESPUES DE CONFIGURAR ===" -ForegroundColor Cyan
Write-Host "1. Espera 2-3 minutos a que reinicie" -ForegroundColor Yellow
Write-Host "2. Prueba el registro: https://leadgenpro-frontend.netlify.app" -ForegroundColor Green
Write-Host "3. Si hay errores, revisa los logs en Render dashboard" -ForegroundColor Yellow
