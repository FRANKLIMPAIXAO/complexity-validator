-- Remover políticas existentes de videos
DROP POLICY IF EXISTS "Videos visíveis para membros da empresa" ON public.videos;
DROP POLICY IF EXISTS "Criar vídeos na empresa" ON public.videos;
DROP POLICY IF EXISTS "Deletar vídeos por admins e gestores" ON public.videos;
DROP POLICY IF EXISTS "Atualizar vídeos na empresa" ON public.videos;

-- Criar nova política de SELECT pública (qualquer pessoa pode ver)
CREATE POLICY "Videos públicos para todos"
ON public.videos FOR SELECT
USING (true);

-- Política de INSERT (apenas admins podem criar)
CREATE POLICY "Apenas admins podem criar vídeos"
ON public.videos FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin')
);

-- Política de UPDATE (apenas admins)
CREATE POLICY "Apenas admins podem atualizar vídeos"
ON public.videos FOR UPDATE
USING (
  has_role(auth.uid(), 'admin')
);

-- Política de DELETE (apenas admins)
CREATE POLICY "Apenas admins podem deletar vídeos"
ON public.videos FOR DELETE
USING (
  has_role(auth.uid(), 'admin')
);