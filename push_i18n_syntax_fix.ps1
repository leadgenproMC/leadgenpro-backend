# Push del fix de sintaxis en i18n.ts
$ErrorActionPreference = "Stop"
cd "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend"

git add src/lib/i18n.ts
git commit -m "Fix unterminated string in i18n hero.subtitle - syntax error resolved"
git push origin master

Write-Host "Commit: $(git rev-parse --short HEAD)" -ForegroundColor Green
Write-Host "Fix de sintaxis i18n.ts subido a GitHub - Netlify deberia deployar correctamente" -ForegroundColor Yellow
