import zipfile
import os

# Carpetas a excluir
EXCLUDE_DIRS = {'venv', '.venv', 'node_modules', '__pycache__', '.git', '.next', '.windsurf'}
EXCLUDE_FILES = {'.env', '.env.local'}

def should_include(path):
    """Verifica si un archivo/carpeta debe incluirse"""
    parts = path.split(os.sep)
    for part in parts:
        if part in EXCLUDE_DIRS:
            return False
    filename = os.path.basename(path)
    if filename in EXCLUDE_FILES:
        return False
    return True

def create_project_zip():
    project_dir = r'c:\Users\Portatil\Documents\My Web Sites\Leadgenpro'
    output_zip = os.path.join(project_dir, 'leadgenpro-project.zip')
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_dir):
            # Filtrar carpetas a excluir
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, project_dir)
                
                if should_include(arcname):
                    zipf.write(filepath, arcname)
    
    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f'ZIP creado: {output_zip}')
    print(f'Tamaño: {size_mb:.2f} MB')

if __name__ == '__main__':
    create_project_zip()
