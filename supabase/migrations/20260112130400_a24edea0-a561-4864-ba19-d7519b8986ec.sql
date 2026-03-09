
-- =============================================
-- FASE 1: ARQUITETURA MULTI-TENANT
-- =============================================

-- 1.1 Criar tabela de empresas
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE NOT NULL,
  tax_regime TEXT DEFAULT 'simples' CHECK (tax_regime IN ('simples', 'presumido', 'real')),
  responsible_name TEXT,
  responsible_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 1.2 Criar enum e tabela de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'gestor', 'operacional', 'visualizador');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, company_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 1.3 Adicionar company_id na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- 1.4 Função para verificar role (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 1.5 Função para obter company_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- 1.6 Função para verificar se usuário pertence à empresa
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND company_id = _company_id
  )
$$;

-- =============================================
-- FASE 2: COMPETÊNCIAS MENSAIS
-- =============================================

-- 2.1 Criar tabela de competências mensais
CREATE TABLE public.monthly_competences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, year, month)
);

-- Enable RLS
ALTER TABLE public.monthly_competences ENABLE ROW LEVEL SECURITY;

-- 2.2 Criar tabela de análises mensais
CREATE TABLE public.monthly_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  competence_id UUID REFERENCES public.monthly_competences(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados da Folha de Pagamento
  employees_count INTEGER DEFAULT 0,
  total_payroll NUMERIC(15,2) DEFAULT 0,
  total_charges NUMERIC(15,2) DEFAULT 0,
  hires_count INTEGER DEFAULT 0,
  terminations_count INTEGER DEFAULT 0,
  
  -- Dados PGDAS
  period_revenue NUMERIC(15,2) DEFAULT 0,
  accumulated_revenue NUMERIC(15,2) DEFAULT 0,
  simples_anexo TEXT,
  das_value NUMERIC(15,2) DEFAULT 0,
  
  -- Métricas calculadas
  calculated_metrics JSONB DEFAULT '{}',
  
  -- Flags de validação
  payroll_validated BOOLEAN DEFAULT false,
  payroll_validated_at TIMESTAMPTZ,
  payroll_validated_by UUID REFERENCES auth.users(id),
  
  pgdas_validated BOOLEAN DEFAULT false,
  pgdas_validated_at TIMESTAMPTZ,
  pgdas_validated_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, competence_id)
);

-- Enable RLS
ALTER TABLE public.monthly_analyses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FASE 3: DOCUMENTOS
-- =============================================

-- 3.1 Criar enums para documentos
CREATE TYPE public.document_type AS ENUM (
  'folha_pagamento',
  'pgdas',
  'balancete',
  'dctf',
  'sped',
  'outros'
);

CREATE TYPE public.document_status AS ENUM (
  'uploaded',
  'processing',
  'extracted',
  'validated',
  'error'
);

-- 3.2 Criar tabela de documentos
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  competence_id UUID REFERENCES public.monthly_competences(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'application/pdf',
  
  status document_status DEFAULT 'uploaded',
  extracted_data JSONB DEFAULT '{}',
  extraction_confidence NUMERIC(5,2),
  extraction_error TEXT,
  
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 3.3 Criar tabela de histórico de ajustes
CREATE TABLE public.document_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  adjusted_by UUID REFERENCES auth.users(id) NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_adjustments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FASE 4: STORAGE BUCKET
-- =============================================

-- Criar bucket para documentos das empresas
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('company-documents', 'company-documents', false, 52428800); -- 50MB limit

-- =============================================
-- FASE 5: RLS POLICIES
-- =============================================

-- Companies policies
CREATE POLICY "Users can view their company"
ON public.companies FOR SELECT
USING (
  id = public.get_user_company_id(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update their company"
ON public.companies FOR UPDATE
USING (
  id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can create a company"
ON public.companies FOR INSERT
WITH CHECK (true);

-- User roles policies
CREATE POLICY "Users can view roles in their company"
ON public.user_roles FOR SELECT
USING (
  company_id = public.get_user_company_id(auth.uid())
);

CREATE POLICY "Admins can manage roles in their company"
ON public.user_roles FOR ALL
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- Monthly competences policies
CREATE POLICY "Users can view competences in their company"
ON public.monthly_competences FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins and gestors can manage competences"
ON public.monthly_competences FOR ALL
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
);

-- Monthly analyses policies
CREATE POLICY "Users can view analyses in their company"
ON public.monthly_analyses FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins and gestors can manage analyses"
ON public.monthly_analyses FOR ALL
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
);

-- Documents policies
CREATE POLICY "Users can view documents in their company"
ON public.documents FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users with upload permission can insert documents"
ON public.documents FOR INSERT
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'gestor')
    OR public.has_role(auth.uid(), 'operacional')
  )
);

CREATE POLICY "Admins and gestors can update documents"
ON public.documents FOR UPDATE
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
);

CREATE POLICY "Admins can delete documents"
ON public.documents FOR DELETE
USING (
  company_id = public.get_user_company_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- Document adjustments policies
CREATE POLICY "Users can view adjustments in their company"
ON public.document_adjustments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_id
    AND d.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Users can insert adjustments"
ON public.document_adjustments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_id
    AND d.company_id = public.get_user_company_id(auth.uid())
  )
  AND (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'gestor')
  )
);

-- Storage policies
CREATE POLICY "Users can view documents in their company"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'company-documents'
  AND (storage.foldername(name))[1] = public.get_user_company_id(auth.uid())::text
);

CREATE POLICY "Users can upload documents to their company"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-documents'
  AND (storage.foldername(name))[1] = public.get_user_company_id(auth.uid())::text
  AND (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'gestor')
    OR public.has_role(auth.uid(), 'operacional')
  )
);

CREATE POLICY "Admins can delete documents from their company"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-documents'
  AND (storage.foldername(name))[1] = public.get_user_company_id(auth.uid())::text
  AND public.has_role(auth.uid(), 'admin')
);

-- =============================================
-- FASE 6: TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_competences_updated_at
  BEFORE UPDATE ON public.monthly_competences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_analyses_updated_at
  BEFORE UPDATE ON public.monthly_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
