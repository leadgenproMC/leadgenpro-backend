# Push del fix de package.json
$ErrorActionPreference = "Stop"
cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

git add package.json
git commit -m "Fix package.json JSON syntax"
git push origin main --force

Write-Host "Commit: $(git rev-parse --short HEAD)" -ForegroundColor Green
Write-Host "Fix subido a GitHub - Vercel deberia deployar" -ForegroundColor Yellow
