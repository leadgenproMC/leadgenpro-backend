# Push fix i18n
$ErrorActionPreference = "Stop"
cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

git add src/app/page.tsx
git commit -m "Fix i18n import path to lib/i18n"
git push origin main --force

Write-Host "Commit: $(git rev-parse --short HEAD)" -ForegroundColor Green
