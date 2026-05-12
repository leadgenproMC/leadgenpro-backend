# Instrucciones específicas para Vercel
Write-Host "=== INSTRUCCIONES ESPECIFICAS PARA VERCEL ===" -ForegroundColor Cyan

# Obtener commit actual
cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"
$commit = git rev-parse --short HEAD
$message = git log -1 --pretty=%B

Write-Host "`n📋 DATOS DEL COMMIT:" -ForegroundColor Yellow
Write-Host "   Hash: $commit" -ForegroundColor White
Write-Host "   Mensaje: $message" -ForegroundColor White

Write-Host "`n🌐 URL DE VERIFICACION:" -ForegroundColor Yellow
Write-Host "   https://github.com/leadgenproMC/Leadgenpro-app/commits/main" -ForegroundColor Cyan

Write-Host "`n📍 PASOS EN VERCEL (siguelos exactamente):" -ForegroundColor Green
Write-Host @"

1. Abre: https://vercel.com/dashboard

2. Busca el proyecto "Leadgenpro-app" y haz click

3. En la parte SUPERIOR, veras una barra con:
   - Production | Preview | ...
   - Busca el commit que dice: $commit

4. Si ves el commit $commit con circulo ROJO o AMARILLO:
   - Haz click en el commit
   - Click en "Redeploy" en la esquina superior derecha
   - DESMARCA la casilla "Use existing Build Cache"
   - Click "Redeploy"

5. Si NO ves el commit $commit (solo ves 8bc619f):
   - Haz click en el boton AZUL "Deploy"
   - Selecciona "Deploy Existing Commit..."
   - Busca y selecciona: $commit
   - DESMARCA "Use existing Build Cache"
   - Click "Deploy"

6. Espera 2-3 minutos a que termine el build

7. Verifica que dice "Ready" en verde

"@

Write-Host "`n🔧 COMANDO PARA VER COMMIT EN GITHUB:" -ForegroundColor Yellow
Write-Host "   Ejecuta esto para verificar:" -ForegroundColor Gray
Write-Host "   git log origin/main --oneline -3" -ForegroundColor Cyan

Write-Host "`nPresiona Enter para abrir Vercel..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "https://vercel.com/dashboard"
