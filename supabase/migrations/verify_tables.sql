-- =========================================
-- ACI - Script de Verificação
-- Valida se todas as tabelas e políticas existem
-- Execute no Supabase SQL Editor
-- =========================================

-- ==========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ==========================================

SELECT '📋 TABELAS EXISTENTES' as secao;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('user_credits', 'payment_transactions', 'credit_transactions', 'credit_packages', 'webhook_logs', 'profiles', 'api_keys', 'wordpress_connections')
        THEN '✅ OK'
        ELSE '⚠️ Extra'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ==========================================
-- 2. VERIFICAR RLS HABILITADO
-- ==========================================

SELECT '🔐 ROW LEVEL SECURITY' as secao;

SELECT 
    tablename as tabela,
    CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'user_credits', 
    'payment_transactions', 
    'credit_transactions', 
    'credit_packages', 
    'webhook_logs',
    'profiles',
    'api_keys',
    'wordpress_connections'
)
ORDER BY tablename;

-- ==========================================
-- 3. VERIFICAR POLÍTICAS RLS
-- ==========================================

SELECT '📜 POLÍTICAS RLS' as secao;

SELECT 
    tablename as tabela,
    policyname as politica,
    cmd as operacao,
    CASE WHEN permissive = 'PERMISSIVE' THEN '✅' ELSE '⚠️' END as tipo
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- 4. VERIFICAR COLUNAS DA TABELA user_credits
-- ==========================================

SELECT '💰 COLUNAS: user_credits' as secao;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_credits'
ORDER BY ordinal_position;

-- ==========================================
-- 5. VERIFICAR COLUNAS DA TABELA payment_transactions
-- ==========================================

SELECT '💳 COLUNAS: payment_transactions' as secao;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'payment_transactions'
ORDER BY ordinal_position;

-- ==========================================
-- 6. VERIFICAR PACOTES DE CRÉDITOS
-- ==========================================

SELECT '📦 PACOTES DE CRÉDITOS' as secao;

SELECT 
    id,
    name,
    credits,
    bonus_credits,
    price,
    highlighted,
    badge
FROM credit_packages
ORDER BY sort_order;

-- ==========================================
-- 7. VERIFICAR ÍNDICES
-- ==========================================

SELECT '🔍 ÍNDICES' as secao;

SELECT 
    indexname as indice,
    tablename as tabela
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'user_credits', 
    'payment_transactions', 
    'credit_transactions', 
    'credit_packages', 
    'webhook_logs',
    'api_keys',
    'wordpress_connections'
)
ORDER BY tablename, indexname;

-- ==========================================
-- 8. VERIFICAR TRIGGERS
-- ==========================================

SELECT '⚡ TRIGGERS' as secao;

SELECT 
    trigger_name,
    event_object_table as tabela,
    action_timing,
    event_manipulation as evento
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- ==========================================
-- 9. VERIFICAR FUNÇÕES
-- ==========================================

SELECT '🔧 FUNÇÕES' as secao;

SELECT 
    routine_name as funcao,
    routine_type as tipo
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ==========================================
-- 10. RESUMO FINAL
-- ==========================================

SELECT '📊 RESUMO' as secao;

SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tabelas,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indices,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers;
