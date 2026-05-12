-- ============================================
-- TABLA DE HISTORIAL DE CONTRASEÑAS
-- Para validar que un usuario nunca use la misma contraseña anterior
-- ============================================

-- Crear tabla de historial de contraseñas
CREATE TABLE IF NOT EXISTS password_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL, -- Hash de la contraseña (no almacenamos la contraseña en texto plano)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT -- 'registration', 'reset', 'change'
);

-- Índice para búsqueda rápida por usuario
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);

-- Política de seguridad: solo el usuario puede ver su propio historial (aunque no debería verse nunca directamente)
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own password history" ON password_history
    FOR SELECT USING (auth.uid() = user_id);

-- Función para verificar si una contraseña fue usada anteriormente
-- Esta función se llamaría desde el backend, no directamente desde el cliente
CREATE OR REPLACE FUNCTION check_password_not_used_before(
    p_user_id UUID,
    p_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_stored_hash TEXT;
    v_found BOOLEAN := FALSE;
BEGIN
    -- Iterar sobre los hashes almacenados para este usuario
    FOR v_stored_hash IN 
        SELECT password_hash FROM password_history WHERE user_id = p_user_id
    LOOP
        -- Verificar si la contraseña coincide con el hash (esto requiere bcrypt en PostgreSQL)
        -- Como PostgreSQL nativo no tiene bcrypt, esta validación debe hacerse en el backend
        -- Esta función es un placeholder para lógica futura
        IF v_stored_hash = crypt(p_password, v_stored_hash) THEN
            v_found := TRUE;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN NOT v_found; -- TRUE si no fue usada antes, FALSE si sí fue usada
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para guardar automáticamente el hash de contraseña cuando se actualiza en auth.users
-- Nota: Esto es complejo porque no tenemos acceso directo a las contraseñas hasheadas de Supabase Auth
-- La solución es guardar el hash desde el backend cuando se hace un reset

-- Comentarios para documentación
COMMENT ON TABLE password_history IS 'Almacena hashes de contraseñas anteriores para validar que no se repitan';
COMMENT ON COLUMN password_history.password_hash IS 'Hash bcrypt de la contraseña (generado en backend)';
COMMENT ON COLUMN password_history.reason IS 'Motivo del cambio: registration, reset, change';
