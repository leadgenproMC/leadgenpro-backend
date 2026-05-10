"""
Router de autenticación para LeadGenPro.
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
    """Genera hash bcrypt de una contraseña."""
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
        "email_confirm": False,
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
                error_msg = error_data.get("msg", "Usuario ya existe o datos inválidos")
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
            logger.error("[Direct API] Timeout después de todos los intentos")
            # Intentar con librería supabase como último recurso
            return sign_up_with_supabase_lib(email, password, user_metadata)
            
        except requests.exceptions.ConnectionError as e:
            logger.warning(f"[Direct API] Error DNS en intento {attempt + 1}: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            logger.error(f"[Direct API] Error DNS después de todos los intentos")
            # Intentar con librería supabase como último recurso
            return sign_up_with_supabase_lib(email, password, user_metadata)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"[Direct API] Error de conexión: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return None, f"Error de conexión: {str(e)}"
            
        except Exception as e:
            logger.error(f"[Direct API] Error inesperado: {str(e)}")
            return None, f"Error inesperado: {str(e)}"
    
    return None, "Error desconocido después de reintentos"


def sign_up_with_supabase_lib(email: str, password: str, user_metadata: dict) -> tuple:
    """
    Fallback usando la librería de Supabase si requests falla.
    """
    try:
        logger.info("[Fallback] Intentando con librería Supabase...")
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
    Verifica si una contraseña fue usada anteriormente por el usuario.
    Retorna True si la contraseña es nueva (no usada antes), False si ya fue usada.
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
                logger.warning(f"Contraseña previamente usada detectada para usuario {user_id}")
                return False  # Contraseña ya fue usada
        
        return True  # No coincide con ninguna del historial
        
    except Exception as e:
        logger.error(f"Error verificando historial de contraseñas: {str(e)}")
        return True  # En caso de error, permitimos el cambio


def save_password_to_history(supabase, user_id: str, password: str, reason: str = "reset"):
    """Guarda el hash de una contraseña en el historial."""
    try:
        password_hash = hash_password(password)
        supabase.table("password_history").insert({
            "user_id": user_id,
            "password_hash": password_hash,
            "reason": reason,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        logger.info(f"Contraseña guardada en historial para usuario {user_id}")
    except Exception as e:
        logger.error(f"Error guardando contraseña en historial: {str(e)}")


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
    """Respuesta de autenticación."""
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    otp_code: Optional[str] = None
    error: Optional[str] = None


@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest):
    """
    Registra un nuevo usuario con nombre.
    
    - **email**: Email del usuario (requerido)
    - **password**: Contraseña (mínimo 6 caracteres)
    - **name**: Nombre completo del usuario (requerido)
    - **agreed_to_terms**: Debe ser `true` para aceptar las Condiciones de Uso (obligatorio)
    """
    logger.info(f"=== INICIANDO REGISTRO ===")
    logger.info(f"Email: {request.email}, Name: {request.name}, Company: {request.company}")
    
    # Validar que aceptó las condiciones
    if not request.agreed_to_terms:
        logger.warning("Registro rechazado: agreed_to_terms es False")
        return AuthResponse(success=False, error="Debes aceptar las Condiciones de Uso para crear la cuenta")
    
    supabase = get_supabase()
    if not supabase:
        logger.error("Supabase no configurado - get_supabase() retornó None")
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    logger.info("Supabase client obtenido correctamente")
    
    # Usar API REST directa para evitar timeout de la librería
    user_metadata = {
        "name": request.name,
        "company": request.company,
        "agreed_to_terms": request.agreed_to_terms
    }
    
    user_id, error = sign_up_user_direct(request.email, request.password, user_metadata)
    
    if error:
        logger.error(f"Error en registro directo: {error}")
        return AuthResponse(success=False, error=f"Error en registro: {error}")
    
    logger.info(f"Usuario creado exitosamente via API directa: {user_id}")
    
    # Guardar datos adicionales en tabla users
    try:
        logger.info(f"Insertando en tabla users - ID: {user_id}")
        insert_result = supabase.table("users").insert({
            "id": user_id,
            "email": request.email,
            "name": request.name,
            "company": request.company,
            "agreed_to_terms": request.agreed_to_terms,
            "created_at": datetime.utcnow().isoformat(),
            "email_confirmed": False  # Marcar como no confirmado
        }).execute()
        logger.info(f"Insert en tabla users exitoso: {insert_result}")
    except Exception as insert_err:
        logger.error(f"ERROR al insertar en tabla users: {str(insert_err)}")
        # No fallamos aquí, el usuario ya fue creado en Auth
    
    # Generar código OTP de verificación
    otp_code = None
    try:
        from ..services.email_service import create_otp_code
        otp_code = create_otp_code(user_id, request.email, request.name)
        if otp_code:
            logger.info(f"[REGISTRO] Código OTP generado para {request.email}: {otp_code}")
        else:
            logger.warning(f"[REGISTRO] No se pudo generar código OTP para {request.email}")
    except Exception as otp_err:
        logger.error(f"[REGISTRO] Error generando código OTP: {str(otp_err)}")
    
    return AuthResponse(
        success=True,
        user=UserResponse(
            id=user_id,
            email=request.email,
            name=request.name,
            company=request.company,
            created_at=datetime.utcnow().isoformat()
        ),
        token=None,
        otp_code=otp_code  # Incluir código en la respuesta
    )


@router.post("/verify-otp")
def verify_otp(request: dict):
    """
    Verifica un código OTP numérico de 6 dígitos.
    
    - **email**: Email del usuario
    - **code**: Código de 6 dígitos
    """
    email = request.get("email")
    code = request.get("code")
    
    if not email or not code:
        return {"success": False, "message": "Email y código son requeridos"}
    
    from ..services.email_service import verify_otp_code
    success, message = verify_otp_code(email, code)
    
    return {"success": success, "message": message}


@router.post("/resend-otp")
def resend_otp(request: dict):
    """
    Genera y envía un nuevo código OTP al email.
    
    - **email**: Email del usuario
    """
    email = request.get("email")
    
    if not email:
        return {"success": False, "message": "Email es requerido"}
    
    from ..services.email_service import resend_otp_code
    success, message, new_code = resend_otp_code(email)
    
    if success and new_code:
        logger.info(f"[RESEND] Nuevo código generado para {email}: {new_code}")
    
    return {
        "success": success,
        "message": message,
        "debug_code": new_code if os.getenv("DEBUG") else None
    }


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest):
    """
    Inicia sesión y retorna datos del usuario incluyendo nombre.
    Verifica que el email esté confirmado antes de permitir acceso.
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
            
            # Verificar si el email está confirmado
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
            return AuthResponse(success=False, error="Credenciales inválidas")
            
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        return AuthResponse(success=False, error="Email o contraseña incorrectos")


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
    """Request para solicitar reset de contraseña."""
    email: EmailStr
    locale: str = "es"


class ResetPasswordRequest(BaseModel):
    """Request para resetear contraseña."""
    token: str
    password: str


class PasswordResetResponse(BaseModel):
    """Respuesta de reset de contraseña."""
    success: bool
    error: Optional[str] = None


@router.post("/forgot-password", response_model=PasswordResetResponse)
def forgot_password(request: ForgotPasswordRequest):
    """
    Envía email con enlace para restablecer contraseña.
    
    - **email**: Email del usuario registrado
    - **locale**: Idioma para el email (es/en)
    """
    logger.info(f"=== SOLICITUD DE RESET DE CONTRASEÑA ===")
    logger.info(f"Email: {request.email}, Locale: {request.locale}")
    
    supabase = get_supabase()
    if not supabase:
        logger.error("Supabase no configurado")
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    try:
        # Primero verificar si el usuario existe
        logger.info(f"Verificando si existe usuario con email: {request.email}")
        
        # Usar Supabase Auth para enviar email de recuperación
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
        # Retornamos el error real para debugging (en producción ocultar)
        return PasswordResetResponse(
            success=False,
            error=str(e)
        )


@router.post("/reset-password", response_model=PasswordResetResponse)
def reset_password(request: ResetPasswordRequest):
    """
    Cambia la contraseña del usuario usando token de recuperación.
    
    - **token**: Token de recuperación recibido por email
    - **password**: Nueva contraseña (mínimo 6 caracteres)
    
    Valida que la nueva contraseña no haya sido usada anteriormente.
    """
    logger.info(f"=== RESET DE CONTRASEÑA ===")
    
    if len(request.password) < 6:
        return PasswordResetResponse(success=False, error="PASSWORD_TOO_SHORT")
    
    supabase = get_supabase()
    if not supabase:
        logger.error("Supabase no configurado")
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    try:
        # Obtener el usuario actual (debe estar autenticado con el token de recuperación)
        # El token se valida automáticamente por Supabase cuando el usuario llega a la página
        
        # Primero intentamos obtener la sesión actual
        session_result = supabase.auth.get_session()
        user = getattr(session_result, 'user', None)
        
        if not user:
            logger.error("No hay sesión activa - el token puede haber expirado")
            return PasswordResetResponse(success=False, error="INVALID_OR_EXPIRED_TOKEN")
        
        user_id = user.id
        logger.info(f"Usuario autenticado para reset: {user_id}")
        
        # Verificar que la contraseña no fue usada antes
        is_new_password = verify_password_against_history(supabase, user_id, request.password)
        
        if not is_new_password:
            logger.warning(f"Usuario {user_id} intentó usar una contraseña previamente usada")
            return PasswordResetResponse(success=False, error="SAME_PASSWORD")
        
        # Actualizar contraseña en Supabase Auth
        result = supabase.auth.update_user({"password": request.password})
        
        if result.user:
            logger.info(f"Contraseña actualizada correctamente para usuario {user_id}")
            
            # Guardar la nueva contraseña en el historial
            save_password_to_history(supabase, user_id, request.password, reason="reset")
            
            return PasswordResetResponse(success=True)
        else:
            logger.error("No se pudo actualizar la contraseña")
            return PasswordResetResponse(success=False, error="UPDATE_FAILED")
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error actualizando contraseña: {error_msg}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return PasswordResetResponse(success=False, error=f"RESET_FAILED: {error_msg}")


@router.post("/verify-password-hash", response_model=PasswordResetResponse)
def verify_password_not_same(email: str, password: str):
    """
    Verifica que la nueva contraseña no sea igual a la anterior.
    Intenta hacer login con la nueva contraseña - si funciona, es la misma.
    """
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase no configurado")
    
    try:
        # Intentar login con la nueva contraseña
        # Si funciona, significa que es la misma contraseña actual
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        # Si llegamos aquí, el login funcionó -> misma contraseña
        if auth_response.user:
            return PasswordResetResponse(success=False, error="SAME_PASSWORD")
            
    except Exception:
        # El login falló -> contraseña es diferente -> OK
        return PasswordResetResponse(success=True)
    
    return PasswordResetResponse(success=True)


# ============ EMAIL CONFIRMATION ENDPOINTS ============

class SendConfirmationRequest(BaseModel):
    """Request para enviar email de confirmación."""
    email: EmailStr
    locale: Optional[str] = "es"


class VerifyConfirmationRequest(BaseModel):
    """Request para verificar token de confirmación."""
    token: str


@router.post("/send-confirmation")
def send_confirmation(request: SendConfirmationRequest):
    """
    Envía email de confirmación al usuario.
    """
    logger.info(f"Solicitud de confirmación para: {request.email}")
    
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
        return {"success": True, "message": "Si el email existe, recibirás un mensaje"}
    
    user = result.data[0]
    
    # Verificar si ya está confirmado
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
            "message": "Email de confirmación enviado",
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
    Verifica el token de confirmación de email.
    """
    logger.info(f"Verificando token: {request.token[:10]}...")
    
    success, message = verify_confirmation_token(request.token)
    
    return {
        "success": success,
        "message": message
    }


# ============ ENDPOINT DE DIAGNÓSTICO ============

@router.get("/test-supabase")
def test_supabase_connection():
    """
    Endpoint de diagnóstico para verificar la conexión con Supabase.
    Muestra información de configuración y estado.
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
            result["supabase_client"] = "NO CREADO - get_supabase() retornó None"
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
    ⚠️ USAR CON PRECAUCIÓN - Solo para desarrollo/testing.
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
        
        # 1. Eliminar tokens de confirmación
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
