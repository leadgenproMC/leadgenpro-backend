# Guía de Configuración Supabase - LeadGenPro

## 📋 Resumen

Esta guía te ayudará a configurar Supabase como base de datos para LeadGenPro, incluyendo:
- Historial de conversaciones del bot
- Persistencia de datos de la aplicación

---

## 🚀 Paso 1: Crear Proyecto en Supabase

### 1.1 Registro
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Regístrate con GitHub o email

### 1.2 Crear Organización y Proyecto
1. **Crear organización**: Dale un nombre (ej: "LeadGenPro")
2. **Crear proyecto**:
   - **Nombre**: `leadgenpro-production` (o el que prefieras)
   - **Contraseña de base de datos**: Guarda esta contraseña en un lugar seguro
   - **Región**: Elige la más cercana a tus usuarios (ej: `West Europe` para España)
   - **Plan**: Free Tier (suficiente para empezar)

3. Espera ~2 minutos a que se cree el proyecto

---

## 📊 Paso 2: Obtener Credenciales

### 2.1 Project URL
1. En el dashboard de Supabase, ve a **Project Settings** (icono ⚙️)
2. Selecciona **API** en el menú lateral
3. Copia el **"Project URL"** (ej: `https://abcdefgh12345678.supabase.co`)

### 2.2 Service Role Key
⚠️ **IMPORTANTE**: Este key tiene acceso total. No lo compartas ni lo expongas en el frontend.

1. En la misma página **API**:
2. Busca **"service_role" secret**
3. Revela y copia el key (empieza con `eyJhbG...`)

---

## ⚙️ Paso 3: Configurar Backend

### 3.1 Editar `.env`

```powershell
cd "C:\Users\Portatil\Documents\My Web Sites\Leadgenpro\backend"
notepad .env
```

Reemplaza con tus credenciales:

```env
# Base de datos Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuración de IA
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
```

---

## 🗄️ Paso 4: Crear Tablas

### 4.1 Abrir SQL Editor
1. En el dashboard de Supabase, ve a **SQL Editor** (icono 💻)
2. Haz clic en **"New query"**

### 4.2 Ejecutar Script de Creación

Copia y ejecuta este SQL:

```sql
-- Tabla para historial de conversaciones del bot
CREATE TABLE chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    session_id text NOT NULL DEFAULT 'default',
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, session_id);

-- Seguridad: Permitir acceso desde el backend
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON chat_messages
    FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- Tablas adicionales para LeadGenPro
-- ==========================================

-- Tabla de usuarios (extiende auth.users de Supabase)
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    full_name text,
    company text,
    credits integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabla de leads
CREATE TABLE leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    email text,
    phone text,
    company text,
    niche text,
    location text,
    status text DEFAULT 'new',
    score integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);

-- Tabla de campañas
CREATE TABLE campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    description text,
    status text DEFAULT 'draft',
    sequence jsonb DEFAULT '[]'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_campaigns_user ON campaigns(user_id);

-- Tabla de créditos/transacciones
CREATE TABLE credit_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    amount integer NOT NULL,
    type text NOT NULL, -- 'purchase', 'usage', 'bonus'
    description text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);

-- Políticas de seguridad básicas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Usuarios solo ven sus propios datos
CREATE POLICY "Users can only see own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only see own leads" ON leads
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own transactions" ON credit_transactions
    FOR ALL USING (auth.uid() = user_id);
```

### 4.3 Verificar Tablas Creadas
1. Ve a **Table Editor** (icono 📊)
2. Deberías ver las tablas:
   - `chat_messages`
   - `profiles`
   - `leads`
   - `campaigns`
   - `credit_transactions`

---

## ✅ Paso 5: Verificar Conexión

### 5.1 Reiniciar Backend
```powershell
cd "C:\Users\Portatil\Documents\My Web Sites\Leadgenpro\backend"
# Detener si está corriendo (Ctrl+C) y reiniciar:
python -m uvicorn app.main:app --reload
```

### 5.2 Test de Conexión
```powershell
# En otra terminal PowerShell:
cd "C:\Users\Portatil\Documents\My Web Sites\Leadgenpro\backend"
python -c "from app.services.supabase_client import get_supabase; s = get_supabase(); print('✅ Conectado' if s else '❌ Error')"
```

### 5.3 Test del Bot con Memoria
```powershell
# Enviar mensaje de prueba
python -c "
import urllib.request
import json

data = json.dumps({'user_id': 'test_user_123', 'message': 'Hola', 'locale': 'es'}).encode()
req = urllib.request.Request('http://localhost:8000/chat/', data=data, headers={'Content-Type': 'application/json'})
response = urllib.request.urlopen(req)
print('Status:', response.status)
print('Response:', response.read().decode())
"
```

---

## 📊 Paso 6: Configurar Autenticación (Opcional)

Para usar Supabase Auth en lugar del sistema actual:

### 6.1 Habilitar Providers
1. Ve a **Authentication** → **Providers**
2. Habilita **Email** (ya está por defecto)
3. (Opcional) Habilita **Google**, **GitHub**, etc.

### 6.2 Configurar Frontend
Actualizar `frontend/src/lib/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🔧 Troubleshooting

### Error: "Invalid API key"
- Verifica que usaste el **Service Role Key**, no el Anon Key
- El Service Role Key está en Project Settings → API → service_role

### Error: "relation does not exist"
- Las tablas no se crearon correctamente
- Revisa el SQL Editor por errores

### Error de conexión timeout
- Verifica tu conexión a internet
- El proyecto de Supabase está activo en el dashboard

### No se guardan mensajes
- Verifica que la tabla `chat_messages` existe
- Revisa logs del backend: `print(supabase)` debe mostrar el cliente

---

## 📚 Recursos

- [Documentación Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎯 Siguientes Pasos

1. ✅ Backend conectado a Supabase
2. ⏭️ Migrar datos existentes (si los hay)
3. ⏭️ Actualizar frontend para usar Supabase Auth
4. ⏭️ Configurar realtime para notificaciones en vivo

¿Necesitas ayuda con algún paso específico?
