# Script de Verificacion Ollama para Windows
# Guardar como: check_ollama.ps1

Write-Host "========================================"
Write-Host "  Verificacion de Ollama - LeadGenPro"
Write-Host "========================================"
Write-Host ""

# 1. Verificar si Ollama esta instalado
Write-Host "1. Verificando instalacion de Ollama..."
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue

if ($ollamaPath) {
    Write-Host "   OK - Ollama encontrado"
    ollama --version
} else {
    Write-Host "   ERROR - Ollama NO instalado"
    Write-Host "   Descarga desde: https://ollama.com/download"
    exit 1
}

Write-Host ""

# 2. Verificar modelos instalados
Write-Host "2. Modelos instalados:"
ollama list

Write-Host ""

# 3. Verificar servicio
Write-Host "3. Verificando servicio..."
try {
    $null = Invoke-WebRequest -Uri "http://localhost:11434" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "   OK - Servicio corriendo"
} catch {
    Write-Host "   ATENCION: Servicio no responde"
    Write-Host "   Inicia Ollama desde el menu Inicio"
}

Write-Host ""

# 4. Instrucciones
Write-Host "========================================"
Write-Host "  Para configurar LeadGenPro:"
Write-Host "========================================"
Write-Host ""
Write-Host "1. Edita backend/.env y añade:"
Write-Host "   AI_PROVIDER=ollama"
Write-Host "   OLLAMA_MODEL=llama3.2"
Write-Host ""
Write-Host "2. Descarga el modelo:"
Write-Host "   ollama pull llama3.2"
Write-Host ""
Write-Host "3. Inicia el backend:"
Write-Host "   uvicorn app.main:app --reload"
Write-Host ""
