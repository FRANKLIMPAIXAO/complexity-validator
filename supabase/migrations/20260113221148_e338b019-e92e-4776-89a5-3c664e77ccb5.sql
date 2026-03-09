-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-videos', 
  'company-videos', 
  false,
  524288000,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Storage policies for company-videos bucket
CREATE POLICY "Videos visíveis para membros da empresa"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'company-videos' AND
  (storage.foldername(name))[1]::uuid = get_user_company_id(auth.uid())
);

CREATE POLICY "Upload de vídeos por usuários da empresa"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-videos' AND
  (storage.foldername(name))[1]::uuid = get_user_company_id(auth.uid())
);

CREATE POLICY "Deletar vídeos por admins e gestores"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-videos' AND
  (storage.foldername(name))[1]::uuid = get_user_company_id(auth.uid()) AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role))
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT NOT NULL,
  duration_seconds INTEGER,
  category TEXT DEFAULT 'treinamento',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for videos
CREATE POLICY "Videos visíveis para membros da empresa"
ON public.videos FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Criar vídeos na empresa"
ON public.videos FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Atualizar vídeos na empresa"
ON public.videos FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Deletar vídeos por admins e gestores"
ON public.videos FOR DELETE
USING (
  company_id = get_user_company_id(auth.uid()) AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role))
);

-- Trigger for updated_at
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();