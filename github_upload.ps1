# Script para subir a GitHub usando gh CLI
# Primero instala GitHub CLI: winget install --id GitHub.cli

$repoName = Read-Host "Nombre del nuevo repositorio (ej: leadgenpro-app)"

# Crear repositorio en GitHub
gh repo create $repoName --public --source=. --push

Write-Host "Repositorio creado y codigo subido exitosamente!" -ForegroundColor Green
Write-Host "URL: https://github.com/$env:GITHUB_USER/$repoName" -ForegroundColor Cyan
