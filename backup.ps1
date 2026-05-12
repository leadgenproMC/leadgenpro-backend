# Script de Backup LeadGenPro
# Guarda este archivo como: backup.ps1

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "c:\Users\Portatil\Documents\Leadgenpro_backup_$timestamp"

# Crear directorio de backup
New-Item -ItemType Directory -Path $backupDir -Force

# Copiar código fuente
Copy-Item -Path "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\backend" -Destination "$backupDir\backend" -Recurse -Force
Copy-Item -Path "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend" -Destination "$backupDir\frontend" -Recurse -Force

# Copiar configuraciones (si existen)
$envFiles = @(
    "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\backend\.env",
    "c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend\.env.local"
)
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupDir -Force
    }
}

Write-Host "✅ Backup creado en: $backupDir"
