# Configurar variables de entorno en Render usando PowerShell
$ErrorActionPreference = "Stop"

Write-Host "=== CONFIGURACIÓN DE VARIABLES DE ENTORNO EN RENDER ===" -ForegroundColor Cyan

# Función para leer variables de forma segura
function Read-Variable($prompt, $isSecret = $false) {
    if ($isSecret) {
        $value = Read-Host $prompt -AsSecureString
        return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($value))
    } else {
        return Read-Host $prompt
    }
}

# Leer variables necesarias
Write-Host "Por favor, ingresa las variables de entorno de Supabase:" -ForegroundColor Yellow
Write-Host ""

$supabaseUrl = Read-Variable "SUPABASE_URL (ej: https://tu-proyecto.supabase.co)"
$supabaseKey = Read-Variable "SUPABASE_SECRET_KEY" $true
$smtpUser = Read-Variable "SMTP_USER (tu email de Gmail)"
$smtpPassword = Read-Variable "SMTP_PASSWORD (tu app password de Gmail)"
$smtpFrom = Read-Variable "SMTP_FROM (tu email de Gmail)"

# Validar que no estén vacías
if (-not $supabaseUrl -or -not $supabaseKey -or -not $smtpUser -or -not $smtpPassword -or -not $smtpFrom) {
    Write-Host "❌ Error: Todas las variables son requeridas" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== VARIABLES INGRESADAS ===" -ForegroundColor Green
Write-Host "SUPABASE_URL: $supabaseUrl" -ForegroundColor White
Write-Host "SUPABASE_KEY: ****" -ForegroundColor White
Write-Host "SMTP_USER: $smtpUser" -ForegroundColor White
Write-Host "SMTP_PASSWORD: ****" -ForegroundColor White
Write-Host "SMTP_FROM: $smtpFrom" -ForegroundColor White
Write-Host ""

# Generar comandos para Render CLI
Write-Host "=== COMANDOS PARA RENDER CLI ===" -ForegroundColor Cyan
Write-Host "Si tienes Render CLI instalado, ejecuta estos comandos:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Login en Render:" -ForegroundColor White
Write-Host "render login" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Configurar variables de entorno:" -ForegroundColor White
Write-Host "render env set SUPABASE_URL=$supabaseUrl --service leadgenpro-backend" -ForegroundColor Gray
Write-Host "render env set SUPABASE_SECRET_KEY=$supabaseKey --service leadgenpro-backend" -ForegroundColor Gray
Write-Host "render env set SMTP_HOST=smtp.gmail.com --service leadgenpro-backend" -ForegroundColor Gray
Write-Host "render env set SMTP_PORT=587 --service leadgenpro-backend" -ForegroundColor Gray
Write-Host "render env set SMTP_USER=$smtpUser --service leadgenpro-backend" -ForegroundColor Gray
Write-Host "render env set SMTP_PASSWORD=$smtpPassword --service leadgenpro-backend" -ForegroundColor Gray
Write-Host "render env set SMTP_FROM=$smtpFrom --service leadgenpro-backend" -ForegroundColor Gray
Write-Host "render env set SMTP_FROM_NAME=LeadGenPro --service leadgenpro-backend" -ForegroundColor Gray
Write-Host "render env set FRONTEND_URL=https://leadgenpro-frontend.netlify.app --service leadgenpro-backend" -ForegroundColor Gray
Write-Host "render env set CORS_ALLOW_ORIGINS=https://leadgenpro-frontend.netlify.app --service leadgenpro-backend" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Reiniciar el servicio:" -ForegroundColor White
Write-Host "render restart leadgenpro-backend" -ForegroundColor Gray
Write-Host ""

# Alternativa: Configuración manual en dashboard
Write-Host "=== ALTERNATIVA: CONFIGURACIÓN MANUAL ===" -ForegroundColor Cyan
Write-Host "1. Ve a: https://dashboard.render.com" -ForegroundColor Yellow
Write-Host "2. Busca tu servicio: leadgenpro-backend" -ForegroundColor Yellow
Write-Host "3. Ve a Environment tab" -ForegroundColor Yellow
Write-Host "4. Agrega estas variables:" -ForegroundColor Yellow
Write-Host ""

$variables = @{
    "SUPABASE_URL" = $supabaseUrl
    "SUPABASE_SECRET_KEY" = $supabaseKey
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "SMTP_USER" = $smtpUser
    "SMTP_PASSWORD" = $smtpPassword
    "SMTP_FROM" = $smtpFrom
    "SMTP_FROM_NAME" = "LeadGenPro"
    "FRONTEND_URL" = "https://leadgenpro-frontend.netlify.app"
    "CORS_ALLOW_ORIGINS" = "https://leadgenpro-frontend.netlify.app"
}

foreach ($key in $variables.Keys) {
    $value = if ($key -like "*SECRET*" -or $key -like "*PASSWORD*") { "****" } else { $variables[$key] }
    Write-Host "$key = $value" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== PRÓXIMOS PASOS ===" -ForegroundColor Cyan
Write-Host "1. Configura las variables (CLI o dashboard)" -ForegroundColor Yellow
Write-Host "2. Reinicia el servicio en Render" -ForegroundColor Yellow
Write-Host "3. Espera 2-3 minutos" -ForegroundColor Yellow
Write-Host "4. Prueba el registro: https://leadgenpro-frontend.netlify.app" -ForegroundColor Green
Write-Host ""

Write-Host "¿Quieres generar un script con los comandos de Render CLI? (S/N)" -ForegroundColor Magenta
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    $scriptPath = "render_commands.ps1"
    $scriptContent = @"
# Comandos para configurar Render
render login
render env set SUPABASE_URL=$supabaseUrl --service leadgenpro-backend
render env set SUPABASE_SECRET_KEY=$supabaseKey --service leadgenpro-backend
render env set SMTP_HOST=smtp.gmail.com --service leadgenpro-backend
render env set SMTP_PORT=587 --service leadgenpro-backend
render env set SMTP_USER=$smtpUser --service leadgenpro-backend
render env set SMTP_PASSWORD=$smtpPassword --service leadgenpro-backend
render env set SMTP_FROM=$smtpFrom --service leadgenpro-backend
render env set SMTP_FROM_NAME=LeadGenPro --service leadgenpro-backend
render env set FRONTEND_URL=https://leadgenpro-frontend.netlify.app --service leadgenpro-backend
render env set CORS_ALLOW_ORIGINS=https://leadgenpro-frontend.netlify.app --service leadgenpro-backend
render restart leadgenpro-backend
"@
    
    Set-Content -Path $scriptPath -Value $scriptContent -Encoding UTF8
    Write-Host "✅ Script generado: $scriptPath" -ForegroundColor Green
    Write-Host "Ejecuta: .\$scriptPath" -ForegroundColor Yellow
}
