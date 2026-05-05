# Bot de Ventas LeadGenPro

Bot de ventas con **IA configurable**: Local (Ollama), OpenAI API, o modo Demo.

## Arquitectura Multi-Proveedor

El bot soporta 3 modos de operación:

| Modo | Proveedor | Costo | Privacidad | Requiere |
|------|-----------|-------|------------|----------|
| **Local** | Ollama (Llama) | Gratis | 100% privado | Instalar Ollama |
| **API** | OpenAI | Pago por uso | Datos en cloud | API Key |
| **Demo** | Respuestas fijas | Gratis | 100% privado | Nada |

## Estructura

```
backend/
├── app/
│   ├── main.py              # Incluye router /chat
│   ├── routers/
│   │   └── chat.py          # Endpoints del bot
│   └── services/
│       ├── ai_chat.py       # Multi-proveedor: Ollama/OpenAI/Demo
│       └── memory.py        # Persistencia en Supabase
├── .env.example             # Configuración de ejemplo
├── requirements.txt         # openai + ollama
└── OLLAMA_SETUP.md          # Guía de instalación IA local

frontend/
└── src/
    ├── components/
    │   └── ChatBot.tsx      # Widget flotante multilenguaje
    └── app/[locale]/
        └── page.tsx         # Landing con ChatBot integrado
```

## Configuración Rápida

### Opción 1: IA Local (Recomendado - Gratuito y Privado)

1. **Instalar Ollama:** https://ollama.com/download
2. **Descargar modelo:**
   ```bash
   ollama pull llama3.2
   ```
3. **Configurar `.env`:**
   ```env
   AI_PROVIDER=ollama
   OLLAMA_MODEL=llama3.2
   ```
4. **Iniciar:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

📖 **Guía detallada:** Ver `OLLAMA_SETUP.md`

### Opción 2: OpenAI (API)

1. **Configurar `.env`:**
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-...
   ```
2. **Iniciar servidor**

### Opción 3: Demo (Sin IA)

1. **Configurar `.env`:**
   ```env
   AI_PROVIDER=demo
   ```
2. **Iniciar servidor**

## Variables de Entorno (.env)

```env
# Proveedor de IA: "ollama", "openai", o "demo"
AI_PROVIDER=ollama

# Para Ollama (Local)
OLLAMA_MODEL=llama3.2

# Para OpenAI (API)
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini

# Base de datos (opcional, para historial)
SUPABASE_URL=https://...
SUPABASE_KEY=...
```

## Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/chat/` | POST | Enviar mensaje al bot |
| `/chat/session` | POST | Crear nueva sesión |
| `/chat/history/{user_id}` | GET | Obtener historial |
| `/chat/status` | GET | Ver estado de proveedores |

### Ejemplo Request

```bash
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "session_id": "default",
    "message": "¿Cómo consigo más leads?",
    "locale": "es"
  }'
```

## Tabla Supabase (Opcional)

Para persistir historial de conversaciones:

```sql
CREATE TABLE chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    session_id text NOT NULL DEFAULT 'default',
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, session_id);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON chat_messages
    FOR ALL USING (true) WITH CHECK (true);
```

## Personalización

Edita `backend/app/services/ai_chat.py`:

```python
SYSTEM_PROMPT = """
Tu estilo personalizado aquí...
"""

DEMO_RESPONSES = {
    "es": {
        "hola": "Tu respuesta personalizada...",
        # ... más respuestas
    }
}
```

## Funcionalidades

✅ **Multi-Proveedor**: Ollama (local), OpenAI (API), Demo  
✅ **100% Privado**: Con Ollama, datos nunca salen de tu PC  
✅ **Gratuito**: Ollama y Demo sin costos  
✅ **Memoria persistente**: Historial en Supabase  
✅ **Widget flotante**: UI en esquina inferior derecha  
✅ **Multilenguaje**: ES/EN automático según URL  
✅ **Typing indicator**: Animación mientras escribe  

## Troubleshooting

### Bot no responde
```bash
# Verificar backend
curl http://localhost:8000/chat/status

# Verificar Ollama
ollama list
ollama run llama3.2
```

### Primera respuesta lenta (Ollama)
Normal. El modelo se carga en memoria la primera vez (10-30s). Siguientes son instantáneas.

### Error de memoria
Usa modelo más pequeño:
```bash
ollama pull llama3.2:1b  # Solo 800MB
```

## Recursos

- [Guía Ollama](OLLAMA_SETUP.md)
- [Biblioteca Ollama](https://ollama.com/library)
- [Repositorio](https://github.com/ollama/ollama)
