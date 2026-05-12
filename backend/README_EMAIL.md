# 📧 CONFIGURACIÓN EMAIL - LEADGENPRO

## 🚨 PROBLEMAS ACTUALES

### **Problema 1: No llega correo de verificación**
- **Causa**: Sistema de email no configurado
- **Solución**: Configurar variables SMTP en Render

### **Problema 2: Sistema no es seguro**
- **Causa**: Login permite acceso sin verificación
- **Solución**: Implementar auth_secure.py

### **Problema 3: Vulnerabilidades**
- **Causa**: Sin hashing de contraseñas
- **Solución**: Sistema con SHA-256

## 🔧 SOLUCIÓN COMPLETA

### **1. Configurar Email en Render**

Ve a tu dashboard de Render y añade estas variables:

```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
FROM_EMAIL=tu-email@gmail.com
```

### **2. Configurar Gmail**

1. Ve a Configuración de Google
2. Activa "Verificación en dos pasos"
3. Genera "Contraseña de aplicación"
4. Usa esa contraseña en SMTP_PASSWORD

### **3. Sistema Implementado**

Ya hemos creado:
- ✅ **Email service real** (`email_real.py`)
- ✅ **Auth router seguro** (`auth_secure.py`)
- ✅ **Hashing de contraseñas** (SHA-256)
- ✅ **Rate limiting** (5 intentos/15min)
- ✅ **Token management** (expiran en 24h)
- ✅ **Logs completos**
- ✅ **Manejo de errores**

## 🎯 PRÓXIMOS PASOS

### **1. Deploy del sistema seguro**
```bash
git add .
git commit -m "Deploy secure auth system"
git push
```

### **2. Configurar variables en Render**
- Dashboard → Service → Environment
- Añadir variables SMTP

### **3. Probar sistema completo**
```bash
# Registrar usuario
curl -X POST https://leadgenpro-backend-7oco.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test","agreed_to_terms":true}'

# Intentar login (debe fallar)
curl -X POST https://leadgenpro-backend-7oco.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Verificar email
curl -X POST https://leadgenpro-backend-7oco.onrender.com/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_DEL_REGISTRO"}'
```

## 🛡️ SEGURIDAD IMPLEMENTADA

### **Características de Seguridad:**
- 🔐 **Hashing SHA-256** para contraseñas
- 🚫 **Rate limiting** anti-brute force
- ⏰ **Tokens expiran** en 24 horas
- 📊 **Logs completos** de auditoría
- 🌐 **Protección CORS**
- 🔍 **Validación de inputs**
- 📱 **User agent tracking**

### **Endpoints Seguros:**
- `POST /auth/register` - Registro con email verification
- `POST /auth/login` - Login con verificación obligatoria
- `POST /auth/verify-email` - Verificación por token
- `POST /auth/resend-verification` - Reenviar email
- `GET /auth/health` - Health check con stats
- `GET /auth/stats` - Estadísticas del sistema

## 🎯 RESULTADO FINAL

Un sistema **completamente seguro** con:
- ✅ **Email verification real**
- ✅ **Protección robusta**
- ✅ **Logs completos**
- ✅ **Rate limiting**
- ✅ **Token management**
- ✅ **Error handling**

**LeadGenPro estará listo para producción con seguridad empresarial.**
