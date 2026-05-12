"""
EMAIL SERVICE REAL - SISTEMA COMPLETO DE VERIFICACIÓN
===============================================

Características:
- ✅ Envío real de emails
- ✅ Verificación por token
- ✅ Seguridad robusta
- ✅ Manejo de errores
- ✅ Logs completos
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import secrets
import time
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "")
        
        # Verificar configuración
        if not all([self.smtp_user, self.smtp_password, self.from_email]):
            logger.warning("⚠️ Email service no configurado - usando modo simulación")
            self.simulation_mode = True
        else:
            self.simulation_mode = False
            logger.info("✅ Email service configurado correctamente")

    def send_verification_email(self, email: str, name: str, verification_token: str) -> bool:
        """
        Enviar email de verificación real.
        """
        try:
            # Crear enlace de verificación
            verification_link = f"https://leadgenpro-frontend.netlify.app/es/verify-email?token={verification_token}"
            
            # HTML del email
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Verifica tu email - LeadGenPro</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #4f46e5; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background: #f9fafb; }}
                    .button {{ background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }}
                    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 LeadGenPro</h1>
                        <p>Bienvenido a la plataforma de generación de leads más potente</p>
                    </div>
                    <div class="content">
                        <h2>¡Hola {name}!</h2>
                        <p>Gracias por registrarte en LeadGenPro. Para activar tu cuenta, por favor verifica tu email haciendo clic en el siguiente botón:</p>
                        
                        <div style="text-align: center;">
                            <a href="{verification_link}" class="button">✅ Verificar Email</a>
                        </div>
                        
                        <p>O copia y pega este enlace en tu navegador:</p>
                        <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">
                            {verification_link}
                        </p>
                        
                        <p><strong>Importante:</strong> Este enlace expirará en 24 horas.</p>
                        <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 LeadGenPro. Todos los derechos reservados.</p>
                        <p>LeadGenPro - Generación de Leads Inteligente</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            if self.simulation_mode:
                # MODO SIMULACIÓN - Para desarrollo
                logger.info(f"📧 [SIMULACIÓN] Email enviado a: {email}")
                logger.info(f"📧 [SIMULACIÓN] Token: {verification_token}")
                logger.info(f"📧 [SIMULACIÓN] Enlace: {verification_link}")
                return True
            
            # ENVÍO REAL
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "🚀 Verifica tu email - LeadGenPro"
            msg['From'] = self.from_email
            msg['To'] = email
            
            # Adjuntar HTML
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Conectar y enviar
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            
            text = msg.as_string()
            server.sendmail(self.from_email, email, text)
            server.quit()
            
            logger.info(f"✅ Email enviado exitosamente a: {email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error enviando email a {email}: {str(e)}")
            return False

    def generate_secure_token(self, email: str) -> str:
        """Generar token seguro para verificación."""
        timestamp = str(int(time.time()))
        random_part = secrets.token_urlsafe(32)
        return f"{timestamp}_{random_part}_{hash(email) % 10000}"

    def is_token_expired(self, token: str, max_hours: int = 24) -> bool:
        """Verificar si el token ha expirado."""
        try:
            timestamp_part = token.split('_')[0]
            token_time = int(timestamp_part)
            expiry_time = token_time + (max_hours * 3600)
            current_time = int(time.time())
            return current_time > expiry_time
        except:
            return True  # Si no puede parsear, considerar expirado

# Instancia global
email_service = EmailService()
