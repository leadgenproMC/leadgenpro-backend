from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.ai_chat import generate_response
from app.services.memory import get_context, save_conversation, create_chat_session

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str = Field(..., description="ID único del usuario")
    session_id: Optional[str] = Field(default="default", description="ID de la sesión de chat")
    message: str = Field(..., min_length=1, max_length=1000, description="Mensaje del usuario")
    locale: Optional[str] = Field(default="es", description="Idioma del usuario (es/en)")

class ChatResponse(BaseModel):
    response: str = Field(..., description="Respuesta del bot")
    session_id: str = Field(..., description="ID de la sesión actual")
    user_id: str = Field(..., description="ID del usuario")

class SessionRequest(BaseModel):
    user_id: str = Field(..., description="ID único del usuario")

class SessionResponse(BaseModel):
    session_id: str = Field(..., description="ID de la nueva sesión")

@router.post("/", response_model=ChatResponse)
def chat(data: ChatRequest):
    """
    Endpoint principal del chat con el bot de ventas.
    Recibe mensajes del usuario y devuelve respuestas de la IA.
    """
    try:
        # Obtener contexto previo
        context = get_context(data.user_id, data.session_id)
        
        # Generar respuesta con locale
        response = generate_response(data.message, context, data.locale)
        
        # Guardar conversación
        save_conversation(data.user_id, data.session_id, data.message, response)
        
        return ChatResponse(
            response=response,
            session_id=data.session_id,
            user_id=data.user_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el chat: {str(e)}")

@router.post("/session", response_model=SessionResponse)
def new_session(data: SessionRequest):
    """
    Crea una nueva sesión de chat para un usuario.
    """
    try:
        session_id = create_chat_session(data.user_id)
        return SessionResponse(session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando sesión: {str(e)}")

@router.get("/history/{user_id}")
def get_chat_history(user_id: str, session_id: Optional[str] = "default"):
    """
    Obtiene el historial de mensajes de una sesión.
    """
    try:
        from app.services.memory import get_context
        history = get_context(user_id, session_id)
        return {
            "user_id": user_id,
            "session_id": session_id,
            "messages": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo historial: {str(e)}")

@router.get("/status")
def get_ai_status():
    """
    Retorna el estado de los proveedores de IA disponibles.
    """
    from app.services.ai_chat import get_provider_status
    return get_provider_status()
