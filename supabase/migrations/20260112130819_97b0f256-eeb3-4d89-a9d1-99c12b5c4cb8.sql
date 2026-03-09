
-- Corrigir policy permissiva de INSERT em companies
-- Apenas usuários autenticados podem criar empresas
DROP POLICY IF EXISTS "Anyone can create a company" ON public.companies;

CREATE POLICY "Authenticated users can create a company"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Corrigir policy de user_roles para INSERT específico
-- Separar a policy "FOR ALL" em policies específicas
DROP POLICY IF EXISTS "Admins can manage roles in their company" ON public.user_roles;

CREATE POLICY "Admins can insert roles in their company"
ON public.user_roles FOR INSERT
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update roles in their company"
ON public.user_roles FOR UPDATE
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete roles in their company"
ON public.user_roles FOR DELETE
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- Função para auto-atribuir role de admin ao criar empresa
CREATE OR REPLACE FUNCTION public.assign_admin_role_on_company_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir role de admin para o usuário que criou a empresa
  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (auth.uid(), NEW.id, 'admin');
  
  -- Atualizar o profile do usuário com o company_id
  UPDATE public.profiles
  SET company_id = NEW.id
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$;

-- Trigger para auto-atribuir admin
CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role_on_company_creation();
