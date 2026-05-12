#!/usr/bin/env python
"""Iniciar backend desde cualquier ubicacion"""
import sys
import os

# Obtener directorio del script
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(script_dir, 'backend')

# Agregar backend al path de Python
sys.path.insert(0, backend_dir)

# Cambiar al directorio backend para que los imports funcionen
os.chdir(backend_dir)

print(f"Iniciando backend desde: {backend_dir}")
print(f"Python path: {sys.path[0]}")

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8004, reload=True)
