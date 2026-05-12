import sys
import os

# Add your project directory to the sys.path
path = '/home/tuusuario/leadgenpro/backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Set environment variables
os.environ['SUPABASE_URL'] = 'https://deccstotatmchyavbtor.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY2NzdG90YXRtY2h5YXZidG9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk2MDU5MiwiZXhwIjoyMDkwNTM2NTkyfQ.9XkZubkwyN4fLfGFXgVo9yIfU5966m69vVKvDNVEFms'
os.environ['SMTP_HOST'] = 'smtp.gmail.com'
os.environ['SMTP_PORT'] = '587'
os.environ['SMTP_USER'] = 'leadgenpro10k@gmail.com'
os.environ['SMTP_PASSWORD'] = 'pemn stlm nval qtsq'
os.environ['SMTP_FROM'] = 'leadgenpro10k@gmail.com'
os.environ['SMTP_FROM_NAME'] = 'LeadGenPro'
os.environ['FRONTEND_URL'] = 'https://leadgenpro.vercel.app'

# Import your FastAPI application
from app.main import app as application
