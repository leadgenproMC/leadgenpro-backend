"""
AUTH ROUTER FUNCIONAL - SISTEMA SIMPLE Y SEGURO
============================================

Características:
- ✅ Contraseña en texto plano (temporal)
- ✅ Login funcional
- ✅ Verificación por token
- ✅ Rate limiting
- ✅ Logs completos
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
import secrets
import time
from datetime import datetime, timedelta
import logging

print("🔒 AUTH ROUTER FUNCIONAL V3.0 CARGADO")

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

# Storage simple
USERS = {}
TOKENS = {}
RATE_LIMIT = {}

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    company: Optional[str] = None
    agreed_to_terms: bool

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    company: Optional[str] = None
    created_at: str
    verified: bool
    verified_at: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    verification_token: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None
    verification_required: Optional[bool] = None

def check_rate_limit(identifier: str, max_requests: int = 5, window_minutes: int = 15) -> bool:
    """Rate limiting."""
    now = time.time()
    window_start = now - (window_minutes * 60)
    
    if identifier not in RATE_LIMIT:
        RATE_LIMIT[identifier] = []
    
    # Limpiar requests viejas
    RATE_LIMIT[identifier] = [req_time for req_time in RATE_LIMIT[identifier] if req_time > window_start]
    
    # Verificar límite
    if len(RATE_LIMIT[identifier]) >= max_requests:
        logger.warning(f"🚫 Rate limit exceeded for {identifier}")
        return False
    
    # Agregar request actual
    RATE_LIMIT[identifier].append(now)
    return True

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, http_request: Request):
    """Registro funcional."""
    try:
        # Rate limiting
        client_ip = http_request.client.host
        if not check_rate_limit(client_ip):
            return AuthResponse(
                success=False,
                error="Demasiados intentos. Por favor espera 15 minutos."
            )
        
        # Validaciones
        if not request.agreed_to_terms:
            return AuthResponse(
                success=False,
                error="Debes aceptar las Condiciones de Uso"
            )
        
        if len(request.password) < 6:
            return AuthResponse(
                success=False,
                error="La contraseña debe tener al menos 6 caracteres"
            )
        
        if request.email in USERS:
            return AuthResponse(
                success=False,
                error="El email ya está registrado"
            )
        
        # Generar datos
        user_id = f"user_{int(time.time())}_{secrets.token_hex(8)}"
        verification_token = secrets.token_urlsafe(32)
        
        # Crear usuario NO VERIFICADO (contraseña en texto plano temporal)
        user_data = {
            "id": user_id,
            "email": request.email,
            "password": request.password,  # TEMPORAL: texto plano
            "name": request.name,
            "company": request.company,
            "created_at": datetime.utcnow().isoformat(),
            "verified": False,
            "verified_at": None,
            "ip_address": client_ip
        }
        
        # Guardar usuario y token
        USERS[request.email] = user_data
        TOKENS[verification_token] = {
            "email": request.email,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
        
        logger.info(f"✅ [REGISTER] Usuario creado: {request.email}")
        logger.info(f"📧 [REGISTER] Token: {verification_token[:20]}...")
        
        return AuthResponse(
            success=True,
            user=UserResponse(**user_data),
            verification_token=verification_token,
            message="Registro completado. Por favor verifica tu email."
        )
        
    except Exception as e:
        logger.error(f"❌ [REGISTER ERROR] {e}")
        return AuthResponse(
            success=False,
            error=f"Error en registro: {str(e)}"
        )

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, http_request: Request):
    """Login funcional con verificación."""
    try:
        # Rate limiting
        client_ip = http_request.client.host
        if not check_rate_limit(client_ip):
            return AuthResponse(
                success=False,
                error="Demasiados intentos. Por favor espera 15 minutos."
            )
        
        if request.email not in USERS:
            return AuthResponse(
                success=False,
                error="Usuario no encontrado"
            )
        
        user_data = USERS[request.email]
        
        # Verificar contraseña (texto plano temporal)
        if request.password != user_data["password"]:
            logger.warning(f"🚫 [LOGIN] Contraseña incorrecta: {request.email}")
            logger.warning(f"🔍 [LOGIN] Esperaba: {user_data['password']}")
            logger.warning(f"🔍 [LOGIN] Recibió: {request.password}")
            return AuthResponse(
                success=False,
                error="Contraseña incorrecta"
            )
        
        # FILTRO DE VERIFICACIÓN - BLOQUEAR SI NO ESTÁ VERIFICADO
        if not user_data.get("verified", False):
            logger.warning(f"🚫 [LOGIN] Usuario NO VERIFICADO: {request.email}")
            return AuthResponse(
                success=False,
                error="Por favor verifica tu email antes de iniciar sesión",
                verification_required=True
            )
        
        logger.info(f"✅ [LOGIN] Usuario verificado: {request.email}")
        
        return AuthResponse(
            success=True,
            user=UserResponse(**user_data),
            token=secrets.token_urlsafe(32),
            message="Login completado exitosamente"
        )
        
    except Exception as e:
        logger.error(f"❌ [LOGIN ERROR] {e}")
        return AuthResponse(
            success=False,
            error=f"Error en login: {str(e)}"
        )

@router.post("/verify-email", response_model=AuthResponse)
async def verify_email(request: dict, http_request: Request):
    """Verificar email usando token."""
    try:
        token = request.get("token")
        
        if not token:
            return AuthResponse(
                success=False,
                error="Token de verificación requerido"
            )
        
        # Verificar si token existe
        if token not in TOKENS:
            return AuthResponse(
                success=False,
                error="Token inválido o expirado"
            )
        
        token_data = TOKENS[token]
        email = token_data["email"]
        
        # Verificar expiración
        if datetime.utcnow() > datetime.fromisoformat(token_data["expires_at"]):
            del TOKENS[token]
            return AuthResponse(
                success=False,
                error="Token expirado. Por favor solicita uno nuevo."
            )
        
        if email not in USERS:
            return AuthResponse(
                success=False,
                error="Usuario no encontrado"
            )
        
        user_data = USERS[email]
        
        # MARCAR COMO VERIFICADO
        user_data["verified"] = True
        user_data["verified_at"] = datetime.utcnow().isoformat()
        user_data["verified_ip"] = http_request.client.host
        
        # LIMPIAR TOKEN
        del TOKENS[token]
        
        logger.info(f"✅ [VERIFY] Email verificado: {email}")
        
        return AuthResponse(
            success=True,
            user=UserResponse(**user_data),
            token=secrets.token_urlsafe(32),
            message="Email verificado exitosamente"
        )
        
    except Exception as e:
        logger.error(f"❌ [VERIFY ERROR] {e}")
        return AuthResponse(
            success=False,
            error=f"Error en verificación: {str(e)}"
        )

@router.post("/resend-verification", response_model=AuthResponse)
async def resend_verification(request: dict, http_request: Request):
    """Reenviar email de verificación."""
    try:
        email = request.get("email")
        
        if not email:
            return AuthResponse(
                success=False,
                error="Email requerido"
            )
        
        if email not in USERS:
            return AuthResponse(
                success=False,
                error="Usuario no encontrado"
            )
        
        user_data = USERS[email]
        
        if user_data.get("verified", False):
            return AuthResponse(
                success=False,
                error="El email ya está verificado"
            )
        
        # Rate limiting
        if not check_rate_limit(email, max_requests=3, window_minutes=60):
            return AuthResponse(
                success=False,
                error="Demasiados intentos de reenvío. Por favor espera 1 hora."
            )
        
        # Generar nuevo token
        verification_token = secrets.token_urlsafe(32)
        
        # Actualizar token
        TOKENS[verification_token] = {
            "email": email,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
        
        logger.info(f"📧 [RESEND] Email reenviado: {email}")
        logger.info(f"📧 [RESEND] Nuevo token: {verification_token[:20]}...")
        
        return AuthResponse(
            success=True,
            verification_token=verification_token,
            message="Email de verificación reenviado exitosamente"
        )
        
    except Exception as e:
        logger.error(f"❌ [RESEND ERROR] {e}")
        return AuthResponse(
            success=False,
            error=f"Error reenviando email: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check."""
    verified_users = len([u for u in USERS.values() if u.get("verified", False)])
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "total_users": len(USERS),
        "verified_users": verified_users,
        "pending_verifications": len(TOKENS),
        "rate_limit_entries": len(RATE_LIMIT),
        "version": "working-v3.0",
        "auth_mode": "plaintext_temporal"
    }

@router.get("/stats")
async def get_stats():
    """Estadísticas."""
    verified_users = len([u for u in USERS.values() if u.get("verified", False)])
    return {
        "users": {
            "total": len(USERS),
            "verified": verified_users,
            "pending": len([u for u in USERS.values() if not u.get("verified", False)])
        },
        "tokens": {
            "active": len(TOKENS)
        },
        "security": {
            "rate_limit_entries": len(RATE_LIMIT),
            "password_mode": "plaintext_temporal"
        },
        "timestamp": datetime.utcnow().isoformat(),
        "system": "leadgenpro-working"
    }
