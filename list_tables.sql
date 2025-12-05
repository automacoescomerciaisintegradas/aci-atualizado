-- Script para listar todas as tabelas do schema 'public'
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
