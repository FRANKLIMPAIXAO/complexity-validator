-- Remover a coluna is_admin da tabela profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;