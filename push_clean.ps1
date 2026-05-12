# Push package.json limpio
$ErrorActionPreference = "Stop"
cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

git add package.json
git commit -m "Fix: remove BOM from package.json"
git push origin main --force

Write-Host "Commit: $(git rev-parse --short HEAD)" -ForegroundColor Green
