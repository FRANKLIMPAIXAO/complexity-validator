-- Remover TODAS as políticas existentes de INSERT na tabela companies
DROP POLICY IF EXISTS "Authenticated users can create a company" ON public.companies;
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.companies;

-- Recriar a política de INSERT de forma explícita e simples
CREATE POLICY "Allow authenticated users to insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Verificar e garantir que o trigger existe
DROP TRIGGER IF EXISTS on_company_created ON public.companies;

CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role_on_company_creation();