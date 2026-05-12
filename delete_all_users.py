#!/usr/bin/env python3
"""
Script para eliminar TODOS los usuarios registrados en Supabase.
⚠️ USAR CON PRECAUCIÓN - Solo para desarrollo/testing.
"""
import os
import sys
from supabase import create_client

# Cargar variables de entorno desde backend/.env
from dotenv import load_dotenv
import os as os_module
backend_dir = os_module.path.join(os_module.path.dirname(__file__), 'backend')
env_path = os_module.path.join(backend_dir, '.env')
load_dotenv(env_path)
print(f"Cargando .env desde: {env_path}")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados")
    sys.exit(1)

print(f"🔗 Conectando a Supabase: {SUPABASE_URL}")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

results = {
    "tokens_deleted": 0,
    "users_deleted": 0,
    "auth_users_deleted": 0,
    "errors": []
}

# 1. Eliminar tokens de confirmación
print("\n🗑️  Eliminando tokens de confirmación...")
try:
    tokens_result = supabase.table("email_confirmation_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    results["tokens_deleted"] = len(tokens_result.data) if tokens_result.data else 0
    print(f"   ✅ Eliminados {results['tokens_deleted']} tokens")
except Exception as e:
    results["errors"].append(f"Error eliminando tokens: {str(e)}")
    print(f"   ❌ Error: {e}")

# 2. Eliminar usuarios de tabla users
print("\n🗑️  Eliminando usuarios de tabla 'users'...")
try:
    users_result = supabase.table("users").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    results["users_deleted"] = len(users_result.data) if users_result.data else 0
    print(f"   ✅ Eliminados {results['users_deleted']} usuarios")
except Exception as e:
    results["errors"].append(f"Error eliminando users: {str(e)}")
    print(f"   ❌ Error: {e}")

# 3. Eliminar usuarios de Supabase Auth
print("\n🗑️  Eliminando usuarios de Supabase Auth...")
try:
    auth_users = supabase.auth.admin.list_users()
    deleted_count = 0
    for user in auth_users:
        try:
            supabase.auth.admin.delete_user(user.id)
            deleted_count += 1
            print(f"   ✅ Eliminado auth user: {user.email}")
        except Exception as user_err:
            results["errors"].append(f"Error eliminando auth user {user.id}: {str(user_err)}")
            print(f"   ❌ Error eliminando {user.email}: {user_err}")
    results["auth_users_deleted"] = deleted_count
except Exception as e:
    results["errors"].append(f"Error listando auth users: {str(e)}")
    print(f"   ❌ Error: {e}")

# Resumen
print("\n" + "="*50)
print("📊 RESUMEN DE ELIMINACIÓN:")
print(f"   • Tokens eliminados: {results['tokens_deleted']}")
print(f"   • Usuarios eliminados (tabla): {results['users_deleted']}")
print(f"   • Usuarios eliminados (Auth): {results['auth_users_deleted']}")

if results["errors"]:
    print(f"\n⚠️  Errores ({len(results['errors'])}):")
    for error in results["errors"]:
        print(f"   - {error}")
else:
    print("\n✅ Todos los usuarios eliminados exitosamente!")

print("="*50)
