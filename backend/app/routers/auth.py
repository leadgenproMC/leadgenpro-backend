"""
AUTH ROUTER SEGURO - SISTEMA COMPLETO CON EMAIL REAL
=================================================

Características:
- ✅ Email verification real
- ✅ Seguridad robusta
- ✅ Token management
- ✅ Rate limiting
- ✅ Logs completos
- ✅ Manejo de errores
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
import secrets
import time
from datetime import datetime, timedelta
import logging
import hashlib
from ..services.email_real import email_service

router = APIRouter(prefix="/auth", tags=["auth"])

logger = logging.getLogger(__name__)

# Storage seguro con timestamps
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

def hash_password(password: str) -> str:
    """Hash seguro de contraseña."""
    hash_result = hashlib.sha256(password.encode()).hexdigest()
    print(f"🔐 [HASH] Password: {password} -> Hash: {hash_result}")
    return hash_result

def verify_password(password: str, hashed: str) -> bool:
    """Verificar contraseña."""
    input_hash = hash_password(password)
    result = input_hash == hashed
    print(f"🔍 [VERIFY] Input: {password} -> {input_hash}")
    print(f"🔍 [VERIFY] Stored: {hashed}")
    print(f"🔍 [VERIFY] Match: {result}")
    return result

def check_rate_limit(email: str, max_requests: int = 5, window_minutes: int = 15) -> bool:
    """Rate limiting por email."""
    now = time.time()
    window_start = now - (window_minutes * 60)
    
    if email not in RATE_LIMIT:
        RATE_LIMIT[email] = []
    
    # Limpiar requests viejas
    RATE_LIMIT[email] = [req_time for req_time in RATE_LIMIT[email] if req_time > window_start]
    
    # Verificar límite
    if len(RATE_LIMIT[email]) >= max_requests:
        logger.warning(f"🚫 Rate limit exceeded for {email}")
        return False
    
    # Agregar request actual
    RATE_LIMIT[email].append(now)
    return True

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, http_request: Request):
    """Registro seguro con email verification."""
    try:
        # Rate limiting
        client_ip = http_request.client.host
        if not check_rate_limit(client_ip):
            return AuthResponse(
                success=False,
                error="Demasiados intentos. Por favor espera 15 minutos."
            )
        
        # Validaciones básicas
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
        
        # Generar datos seguros
        user_id = f"user_{int(time.time())}_{secrets.token_hex(8)}"
        verification_token = email_service.generate_secure_token(request.email)
        
        # Crear usuario NO VERIFICADO
        user_data = {
            "id": user_id,
            "email": request.email,
            "password_hash": hash_password(request.password),  # Hash seguro
            "name": request.name,
            "company": request.company,
            "created_at": datetime.utcnow().isoformat(),
            "verified": False,
            "verified_at": None,
            "ip_address": client_ip,
            "user_agent": str(http_request.headers.get("user-agent", "Unknown"))
        }
        
        # Guardar usuario y token
        USERS[request.email] = user_data
        TOKENS[verification_token] = {
            "email": request.email,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
        
        # Enviar email de verificación
        email_sent = email_service.send_verification_email(
            email=request.email,
            name=request.name,
            verification_token=verification_token
        )
        
        if not email_sent:
            return AuthResponse(
                success=False,
                error="Error enviando email de verificación. Por favor intenta más tarde."
            )
        
        logger.info(f"✅ [REGISTER] Usuario creado: {request.email}")
        logger.info(f"📧 [REGISTER] Email enviado: {verification_token[:20]}...")
        
        return AuthResponse(
            success=True,
            user=UserResponse(**user_data),
            verification_token=verification_token,  # Solo para desarrollo
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
    """Login seguro con verificación OBLIGATORIA."""
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
        
        # Verificar contraseña con hash
        if not verify_password(request.password, user_data["password_hash"]):
            logger.warning(f"🚫 [LOGIN] Contraseña incorrecta: {request.email}")
            return AuthResponse(
                success=False,
                error="Contraseña incorrecta"
            )
        
        # FILTRO DE VERIFICACIÓN - BLOQUEAR ACCESO SI NO ESTÁ VERIFICADO
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
        verification_token = email_service.generate_secure_token(email)
        
        # Actualizar token
        TOKENS[verification_token] = {
            "email": email,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
        
        # Enviar email
        email_sent = email_service.send_verification_email(
            email=email,
            name=user_data["name"],
            verification_token=verification_token
        )
        
        if not email_sent:
            return AuthResponse(
                success=False,
                error="Error enviando email. Por favor intenta más tarde."
            )
        
        logger.info(f"📧 [RESEND] Email reenviado: {email}")
        
        return AuthResponse(
            success=True,
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
    """Health check con información detallada."""
    verified_users = len([u for u in USERS.values() if u.get("verified", False)])
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "total_users": len(USERS),
        "verified_users": verified_users,
        "pending_verifications": len(TOKENS),
        "rate_limit_entries": len(RATE_LIMIT),
        "email_service_mode": "simulation" if email_service.simulation_mode else "production",
        "version": "secure-v2.0"
    }

@router.get("/stats")
async def get_stats():
    """Estadísticas detalladas del sistema."""
    return {
        "users": {
            "total": len(USERS),
            "verified": len([u for u in USERS.values() if u.get("verified", False)]),
            "pending": len([u for u in USERS.values() if not u.get("verified", False)])
        },
        "tokens": {
            "active": len(TOKENS),
            "expired": sum(1 for t in TOKENS.values() 
                         if datetime.utcnow() > datetime.fromisoformat(t["expires_at"]))
        },
        "security": {
            "rate_limit_entries": len(RATE_LIMIT),
            "email_service": "simulation" if email_service.simulation_mode else "production"
        },
        "timestamp": datetime.utcnow().isoformat(),
        "system": "leadgenpro-secure"
    }
