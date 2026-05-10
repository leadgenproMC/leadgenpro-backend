# Guía de Instalación - Bot de Ventas con IA Local

Esta guía te ayuda a configurar el bot de ventas de LeadGenPro con **IA 100% local y privada** usando Ollama.

## ¿Por qué IA Local?

✅ **Gratuito** - Sin costos por uso  
✅ **Privado** - Tus datos nunca salen de tu computadora  
✅ **Sin dependencias** - Funciona offline  
✅ **Rápido** - Respuestas instantáneas sin latencia de red  

## Paso 1: Instalar Ollama

### Windows

1. Descarga Ollama desde: https://ollama.com/download/windows
2. Ejecuta el instalador `.exe`
3. Ollama se ejecutará automáticamente en segundo plano

### macOS

```bash
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## Paso 2: Descargar Modelo de IA

Abre terminal y ejecuta:

```bash
# Modelo recomendado (rápido y eficiente)
ollama pull llama3.2

# Alternativa más potente (más lento)
ollama pull llama3.1

# Modelo en español optimizado
ollama pull llama3.2:es
```

**Tamaños:**
- `llama3.2` (~2GB) - Recomendado para la mayoría
- `llama3.1` (~4.7GB) - Mejor calidad

## Paso 3: Verificar Instalación

```bash
# Listar modelos instalados
ollama list

# Deberías ver: llama3.2:latest

# Probar el modelo
ollama run llama3.2

# Escribe: "Hola, ¿cómo estás?"
# Para salir: Ctrl+D
```

## Paso 4: Configurar Backend

1. **Crear archivo `.env` en `backend/`:**

```env
# Base de datos Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Configuración de IA Local
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2

# Deja vacío si usas IA local
OPENAI_API_KEY=

DEBUG=True
```

2. **Instalar dependencias:**

```bash
cd backend
pip install -r requirements.txt
```

3. **Iniciar servidor:**

```bash
uvicorn app.main:app --reload
```

4. **Verificar conexión:**

```bash
curl http://localhost:8000/chat/status
```

Debería mostrar:
```json
{
  "provider": "ollama",
  "ollama_available": true,
  "ollama_model": "llama3.2"
}
```

## Paso 5: Probar el Bot

1. Abre el frontend: http://localhost:3000
2. Haz clic en el botón verde flotante (esquina inferior derecha)
3. Escribe: "Hola, ¿qué es LeadGenPro?"

**La primera respuesta puede tardar 10-30 segundos** mientras el modelo se carga en memoria. Las siguientes serán instantáneas.

## Troubleshooting

### "Ollama not found"

```bash
# Verificar que Ollama está corriendo
ollama --version

# Si no, iniciar manualmente
ollama serve
```

### "Model not found"

```bash
# Re-descargar el modelo
ollama pull llama3.2
```

### Respuestas muy lentas

1. Cierra aplicaciones pesadas
2. Usa un modelo más pequeño: `ollama pull llama3.2:1b`
3. Aumenta RAM asignada a Ollama

### Error de memoria

El modelo requiere:
- **Mínimo:** 4GB RAM libre
- **Recomendado:** 8GB+ RAM

Si tienes poca RAM, usa:
```bash
ollama pull llama3.2:1b  # Versión reducida (~800MB)
```

## Comparativa de Modelos

| Modelo | Tamaño | Velocidad | Calidad | Uso recomendado |
|--------|--------|-----------|---------|-----------------|
| llama3.2 | 2GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Chat general, ventas |
| llama3.1 | 4.7GB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Respuestas complejas |
| llama3.2:1b | 800MB | ⭐⭐⭐⭐⭐ | ⭐⭐ | PCs con poca RAM |

## Cambiar entre Proveedores

Edita `backend/.env`:

```env
# Para IA Local (Ollama)
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2

# Para OpenAI (API)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Para Demo (sin IA)
AI_PROVIDER=demo
```

Reinicia el servidor backend después de cambiar.

## Performance Tips

1. **Mantén Ollama corriendo:** No cierres la terminal
2. **Precarga el modelo:** Ejecuta `ollama run llama3.2` antes de usar el bot
3. **Cierra apps innecesarias:** Libera RAM
4. **SSD recomendado:** Mejora tiempos de carga del modelo

## Recursos

- [Ollama GitHub](https://github.com/ollama/ollama)
- [Modelos disponibles](https://ollama.com/library)
- [Documentación Llama](https://llama.meta.com/)
