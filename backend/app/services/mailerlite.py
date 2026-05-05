"""
Servicio de integración con MailerLite (New API) para LeadGenPro.

Usa la API REST directa de New MailerLite (https://dashboard.mailerlite.com)
documentación: https://developers.mailerlite.com/
"""

import os
import requests
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("MAILERLITE_API_KEY")
_base_url = "https://connect.mailerlite.com/api"


def _get_headers() -> Dict[str, str]:
    """Retorna headers para autenticación."""
    return {
        "Authorization": f"Bearer {_api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }


def is_configured() -> bool:
    """Verifica si MailerLite está configurado."""
    return bool(_api_key)


def subscribe_lead(
    email: str,
    name: str,
    fields: Optional[Dict[str, Any]] = None,
    groups: Optional[List[str]] = None
) -> Dict:
    """Suscribe un lead a MailerLite."""
    if not _api_key:
        return {"success": False, "error": "MailerLite no configurado"}
    
    try:
        payload = {
            "email": email,
            "fields": {"name": name}
        }
        
        if fields:
            payload["fields"].update(fields)
        if groups:
            payload["groups"] = groups
        
        response = requests.post(
            f"{_base_url}/subscribers",
            headers=_get_headers(),
            json=payload,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            data = response.json().get("data", {})
            return {
                "success": True,
                "subscriber_id": data.get("id"),
                "email": data.get("email"),
                "status": data.get("status", "active")
            }
        elif response.status_code == 422:
            return {"success": False, "error": "El suscriptor ya existe"}
        else:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_groups() -> List[Dict]:
    """Obtiene la lista de grupos disponibles."""
    if not _api_key:
        return []
    
    try:
        response = requests.get(
            f"{_base_url}/groups",
            headers=_get_headers(),
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json().get("data", [])
            return [{"id": g.get("id"), "name": g.get("name"), "total": g.get("total", 0)} for g in data]
        return []
        
    except Exception as e:
        print(f"[MailerLite] Error: {e}")
        return []


def verify_connection() -> Dict:
    """Verifica que la conexión con MailerLite funciona."""
    if not _api_key:
        return {"success": False, "error": "No hay API key configurada"}
    
    try:
        response = requests.get(
            f"{_base_url}/subscribers",
            headers=_get_headers(),
            params={"limit": 1},
            timeout=30
        )
        
        if response.status_code == 200:
            return {"success": True, "message": "Conexión exitosa"}
        elif response.status_code == 401:
            return {"success": False, "error": "API key inválida"}
        else:
            return {"success": False, "error": f"HTTP {response.status_code}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}



def get_subscriber(email: str) -> Optional[Dict]:
    """Obtiene información de un suscriptor por email."""
    if not _api_key:
        return None
    
    try:
        response = requests.get(
            f"{_base_url}/subscribers/{email}",
            headers=_get_headers(),
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json().get("data")
        return None
        
    except Exception as e:
        if "not found" in str(e).lower():
            return None
        print(f"[MailerLite] Error obteniendo suscriptor: {e}")
        return None


def update_subscriber(
    email: str,
    name: Optional[str] = None,
    fields: Optional[Dict[str, Any]] = None,
    status: Optional[str] = None
) -> Dict:
    """Actualiza un suscriptor existente."""
    if not _api_key:
        return {"success": False, "error": "MailerLite no configurado"}
    
    try:
        payload = {"fields": {}}
        
        if name:
            payload["fields"]["name"] = name
        if fields:
            payload["fields"].update(fields)
        if status:
            payload["status"] = status
        
        response = requests.put(
            f"{_base_url}/subscribers/{email}",
            headers=_get_headers(),
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json().get("data", {})
            return {
                "success": True,
                "subscriber_id": data.get("id"),
                "email": data.get("email")
            }
        else:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}


def create_group(name: str) -> Dict:
    """Crea un nuevo grupo en MailerLite."""
    if not _api_key:
        return {"success": False, "error": "MailerLite no configurado"}
    
    try:
        response = requests.post(
            f"{_base_url}/groups",
            headers=_get_headers(),
            json={"name": name},
            timeout=30
        )
        
        if response.status_code == 201:
            data = response.json().get("data", {})
            return {
                "success": True,
                "group_id": data.get("id"),
                "name": data.get("name")
            }
        else:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_campaign_stats(campaign_id: str) -> Dict:
    """Obtiene estadísticas de una campaña."""
    if not _api_key:
        return {}
    
    try:
        response = requests.get(
            f"{_base_url}/campaigns/{campaign_id}/stats",
            headers=_get_headers(),
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json().get("data", {})
            return {
                "sent": data.get("sent_count", 0),
                "opens": data.get("open_count", 0),
                "clicks": data.get("click_count", 0),
                "unsubscribed": data.get("unsubscribe_count", 0),
                "open_rate": data.get("open_rate", 0),
                "click_rate": data.get("click_rate", 0)
            }
        return {}
        
    except Exception as e:
        print(f"[MailerLite] Error obteniendo estadísticas: {e}")
        return {}


def sync_lead_from_supabase(user_id: str, group_id: Optional[str] = None) -> Dict:
    """Sincroniza un lead desde Supabase a MailerLite."""
    from app.services.supabase_client import get_supabase
    
    supabase = get_supabase()
    if not supabase:
        return {"success": False, "error": "Supabase no configurado"}
    
    try:
        # Obtener lead de Supabase
        result = supabase.table("leads").select("*").eq("user_id", user_id).execute()
        
        if not result.data:
            return {"success": False, "error": "Lead no encontrado en Supabase"}
        
        lead = result.data[0]
        
        # Suscribir a MailerLite
        groups = [group_id] if group_id else None
        
        return subscribe_lead(
            email=lead.get("email"),
            name=lead.get("name", ""),
            fields={
                "city": lead.get("location", ""),
                "company": lead.get("company", ""),
                "phone": lead.get("phone", "")
            },
            groups=groups
        )
        
    except Exception as e:
        return {"success": False, "error": str(e)}


def add_lead_from_chat(
    email: str,
    name: str,
    company: str = "",
    location: str = "",
    notes: str = ""
) -> Dict:
    """Agrega un lead capturado por el chatbot a MailerLite."""
    return subscribe_lead(
        email=email,
        name=name,
        fields={
            "company": company,
            "city": location,
            "last_noted": notes[:255] if notes else "Capturado por LeadGenPro Bot"
        }
    )
