"""
Servicio de IA para el bot de ventas.
Soporta múltiples proveedores: Ollama (local), OpenAI (API), o modo demo.
"""

import os
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

# Configuración del proveedor de IA
AI_PROVIDER = os.getenv("AI_PROVIDER", "demo").lower()  # "ollama", "openai", "demo"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = """Eres un experto en ventas consultivas para LeadGenPro, una plataforma SaaS de generación de leads B2B.

Tu estilo:
- Haces preguntas inteligentes para entender el negocio del cliente
- Detectas necesidades de generación de leads
- Propones soluciones claras basadas en nuestra plataforma
- Llevas al usuario a crear una cuenta o solicitar una demo
- Eres persuasivo pero nunca agresivo

Servicios de LeadGenPro:
- Lead Finder: Encuentra leads de alta intención con IA
- Campaigns: Automatiza secuencias de email
- Analytics: Mide y optimiza conversiones
- Exportación CSV: Compatible con cualquier CRM

Responde en español si el usuario escribe en español, o en inglés si escribe en inglés.
Sé directo, claro y enfocado en resultados. Máximo 3-4 oraciones por respuesta."""

# Respuestas predefinidas para modo demo (sin IA)
DEMO_RESPONSES = {
    "es": {
        "hola": "¡Hola! Soy el asesor virtual de LeadGenPro. ¿En qué tipo de negocio trabajas y qué desafíos tienes para conseguir clientes?",
        "precio": "Tenemos planes desde $29/mes. ¿Prefieres empezar con la prueba gratuita de 50 leads?",
        "demo": "Perfecto, puedo ayudarte. LeadGenPro encuentra leads verificados automáticamente. ¿Te gustaría probar el Lead Finder primero?",
        "lead": "Nuestro Lead Finder usa IA para encontrar leads de alta intención en cualquier nicho. ¿Qué industria te interesa?",
        "gracias": "¡De nada! Estoy aquí para ayudarte. ¿Necesitas que te explique alguna función específica?",
        "adios": "¡Hasta luego! No dudes en volver si necesitas ayuda con LeadGenPro. 🚀",
        "default": "Entiendo. LeadGenPro puede ayudarte a escalar tu generación de leads con IA. ¿Quieres que te explique cómo funciona el Lead Finder o prefieres ver una demo de las campañas automáticas?",
    },
    "en": {
        "hello": "Hi! I'm LeadGenPro's virtual advisor. What type of business do you run and what challenges do you face getting clients?",
        "price": "We have plans starting at $29/month. Would you like to start with the free trial of 50 leads?",
        "demo": "Perfect, I can help you. LeadGenPro finds verified leads automatically. Would you like to try the Lead Finder first?",
        "lead": "Our Lead Finder uses AI to find high-intent leads in any niche. What industry interests you?",
        "thanks": "You're welcome! I'm here to help. Do you need me to explain any specific feature?",
        "bye": "Goodbye! Feel free to come back if you need help with LeadGenPro. 🚀",
        "default": "I understand. LeadGenPro can help you scale your lead generation with AI. Would you like me to explain how Lead Finder works or would you prefer to see a demo of automatic campaigns?",
    }
}


def _get_demo_response(message: str, locale: str = "es") -> str:
    """Genera respuesta demo basada en palabras clave."""
    msg_lower = message.lower()
    responses = DEMO_RESPONSES.get(locale, DEMO_RESPONSES["en"])
    
    # Buscar palabras clave
    for keyword, response in responses.items():
        if keyword != "default" and keyword in msg_lower:
            return response
    
    return responses["default"]


def _generate_with_ollama(message: str, context: list = None) -> str:
    """Genera respuesta usando Ollama (modelo local)."""
    if context is None:
        context = []
    
    try:
        import ollama
        
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        if context:
            for msg in context:
                messages.append(msg)
        
        messages.append({"role": "user", "content": message})
        
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=messages,
            options={
                "temperature": 0.7,
                "num_predict": 300,
            }
        )
        
        return response['message']['content']
    except Exception as e:
        print(f"[ERROR] Ollama failed: {e}")
        # Fallback a modo demo
        return _get_demo_response(message, "es" if "ñ" in message.lower() else "en")


def _generate_with_openai(message: str, context: list = None) -> str:
    """Genera respuesta usando OpenAI API."""
    if context is None:
        context = []
    
    try:
        from openai import OpenAI, APITimeoutError
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not configured")
        
        client = OpenAI(api_key=api_key, timeout=30.0)
        
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        if context:
            for msg in context:
                messages.append(msg)
        
        messages.append({"role": "user", "content": message})
        
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=500,
            timeout=30.0
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"[ERROR] OpenAI failed: {e}")
        # Fallback a modo demo
        return _get_demo_response(message, "es" if "ñ" in message.lower() else "en")


def generate_response(message: str, context: list = None, locale: str = "es") -> str:
    """
    Genera respuesta del bot usando el proveedor configurado.
    
    Provider priority:
    1. ollama - Modelo local (requiere Ollama instalado)
    2. openai - API de OpenAI (requiere API key)
    3. demo - Respuestas predefinidas (funciona sin configuración)
    """
    if context is None:
        context = []
    
    # Seleccionar proveedor
    provider = AI_PROVIDER
    
    # Si OpenAI tiene API key configurada, usarla
    if provider == "openai" and os.getenv("OPENAI_API_KEY"):
        return _generate_with_openai(message, context)
    
    # Intentar Ollama si está configurado
    if provider == "ollama":
        return _generate_with_ollama(message, context)
    
    # Fallback a modo demo (siempre funciona)
    return _get_demo_response(message, locale)


def get_provider_status():
    """Retorna el estado de los proveedores de IA disponibles."""
    status = {
        "provider": AI_PROVIDER,
        "demo_available": True,
        "openai_available": bool(os.getenv("OPENAI_API_KEY")),
        "ollama_available": False,
        "ollama_model": OLLAMA_MODEL,
    }
    
    # Verificar Ollama
    try:
        import ollama
        ollama.list()
        status["ollama_available"] = True
    except:
        pass
    
    return status
