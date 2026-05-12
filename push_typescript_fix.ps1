# Push fix TypeScript
$ErrorActionPreference = "Stop"
cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

git add src/app/[locale]/lead-finder/page.tsx
git commit -m "Fix TypeScript error: generateLeads takes object not 3 args"
git push origin main --force

Write-Host "Commit: $(git rev-parse --short HEAD)" -ForegroundColor Green
