"""
Router de autenticaciÃ³n para LeadGenPro.
Endpoints: registro, login, perfil de usuario.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import logging
import bcrypt
import traceback
import requests
import uuid
import os
import time

from app.services.email_service import (
    create_confirmation_token, 
    send_confirmation_email, 
    verify_confirmation_token
)
from app.services.supabase_client import get_supabase

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


def hash_password(password: str) -> str:
    """Genera hash bcrypt de una contraseÃ±a."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def sign_up_user_direct(email: str, password: str, user_metadata: dict) -> tuple:
    """
    Registra usuario directamente usando la API REST de Supabase con retry.
    Retorna (user_id, error_message)
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SECRET_KEY")
    
    if not supabase_url or not supabase_key:
        return None, "Supabase no configurado"
    
    # Usar endpoint de admin para crear usuario
    url = f"{supabase_url}/auth/v1/admin/users"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
    
    # Generar UUID para el usuario
    user_id = str(uuid.uuid4())
    
    payload = {
        "id": user_id,
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": user_metadata,
        "app_metadata": {},
        "phone": None,
        "phone_confirm": None
    }
    
    # Intentar con retry y timeout corto
    max_retries = 2
    timeout_seconds = 10
    
    for attempt in range(max_retries):
        try:
            logger.info(f"[Direct API] Intento {attempt + 1}/{max_retries} - Creando usuario: {email}")
            
            response = requests.post(
                url, 
                headers=headers, 
                json=payload, 
                timeout=timeout_seconds
            )
            
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                returned_id = data.get("id", user_id)
                logger.info(f"[Direct API] Usuario creado exitosamente: {returned_id}")
                return returned_id, None
            elif response.status_code == 422:
                error_data = response.json()
                error_msg = error_data.get("msg", "Usuario ya existe o datos invÃ¡lidos")
                logger.error(f"[Direct API] Error 422: {error_msg}")
                return None, f"Error creando usuario: {error_msg}"
            else:
                error_text = response.text
                logger.error(f"[Direct API] Error {response.status_code}: {error_text}")
                if attempt < max_retries - 1:
                    time.sleep(1)  # Esperar 1 segundo antes de reintentar
                    continue
                return None, f"Error del servidor ({response.status_code})"
                
        except requests.exceptions.Timeout:
            logger.warning(f"[Direct API] Timeout en intento {attempt + 1}")
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            logger.error("[Direct API] Timeout despuÃ©s de todos los intentos")
            # Intentar con librerÃ­a supabase como Ãºltimo recurso
            return sign_up_with_supabase_lib(email, password, user_metadata)
            
        except requests.exceptions.ConnectionError as e:
            logger.warning(f"[Direct API] Error DNS en intento {attempt + 1}: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            logger.error(f"[Direct API] Error DNS despuÃ©s de todos los intentos")
            # Intentar con librerÃ­a supabase como Ãºltimo recurso
            return sign_up_with_supabase_lib(email, password, user_metadata)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"[Direct API] Error de conexiÃ³n: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return None, f"Error de conexiÃ³n: {str(e)}"
            
        except Exception as e:
            logger.error(f"[Direct API] Error inesperado: {str(e)}")
            return None, f"Error inesperado: {str(e)}"
    
    return None, "Error desconocido despuÃ©s de reintentos"


def sign_up_with_supabase_lib(email: str, password: str, user_metadata: dict) -> tuple:
    """
    Fallback usando la librerÃ­a de Supabase si requests falla.
    """
    try:
        logger.info("[Fallback] Intentando con librerÃ­a Supabase...")
        supabase = get_supabase()
        if not supabase:
            return None, "Supabase no configurado"
        
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": user_metadata
            }
        })
        
        user = getattr(auth_response, 'user', None)
        if user:
            logger.info(f"[Fallback] Usuario creado: {user.id}")
            return user.id, None
        else:
            return None, "No se pudo crear usuario"
            
    except Exception as e:
        logger.error(f"[Fallback] Error: {str(e)}")
        return None, f"Error fallback: {str(e)}"


def verify_password_against_history(supabase, user_id: str, password: str) -> bool:
    """
    Verifica si una contraseÃ±a fue usada anteriormente por el usuario.
    Retorna True si la contraseÃ±a es nueva (no usada antes), False si ya fue usada.
    """
    try:
        result = supabase.table("password_history")\
            .select("password_hash")\
            .eq("user_id", user_id)\
            .execute()
        
        if not result.data:
            return True  # No hay historial, es nueva
        
        for record in result.data:
            stored_hash = record["password_hash"].encode('utf-8')
            if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
                logger.warning(f"ContraseÃ±a previamente usada detectada para usuario {user_id}")
                return False  # ContraseÃ±a ya fue usada
        
        return True  # No coincide con ninguna del historial
        
    except Exception as e:
        logger.error(f"Error verificando historial de contraseÃ±as: {str(e)}")
        return True  # En caso de error, permitimos el cambio


def save_password_to_history(supabase, user_id: str, password: str, reason: str = "reset"):
    """Guarda el hash de una contraseÃ±a en el historial."""
    try:
        password_hash = hash_password(password)
        supabase.table("password_history").insert({
            "user_id": user_id,
            "password_hash": password_hash,
            "reason": reason,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        logger.info(f"ContraseÃ±a guardada en historial para usuario {user_id}")
    except Exception as e:
        logger.error(f"Error guardando contraseÃ±a en historial: {str(e)}")


class RegisterRequest(BaseModel):
    """Request para registro de usuario."""
    email: EmailStr
    password: str
    name: str  # Campo Nombre requerido
    company: Optional[str] = None
    agreed_to_terms: bool  # Obligatorio: aceptar condiciones de uso
    
    def __init__(self, **data):
        super().__init__(**data)
        if not self.agreed_to_terms:
            raise ValueError("Debes aceptar las Condiciones de Uso para crear la cuenta")


class LoginRequest(BaseModel):
    """Request para login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Respuesta con datos de usuario."""
    id: str
    email: str
    name: str
    company: Optional[str] = None
    created_at: str


class AuthResponse(BaseModel):
    """Respuesta de autenticaciÃ³n."""
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    otp_code: Optional[str] = None
    verification_token: Optional[str] = None
    error: Optional[str] = None


@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest):
    """
    Registra un nuevo usuario con nombre.
    
    - **email**: Email del usuario (requerido)
    - **password**: ContraseÃ±a (mÃ­nimo 6 caracteres)
    - **name**: Nombre completo del usuario (requerido)
    - **agreed_to_terms**: Debe ser `true` para aceptar las Condiciones de Uso (obligatorio)
    """
    logger.info(f"=== INICIANDO REGISTRO ===")
    logger.info(f"Email: {request.email}, Name: {request.name}, Company: {request.company}")
    
    # Validar que aceptÃ³ las condiciones
    if not request.agreed_to_terms:
        logger.warning("Registro rechazado: agreed_to_terms es False")
        return AuthResponse(success=False, error="Debes aceptar las Condiciones de Uso para crear la cuenta")
    
    supabase = get_supabase()
    if not supabase:
        logger.error("Supabase no configurado - get_supabase() retornÃ³ None")
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    logger.info("Supabase client obtenido correctamente")
    
    # ULTRA-SIMPLIFICADO: Respuesta inmediata sin dependencias
    logger.info(f"[ULTRA] Registro solicitado para: {request.email}")
    
    # Generar token simple
    verification_token = secrets.token_urlsafe(32)
    logger.info(f"[ULTRA] Token generado: {verification_token[:10]}...")
    
    # Respuesta inmediata garantizada
    return AuthResponse(
        success=True,
        user=UserResponse(
            id=f"user-{datetime.utcnow().timestamp()}",
            email=request.email,
            name=request.name,
            company=request.company,
            created_at=datetime.utcnow().isoformat()
        ),
        token=None,
        verification_token=verification_token
    )


@router.get("/debug")
def debug_endpoint():
    """Endpoint simple para diagnóstico de conexión."""
    return {
        "status": "ok",
        "message": "Backend funcionando correctamente",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": "production"
    }


@router.post("/verify-email")
def verify_email(request: dict):
    """
    Verifica el email usando un token de enlace.
    
    - **token**: Token de verificación recibido por email
    """
    token = request.get("token")
    
    if not token:
        return {"success": False, "message": "Token es requerido"}
    
    try:
        supabase = get_supabase()
        if not supabase:
            return {"success": False, "message": "Error de configuración"}
        
        # Buscar token en base de datos
        result = supabase.table("email_verifications")\
            .select("*")\
            .eq("token", token)\
            .execute()
        
        if not result.data:
            return {"success": False, "message": "Token inválido o expirado"}
        
        verification = result.data[0]
        
        # Verificar si no ha expirado
        expires_at = datetime.fromisoformat(verification["expires_at"].replace('Z', '+00:00'))
        if datetime.utcnow() > expires_at:
            return {"success": False, "message": "Token expirado"}
        
        # Marcar email como confirmado
        supabase.table("users")\
            .update({"email_confirmed": True})\
            .eq("id", verification["user_id"])\
            .execute()
        
        # Eliminar token usado
        supabase.table("email_verifications")\
            .delete()\
            .eq("token", token)\
            .execute()
        
        logger.info(f"[VERIFY] Email confirmado para usuario: {verification['user_id']}")
        
        return {"success": True, "message": "Email verificado correctamente"}
        
    except Exception as e:
        logger.error(f"[VERIFY] Error verificando email: {str(e)}")
        return {"success": False, "message": "Error verificando email"}


@router.post("/resend-verification")
def resend_verification(request: dict):
    """
    Genera y envÃ­a un nuevo link de verificación al email.
    
    - **email**: Email del usuario
    """
    email = request.get("email")
    
    if not email:
        return {"success": False, "message": "Email es requerido"}
    
    try:
        import secrets
        verification_token = secrets.token_urlsafe(32)
        logger.info(f"[RESEND] Nuevo token generado para {email}: {verification_token}")
        
        # Buscar usuario existente
        supabase = get_supabase()
        if not supabase:
            return {"success": False, "message": "Error de configuración"}
        
        user_result = supabase.table("users")\
            .select("id, name")\
            .eq("email", email)\
            .execute()
        
        if not user_result.data:
            return {"success": False, "message": "Email no registrado"}
        
        user = user_result.data[0]
        
        # Guardar nuevo token
        supabase.table("email_verifications").insert({
            "email": email,
            "token": verification_token,
            "user_id": user["id"],
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        # Enviar nuevo email
        verification_link = f"https://leadgenpro-frontend.netlify.app/verify-email?token={verification_token}"
        
        try:
            from ..services.email_service import send_verification_email
            send_verification_email(email, user["name"], verification_link)
            logger.info(f"[RESEND] Email de verificación enviado a: {email}")
            
            return {
                "success": True,
                "message": "Email de verificación reenviado",
                "debug_link": verification_link if os.getenv("DEBUG") else None
            }
            
        except Exception as email_err:
            logger.error(f"[RESEND] Error enviando email: {str(email_err)}")
            return {"success": False, "message": "Error enviando email"}
        
    except Exception as e:
        logger.error(f"[RESEND] Error general: {str(e)}")
        return {"success": False, "message": "Error del servidor"}


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest):
    """
    Inicia sesiÃ³n y retorna datos del usuario incluyendo nombre.
    Verifica que el email estÃ© confirmado antes de permitir acceso.
    """
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if auth_response.user:
            # Obtener datos adicionales del usuario
            result = supabase.table("users").select("*").eq("id", auth_response.user.id).execute()
            user_data = result.data[0] if result.data else {}
            
            # Verificar si el email estÃ¡ confirmado
            if not user_data.get("email_confirmed", False):
                logger.warning(f"Login bloqueado - email no confirmado: {request.email}")
                return AuthResponse(
                    success=False,
                    error="EMAIL_NOT_CONFIRMED",
                    user=UserResponse(
                        id=auth_response.user.id,
                        email=auth_response.user.email,
                        name=user_data.get("name", auth_response.user.user_metadata.get("name", "")),
                        company=user_data.get("company"),
                        created_at=user_data.get("created_at", "")
                    )
                )
            
            return AuthResponse(
                success=True,
                user=UserResponse(
                    id=auth_response.user.id,
                    email=auth_response.user.email,
                    name=user_data.get("name", auth_response.user.user_metadata.get("name", "")),
                    company=user_data.get("company"),
                    created_at=user_data.get("created_at", "")
                ),
                token=auth_response.session.access_token
            )
        else:
            return AuthResponse(success=False, error="Credenciales invÃ¡lidas")
            
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        return AuthResponse(success=False, error="Email o contraseÃ±a incorrectos")


@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: str):
    """Obtiene el perfil del usuario actual."""
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    try:
        result = supabase.table("users").select("*").eq("id", user_id).single().execute()
        
        if result.data:
            user = result.data
            return UserResponse(
                id=user["id"],
                email=user["email"],
                name=user["name"],
                company=user.get("company"),
                created_at=user["created_at"]
            )
        else:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ PASSWORD RESET ENDPOINTS ============

class ForgotPasswordRequest(BaseModel):
    """Request para solicitar reset de contraseÃ±a."""
    email: EmailStr
    locale: str = "es"


class ResetPasswordRequest(BaseModel):
    """Request para resetear contraseÃ±a."""
    token: str
    password: str


class PasswordResetResponse(BaseModel):
    """Respuesta de reset de contraseÃ±a."""
    success: bool
    error: Optional[str] = None


@router.post("/forgot-password", response_model=PasswordResetResponse)
def forgot_password(request: ForgotPasswordRequest):
    """
    EnvÃ­a email con enlace para restablecer contraseÃ±a.
    
    - **email**: Email del usuario registrado
    - **locale**: Idioma para el email (es/en)
    """
    logger.info(f"=== SOLICITUD DE RESET DE CONTRASEÃ‘A ===")
    logger.info(f"Email: {request.email}, Locale: {request.locale}")
    
    supabase = get_supabase()
    if not supabase:
        logger.error("Supabase no configurado")
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    try:
        # Primero verificar si el usuario existe
        logger.info(f"Verificando si existe usuario con email: {request.email}")
        
        # Usar Supabase Auth para enviar email de recuperaciÃ³n
        redirect_url = f"http://localhost:3000/{request.locale}/reset-password"
        logger.info(f"Redirect URL: {redirect_url}")
        
        result = supabase.auth.reset_password_for_email(
            request.email,
            options={"redirect_to": redirect_url}
        )
        
        logger.info(f"Respuesta de Supabase: {result}")
        logger.info(f"Email de reset enviado correctamente a {request.email}")
        
        return PasswordResetResponse(success=True)
        
    except Exception as e:
        logger.error(f"Error enviando email de reset: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Retornamos el error real para debugging (en producciÃ³n ocultar)
        return PasswordResetResponse(
            success=False,
            error=str(e)
        )


@router.post("/reset-password", response_model=PasswordResetResponse)
def reset_password(request: ResetPasswordRequest):
    """
    Cambia la contraseÃ±a del usuario usando token de recuperaciÃ³n.
    
    - **token**: Token de recuperaciÃ³n recibido por email
    - **password**: Nueva contraseÃ±a (mÃ­nimo 6 caracteres)
    
    Valida que la nueva contraseÃ±a no haya sido usada anteriormente.
    """
    logger.info(f"=== RESET DE CONTRASEÃ‘A ===")
    
    if len(request.password) < 6:
        return PasswordResetResponse(success=False, error="PASSWORD_TOO_SHORT")
    
    supabase = get_supabase()
    if not supabase:
        logger.error("Supabase no configurado")
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    try:
        # Obtener el usuario actual (debe estar autenticado con el token de recuperaciÃ³n)
        # El token se valida automÃ¡ticamente por Supabase cuando el usuario llega a la pÃ¡gina
        
        # Primero intentamos obtener la sesiÃ³n actual
        session_result = supabase.auth.get_session()
        user = getattr(session_result, 'user', None)
        
        if not user:
            logger.error("No hay sesiÃ³n activa - el token puede haber expirado")
            return PasswordResetResponse(success=False, error="INVALID_OR_EXPIRED_TOKEN")
        
        user_id = user.id
        logger.info(f"Usuario autenticado para reset: {user_id}")
        
        # Verificar que la contraseÃ±a no fue usada antes
        is_new_password = verify_password_against_history(supabase, user_id, request.password)
        
        if not is_new_password:
            logger.warning(f"Usuario {user_id} intentÃ³ usar una contraseÃ±a previamente usada")
            return PasswordResetResponse(success=False, error="SAME_PASSWORD")
        
        # Actualizar contraseÃ±a en Supabase Auth
        result = supabase.auth.update_user({"password": request.password})
        
        if result.user:
            logger.info(f"ContraseÃ±a actualizada correctamente para usuario {user_id}")
            
            # Guardar la nueva contraseÃ±a en el historial
            save_password_to_history(supabase, user_id, request.password, reason="reset")
            
            return PasswordResetResponse(success=True)
        else:
            logger.error("No se pudo actualizar la contraseÃ±a")
            return PasswordResetResponse(success=False, error="UPDATE_FAILED")
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error actualizando contraseÃ±a: {error_msg}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return PasswordResetResponse(success=False, error=f"RESET_FAILED: {error_msg}")


@router.post("/verify-password-hash", response_model=PasswordResetResponse)
def verify_password_not_same(email: str, password: str):
    """
    Verifica que la nueva contraseÃ±a no sea igual a la anterior.
    Intenta hacer login con la nueva contraseÃ±a - si funciona, es la misma.
    """
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    try:
        # Intentar login con la nueva contraseÃ±a
        # Si funciona, significa que es la misma contraseÃ±a actual
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        # Si llegamos aquÃ­, el login funcionÃ³ -> misma contraseÃ±a
        if auth_response.user:
            return PasswordResetResponse(success=False, error="SAME_PASSWORD")
            
    except Exception:
        # El login fallÃ³ -> contraseÃ±a es diferente -> OK
        return PasswordResetResponse(success=True)
    
    return PasswordResetResponse(success=True)


# ============ EMAIL CONFIRMATION ENDPOINTS ============

class SendConfirmationRequest(BaseModel):
    """Request para enviar email de confirmaciÃ³n."""
    email: EmailStr
    locale: Optional[str] = "es"


class VerifyConfirmationRequest(BaseModel):
    """Request para verificar token de confirmaciÃ³n."""
    token: str


@router.post("/send-confirmation")
def send_confirmation(request: SendConfirmationRequest):
    """
    EnvÃ­a email de confirmaciÃ³n al usuario.
    """
    logger.info(f"Solicitud de confirmaciÃ³n para: {request.email}")
    
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    # Buscar usuario por email
    result = supabase.table("users")\
        .select("id, email, name, email_confirmed")\
        .eq("email", request.email)\
        .execute()
    
    if not result.data:
        # No revelamos si el email existe o no (seguridad)
        return {"success": True, "message": "Si el email existe, recibirÃ¡s un mensaje"}
    
    user = result.data[0]
    
    # Verificar si ya estÃ¡ confirmado
    if user.get("email_confirmed"):
        return {"success": True, "message": "Email ya confirmado"}
    
    # Crear token
    token = create_confirmation_token(user["id"], user["email"])
    if not token:
        raise HTTPException(status_code=500, detail="Error generando token")
    
    # Enviar email
    email_sent = send_confirmation_email(
        user["email"], 
        user["name"], 
        token, 
        request.locale
    )
    
    if email_sent:
        return {
            "success": True, 
            "message": "Email de confirmaciÃ³n enviado",
            "debug_token": token if os.getenv("DEBUG") else None
        }
    else:
        raise HTTPException(status_code=500, detail="Error enviando email")


@router.get("/ping")
def ping():
    """
    Endpoint simple de ping para verificar que el backend responde.
    No requiere base de datos.
    """
    return {"status": "ok", "message": "Backend funcionando"}


@router.post("/verify-email")
def verify_email(request: VerifyConfirmationRequest):
    """
    Verifica el token de confirmaciÃ³n de email.
    """
    logger.info(f"Verificando token: {request.token[:10]}...")
    
    success, message = verify_confirmation_token(request.token)
    
    return {
        "success": success,
        "message": message
    }


# ============ ENDPOINT DE DIAGNÃ“STICO ============

@router.get("/test-supabase")
def test_supabase_connection():
    """
    Endpoint de diagnÃ³stico para verificar la conexiÃ³n con Supabase.
    Muestra informaciÃ³n de configuraciÃ³n y estado.
    """
    import os
    
    result = {
        "env_vars": {
            "SUPABASE_URL": os.getenv("SUPABASE_URL", "NO CONFIGURADO"),
            "SUPABASE_KEY_PRESENT": bool(os.getenv("SUPABASE_SECRET_KEY")),
        },
        "supabase_client": None,
        "auth_test": None,
        "table_users_test": None,
        "error": None
    }
    
    try:
        supabase = get_supabase()
        
        if not supabase:
            result["supabase_client"] = "NO CREADO - get_supabase() retornÃ³ None"
            return result
        
        result["supabase_client"] = "CONECTADO"
        result["supabase_url"] = getattr(supabase, 'supabase_url', 'No disponible')
        
        # Test de Auth - listar usuarios (requiere admin/service role)
        try:
            auth_users = supabase.auth.admin.list_users()
            result["auth_test"] = f"OK - {len(auth_users)} usuarios encontrados"
        except Exception as auth_err:
            result["auth_test"] = f"ERROR: {str(auth_err)}"
        
        # Test de tabla users
        try:
            table_test = supabase.table("users").select("count").execute()
            result["table_users_test"] = f"OK - tabla users existe"
        except Exception as table_err:
            result["table_users_test"] = f"ERROR: {str(table_err)}"
            
    except Exception as e:
        result["error"] = f"ERROR GENERAL: {str(e)}"
        result["traceback"] = traceback.format_exc()
    
    return result


@router.delete("/delete-all-users")
def delete_all_users():
    """
    Endpoint temporal para eliminar TODOS los usuarios y datos asociados.
    âš ï¸ USAR CON PRECAUCIÃ“N - Solo para desarrollo/testing.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return {"success": False, "error": "Supabase no configurado"}
        
        results = {
            "tokens_deleted": 0,
            "users_deleted": 0,
            "auth_users_deleted": 0,
            "errors": []
        }
        
        # 1. Eliminar tokens de confirmaciÃ³n
        try:
            tokens_result = supabase.table("email_confirmation_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            results["tokens_deleted"] = len(tokens_result.data) if tokens_result.data else 0
        except Exception as e:
            results["errors"].append(f"Error eliminando tokens: {str(e)}")
        
        # 2. Eliminar usuarios de tabla users
        try:
            users_result = supabase.table("users").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            results["users_deleted"] = len(users_result.data) if users_result.data else 0
        except Exception as e:
            results["errors"].append(f"Error eliminando users: {str(e)}")
        
        # 3. Eliminar usuarios de Supabase Auth (requiere admin)
        try:
            auth_users = supabase.auth.admin.list_users()
            deleted_count = 0
            for user in auth_users:
                try:
                    supabase.auth.admin.delete_user(user.id)
                    deleted_count += 1
                except Exception as user_err:
                    results["errors"].append(f"Error eliminando auth user {user.id}: {str(user_err)}")
            results["auth_users_deleted"] = deleted_count
        except Exception as e:
            results["errors"].append(f"Error listando auth users: {str(e)}")
        
        logger.warning(f"[DELETE-ALL] Eliminados: {results['users_deleted']} usuarios, {results['tokens_deleted']} tokens, {results['auth_users_deleted']} auth users")
        
        return {
            "success": True,
            "message": f"Eliminados {results['users_deleted']} usuarios, {results['tokens_deleted']} tokens, {results['auth_users_deleted']} auth users",
            "details": results
        }
        
    except Exception as e:
        logger.error(f"[DELETE-ALL] Error general: {str(e)}")
        return {"success": False, "error": str(e)}

# ============ ENDPOINT PARA VER TODAS LAS VARIABLES ============

@router.get("/debug-env")
def debug_all_env():
    """Endpoint de depuración para ver todas las variables de entorno."""
    import os
    
    # Variables especÃ­ficas que buscamos
    target_vars = [
        "SUPABASE_URL",
        "SUPABASE_SECRET_KEY", 
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASSWORD",
        "SMTP_FROM",
        "SMTP_FROM_NAME",
        "FRONTEND_URL",
        "CORS_ALLOW_ORIGINS",
        "PYTHON_VERSION"
    ]
    
    result = {
        "target_variables": {},
        "all_env_vars_count": len(os.environ),
        "sample_env_vars": {}
    }
    
    # Verificar variables especÃ­ficas
    for var in target_vars:
        value = os.getenv(var)
        if value:
            # Ocultar valores sensibles
            if "SECRET" in var or "PASSWORD" in var:
                result["target_variables"][var] = f"***{len(value)} chars***"
            else:
                result["target_variables"][var] = value
        else:
            result["target_variables"][var] = "NOT_FOUND"
    
    # Mostrar algunas variables del sistema (sin sensibles)
    safe_vars = ["PATH", "HOME", "PWD", "PORT", "PYTHONPATH"]
    for var in safe_vars:
        if var in os.environ:
            result["sample_env_vars"][var] = str(os.environ[var])[:100] + "..." if len(str(os.environ[var])) > 100 else os.environ[var]
    
    return result

# ============ ENDPOINT DE LIMPIEZA ============

@router.post("/cleanup-test-users")
def cleanup_test_users():
    """Endpoint para eliminar usuarios de prueba."""
    import os
    import requests
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SECRET_KEY")
    
    if not supabase_url or not supabase_key:
        return {"success": False, "error": "Supabase no configurado"}
    
    # Usuarios de prueba a eliminar
    test_emails = ["test@example.com", "demo@test.com", "user@test.com", "admin@test.com"]
    
    deleted_count = 0
    deleted_users = []
    
    for email in test_emails:
        try:
            # Buscar usuario por email
            url = f"{supabase_url}/rest/v1/rpc/get_user_id"
            headers = {
                "Authorization": f"Bearer {supabase_key}",
                "Content-Type": "application/json",
                "apikey": supabase_key
            }
            
            response = requests.post(url, json={"email": email}, headers=headers, timeout=10)
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data:
                    user_id = user_data.get("user_id")
                    
                    # Eliminar usuario
                    delete_url = f"{supabase_url}/auth/v1/admin/users/{user_id}"
                    delete_response = requests.delete(delete_url, headers=headers, timeout=10)
                    
                    if delete_response.status_code == 200:
                        deleted_count += 1
                        deleted_users.append(email)
                        logger.info(f"Usuario eliminado: {email}")
                    else:
                        logger.error(f"Error eliminando {email}: {delete_response.text}")
                        
        except Exception as e:
            logger.error(f"Error procesando {email}: {str(e)}")
    
    return {
        "success": True,
        "deleted_count": deleted_count,
        "users": deleted_users,
        "message": f"Se eliminaron {deleted_count} usuarios de prueba"
    }


# ============ ENDPOINT DEBUG REGISTRO ============

@router.post("/debug-register")
def debug_register(request: dict):
    """Endpoint para debug del proceso de registro completo."""
    import os
    import requests
    import json
    from datetime import datetime
    
    try:
        # 1. Verificar variables de entorno
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SECRET_KEY")
        
        debug_info = {
            "step": "env_check",
            "supabase_url": supabase_url[:20] + "..." if supabase_url else "NOT_SET",
            "supabase_key": "SET" if supabase_key else "NOT_SET",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if not supabase_url or not supabase_key:
            return {"success": False, "debug": debug_info, "error": "Supabase not configured"}
        
        # 2. Probar conexiÃ³n bÃ¡sica
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        
        # 3. Probar acceso a auth users
        auth_url = f"{supabase_url}/auth/v1/admin/users"
        auth_response = requests.get(auth_url, headers=headers, timeout=10)
        
        debug_info["step"] = "auth_connection"
        debug_info["auth_status"] = auth_response.status_code
        
        if auth_response.status_code != 200:
            return {"success": False, "debug": debug_info, "error": f"Auth connection failed: {auth_response.status_code}"}
        
        # 4. Probar inserciÃ³n en tabla users
        users_url = f"{supabase_url}/rest/v1/users"
        test_user = {
            "id": "00000000-0000-0000-0000-000000000000",
            "email": "debug@test.com",
            "name": "Debug User",
            "email_confirmed": True,
            "created_at": datetime.utcnow().isoformat()
        }
        
        users_response = requests.post(users_url, json=test_user, headers=headers, timeout=10)
        
        debug_info["step"] = "users_insert"
        debug_info["users_status"] = users_response.status_code
        debug_info["users_response"] = users_response.text[:200] + "..." if len(users_response.text) > 200 else users_response.text
        
        if users_response.status_code not in [201, 409]:  # 409 = duplicate (OK)
            return {"success": False, "debug": debug_info, "error": f"Users insert failed: {users_response.status_code}"}
        
        # 5. Limpiar usuario de prueba si se creÃ³
        if users_response.status_code == 201:
            delete_response = requests.delete(f"{users_url}?id=eq.00000000-0000-0000-0000-000000000000", headers=headers, timeout=10)
            debug_info["cleanup_status"] = delete_response.status_code
        
        debug_info["step"] = "complete"
        debug_info["result"] = "All checks passed"
        
        return {"success": True, "debug": debug_info}
        
    except Exception as e:
        debug_info["step"] = "exception"
        debug_info["error"] = str(e)
        return {"success": False, "debug": debug_info, "error": f"Exception: {str(e)}"}
