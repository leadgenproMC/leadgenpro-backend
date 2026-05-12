#!/usr/bin/env python
"""Eliminar usuario específico de Supabase"""
import sys
import os

# Cargar .env desde backend
from dotenv import load_dotenv
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)

from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if len(sys.argv) < 2:
    print("Uso: python delete_user.py <email>")
    sys.exit(1)

email = sys.argv[1]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print(f"Buscando usuario: {email}")

# Buscar en Auth
auth_users = supabase.auth.admin.list_users()
target_user = None
for user in auth_users:
    if user.email == email:
        target_user = user
        break

if target_user:
    print(f"Eliminando de Auth: {target_user.id}")
    supabase.auth.admin.delete_user(target_user.id)
    print("✓ Usuario eliminado de Auth")
else:
    print("Usuario no encontrado en Auth")

# Eliminar de tabla users
try:
    result = supabase.table("users").delete().eq("email", email).execute()
    print(f"✓ Eliminados {len(result.data)} de tabla users")
except Exception as e:
    print(f"Error tabla users: {e}")

# Eliminar tokens
try:
    result = supabase.table("email_confirmation_tokens").delete().eq("email", email).execute()
    print(f"✓ Eliminados {len(result.data)} tokens")
except Exception as e:
    print(f"Error tokens: {e}")

print(f"\n✅ {email} limpiado completamente")
