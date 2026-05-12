# Guía de Integración MailerLite - LeadGenPro

## 📧 Resumen

MailerLite es un servicio de email marketing que permite:
- Capturar leads desde el chatbot
- Suscribir leads a newsletters
- Enviar campañas de email
- Sincronizar con Supabase

---

## 🚀 Paso 1: Crear Cuenta en MailerLite

### 1.1 Registro Gratuito
1. Ve a [https://www.mailerlite.com](https://www.mailerlite.com)
2. Clic en **"Sign Up Free"**
3. Completa el registro con tu email

### 1.2 Verificación
- Confirma tu email
- Completa el perfil de cuenta
- Espera aprobación (generalmente instantánea)

---

## 🔑 Paso 2: Obtener API Key

### 2.1 Generar API Key
1. Ve a **Integrations** → **Developer API**
2. Clic en **"Generate new token"**
3. Dale un nombre: `LeadGenPro Integration`
4. Copia el API key (empieza con `ml_...`)

### 2.2 Configurar .env

```powershell
cd "C:\Users\Portatil\Documents\My Web Sites\Leadgenpro\backend"
notepad .env
```

Agrega:
```env
# Configuración de Email (MailerLite)
MAILERLITE_API_KEY=ml_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILERLITE_GROUP_ID=12345678  # Opcional: ID del grupo por defecto
```

---

## 📦 Paso 3: Instalar Dependencias

```powershell
cd "C:\Users\Portatil\Documents\My Web Sites\Leadgenpro\backend"
pip install mailerlite-python
```

O si usas el requirements.txt actualizado:
```powershell
pip install -r requirements.txt
```

---

## 🧪 Paso 4: Verificar Conexión

```powershell
python -c "from app.services.mailerlite import is_configured; print('✅ Configurado' if is_configured() else '❌ Falta API key')"
```

---

## 📊 Endpoints Disponibles

### GET `/mailerlite/status`
Verifica si MailerLite está configurado.

**Respuesta:**
```json
{
  "configured": true,
  "message": "MailerLite configurado"
}
```

---

### GET `/mailerlite/groups`
Lista de grupos/listas de correo.

**Respuesta:**
```json
{
  "groups": [
    {
      "id": "12345678",
      "name": "Nuevos Leads",
      "total": 150
    }
  ]
}
```

---

### POST `/mailerlite/subscribe`
Suscribe un nuevo lead.

**Request:**
```json
{
  "email": "carlos@ejemplo.com",
  "name": "Carlos García",
  "fields": {
    "city": "Madrid",
    "company": "Mi Empresa",
    "phone": "+34612345678"
  },
  "groups": ["12345678"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "subscriber_id": "98765432",
  "email": "carlos@ejemplo.com",
  "status": "active"
}
```

---

### GET `/mailerlite/subscriber/{email}`
Obtiene información de un suscriptor.

**Ejemplo:**
```
GET /mailerlite/subscriber/carlos@ejemplo.com
```

---

### PUT `/mailerlite/subscriber/{email}`
Actualiza un suscriptor.

**Request:**
```json
{
  "name": "Carlos García Pérez",
  "fields": {
    "city": "Barcelona"
  },
  "status": "active"
}
```

---

### POST `/mailerlite/sync-from-supabase`
Sincroniza un lead desde Supabase.

**Request:**
```json
{
  "user_id": "uuid-del-usuario-en-supabase",
  "group_id": "12345678"
}
```

---

### POST `/mailerlite/add-from-chat`
Agrega un lead desde el chatbot.

**Request:**
```json
{
  "email": "lead@ejemplo.com",
  "name": "Nombre del Lead",
  "fields": {
    "company": "Empresa S.A.",
    "city": "Madrid",
    "last_noted": "Interesado en servicios premium"
  }
}
```

---

## 🤖 Integración con el ChatBot

Para capturar leads automáticamente desde el chatbot:

### Ejemplo de uso en ai_chat.py:

```python
from app.services import mailerlite

# Cuando el bot detecta un email en la conversación
if email_detectado:
    mailerlite.add_lead_from_chat(
        email=email_detectado,
        name=nombre_detectado,
        company=empresa,
        location=ubicacion,
        notes=f"Capturado por bot - Interés: {servicio_detectado}"
    )
```

---

## 🔄 Flujo de Trabajo Recomendado

1. **Lead visita landing** → Se registra en Supabase
2. **Lead habla con bot** → Bot captura email y datos
3. **Automáticamente** → Se suscribe a MailerLite
4. **Campaña de nurturing** → MailerLite envía emails automáticos
5. **Lead convierte** → Se actualiza estado en Supabase

---

## 📈 Mejores Prácticas

### Segmentación:
- Crear grupos por nicho (Marketing, Ecommerce, etc.)
- Segmentar por ubicación (ciudad, país)
- Etiquetar por nivel de interés (hot, warm, cold)

### Campos personalizados en MailerLite:
- `source`: De dónde viene el lead (chatbot, landing, etc.)
- `interest`: Servicio de interés
- `budget`: Presupuesto estimado
- `nich`: Nicho del negocio

---

## 🔧 Troubleshooting

### Error: "Invalid API key"
- Verifica que el key empieza con `ml_`
- Regenera el token en MailerLite dashboard
- Asegúrate de que no haya espacios en el .env

### Error: "Subscriber not found"
- El email no existe en tu lista de MailerLite
- Verifica que el email esté correctamente escrito

### Error: "Group not found"
- El ID del grupo no existe
- Usa el endpoint `/mailerlite/groups` para ver los IDs válidos

### No se sincroniza con Supabase
- Verifica que la tabla `leads` existe en Supabase
- Comprueba que el `user_id` es correcto
- Revisa los logs del backend

---

## 📚 Recursos

- [Documentación MailerLite API](https://mailerlite.com/developers)
- [Librería Python](https://github.com/mailerlite/mailerlite-python)
- [Guía de Webhooks](https://mailerlite.com/help/webhooks)

---

## ✅ Checklist de Configuración

- [ ] Cuenta creada en MailerLite
- [ ] API key generada
- [ ] API key agregada a `.env`
- [ ] Dependencias instaladas (`pip install mailerlite-python`)
- [ ] Backend reiniciado
- [ ] Test de conexión exitoso
- [ ] Grupo creado en MailerLite
- [ ] Test de suscripción exitoso

¿Necesitas ayuda con algún paso específico?
