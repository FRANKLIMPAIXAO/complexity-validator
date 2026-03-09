-- Criar tabela de planos de clientes (dinâmica)
CREATE TABLE public.client_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  description text,
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_client_plans_company ON public.client_plans(company_id);
CREATE UNIQUE INDEX idx_client_plans_name_company ON public.client_plans(company_id, name);

-- Habilitar RLS
ALTER TABLE public.client_plans ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view plans in their company"
ON public.client_plans FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins and gestors can insert plans"
ON public.client_plans FOR INSERT
WITH CHECK (
  company_id = get_user_company_id(auth.uid()) 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'))
);

CREATE POLICY "Admins and gestors can update plans"
ON public.client_plans FOR UPDATE
USING (
  company_id = get_user_company_id(auth.uid()) 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'))
);

CREATE POLICY "Admins can delete plans"
ON public.client_plans FOR DELETE
USING (
  company_id = get_user_company_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin')
);

-- Adicionar coluna plan_id na tabela clients (referência à tabela de planos)
ALTER TABLE public.clients 
ADD COLUMN plan_id uuid REFERENCES public.client_plans(id) ON DELETE SET NULL;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_client_plans_updated_at
BEFORE UPDATE ON public.client_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();