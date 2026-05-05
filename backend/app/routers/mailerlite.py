"""
Router para endpoints de MailerLite.

Proporciona endpoints para:
- Suscribir leads
- Gestionar suscriptores
- Sincronizar con Supabase
- Obtener estadísticas
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any

from app.services import mailerlite

router = APIRouter(prefix="/mailerlite", tags=["mailerlite"])


class SubscribeRequest(BaseModel):
    email: EmailStr
    name: str
    fields: Optional[Dict[str, Any]] = None
    groups: Optional[List[str]] = None


class UpdateSubscriberRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    fields: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class SyncLeadRequest(BaseModel):
    user_id: str
    group_id: Optional[str] = None


class CreateGroupRequest(BaseModel):
    name: str


@router.get("/status")
def get_mailerlite_status():
    """Verifica si MailerLite está configurado."""
    return {
        "configured": mailerlite.is_configured(),
        "message": "MailerLite configurado" if mailerlite.is_configured() else "Falta MAILERLITE_API_KEY en .env"
    }


@router.get("/groups")
def get_groups():
    """Obtiene la lista de grupos/listas de correo."""
    if not mailerlite.is_configured():
        raise HTTPException(status_code=503, detail="MailerLite no configurado")
    
    groups = mailerlite.get_groups()
    return {"groups": groups}


@router.post("/create-group")
def create_group(request: CreateGroupRequest):
    """Crea un nuevo grupo en MailerLite."""
    if not mailerlite.is_configured():
        raise HTTPException(status_code=503, detail="MailerLite no configurado")
    
    result = mailerlite.create_group(request.name)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.post("/subscribe")
def subscribe_lead(request: SubscribeRequest):
    """
    Suscribe un nuevo lead a MailerLite.
    
    - **email**: Email del lead (requerido)
    - **name**: Nombre completo (requerido)
    - **fields**: Campos adicionales como ciudad, empresa, teléfono
    - **groups**: Lista de IDs de grupos para asignar
    """
    if not mailerlite.is_configured():
        raise HTTPException(status_code=503, detail="MailerLite no configurado")
    
    result = mailerlite.subscribe_lead(
        email=request.email,
        name=request.name,
        fields=request.fields,
        groups=request.groups
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.get("/subscriber/{email}")
def get_subscriber(email: str):
    """Obtiene información de un suscriptor por email."""
    if not mailerlite.is_configured():
        raise HTTPException(status_code=503, detail="MailerLite no configurado")
    
    subscriber = mailerlite.get_subscriber(email)
    if not subscriber:
        raise HTTPException(status_code=404, detail="Suscriptor no encontrado")
    
    return subscriber


@router.put("/subscriber/{email}")
def update_subscriber(email: str, request: UpdateSubscriberRequest):
    """Actualiza un suscriptor existente."""
    if not mailerlite.is_configured():
        raise HTTPException(status_code=503, detail="MailerLite no configurado")
    
    result = mailerlite.update_subscriber(
        email=email,
        name=request.name,
        fields=request.fields,
        status=request.status
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.post("/sync-from-supabase")
def sync_from_supabase(request: SyncLeadRequest):
    """
    Sincroniza un lead desde Supabase a MailerLite.
    
    - **user_id**: ID del usuario en Supabase
    - **group_id**: ID del grupo de MailerLite (opcional)
    """
    if not mailerlite.is_configured():
        raise HTTPException(status_code=503, detail="MailerLite no configurado")
    
    result = mailerlite.sync_lead_from_supabase(
        user_id=request.user_id,
        group_id=request.group_id
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.post("/add-from-chat")
def add_from_chat(request: SubscribeRequest):
    """
    Agrega un lead capturado por el chatbot.
    Endpoint optimizado para integración con el bot de ventas.
    """
    if not mailerlite.is_configured():
        raise HTTPException(status_code=503, detail="MailerLite no configurado")
    
    result = mailerlite.add_lead_from_chat(
        email=request.email,
        name=request.name,
        company=request.fields.get("company", "") if request.fields else "",
        location=request.fields.get("city", "") if request.fields else "",
        notes=request.fields.get("last_noted", "") if request.fields else ""
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result
