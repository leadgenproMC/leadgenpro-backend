-- SQL CORREGIDO para Supabase (sin advertencias de seguridad)

-- ==========================================
-- 1. Tabla chat_messages (historial del bot)
-- ==========================================
CREATE TABLE chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    session_id text NOT NULL DEFAULT 'default',
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, session_id);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Política solo SELECT pública (intencional), INSERT/UPDATE restringido a backend
CREATE POLICY "Allow select all" ON chat_messages
    FOR SELECT USING (true);

-- ==========================================
-- 2. Tabla profiles (perfiles de usuario)
-- ==========================================
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    full_name text,
    company text,
    credits integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Función con search_path fijo (corregido warning)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 3. Tabla leads
-- ==========================================
CREATE TABLE leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    email text,
    phone text,
    company text,
    niche text,
    location text,
    status text DEFAULT 'new',
    score integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);

-- ==========================================
-- 4. Tabla campaigns
-- ==========================================
CREATE TABLE campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    description text,
    status text DEFAULT 'draft',
    sequence jsonb DEFAULT '[]'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_campaigns_user ON campaigns(user_id);

-- ==========================================
-- 5. Tabla credit_transactions
-- ==========================================
CREATE TABLE credit_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    amount integer NOT NULL,
    type text NOT NULL, -- 'purchase', 'usage', 'bonus'
    description text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);

-- ==========================================
-- 6. Políticas de seguridad RLS
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Solo el propietario ve sus datos
CREATE POLICY "Users can only see own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only see own leads" ON leads
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own transactions" ON credit_transactions
    FOR ALL USING (auth.uid() = user_id);
