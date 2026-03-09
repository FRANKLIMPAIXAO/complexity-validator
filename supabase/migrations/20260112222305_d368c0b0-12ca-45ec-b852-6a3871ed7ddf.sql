-- Remover política existente de INSERT
DROP POLICY IF EXISTS "Authenticated users can create company" ON public.companies;

-- Recriar política com role correta (authenticated)
-- TO authenticated garante que apenas usuários autenticados podem inserir
CREATE POLICY "Authenticated users can insert company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);