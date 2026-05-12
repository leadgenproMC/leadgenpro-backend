#!/usr/bin/env python
"""Script simple para iniciar el backend"""
import sys
import os

# Agregar backend al path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Cambiar al directorio backend
os.chdir(backend_dir)

import uvicorn

if __name__ == "__main__":
    print("Iniciando backend en http://localhost:8004")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8004, reload=True)
