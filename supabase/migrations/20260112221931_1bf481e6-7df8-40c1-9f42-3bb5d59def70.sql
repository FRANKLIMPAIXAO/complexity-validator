-- Remover política existente de INSERT
DROP POLICY IF EXISTS "Allow authenticated users to insert companies" ON public.companies;

-- Criar política usando TO public (consistente com outras políticas da tabela)
-- auth.uid() IS NOT NULL garante que apenas usuários autenticados podem inserir
CREATE POLICY "Authenticated users can create company"
ON public.companies
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);