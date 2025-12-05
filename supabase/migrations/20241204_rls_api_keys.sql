-- =========================================
-- ACI - Configuração RLS para api_keys
-- Migration: Segurança Row Level Security
-- Data: 2024-12-04
-- =========================================

-- ==========================================
-- 1. CONFIGURAR RLS NA TABELA api_keys
-- ==========================================

-- Habilitar RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Criar índice na coluna user_id para performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Drop políticas existentes
DROP POLICY IF EXISTS "Users can view own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can create own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can manage all api keys" ON api_keys;

-- ==========================================
-- 2. CRIAR POLÍTICAS RLS
-- ==========================================

-- Política: Usuários podem ver suas próprias API keys
CREATE POLICY "Users can view own api keys" ON api_keys
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política: Usuários podem criar suas próprias API keys
CREATE POLICY "Users can create own api keys" ON api_keys
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias API keys
CREATE POLICY "Users can update own api keys" ON api_keys
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias API keys
CREATE POLICY "Users can delete own api keys" ON api_keys
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Política: Admins podem gerenciar todas as API keys
CREATE POLICY "Admins can manage all api keys" ON api_keys
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 3. CONFIGURAR RLS NA TABELA wordpress_connections
-- ==========================================

-- Habilitar RLS
ALTER TABLE wordpress_connections ENABLE ROW LEVEL SECURITY;

-- Criar índice na coluna user_id para performance
CREATE INDEX IF NOT EXISTS idx_wordpress_connections_user_id ON wordpress_connections(user_id);

-- Drop políticas existentes
DROP POLICY IF EXISTS "Users can view own wordpress connections" ON wordpress_connections;
DROP POLICY IF EXISTS "Users can create own wordpress connections" ON wordpress_connections;
DROP POLICY IF EXISTS "Users can update own wordpress connections" ON wordpress_connections;
DROP POLICY IF EXISTS "Users can delete own wordpress connections" ON wordpress_connections;
DROP POLICY IF EXISTS "Admins can manage all wordpress connections" ON wordpress_connections;

-- Política: Usuários podem ver suas próprias conexões WordPress
CREATE POLICY "Users can view own wordpress connections" ON wordpress_connections
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política: Usuários podem criar suas próprias conexões WordPress
CREATE POLICY "Users can create own wordpress connections" ON wordpress_connections
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias conexões WordPress
CREATE POLICY "Users can update own wordpress connections" ON wordpress_connections
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias conexões WordPress
CREATE POLICY "Users can delete own wordpress connections" ON wordpress_connections
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Política: Admins podem gerenciar todas as conexões WordPress
CREATE POLICY "Admins can manage all wordpress connections" ON wordpress_connections
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 4. GRANT PERMISSIONS
-- ==========================================

-- Service role tem acesso total (para operações de backend)
GRANT ALL ON api_keys TO service_role;
GRANT ALL ON wordpress_connections TO service_role;

-- ==========================================
-- 5. VERIFICAÇÃO
-- ==========================================

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('api_keys', 'wordpress_connections', 'user_credits', 'payment_transactions', 'credit_transactions', 'credit_packages', 'webhook_logs')
AND schemaname = 'public';

-- Listar todas as políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('api_keys', 'wordpress_connections')
ORDER BY tablename, policyname;

-- ==========================================
-- FIM DA MIGRAÇÃO RLS
-- ==========================================
