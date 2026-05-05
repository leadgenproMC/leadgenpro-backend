from app.services.supabase_client import get_supabase
from typing import List, Dict

supabase = get_supabase()

def get_context(user_id: str, session_id: str = "default") -> List[Dict]:
    """Obtiene el historial de mensajes de una sesión."""
    if not supabase:
        return []
    
    try:
        response = supabase.table("chat_messages")\
            .select("role, content, created_at")\
            .eq("user_id", user_id)\
            .eq("session_id", session_id)\
            .order("created_at")\
            .limit(10)\
            .execute()
        
        messages = []
        for msg in response.data:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        return messages
    except Exception as e:
        print(f"Error getting context: {e}")
        return []

def save_message(user_id: str, session_id: str, role: str, content: str) -> bool:
    """Guarda un mensaje en la base de datos."""
    if not supabase:
        return False
    
    try:
        supabase.table("chat_messages").insert({
            "user_id": user_id,
            "session_id": session_id,
            "role": role,
            "content": content
        }).execute()
        return True
    except Exception as e:
        print(f"Error saving message: {e}")
        return False

def save_conversation(user_id: str, session_id: str, user_msg: str, bot_msg: str):
    """Guarda la conversación completa (usuario + bot)."""
    save_message(user_id, session_id, "user", user_msg)
    save_message(user_id, session_id, "assistant", bot_msg)

def create_chat_session(user_id: str) -> str:
    """Crea una nueva sesión de chat."""
    import uuid
    return str(uuid.uuid4())

def get_user_sessions(user_id: str) -> List[Dict]:
    """Obtiene todas las sesiones de chat de un usuario."""
    if not supabase:
        return []
    
    try:
        response = supabase.table("chat_sessions")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        print(f"Error getting sessions: {e}")
        return []
