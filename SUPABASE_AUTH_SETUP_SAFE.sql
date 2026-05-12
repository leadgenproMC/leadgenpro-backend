-- ============================================
-- SQL SEGURO PARA CREAR TABLA DE TOKENS
-- Usar si ya existe parcialmente
-- ============================================

-- Crear tabla si no existe
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

-- Crear política solo si no existe (usando DO block)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'email_confirmation_tokens' 
        AND policyname = 'System can manage confirmation tokens'
    ) THEN
        CREATE POLICY "System can manage confirmation tokens"
        ON email_confirmation_tokens FOR ALL
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- Campo para tracking de email confirmado en tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON TABLE email_confirmation_tokens IS 'Tokens para confirmación de email personalizada';
