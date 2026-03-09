-- Corrigir política RLS de INSERT para companies
DROP POLICY IF EXISTS "Authenticated users can create a company" ON public.companies;

CREATE POLICY "Authenticated users can create a company"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK (true);

-- Recriar o trigger para atualizar o profile após criar empresa
CREATE OR REPLACE FUNCTION public.assign_admin_role_on_company_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir role de admin para o usuário que criou a empresa
  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (auth.uid(), NEW.id, 'admin')
  ON CONFLICT (user_id, company_id) DO NOTHING;
  
  -- Atualizar o profile do usuário com o company_id
  UPDATE public.profiles
  SET company_id = NEW.id
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$;