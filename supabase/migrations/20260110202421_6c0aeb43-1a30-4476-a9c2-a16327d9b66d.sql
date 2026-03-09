-- Criar enum para pilares estratégicos
CREATE TYPE public.strategic_pillar AS ENUM (
  'financeiro',
  'comercial', 
  'marketing',
  'operacoes',
  'pessoas',
  'tecnologia',
  'compliance'
);

-- Criar enum para status de metas
CREATE TYPE public.goal_status AS ENUM (
  'nao_iniciada',
  'em_andamento',
  'concluida',
  'atrasada',
  'cancelada'
);

-- Criar enum para prioridade
CREATE TYPE public.priority_level AS ENUM (
  'baixa',
  'media',
  'alta',
  'critica'
);

-- Criar enum para frequência de apuração de KPIs
CREATE TYPE public.kpi_frequency AS ENUM (
  'diaria',
  'semanal',
  'quinzenal',
  'mensal',
  'trimestral',
  'semestral',
  'anual'
);

-- Criar enum para tipo de ciclo de governança
CREATE TYPE public.governance_cycle AS ENUM (
  'semanal',
  'mensal',
  'trimestral'
);

-- Tabela de Diagnóstico Estratégico
CREATE TABLE public.strategic_diagnosis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Identidade Estratégica
  mission TEXT,
  vision TEXT,
  core_values TEXT,
  value_proposition TEXT,
  target_audience TEXT,
  
  -- Diagnóstico Interno (SWOT - Forças e Fraquezas)
  internal_financial TEXT,
  internal_processes TEXT,
  internal_people TEXT,
  internal_technology TEXT,
  internal_commercial TEXT,
  internal_brand TEXT,
  
  -- Diagnóstico Externo (SWOT - Oportunidades e Ameaças)
  external_market TEXT,
  external_legislation TEXT,
  external_competition TEXT,
  external_technology TEXT,
  external_economy TEXT,
  
  -- Resumo gerado
  strategic_summary TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para diagnóstico
ALTER TABLE public.strategic_diagnosis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnosis"
ON public.strategic_diagnosis FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagnosis"
ON public.strategic_diagnosis FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagnosis"
ON public.strategic_diagnosis FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diagnosis"
ON public.strategic_diagnosis FOR DELETE
USING (auth.uid() = user_id);

-- Tabela de Objetivos Estratégicos
CREATE TABLE public.strategic_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pillar public.strategic_pillar NOT NULL,
  objective TEXT NOT NULL,
  justification TEXT,
  expected_impact TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para objetivos
ALTER TABLE public.strategic_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own objectives"
ON public.strategic_objectives FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own objectives"
ON public.strategic_objectives FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives"
ON public.strategic_objectives FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own objectives"
ON public.strategic_objectives FOR DELETE
USING (auth.uid() = user_id);

-- Tabela de Metas SMART
CREATE TABLE public.strategic_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  objective_id UUID NOT NULL REFERENCES public.strategic_objectives(id) ON DELETE CASCADE,
  goal_description TEXT NOT NULL,
  deadline DATE NOT NULL,
  responsible TEXT NOT NULL,
  status public.goal_status NOT NULL DEFAULT 'nao_iniciada',
  priority public.priority_level NOT NULL DEFAULT 'media',
  
  -- Validação SMART
  is_specific BOOLEAN DEFAULT false,
  is_measurable BOOLEAN DEFAULT false,
  is_achievable BOOLEAN DEFAULT false,
  is_relevant BOOLEAN DEFAULT false,
  is_time_bound BOOLEAN DEFAULT false,
  
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para metas
ALTER TABLE public.strategic_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
ON public.strategic_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.strategic_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.strategic_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.strategic_goals FOR DELETE
USING (auth.uid() = user_id);

-- Tabela de KPIs
CREATE TABLE public.strategic_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID REFERENCES public.strategic_goals(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  formula TEXT,
  data_source TEXT,
  frequency public.kpi_frequency NOT NULL DEFAULT 'mensal',
  target_value NUMERIC NOT NULL,
  minimum_acceptable NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '%',
  pillar public.strategic_pillar NOT NULL,
  responsible TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para KPIs
ALTER TABLE public.strategic_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own kpis"
ON public.strategic_kpis FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kpis"
ON public.strategic_kpis FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kpis"
ON public.strategic_kpis FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kpis"
ON public.strategic_kpis FOR DELETE
USING (auth.uid() = user_id);

-- Tabela de Histórico de KPIs
CREATE TABLE public.kpi_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kpi_id UUID NOT NULL REFERENCES public.strategic_kpis(id) ON DELETE CASCADE,
  recorded_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Habilitar RLS para histórico
ALTER TABLE public.kpi_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own kpi history"
ON public.kpi_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kpi history"
ON public.kpi_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Tabela de Relatórios de Governança
CREATE TABLE public.governance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cycle_type public.governance_cycle NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  what_worked TEXT,
  what_didnt_work TEXT,
  adjustments_needed TEXT,
  decisions_made TEXT,
  critical_analysis TEXT,
  action_plan TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para relatórios
ALTER TABLE public.governance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
ON public.governance_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
ON public.governance_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
ON public.governance_reports FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
ON public.governance_reports FOR DELETE
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_strategic_diagnosis_updated_at
BEFORE UPDATE ON public.strategic_diagnosis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategic_objectives_updated_at
BEFORE UPDATE ON public.strategic_objectives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategic_goals_updated_at
BEFORE UPDATE ON public.strategic_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategic_kpis_updated_at
BEFORE UPDATE ON public.strategic_kpis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_governance_reports_updated_at
BEFORE UPDATE ON public.governance_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();