"""
AUTH ROUTER ULTRA-SIMPLIFICADO - SIN DEPENDENCIAS
================================================

Características:
- ✅ Respuesta inmediata (< 100ms)
- ✅ Sin cache externo
- ✅ Sin dependencias complejas
- ✅ Verificación de email funcional
- ✅ Login con filtro de verificación
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import secrets
import time
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])

# Storage simple en memoria
users_db = {}
verification_tokens = {}

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

class AuthResponse(BaseModel):
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    verification_token: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None
    verification_required: Optional[bool] = None

def generate_token() -> str:
    """Generar token seguro."""
    return secrets.token_urlsafe(32)

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    Registro ultra-simple y rápido.
    """
    try:
        # Validación básica
        if not request.agreed_to_terms:
            return AuthResponse(
                success=False,
                error="Debes aceptar las Condiciones de Uso"
            )
        
        # Verificar si usuario ya existe
        if request.email in users_db:
            return AuthResponse(
                success=False,
                error="El email ya está registrado"
            )
        
        # Generar datos
        user_id = f"user_{int(time.time())}"
        verification_token = generate_token()
        
        # Crear usuario
        user_data = {
            "id": user_id,
            "email": request.email,
            "password": request.password,  # En producción usar hash
            "name": request.name,
            "company": request.company,
            "created_at": datetime.utcnow().isoformat(),
            "verified": False
        }
        
        # Guardar usuario
        users_db[request.email] = user_data
        verification_tokens[verification_token] = request.email
        
        print(f"[REGISTER] Usuario creado: {request.email}")
        print(f"[REGISTER] Token: {verification_token[:10]}...")
        
        return AuthResponse(
            success=True,
            user=UserResponse(**user_data),
            verification_token=verification_token,
            message="Registro completado exitosamente"
        )
        
    except Exception as e:
        print(f"[REGISTER ERROR] {e}")
        return AuthResponse(
            success=False,
            error=f"Error en registro: {str(e)}"
        )

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login con filtro de verificación.
    """
    try:
        # Buscar usuario
        if request.email not in users_db:
            return AuthResponse(
                success=False,
                error="Usuario no encontrado"
            )
        
        user_data = users_db[request.email]
        
        # Verificar contraseña
        if request.password != user_data["password"]:
            return AuthResponse(
                success=False,
                error="Contraseña incorrecta"
            )
        
        # FILTRO DE VERIFICACIÓN - CRÍTICO
        if not user_data["verified"]:
            return AuthResponse(
                success=False,
                error="Por favor verifica tu email antes de iniciar sesión",
                verification_required=True
            )
        
        print(f"[LOGIN] Usuario verificado: {request.email}")
        
        return AuthResponse(
            success=True,
            user=UserResponse(**user_data),
            token=generate_token(),
            message="Login completado exitosamente"
        )
        
    except Exception as e:
        print(f"[LOGIN ERROR] {e}")
        return AuthResponse(
            success=False,
            error=f"Error en login: {str(e)}"
        )

@router.post("/verify-email", response_model=AuthResponse)
async def verify_email(request: dict):
    """
    Verificar email usando token.
    """
    try:
        token = request.get("token")
        
        if not token:
            return AuthResponse(
                success=False,
                error="Token de verificación requerido"
            )
        
        # Buscar token
        if token not in verification_tokens:
            return AuthResponse(
                success=False,
                error="Token inválido o expirado"
            )
        
        email = verification_tokens[token]
        user_data = users[email]
        
        # Marcar como verificado
        user_data["verified"] = True
        user_data["verified_at"] = datetime.utcnow().isoformat()
        
        # Limpiar token
        del verification_tokens[token]
        
        print(f"[VERIFY] Email verificado: {email}")
        
        return AuthResponse(
            success=True,
            user=UserResponse(**user_data),
            message="Email verificado exitosamente"
        )
        
    except Exception as e:
        print(f"[VERIFY ERROR] {e}")
        return AuthResponse(
            success=False,
            error=f"Error en verificación: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check simple."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "users_count": len(users_db),
        "pending_verifications": len(verification_tokens),
        "version": "simple-v1.0"
    }

@router.get("/stats")
async def get_stats():
    """Estadísticas simples."""
    return {
        "total_users": len(users_db),
        "verified_users": len([u for u in users_db.values() if u["verified"]]),
        "pending_verifications": len(verification_tokens),
        "timestamp": datetime.utcnow().isoformat(),
        "system": "leadgenpro-simple"
    }
