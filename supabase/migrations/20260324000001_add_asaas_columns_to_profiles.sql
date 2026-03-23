-- Adiciona colunas de integração Asaas na tabela profiles
-- asaas_customer_id: ID do cliente no Asaas (cus_...) - usado pelo webhook para resolver o usuário
-- asaas_subscription_id: ID da assinatura no Asaas (sub_...) - para gerenciamento futuro

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT DEFAULT NULL;

-- Índice esparso para lookup eficiente no webhook
CREATE INDEX IF NOT EXISTS idx_profiles_asaas_customer
  ON public.profiles(asaas_customer_id)
  WHERE asaas_customer_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.asaas_customer_id IS
  'ID do cliente no Asaas (cus_...) — salvo pelo asaas-checkout, usado pelo asaas-webhook';

COMMENT ON COLUMN public.profiles.asaas_subscription_id IS
  'ID da assinatura no Asaas (sub_...) — salvo pelo asaas-checkout';
