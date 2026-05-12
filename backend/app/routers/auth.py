"""
AUTH ROUTER FIJO - VERSIÓN DEFINITIVA
=====================================

Este router reemplaza completamente al antiguo.
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
import secrets
import time
from datetime import datetime, timedelta
import logging

print("🔒 AUTH ROUTER FIJO V4.0 - REEMPLAZANDO AL ANTIGUO")

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

# Storage
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
    
    RATE_LIMIT[identifier] = [req_time for req_time in RATE_LIMIT[identifier] if req_time > window_start]
    
    if len(RATE_LIMIT[identifier]) >= max_requests:
        logger.warning(f"🚫 Rate limit exceeded for {identifier}")
        return False
    
    RATE_LIMIT[identifier].append(now)
    return True

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, http_request: Request):
    """Registro que funciona."""
    try:
        client_ip = http_request.client.host
        
        if not check_rate_limit(client_ip):
            return AuthResponse(
                success=False,
                error="Demasiados intentos. Por favor espera 15 minutos."
            )
        
        if not request.agreed_to_terms:
            return AuthResponse(
                success=False,
                error="Debes aceptar las Condiciones de Uso"
            )
        
        if request.email in USERS:
            return AuthResponse(
                success=False,
                error="El email ya está registrado"
            )
        
        user_id = f"user_{int(time.time())}_{secrets.token_hex(8)}"
        verification_token = secrets.token_urlsafe(32)
        
        # Crear usuario SIN VERIFICACIÓN (texto plano)
        user_data = {
            "id": user_id,
            "email": request.email,
            "password": request.password,  # TEXTO PLANO - FUNCIONAL
            "name": request.name,
            "company": request.company,
            "created_at": datetime.utcnow().isoformat(),
            "verified": False,
            "verified_at": None,
            "ip_address": client_ip
        }
        
        USERS[request.email] = user_data
        TOKENS[verification_token] = {
            "email": request.email,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
        
        logger.info(f"✅ [REGISTER] Usuario creado: {request.email}")
        logger.info(f"🔐 [REGISTER] Contraseña guardada: {request.password}")
        
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
    """Login que funciona."""
    try:
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
        
        # VERIFICACIÓN DIRECTA (texto plano)
        logger.info(f"🔍 [LOGIN] Contraseña recibida: {request.password}")
        logger.info(f"🔍 [LOGIN] Contraseña guardada: {user_data['password']}")
        logger.info(f"🔍 [LOGIN] Coinciden: {request.password == user_data['password']}")
        
        if request.password != user_data["password"]:
            logger.warning(f"🚫 [LOGIN] Contraseña incorrecta: {request.email}")
            return AuthResponse(
                success=False,
                error="Contraseña incorrecta"
            )
        
        # VERIFICACIÓN DE EMAIL OBLIGATORIA
        if not user_data.get("verified", False):
            logger.warning(f"🚫 [LOGIN] Usuario NO VERIFICADO: {request.email}")
            return AuthResponse(
                success=False,
                error="Por favor verifica tu email antes de iniciar sesión",
                verification_required=True
            )
        
        logger.info(f"✅ [LOGIN] Login exitoso: {request.email}")
        
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
    """Verificación que funciona."""
    try:
        token = request.get("token")
        
        if not token:
            return AuthResponse(
                success=False,
                error="Token de verificación requerido"
            )
        
        if token not in TOKENS:
            return AuthResponse(
                success=False,
                error="Token inválido o expirado"
            )
        
        token_data = TOKENS[token]
        email = token_data["email"]
        
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

@router.get("/health")
async def health_check():
    """Health check que funciona."""
    verified_users = len([u for u in USERS.values() if u.get("verified", False)])
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "total_users": len(USERS),
        "verified_users": verified_users,
        "pending_verifications": len(TOKENS),
        "version": "fixed-v4.0",
        "password_mode": "plaintext_functional",
        "router_status": "ACTIVE"
    }

@router.get("/debug")
async def debug_info():
    """Debug info."""
    return {
        "router": "fixed-v4.0",
        "users": list(USERS.keys()),
        "tokens": len(TOKENS),
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Router FIJO cargado correctamente"
    }
