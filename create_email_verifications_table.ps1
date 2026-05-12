# Script para crear la tabla email_verifications en Supabase
$ErrorActionPreference = "Stop"

Write-Host "=== CREANDO TABLA EMAIL_VERIFICATIONS ===" -ForegroundColor Cyan

# SQL para crear la tabla
$sql = @"
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Políticas de acceso
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Política para inserción (cualquiera puede insertar)
CREATE POLICY "Anyone can insert email verifications" ON email_verifications
    FOR INSERT WITH CHECK (true);

-- Política para lectura (usuarios pueden ver sus propias verificaciones)
CREATE POLICY "Users can view their own email verifications" ON email_verifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Política para actualización (usuarios pueden actualizar sus propias verificaciones)
CREATE POLICY "Users can update their own email verifications" ON email_verifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Política para eliminación (usuarios pueden eliminar sus propias verificaciones)
CREATE POLICY "Users can delete their own email verifications" ON email_verifications
    FOR DELETE USING (auth.uid()::text = user_id::text);
"@

Write-Host "SQL generado para crear la tabla email_verifications" -ForegroundColor Green
Write-Host ""
Write-Host "Para ejecutar este SQL:" -ForegroundColor Yellow
Write-Host "1. Ve a Supabase Dashboard" -ForegroundColor White
Write-Host "2. Ve a SQL Editor" -ForegroundColor White
Write-Host "3. Copia y pega el SQL anterior" -ForegroundColor White
Write-Host "4. Ejecuta el SQL" -ForegroundColor White
Write-Host ""
Write-Host "O puedes ejecutarlo directamente desde aquí si tienes la extensión de Supabase en VS Code" -ForegroundColor Cyan
