#!/usr/bin/env python3
import os

os.chdir(r"c:\Users\Portatil\Documents\My Web Sites\Leadgenpro\frontend")

json_content = '''{
  "name": "leadgenpro-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "clsx": "2.1.1",
    "next": "15.0.3",
    "next-intl": "^3.26.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.12.12",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "eslint": "9.12.0",
    "eslint-config-next": "15.0.3",
    "postcss": "8.4.38",
    "tailwindcss": "3.4.10",
    "typescript": "5.6.3"
  }
}
'''

# Escribir sin BOM
with open("package.json", "w", encoding="utf-8") as f:
    f.write(json_content)

print("✅ package.json creado sin BOM")

# Git commands
os.system('git add package.json')
os.system('git commit -m "Fix BOM in package.json - utf8 no bom"')
os.system('git push origin main --force')

import subprocess
result = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True)
print(f"Commit: {result.stdout.strip()}")
