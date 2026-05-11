"""
Servicio de envío de emails para LeadGenPro.
Soporta SMTP y servicios de email como SendGrid.
"""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional
import secrets
import string

from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)

# Configuración SMTP desde variables de entorno
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@leadgenpro.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "LeadGenPro")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def generate_confirmation_token() -> str:
    """Genera un token seguro de 32 caracteres."""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))


def generate_otp_code() -> str:
    """Genera un código numérico de 6 dígitos para verificación."""
    return ''.join(secrets.choice(string.digits) for _ in range(6))


def create_confirmation_token(user_id: str, email: str) -> Optional[str]:
    """
    Crea un token de confirmación en la base de datos.
    Retorna el token generado o None si hay error.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            logger.error("Supabase no configurado")
            return None
        
        # Invalidar tokens anteriores del usuario
        supabase.table("email_confirmation_tokens")\
            .update({"used": True})\
            .eq("user_id", user_id)\
            .eq("used", False)\
            .execute()
        
        # Generar nuevo token
        token = generate_confirmation_token()
        
        # Guardar en BD
        result = supabase.table("email_confirmation_tokens").insert({
            "user_id": user_id,
            "email": email,
            "token": token,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
            "used": False
        }).execute()
        
        if result.data:
            logger.info(f"Token de confirmación creado para {email}")
            return token
        else:
            logger.error("Error al crear token en BD")
            return None
            
    except Exception as e:
        logger.error(f"Error creando token de confirmación: {str(e)}")
        return None


def send_confirmation_email(to_email: str, name: str, token: str, locale: str = "es") -> bool:
    """
    Envía email de confirmación al usuario.
    Retorna True si se envió correctamente.
    """
    # Construir URL de confirmación
    confirmation_url = f"{FRONTEND_URL}/{locale}/confirm-email?token={token}"
    
    # Templates de email
    subjects = {
        "es": "Confirma tu email - LeadGenPro",
        "en": "Confirm your email - LeadGenPro"
    }
    
    # Template HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #0f172a; color: white; padding: 30px; text-align: center; }}
            .content {{ background: #f8fafc; padding: 30px; }}
            .button {{ display: inline-block; background: #6366f1; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #64748b; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>LeadGenPro</h1>
            </div>
            <div class="content">
                <h2>{"¡Hola" if locale == "es" else "Hi"} {name}!</h2>
                <p>{"Gracias por registrarte. Haz clic en el botón para confirmar tu email:" 
                    if locale == "es" else "Thanks for signing up. Click the button to confirm your email:"}</p>
                
                <a href="{confirmation_url}" class="button">
                    {"Confirmar Email" if locale == "es" else "Confirm Email"}
                </a>
                
                <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
                    {"O copia y pega este enlace:" if locale == "es" else "Or copy and paste this link:"}<br>
                    <a href="{confirmation_url}">{confirmation_url}</a>
                </p>
                
                <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
                    {"Este enlace expira en 24 horas." if locale == "es" else "This link expires in 24 hours."}
                </p>
            </div>
            <div class="footer">
                <p>© 2026 LeadGenPro. {"Todos los derechos reservados." if locale == "es" else "All rights reserved."}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Intentar enviar por SMTP si está configurado
    if all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD]):
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subjects.get(locale, subjects["es"])
            msg['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM}>"
            msg['To'] = to_email
            
            # Adjuntar contenido HTML
            msg.attach(MIMEText(html_content, 'html'))
            
            # Conectar y enviar
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Email de confirmación enviado a {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error enviando email SMTP: {str(e)}")
            return False
    else:
        logger.warning("SMTP no configurado. Email no enviado.")
        logger.info(f"URL de confirmación para {to_email}: {confirmation_url}")
        # En desarrollo, simulamos éxito y mostramos URL
        return True


def verify_confirmation_token(token: str) -> tuple[bool, str]:
    """
    Verifica un token de confirmación.
    Retorna (éxito, mensaje).
    """
    try:
        logger.info(f"[VerifyToken] Iniciando verificación de token: {token[:10]}...")
        
        supabase = get_supabase()
        if not supabase:
            logger.error("[VerifyToken] Supabase no configurado")
            return False, "Error de configuración"
        
        # Buscar token - buscar todos los tokens sin filtrar por 'used' primero
        logger.info(f"[VerifyToken] Buscando token en BD...")
        result_all = supabase.table("email_confirmation_tokens")\
            .select("*")\
            .eq("token", token)\
            .execute()
        
        logger.info(f"[VerifyToken] Resultado búsqueda total: {len(result_all.data)} registros")
        
        if not result_all.data:
            logger.warning(f"[VerifyToken] Token no encontrado: {token[:10]}...")
            return False, "Token inválido o ya usado"
        
        # Verificar si el token ya fue usado
        token_data = result_all.data[0]
        logger.info(f"[VerifyToken] Token encontrado - ID: {token_data.get('id')}, Used: {token_data.get('used')}")
        
        if token_data.get("used"):
            logger.warning(f"[VerifyToken] Token ya fue usado")
            return False, "Token inválido o ya usado"
        
        # Verificar expiración
        expires_at_str = token_data.get("expires_at")
        logger.info(f"[VerifyToken] Expira en: {expires_at_str}")
        
        expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
        now = datetime.now(expires_at.tzinfo)
        
        if now > expires_at:
            logger.warning(f"[VerifyToken] Token expirado")
            return False, "Token expirado"
        
        # Marcar token como usado
        token_id = token_data.get("id")
        user_id = token_data.get("user_id")
        
        logger.info(f"[VerifyToken] Marcando token {token_id} como usado...")
        supabase.table("email_confirmation_tokens")\
            .update({"used": True, "used_at": datetime.utcnow().isoformat()})\
            .eq("id", token_id)\
            .execute()
        
        # Marcar email como confirmado en users
        logger.info(f"[VerifyToken] Marcando email confirmado para usuario {user_id}...")
        supabase.table("users")\
            .update({
                "email_confirmed": True,
                "email_confirmed_at": datetime.utcnow().isoformat()
            })\
            .eq("id", user_id)\
            .execute()
        
        logger.info(f"[VerifyToken] ÉXITO - Email confirmado para usuario {user_id}")
        return True, "Email confirmado correctamente"
        
    except Exception as e:
        logger.error(f"[VerifyToken] Error verificando token: {str(e)}")
        import traceback
        logger.error(f"[VerifyToken] Traceback: {traceback.format_exc()}")
        return False, f"Error: {str(e)}"


def send_otp_email_mailerlite(email: str, code: str, name: str = "") -> bool:
    """Envía código OTP por email usando Gmail SMTP."""
    try:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        smtp_from = os.getenv("SMTP_FROM", smtp_user)
        smtp_from_name = os.getenv("SMTP_FROM_NAME", "LeadGenPro")
        
        if not smtp_user or not smtp_password:
            logger.warning("[SMTP] Credenciales no configuradas")
            return False
        
        logger.info(f"[SMTP] Enviando código a {email}...")
        
        # Crear mensaje
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Tu código de verificación - LeadGenPro"
        msg['From'] = f"{smtp_from_name} <{smtp_from}>"
        msg['To'] = email
        
        # HTML del email
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Verificación de Email</h2>
            <p>Hola {name or 'Usuario'},</p>
            <p>Tu código de verificación para LeadGenPro es:</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
                {code}
            </div>
            <p>Este código expira en 15 minutos.</p>
            <p>Si no solicitaste este código, ignora este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">LeadGenPro - Generación de Leads con IA</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html, 'html'))
        
        # Conectar y enviar
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        logger.info(f"[SMTP] Email enviado exitosamente a {email}")
        return True
            
    except Exception as e:
        logger.error(f"[SMTP] Error enviando email: {str(e)}")
        import traceback
        logger.error(f"[SMTP] Traceback: {traceback.format_exc()}")
        return False


def create_otp_code(user_id: str, email: str, name: str = "") -> Optional[str]:
    """
    Crea un código OTP y lo envía por email.
    Retorna el código generado o None si hay error.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            logger.error("[OTP] Supabase no configurado")
            return None
        
        # Generar código de 6 dígitos
        code = generate_otp_code()
        
        # Calcular expiración (15 minutos)
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        
        # Guardar en la base de datos
        result = supabase.table("email_confirmation_tokens").insert({
            "user_id": user_id,
            "email": email,
            "token": code,
            "used": False,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            logger.info(f"[OTP] Código creado para {email}: {code}")
            # Enviar por email
            email_sent = send_otp_email_mailerlite(email, code, name)
            if email_sent:
                logger.info(f"[OTP] Email enviado a {email}")
            else:
                logger.warning(f"[OTP] No se pudo enviar email a {email}")
            return code
        else:
            logger.error("[OTP] No se pudo crear el código")
            return None
            
    except Exception as e:
        logger.error(f"[OTP] Error creando código: {str(e)}")
        return None


def verify_otp_code(email: str, code: str) -> tuple[bool, str]:
    """
    Verifica un código OTP.
    Retorna (éxito, mensaje).
    """
    try:
        logger.info(f"[VerifyOTP] Verificando código para {email}: {code}")
        
        supabase = get_supabase()
        if not supabase:
            logger.error("[VerifyOTP] Supabase no configurado")
            return False, "Error de configuración"
        
        # Buscar el código más reciente para este email
        result = supabase.table("email_confirmation_tokens")\
            .select("*")\
            .eq("email", email)\
            .eq("token", code)\
            .eq("used", False)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if not result.data:
            logger.warning(f"[VerifyOTP] Código no encontrado o ya usado: {code}")
            return False, "Código inválido o ya usado"
        
        token_data = result.data[0]
        
        # Verificar expiración
        expires_at_str = token_data.get("expires_at")
        expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
        now = datetime.now(expires_at.tzinfo)
        
        if now > expires_at:
            logger.warning(f"[VerifyOTP] Código expirado")
            return False, "Código expirado. Solicita uno nuevo."
        
        # Marcar como usado
        token_id = token_data.get("id")
        user_id = token_data.get("user_id")
        
        supabase.table("email_confirmation_tokens")\
            .update({"used": True, "used_at": datetime.utcnow().isoformat()})\
            .eq("id", token_id)\
            .execute()
        
        # Marcar email como confirmado
        supabase.table("users")\
            .update({
                "email_confirmed": True,
                "email_confirmed_at": datetime.utcnow().isoformat()
            })\
            .eq("id", user_id)\
            .execute()
        
        logger.info(f"[VerifyOTP] ÉXITO - Email confirmado para {email}")
        return True, "Email verificado correctamente"
        
    except Exception as e:
        logger.error(f"[VerifyOTP] Error: {str(e)}")
        import traceback
        logger.error(f"[VerifyOTP] Traceback: {traceback.format_exc()}")
        return False, f"Error: {str(e)}"


def resend_otp_code(email: str) -> tuple[bool, str, Optional[str]]:
    """
    Genera y envía un nuevo código OTP.
    Retorna (éxito, mensaje, código).
    """
    try:
        supabase = get_supabase()
        if not supabase:
            return False, "Error de configuración", None
        
        # Buscar usuario por email
        user_result = supabase.table("users")\
            .select("id, email_confirmed")\
            .eq("email", email)\
            .single()\
            .execute()
        
        if not user_result.data:
            return False, "Usuario no encontrado", None
        
        if user_result.data.get("email_confirmed"):
            return False, "El email ya está verificado", None
        
        user_id = user_result.data.get("id")
        
        # Invalidar códigos anteriores
        supabase.table("email_confirmation_tokens")\
            .update({"used": True})\
            .eq("email", email)\
            .eq("used", False)\
            .execute()
        
        # Crear nuevo código
        new_code = create_otp_code(user_id, email)
        
        if not new_code:
            return False, "Error generando código", None
        
        return True, "Nuevo código generado", new_code
        
    except Exception as e:
        logger.error(f"[ResendOTP] Error: {str(e)}")
        return False, f"Error: {str(e)}", None


def send_verification_email(email: str, name: str, verification_link: str) -> bool:
    """
    Envía email de verificación con link de confirmación.
    Retorna True si se envió correctamente.
    """
    try:
        logger.info(f"[VerificationEmail] Enviando email a: {email}")
        
        # Asunto y mensaje
        subject = "Verifica tu email en LeadGenPro"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verifica tu email</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    background: #10b981;
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    color: #6b7280;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>¡Bienvenido a LeadGenPro!</h1>
                <h2>Verifica tu email</h2>
            </div>
            
            <div class="content">
                <p>Hola {name},</p>
                <p>Gracias por registrarte en LeadGenPro. Para completar tu registro y acceder a todas las funciones, por favor verifica tu email haciendo clic en el siguiente enlace:</p>
                
                <div style="text-align: center;">
                    <a href="{verification_link}" class="button">Verificar Email</a>
                </div>
                
                <p>Si el botón no funciona, también puedes copiar y pegar este enlace en tu navegador:</p>
                <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;">
                    {verification_link}
                </p>
                
                <p><strong>Importante:</strong> Este enlace expirará en 24 horas.</p>
                
                <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
            </div>
            
            <div class="footer">
                <p>LeadGenPro - Tu plataforma de generación de leads</p>
                <p>Este email fue enviado a {email}</p>
            </div>
        </body>
        </html>
        """
        
        # Enviar email
        success = send_email(
            to_email=email,
            subject=subject,
            html_content=html_content
        )
        
        if success:
            logger.info(f"[VerificationEmail] ÉXITO - Email enviado a {email}")
            return True
        else:
            logger.error(f"[VerificationEmail] Error - No se pudo enviar email a {email}")
            return False
            
    except Exception as e:
        logger.error(f"[VerificationEmail] Error: {str(e)}")
        import traceback
        logger.error(f"[VerificationEmail] Traceback: {traceback.format_exc()}")
        return False
