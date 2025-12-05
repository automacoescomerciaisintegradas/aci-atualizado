-- CONSULTAS DE DIAGNÓSTICO PARA SUPABASE
-- Execute estas consultas uma por uma no SQL Editor do Supabase

-- 1. Verificar se o gatilho existe
SELECT 
    tg.tgname AS trigger_name,
    tbl.relname AS table_name,
    proc.proname AS function_name
FROM pg_trigger tg
JOIN pg_class tbl ON tg.tgrelid = tbl.oid
JOIN pg_proc proc ON tg.tgfoid = proc.oid
WHERE tg.tgname = 'on_auth_user_created';

-- 2. Verificar se a função handle_new_user existe
SELECT 
    proname AS function_name,
    provolatile AS volatility,
    prosecdef AS security_definer
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Verificar constraints da tabela profiles
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY', 'CHECK');

-- 4. Verificar extensões necessárias
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 5. Verificar search_path
SHOW search_path;

-- 6. Verificar permissões do schema público
SELECT 
    nspname AS schema_name,
    nspowner AS owner_oid
FROM pg_namespace 
WHERE nspname = 'public';

-- 7. Testar geração de UUID (parte importante do processo)
SELECT gen_random_uuid();

-- 8. Verificar estrutura da tabela profiles (campos obrigatórios)
SELECT 
    column_name,
    is_nullable,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND is_nullable = 'NO' 
AND column_default IS NULL
ORDER BY ordinal_position;

-- 9. Verificar se há triggers nas tabelas relacionadas
SELECT 
    trg.tgname AS trigger_name,
    tbl.relname AS table_name,
    fn.proname AS function_name
FROM pg_trigger trg
JOIN pg_class tbl ON trg.tgrelid = tbl.oid
JOIN pg_proc fn ON trg.tgfoid = fn.oid
WHERE tbl.relname IN ('profiles', 'user_credits', 'credit_transactions')
ORDER BY tbl.relname, trg.tgname;