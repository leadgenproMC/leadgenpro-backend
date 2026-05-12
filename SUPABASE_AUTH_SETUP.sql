-- Crear tabla de usuarios para autenticación
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Políticas de seguridad (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver solo su propio perfil
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- Usuarios pueden actualizar solo su propio perfil
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- Solo el sistema puede insertar (a través del service role key)
CREATE POLICY "System can insert users" 
ON users FOR INSERT 
WITH CHECK (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Nota: Esta tabla complementa auth.users de Supabase Auth
-- auth.users maneja email/password, esta tabla guarda datos adicionales (name, company)

-- ============================================
-- TABLA PARA TOKENS DE CONFIRMACIÓN DE EMAIL
-- ============================================

CREATE TABLE IF NOT EXISTS email_confirmation_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
    used_at TIMESTAMP WITH TIME ZONE,
    used BOOLEAN NOT NULL DEFAULT false
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_confirmation_tokens_token ON email_confirmation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_confirmation_tokens_user_id ON email_confirmation_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_confirmation_tokens_email ON email_confirmation_tokens(email);

-- Políticas RLS
ALTER TABLE email_confirmation_tokens ENABLE ROW LEVEL SECURITY;

-- Solo el sistema puede gestionar tokens
CREATE POLICY "System can manage confirmation tokens"
ON email_confirmation_tokens FOR ALL
USING (true)
WITH CHECK (true);

-- Campo para tracking de email confirmado en tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON TABLE email_confirmation_tokens IS 'Tokens para confirmación de email personalizada';
