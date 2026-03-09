-- Fase 1: Adicionar company_id às tabelas que usam apenas user_id

-- Clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Employees
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Strategic tables
ALTER TABLE public.strategic_goals ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.strategic_kpis ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.strategic_objectives ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.strategic_diagnosis ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Employee-related tables
ALTER TABLE public.employee_actions ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.employee_metrics ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.employee_clients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.employee_feedback ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.employee_performance_history ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Governance and KPI history
ALTER TABLE public.governance_reports ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.kpi_history ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Fase 2: Migrar dados existentes (preencher company_id baseado no user_id)
UPDATE public.clients SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = clients.user_id
) WHERE company_id IS NULL;

UPDATE public.employees SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = employees.user_id
) WHERE company_id IS NULL;

UPDATE public.strategic_goals SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = strategic_goals.user_id
) WHERE company_id IS NULL;

UPDATE public.strategic_kpis SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = strategic_kpis.user_id
) WHERE company_id IS NULL;

UPDATE public.strategic_objectives SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = strategic_objectives.user_id
) WHERE company_id IS NULL;

UPDATE public.strategic_diagnosis SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = strategic_diagnosis.user_id
) WHERE company_id IS NULL;

UPDATE public.employee_actions SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = employee_actions.user_id
) WHERE company_id IS NULL;

UPDATE public.employee_metrics SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = employee_metrics.user_id
) WHERE company_id IS NULL;

UPDATE public.employee_clients SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = employee_clients.user_id
) WHERE company_id IS NULL;

UPDATE public.employee_feedback SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = employee_feedback.user_id
) WHERE company_id IS NULL;

UPDATE public.employee_performance_history SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = employee_performance_history.user_id
) WHERE company_id IS NULL;

UPDATE public.governance_reports SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = governance_reports.user_id
) WHERE company_id IS NULL;

UPDATE public.kpi_history SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = kpi_history.user_id
) WHERE company_id IS NULL;

UPDATE public.notifications SET company_id = (
  SELECT company_id FROM public.profiles WHERE id = notifications.user_id
) WHERE company_id IS NULL;

-- Fase 3: Atualizar políticas RLS para usar company_id

-- CLIENTS
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

CREATE POLICY "Users can view clients in their company"
  ON public.clients FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert clients in their company"
  ON public.clients FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update clients in their company"
  ON public.clients FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete clients in their company"
  ON public.clients FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- EMPLOYEES
DROP POLICY IF EXISTS "Users can view their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can insert their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete their own employees" ON public.employees;

CREATE POLICY "Users can view employees in their company"
  ON public.employees FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert employees in their company"
  ON public.employees FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update employees in their company"
  ON public.employees FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete employees in their company"
  ON public.employees FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- STRATEGIC_OBJECTIVES
DROP POLICY IF EXISTS "Users can view their own objectives" ON public.strategic_objectives;
DROP POLICY IF EXISTS "Users can insert their own objectives" ON public.strategic_objectives;
DROP POLICY IF EXISTS "Users can update their own objectives" ON public.strategic_objectives;
DROP POLICY IF EXISTS "Users can delete their own objectives" ON public.strategic_objectives;

CREATE POLICY "Users can view objectives in their company"
  ON public.strategic_objectives FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert objectives in their company"
  ON public.strategic_objectives FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update objectives in their company"
  ON public.strategic_objectives FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete objectives in their company"
  ON public.strategic_objectives FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- STRATEGIC_GOALS
DROP POLICY IF EXISTS "Users can view their own goals" ON public.strategic_goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.strategic_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.strategic_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.strategic_goals;

CREATE POLICY "Users can view goals in their company"
  ON public.strategic_goals FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert goals in their company"
  ON public.strategic_goals FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update goals in their company"
  ON public.strategic_goals FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete goals in their company"
  ON public.strategic_goals FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- STRATEGIC_KPIS
DROP POLICY IF EXISTS "Users can view their own kpis" ON public.strategic_kpis;
DROP POLICY IF EXISTS "Users can insert their own kpis" ON public.strategic_kpis;
DROP POLICY IF EXISTS "Users can update their own kpis" ON public.strategic_kpis;
DROP POLICY IF EXISTS "Users can delete their own kpis" ON public.strategic_kpis;

CREATE POLICY "Users can view kpis in their company"
  ON public.strategic_kpis FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert kpis in their company"
  ON public.strategic_kpis FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update kpis in their company"
  ON public.strategic_kpis FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete kpis in their company"
  ON public.strategic_kpis FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- STRATEGIC_DIAGNOSIS
DROP POLICY IF EXISTS "Users can view their own diagnosis" ON public.strategic_diagnosis;
DROP POLICY IF EXISTS "Users can insert their own diagnosis" ON public.strategic_diagnosis;
DROP POLICY IF EXISTS "Users can update their own diagnosis" ON public.strategic_diagnosis;
DROP POLICY IF EXISTS "Users can delete their own diagnosis" ON public.strategic_diagnosis;

CREATE POLICY "Users can view diagnosis in their company"
  ON public.strategic_diagnosis FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert diagnosis in their company"
  ON public.strategic_diagnosis FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update diagnosis in their company"
  ON public.strategic_diagnosis FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete diagnosis in their company"
  ON public.strategic_diagnosis FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- EMPLOYEE_ACTIONS
DROP POLICY IF EXISTS "Users can view their own employee actions" ON public.employee_actions;
DROP POLICY IF EXISTS "Users can insert their own employee actions" ON public.employee_actions;
DROP POLICY IF EXISTS "Users can update their own employee actions" ON public.employee_actions;
DROP POLICY IF EXISTS "Users can delete their own employee actions" ON public.employee_actions;

CREATE POLICY "Users can view employee actions in their company"
  ON public.employee_actions FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert employee actions in their company"
  ON public.employee_actions FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update employee actions in their company"
  ON public.employee_actions FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete employee actions in their company"
  ON public.employee_actions FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- EMPLOYEE_METRICS
DROP POLICY IF EXISTS "Users can view their own employee metrics" ON public.employee_metrics;
DROP POLICY IF EXISTS "Users can insert their own employee metrics" ON public.employee_metrics;
DROP POLICY IF EXISTS "Users can update their own employee metrics" ON public.employee_metrics;
DROP POLICY IF EXISTS "Users can delete their own employee metrics" ON public.employee_metrics;

CREATE POLICY "Users can view employee metrics in their company"
  ON public.employee_metrics FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert employee metrics in their company"
  ON public.employee_metrics FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update employee metrics in their company"
  ON public.employee_metrics FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete employee metrics in their company"
  ON public.employee_metrics FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- EMPLOYEE_CLIENTS
DROP POLICY IF EXISTS "Users can view their own employee-client assignments" ON public.employee_clients;
DROP POLICY IF EXISTS "Users can insert their own employee-client assignments" ON public.employee_clients;
DROP POLICY IF EXISTS "Users can update their own employee-client assignments" ON public.employee_clients;
DROP POLICY IF EXISTS "Users can delete their own employee-client assignments" ON public.employee_clients;

CREATE POLICY "Users can view employee-client assignments in their company"
  ON public.employee_clients FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert employee-client assignments in their company"
  ON public.employee_clients FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update employee-client assignments in their company"
  ON public.employee_clients FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete employee-client assignments in their company"
  ON public.employee_clients FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- EMPLOYEE_FEEDBACK
DROP POLICY IF EXISTS "Users can view their own employee feedback" ON public.employee_feedback;
DROP POLICY IF EXISTS "Users can insert their own employee feedback" ON public.employee_feedback;
DROP POLICY IF EXISTS "Users can delete their own employee feedback" ON public.employee_feedback;

CREATE POLICY "Users can view employee feedback in their company"
  ON public.employee_feedback FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert employee feedback in their company"
  ON public.employee_feedback FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete employee feedback in their company"
  ON public.employee_feedback FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- EMPLOYEE_PERFORMANCE_HISTORY
DROP POLICY IF EXISTS "Users can view their own performance history" ON public.employee_performance_history;
DROP POLICY IF EXISTS "Users can insert their own performance history" ON public.employee_performance_history;

CREATE POLICY "Users can view performance history in their company"
  ON public.employee_performance_history FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert performance history in their company"
  ON public.employee_performance_history FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- GOVERNANCE_REPORTS
DROP POLICY IF EXISTS "Users can view their own reports" ON public.governance_reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON public.governance_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.governance_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.governance_reports;

CREATE POLICY "Users can view reports in their company"
  ON public.governance_reports FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert reports in their company"
  ON public.governance_reports FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update reports in their company"
  ON public.governance_reports FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete reports in their company"
  ON public.governance_reports FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));

-- KPI_HISTORY
DROP POLICY IF EXISTS "Users can view their own kpi history" ON public.kpi_history;
DROP POLICY IF EXISTS "Users can insert their own kpi history" ON public.kpi_history;

CREATE POLICY "Users can view kpi history in their company"
  ON public.kpi_history FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert kpi history in their company"
  ON public.kpi_history FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Users can view notifications in their company"
  ON public.notifications FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Users can insert notifications in their company"
  ON public.notifications FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());