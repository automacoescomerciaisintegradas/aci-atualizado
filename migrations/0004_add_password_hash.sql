-- Migration: 0004_add_password_hash.sql
-- Criado em: 2025-12-06
-- Descrição: Adiciona coluna password_hash à tabela profiles

-- Adicionar coluna password_hash para armazenar senhas
ALTER TABLE profiles ADD COLUMN password_hash TEXT;

-- Criar índice para buscas por password (opcional, para validação)
CREATE INDEX IF NOT EXISTS idx_profiles_password_hash ON profiles(password_hash);
