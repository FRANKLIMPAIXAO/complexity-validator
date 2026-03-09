
-- Add MEI to tax_regime enum
ALTER TYPE public.tax_regime ADD VALUE IF NOT EXISTS 'mei' BEFORE 'simples';

-- Add new complexity fields to clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS monthly_invoices integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_tax_substitution boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_import_operations boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_ecommerce boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS complex_payroll boolean NOT NULL DEFAULT false;
