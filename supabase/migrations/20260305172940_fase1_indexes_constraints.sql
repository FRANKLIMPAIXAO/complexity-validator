-- ============================================================
-- FASE 1.1 — Indexes Compostos e Constraints
-- ============================================================
-- Adiciona indexes de performance que estão faltando em todas
-- as tabelas principais, e corrige o UNIQUE constraint de
-- employee_metrics que estava sem company_id.
-- ============================================================

-- ----- CLIENTS -----
CREATE INDEX IF NOT EXISTS idx_clients_company_created
  ON clients(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clients_company_underpriced
  ON clients(company_id, is_underpriced)
  WHERE is_underpriced = true;

CREATE INDEX IF NOT EXISTS idx_clients_company_level
  ON clients(company_id, complexity_level);

CREATE INDEX IF NOT EXISTS idx_clients_company_plan
  ON clients(company_id, plan_id);

-- ----- EMPLOYEES -----
CREATE INDEX IF NOT EXISTS idx_employees_company_active
  ON employees(company_id, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_employees_company_created
  ON employees(company_id, created_at DESC);

-- ----- EMPLOYEE_METRICS -----
CREATE INDEX IF NOT EXISTS idx_employee_metrics_company_period
  ON employee_metrics(company_id, period_year DESC, period_month DESC);

CREATE INDEX IF NOT EXISTS idx_employee_metrics_employee_period
  ON employee_metrics(employee_id, period_year DESC, period_month DESC);

CREATE INDEX IF NOT EXISTS idx_employee_metrics_company_level
  ON employee_metrics(company_id, performance_level);

-- Corrige UNIQUE constraint: antes era (employee_id, period_month, period_year)
-- sem company_id, permitindo colisão entre empresas diferentes
ALTER TABLE employee_metrics
  DROP CONSTRAINT IF EXISTS employee_metrics_employee_id_period_month_period_year_key;

ALTER TABLE employee_metrics
  ADD CONSTRAINT employee_metrics_unique_period
  UNIQUE(company_id, employee_id, period_month, period_year);

-- ----- EMPLOYEE_CLIENTS -----
CREATE INDEX IF NOT EXISTS idx_employee_clients_employee
  ON employee_clients(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_clients_client
  ON employee_clients(client_id);

CREATE INDEX IF NOT EXISTS idx_employee_clients_company
  ON employee_clients(company_id);

-- ----- EMPLOYEE_FEEDBACK -----
CREATE INDEX IF NOT EXISTS idx_employee_feedback_employee
  ON employee_feedback(employee_id, created_at DESC);

-- ----- EMPLOYEE_ACTIONS -----
CREATE INDEX IF NOT EXISTS idx_employee_actions_employee
  ON employee_actions(employee_id, is_completed);

-- ----- EMPLOYEE_PERFORMANCE_HISTORY -----
CREATE INDEX IF NOT EXISTS idx_perf_history_employee_period
  ON employee_performance_history(employee_id, period_year DESC, period_month DESC);

-- ----- NOTIFICATIONS -----
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_company_created
  ON notifications(company_id, created_at DESC);

-- ----- ACTIVITY_LOGS -----
CREATE INDEX IF NOT EXISTS idx_activity_logs_company_entity
  ON activity_logs(company_id, entity_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id
  ON activity_logs(entity_id);

-- ----- STRATEGIC PLANNING -----
CREATE INDEX IF NOT EXISTS idx_strategic_objectives_company_pillar
  ON strategic_objectives(company_id, pillar);

CREATE INDEX IF NOT EXISTS idx_strategic_goals_objective
  ON strategic_goals(objective_id);

CREATE INDEX IF NOT EXISTS idx_strategic_goals_company_status
  ON strategic_goals(company_id, status);

CREATE INDEX IF NOT EXISTS idx_strategic_kpis_company_pillar
  ON strategic_kpis(company_id, pillar)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_kpi_history_kpi_recorded
  ON kpi_history(kpi_id, recorded_at DESC);

-- ----- GOVERNANCE -----
CREATE INDEX IF NOT EXISTS idx_governance_reports_company_cycle
  ON governance_reports(company_id, cycle_type, period_start DESC);

-- ----- CLIENT_PROFITABILITY_CACHE -----
CREATE INDEX IF NOT EXISTS idx_profitability_cache_company
  ON client_profitability_cache(company_id);

CREATE INDEX IF NOT EXISTS idx_profitability_cache_opportunity
  ON client_profitability_cache(company_id, opportunity_score DESC);

-- ----- DOCUMENTS -----
CREATE INDEX IF NOT EXISTS idx_documents_company_competence
  ON documents(company_id, competence_id);

CREATE INDEX IF NOT EXISTS idx_documents_company_status
  ON documents(company_id, status);

-- ----- OFFICE_EXPENSES -----
CREATE INDEX IF NOT EXISTS idx_office_expenses_company_period
  ON office_expenses(company_id, year DESC, month DESC);

-- ----- MONTHLY_COMPETENCES -----
CREATE INDEX IF NOT EXISTS idx_competences_company_period
  ON monthly_competences(company_id, year DESC, month DESC);

-- ----- CLIENT_PLANS -----
CREATE INDEX IF NOT EXISTS idx_client_plans_company_sort
  ON client_plans(company_id, sort_order);

-- ----- EMPLOYEE_GOALS -----
CREATE INDEX IF NOT EXISTS idx_employee_goals_employee_status
  ON employee_goals(employee_id, status);

-- ----- EMPLOYEE_PDI -----
CREATE INDEX IF NOT EXISTS idx_employee_pdi_employee_status
  ON employee_pdi(employee_id, status);
