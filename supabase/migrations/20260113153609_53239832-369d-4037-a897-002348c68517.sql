-- Forçar reload do cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- Adicionar comentário na tabela para invalidar cache
COMMENT ON TABLE public.companies IS 'Tabela de empresas - RLS habilitado';

-- Recriar o trigger que associa o usuário como admin da empresa
DROP TRIGGER IF EXISTS on_company_created ON public.companies;

CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role_on_company_creation();