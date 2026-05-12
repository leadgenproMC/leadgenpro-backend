# LeadGenPro - Información de Backup

Fecha del backup: 2025-04-04
Ubicación: C:\Users\Portatil\Documents\My Web Sites\Leadgenpro

## Estado Actual del Proyecto

### Funcionalidades Implementadas (04/04/2025)

#### 1. Autenticación Completa ✅
- Registro de usuarios con email, password, nombre, empresa
- Confirmación de email vía Supabase Auth
- Login con JWT token
- Recuperación de contraseña (forgot-password → email → reset-password)
- Validación: nunca usar la misma contraseña anterior
- Historial de contraseñas en tabla `password_history`

#### 2. Frontend (Next.js)
- `/[locale]/login` - Página login/registro con tabs
- `/[locale]/confirm-email` - Página post-registro "revisa tu email"
- `/[locale]/auth/callback` - Callback para confirmación de email
- `/[locale]/forgot-password` - Formulario de recuperación
- `/[locale]/reset-password` - Formulario de nueva contraseña
- `/[locale]/dashboard` - Dashboard principal (protegido)
- ChatBot integrado en layout global
- Internacionalización (es/en)

#### 3. Backend (FastAPI)
- `POST /auth/register` - Registro con Supabase Auth
- `POST /auth/login` - Login
- `POST /auth/forgot-password` - Envía email de recuperación
- `POST /auth/reset-password` - Cambia contraseña con validación
- `GET /auth/test-supabase` - Endpoint de diagnóstico
- Integración completa con Supabase Auth

#### 4. Base de Datos (Supabase)
- Tabla `public.users` - Datos adicionales de usuarios
- Tabla `public.password_history` - Historial de contraseñas
- RLS policies configuradas
- Triggers para updated_at

## Estructura del Proyecto

```
Leadgenpro/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app con routers
│   │   ├── routers/
│   │   │   └── auth.py            # Endpoints de autenticación
│   │   └── services/
│   │       └── supabase_client.py # Cliente Supabase
│   ├── requirements.txt           # Dependencias Python
│   └── .env                       # Variables de entorno
├── frontend/
│   └── src/
│       └── app/
│           └── [locale]/
│               ├── login/page.tsx
│               ├── confirm-email/page.tsx
│               ├── forgot-password/page.tsx
│               ├── reset-password/page.tsx
│               ├── auth/callback/page.tsx
│               ├── dashboard/page.tsx
│               └── layout.tsx     # Con ChatBot global
├── SUPABASE_AUTH_SETUP.sql       # SQL para tabla users
├── SUPABASE_PASSWORD_HISTORY.sql # SQL para historial contraseñas
└── BACKUP_README.md             # Este archivo
```

## Configuración Supabase Requerida

### 1. Authentication → URL Configuration
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: 
  - `http://localhost:3000/*/auth/callback`
  - `http://localhost:3000/*/reset-password`

### 2. Authentication → Email Templates
- Confirm signup: Usar `{{ .ConfirmationURL }}`
- Reset password: Usar `{{ .ConfirmationURL }}`

### 3. SQL Ejecutado
- ✅ `SUPABASE_AUTH_SETUP.sql` - Tabla users + RLS
- ✅ `SUPABASE_PASSWORD_HISTORY.sql` - Tabla historial contraseñas

## Variables de Entorno (.env)

```
SUPABASE_URL=https://deccstotatmchyavbtor.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Para Restaurar / Desplegar

```powershell
# 1. Backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001

# 2. Frontend
npm install
npm run dev
```

## Checklist Post-Restauración

- [ ] Verificar `.env` con credenciales Supabase
- [ ] Instalar dependencias Python: `pip install -r requirements.txt`
- [ ] Instalar dependencias Node: `npm install`
- [ ] Verificar backend: `http://localhost:8001/auth/test-supabase`
- [ ] Verificar frontend: `http://localhost:3000/es/login`
- [ ] Configurar Supabase URL Configuration
- [ ] Configurar Email Templates en Supabase

## Notas Importantes

- Los usuarios se crean en `auth.users` (Supabase Auth)
- Datos adicionales en `public.users` (nombre, empresa)
- Email confirmation está habilitado (obligatorio)
- Password reset funciona con validación de historial
- ChatBot aparece en todas las páginas vía layout.tsx
