-- 1. Corrigir politica de videos - SELECT aberto demais
DROP POLICY IF EXISTS "Videos públicos para todos" ON public.videos;
CREATE POLICY "Users can view public or company videos" ON public.videos
  FOR SELECT TO authenticated
  USING (is_public = true OR company_id = get_user_company_id(auth.uid()));

-- 2. Corrigir INSERT na companies - WITH CHECK (true) muito permissivo
DROP POLICY IF EXISTS "Authenticated users can insert company" ON public.companies;
CREATE POLICY "Users without company can insert" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (get_user_company_id(auth.uid()) IS NULL);