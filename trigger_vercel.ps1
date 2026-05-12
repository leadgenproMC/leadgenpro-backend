# Trigger Vercel deploy
$ErrorActionPreference = "Stop"
cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

# Agregar archivo de trigger con timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
$random = Get-Random -Minimum 1000 -Maximum 9999
$filename = ".vercel-trigger-$timestamp-$random"
Write-Host "Vercel deploy trigger - $timestamp" | Out-File $filename -Encoding UTF8

git add $filename
git commit -m "Force Vercel deploy trigger - $timestamp-$random"
git push origin main --force

Write-Host "Commit: $(git rev-parse --short HEAD)" -ForegroundColor Green
Write-Host "Vercel debe detectar y deployar" -ForegroundColor Yellow
