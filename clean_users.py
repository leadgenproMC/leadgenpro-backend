#!/usr/bin/env python3
"""Eliminar todos los usuarios de Supabase"""
import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Cargar .env desde backend
import os as os_module
backend_dir = os_module.path.join(os_module.path.dirname(__file__), 'backend')
env_path = os_module.path.join(backend_dir, '.env')
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados")
    sys.exit(1)

print(f"Conectando a Supabase...")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Eliminar tokens
print("\nEliminando tokens de confirmacion...")
try:
    result = supabase.table("email_confirmation_tokens").delete().neq("id", "x").execute()
    print(f"  Tokens eliminados: {len(result.data) if result.data else 0}")
except Exception as e:
    print(f"  Error: {e}")

# Eliminar usuarios de tabla
print("\nEliminando usuarios de tabla 'users'...")
try:
    result = supabase.table("users").delete().neq("id", "x").execute()
    print(f"  Usuarios eliminados: {len(result.data) if result.data else 0}")
except Exception as e:
    print(f"  Error: {e}")

# Eliminar usuarios de Auth
print("\nEliminando usuarios de Supabase Auth...")
try:
    auth_users = supabase.auth.admin.list_users()
    count = 0
    for user in auth_users:
        try:
            supabase.auth.admin.delete_user(user.id)
            count += 1
            print(f"  Eliminado: {user.email}")
        except Exception as e:
            print(f"  Error eliminando {user.email}: {e}")
    print(f"\nTotal usuarios Auth eliminados: {count}")
except Exception as e:
    print(f"  Error: {e}")

print("\nLimpieza completada!")
