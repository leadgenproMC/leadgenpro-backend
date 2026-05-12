# Auto-deploy trigger - 2026-05-12 16:45:00 - FORCE REDEPLOY - FIX VERIFY-EMAIL

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from .routers.health import router as health_router
from .routers.credits import router as credits_router
from .routers.leads import router as leads_router
from .routers.chat import router as chat_router
from .routers.mailerlite import router as mailerlite_router
from .routers.auth import router as auth_router
from .config import get_cors_origins

load_dotenv()

app = FastAPI(title="Leadgenpro API", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=get_cors_origins(),
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

@app.get("/")
def root():
    """Redirige a la documentaciÃ³n."""
    return RedirectResponse(url="/docs")

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 LeadGenPro Backend Final starting up...")
    
    # Forzar carga de routers
    logger.info("📋 Loading auth router...")
    
    logger.info("🎯 LeadGenPro Backend Final ready!")

app.include_router(health_router)
app.include_router(auth_router)  # Auth endpoints
app.include_router(credits_router, prefix="/credits", tags=["credits"])
app.include_router(leads_router, prefix="/leads", tags=["leads"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(mailerlite_router)
