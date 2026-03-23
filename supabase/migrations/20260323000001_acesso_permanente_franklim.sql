-- Acesso permanente: franklim.contador@paixaoassessoriacontabil.com.br
-- Data: 2026-03-23
-- Ação: Define subscription_status='active' e remove expiração de trial

UPDATE public.profiles
SET
  subscription_status = 'active',
  trial_expires_at    = NULL,
  updated_at          = now()
WHERE
  lower(email) = 'franklim.contador@paixaoassessoriacontabil.com.br'
  OR id IN (
    SELECT id
    FROM auth.users
    WHERE lower(email) = 'franklim.contador@paixaoassessoriacontabil.com.br'
  );
