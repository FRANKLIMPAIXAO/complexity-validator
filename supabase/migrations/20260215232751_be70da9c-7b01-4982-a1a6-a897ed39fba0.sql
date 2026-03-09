
-- Table: employee_goals (Metas SMART)
CREATE TABLE public.employee_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_specific boolean NOT NULL DEFAULT false,
  is_measurable boolean NOT NULL DEFAULT false,
  is_achievable boolean NOT NULL DEFAULT false,
  is_relevant boolean NOT NULL DEFAULT false,
  is_time_bound boolean NOT NULL DEFAULT false,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  deadline date,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view goals in their company" ON public.employee_goals FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can insert goals in their company" ON public.employee_goals FOR INSERT WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can update goals in their company" ON public.employee_goals FOR UPDATE USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Admins can delete goals in their company" ON public.employee_goals FOR DELETE USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

CREATE TRIGGER update_employee_goals_updated_at BEFORE UPDATE ON public.employee_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: employee_competence_evaluations (CHA + Competências + 360)
CREATE TABLE public.employee_competence_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period_month integer NOT NULL,
  period_year integer NOT NULL,
  evaluator_type text NOT NULL DEFAULT 'gestor',
  conhecimento_score integer NOT NULL DEFAULT 3,
  habilidade_score integer NOT NULL DEFAULT 3,
  atitude_score integer NOT NULL DEFAULT 3,
  responsabilidade integer NOT NULL DEFAULT 3,
  comunicacao integer NOT NULL DEFAULT 3,
  organizacao integer NOT NULL DEFAULT 3,
  proatividade integer NOT NULL DEFAULT 3,
  trabalho_equipe integer NOT NULL DEFAULT 3,
  lideranca integer NOT NULL DEFAULT 3,
  comments text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_competence_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evaluations in their company" ON public.employee_competence_evaluations FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can insert evaluations in their company" ON public.employee_competence_evaluations FOR INSERT WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can update evaluations in their company" ON public.employee_competence_evaluations FOR UPDATE USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Admins can delete evaluations in their company" ON public.employee_competence_evaluations FOR DELETE USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- Table: employee_pdi (Plano de Desenvolvimento Individual)
CREATE TABLE public.employee_pdi (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  ponto_forte text,
  ponto_melhoria text,
  acao_pratica text,
  deadline date,
  responsavel text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_pdi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pdi in their company" ON public.employee_pdi FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can insert pdi in their company" ON public.employee_pdi FOR INSERT WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can update pdi in their company" ON public.employee_pdi FOR UPDATE USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Admins can delete pdi in their company" ON public.employee_pdi FOR DELETE USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

CREATE TRIGGER update_employee_pdi_updated_at BEFORE UPDATE ON public.employee_pdi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
