import zipfile
import os

EXCLUDE_DIRS = {'venv', '.venv', 'node_modules', '__pycache__', '.git', '.next', '.windsurf', '.github'}
EXCLUDE_FILES = {'.env', '.env.local', 'leadgenpro-project.zip', 'create_project_zip.py', 'create_render_zip.py'}

def create_render_zip():
    project_dir = r'c:\Users\Portatil\Documents\My Web Sites\Leadgenpro'
    output_zip = os.path.join(project_dir, 'render-deploy.zip')
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_dir):
            # Filtrar carpetas
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, project_dir)
                
                # Solo incluir archivos necesarios para el backend
                if file in EXCLUDE_FILES:
                    continue
                
                # Incluir: Dockerfile, railway.toml, render.yaml, backend/, requirements.txt
                if arcname.startswith('backend') or arcname in ['Dockerfile', 'railway.toml', 'render.yaml', 'requirements.txt', 'test_basic.py']:
                    zipf.write(filepath, arcname)
                    print(f'Incluido: {arcname}')
    
    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f'\nZIP creado: {output_zip}')
    print(f'Tamaño: {size_mb:.2f} MB')

if __name__ == '__main__':
    create_render_zip()
