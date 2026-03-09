-- Add cnpj column to clients table for unique identification
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Create unique index on cnpj per user to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS clients_cnpj_user_idx ON public.clients(user_id, cnpj) WHERE cnpj IS NOT NULL;