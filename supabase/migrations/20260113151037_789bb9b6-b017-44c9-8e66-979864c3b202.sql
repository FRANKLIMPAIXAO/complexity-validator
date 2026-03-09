-- Conceder permissões para a role authenticated na tabela companies
GRANT SELECT, INSERT, UPDATE ON public.companies TO authenticated;

-- Conceder permissões para a role anon (leitura pública se necessário)
GRANT SELECT ON public.companies TO anon;

-- Também garantir que a role authenticated tenha permissão nas sequências
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;