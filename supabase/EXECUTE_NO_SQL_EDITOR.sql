-- ====================================================================
-- PRAXIS — Migrations de Escalabilidade (Fases 1-4)
-- Execute este arquivo no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/ccgwvtwvvyfhldrhvgyy/sql/new
-- ====================================================================


-- ====================================================================
-- FASE 1.1 — Indexes Compostos e Constraints
-- ====================================================================

-- CLIENTS
CREATE INDEX IF NOT EXISTS idx_clients_company_created
  ON clients(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clients_company_underpriced
  ON clients(company_id, is_underpriced)
  WHERE is_underpriced = true;

CREATE INDEX IF NOT EXISTS idx_clients_company_level
  ON clients(company_id, complexity_level);

CREATE INDEX IF NOT EXISTS idx_clients_company_plan
  ON clients(company_id, plan_id);

-- EMPLOYEES
CREATE INDEX IF NOT EXISTS idx_employees_company_active
  ON employees(company_id, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_employees_company_created
  ON employees(company_id, created_at DESC);

-- EMPLOYEE_METRICS
CREATE INDEX IF NOT EXISTS idx_employee_metrics_company_period
  ON employee_metrics(company_id, period_year DESC, period_month DESC);

CREATE INDEX IF NOT EXISTS idx_employee_metrics_employee_period
  ON employee_metrics(employee_id, period_year DESC, period_month DESC);

CREATE INDEX IF NOT EXISTS idx_employee_metrics_company_level
  ON employee_metrics(company_id, performance_level);

-- Corrige UNIQUE constraint: antes sem company_id (permitia colisão entre empresas)
ALTER TABLE employee_metrics
  DROP CONSTRAINT IF EXISTS employee_metrics_employee_id_period_month_period_year_key;

ALTER TABLE employee_metrics
  ADD CONSTRAINT employee_metrics_unique_period
  UNIQUE(company_id, employee_id, period_month, period_year);

-- EMPLOYEE_CLIENTS
CREATE INDEX IF NOT EXISTS idx_employee_clients_employee
  ON employee_clients(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_clients_client
  ON employee_clients(client_id);

CREATE INDEX IF NOT EXISTS idx_employee_clients_company
  ON employee_clients(company_id);

-- EMPLOYEE_FEEDBACK
CREATE INDEX IF NOT EXISTS idx_employee_feedback_employee
  ON employee_feedback(employee_id, created_at DESC);

-- EMPLOYEE_ACTIONS
CREATE INDEX IF NOT EXISTS idx_employee_actions_employee
  ON employee_actions(employee_id, is_completed);

-- EMPLOYEE_PERFORMANCE_HISTORY
CREATE INDEX IF NOT EXISTS idx_perf_history_employee_period
  ON employee_performance_history(employee_id, period_year DESC, period_month DESC);

-- NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_company_created
  ON notifications(company_id, created_at DESC);

-- ACTIVITY_LOGS
CREATE INDEX IF NOT EXISTS idx_activity_logs_company_entity
  ON activity_logs(company_id, entity_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id
  ON activity_logs(entity_id);

-- STRATEGIC PLANNING
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

-- GOVERNANCE
CREATE INDEX IF NOT EXISTS idx_governance_reports_company_cycle
  ON governance_reports(company_id, cycle_type, period_start DESC);

-- CLIENT_PROFITABILITY_CACHE
CREATE INDEX IF NOT EXISTS idx_profitability_cache_company
  ON client_profitability_cache(company_id);

CREATE INDEX IF NOT EXISTS idx_profitability_cache_opportunity
  ON client_profitability_cache(company_id, opportunity_score DESC);

-- DOCUMENTS
CREATE INDEX IF NOT EXISTS idx_documents_company_competence
  ON documents(company_id, competence_id);

CREATE INDEX IF NOT EXISTS idx_documents_company_status
  ON documents(company_id, status);

-- OFFICE_EXPENSES
CREATE INDEX IF NOT EXISTS idx_office_expenses_company_period
  ON office_expenses(company_id, year DESC, month DESC);

-- MONTHLY_COMPETENCES
CREATE INDEX IF NOT EXISTS idx_competences_company_period
  ON monthly_competences(company_id, year DESC, month DESC);

-- CLIENT_PLANS
CREATE INDEX IF NOT EXISTS idx_client_plans_company_sort
  ON client_plans(company_id, sort_order);

-- EMPLOYEE_GOALS
CREATE INDEX IF NOT EXISTS idx_employee_goals_employee_status
  ON employee_goals(employee_id, status);

-- EMPLOYEE_PDI
CREATE INDEX IF NOT EXISTS idx_employee_pdi_employee_status
  ON employee_pdi(employee_id, status);


-- ====================================================================
-- FASE 1.2 — Soft Delete, Trial Auto-Expiry e Rate Limiting
-- ====================================================================

-- 1. Colunas de soft delete
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Índices parciais para registros ativos
CREATE INDEX IF NOT EXISTS idx_clients_company_active
  ON clients(company_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_employees_company_active_full
  ON employees(company_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- 2. RLS atualizada para excluir soft-deleted
DROP POLICY IF EXISTS "Users can view clients in their company" ON clients;
CREATE POLICY "Users can view clients in their company"
  ON clients FOR SELECT TO authenticated
  USING (
    company_id = get_user_company_id(auth.uid())
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can view employees in their company" ON employees;
CREATE POLICY "Users can view employees in their company"
  ON employees FOR SELECT TO authenticated
  USING (
    company_id = get_user_company_id(auth.uid())
    AND deleted_at IS NULL
  );

-- 3. Trial auto-expiry
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE profiles
  SET subscription_status = 'expired'
  WHERE subscription_status = 'trial'
    AND trial_expires_at IS NOT NULL
    AND trial_expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION expire_trials() FROM PUBLIC;

-- 4. Rate limiting para Edge Functions
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint     TEXT        NOT NULL,
  calls_count  INTEGER     NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
  ON api_rate_limits FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint
  ON api_rate_limits(user_id, endpoint);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON api_rate_limits(window_start);

CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_user_id     UUID,
  p_endpoint    TEXT,
  p_max_calls   INTEGER DEFAULT 10,
  p_window_min  INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current    api_rate_limits%ROWTYPE;
  v_now        TIMESTAMPTZ := now();
  v_window_end TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_current
  FROM api_rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO api_rate_limits(user_id, endpoint, calls_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, v_now);
    RETURN TRUE;
  END IF;

  v_window_end := v_current.window_start + (p_window_min || ' minutes')::INTERVAL;

  IF v_now > v_window_end THEN
    UPDATE api_rate_limits
    SET calls_count = 1, window_start = v_now
    WHERE user_id = p_user_id AND endpoint = p_endpoint;
    RETURN TRUE;
  END IF;

  IF v_current.calls_count >= p_max_calls THEN
    RETURN FALSE;
  END IF;

  UPDATE api_rate_limits
  SET calls_count = calls_count + 1
  WHERE user_id = p_user_id AND endpoint = p_endpoint;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION check_and_increment_rate_limit(UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_and_increment_rate_limit(UUID, TEXT, INTEGER, INTEGER) TO service_role;


-- ====================================================================
-- FASE 2.1 — Triggers de Auto-Cálculo
-- ====================================================================

-- 1. Trigger de complexidade
CREATE OR REPLACE FUNCTION calculate_client_complexity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_score INTEGER := 0;
BEGIN
  v_score := v_score + CASE NEW.tax_regime
    WHEN 'mei'       THEN 2
    WHEN 'simples'   THEN 10
    WHEN 'presumido' THEN 20
    WHEN 'real'      THEN 30
    ELSE 10
  END;

  v_score := v_score + CASE
    WHEN NEW.monthly_revenue <= 50000  THEN 2
    WHEN NEW.monthly_revenue <= 100000 THEN 5
    WHEN NEW.monthly_revenue <= 500000 THEN 10
    ELSE 15
  END;

  v_score := v_score + LEAST(
    ROUND(COALESCE(NEW.employees_count, 0) * 1.5)::INTEGER,
    30
  );

  v_score := v_score + CASE
    WHEN COALESCE(NEW.monthly_invoices, 0) <= 20  THEN 2
    WHEN COALESCE(NEW.monthly_invoices, 0) <= 100 THEN 5
    WHEN COALESCE(NEW.monthly_invoices, 0) <= 500 THEN 10
    ELSE 15
  END;

  IF COALESCE(NEW.has_tax_substitution,  false) THEN v_score := v_score + 8;  END IF;
  IF COALESCE(NEW.has_import_operations, false) THEN v_score := v_score + 10; END IF;
  IF COALESCE(NEW.is_ecommerce,          false) THEN v_score := v_score + 5;  END IF;
  IF COALESCE(NEW.complex_payroll,       false) THEN v_score := v_score + 5;  END IF;

  NEW.complexity_score := LEAST(v_score, 100);

  NEW.complexity_level := CASE
    WHEN NEW.complexity_score <= 20 THEN 'basico'
    WHEN NEW.complexity_score <= 40 THEN 'intermediario'
    WHEN NEW.complexity_score <= 60 THEN 'avancado'
    WHEN NEW.complexity_score <= 80 THEN 'alto_risco'
    ELSE 'critico'
  END::complexity_level;

  NEW.is_underpriced := COALESCE(NEW.current_fee, 0) < CASE NEW.complexity_level
    WHEN 'basico'        THEN 300
    WHEN 'intermediario' THEN 600
    WHEN 'avancado'      THEN 1200
    WHEN 'alto_risco'    THEN 2500
    WHEN 'critico'       THEN 5000
    ELSE 300
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_client_complexity ON clients;
CREATE TRIGGER trg_client_complexity
  BEFORE INSERT OR UPDATE
    OF tax_regime, monthly_revenue, employees_count, monthly_invoices,
       has_tax_substitution, has_import_operations, is_ecommerce,
       complex_payroll, current_fee
  ON clients
  FOR EACH ROW
  EXECUTE FUNCTION calculate_client_complexity();

-- 2. Trigger de rentabilidade (atualiza client_profitability_cache)
CREATE OR REPLACE FUNCTION refresh_client_profitability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_cost         NUMERIC;
  v_complexity_factor NUMERIC;
  v_target_margin     NUMERIC;
  v_cost              NUMERIC;
  v_rec_fee           NUMERIC;
  v_margin_value      NUMERIC;
  v_margin_pct        NUMERIC;
  v_opp_score         NUMERIC;
BEGIN
  SELECT
    COALESCE(base_cost_per_client, 350),
    COALESCE(complexity_cost_factor, 5),
    COALESCE(target_margin, 0.30)
  INTO v_base_cost, v_complexity_factor, v_target_margin
  FROM office_financial_settings
  WHERE company_id = NEW.company_id
  LIMIT 1;

  IF NOT FOUND THEN
    v_base_cost         := 350;
    v_complexity_factor := 5;
    v_target_margin     := 0.30;
  END IF;

  v_cost         := v_base_cost + (NEW.complexity_score * v_complexity_factor);
  v_rec_fee      := CASE WHEN v_target_margin < 1 THEN v_cost / (1 - v_target_margin) ELSE v_cost * 2 END;
  v_margin_value := COALESCE(NEW.current_fee, 0) - v_cost;
  v_margin_pct   := CASE WHEN v_rec_fee > 0 THEN v_margin_value / v_rec_fee ELSE 0 END;
  v_opp_score    := GREATEST(v_rec_fee - COALESCE(NEW.current_fee, 0), 0) + (NEW.complexity_score * 2);

  INSERT INTO client_profitability_cache(
    company_id, client_id, estimated_cost, margin_value, margin_pct,
    recommended_fee, opportunity_score, updated_at
  )
  VALUES(
    NEW.company_id, NEW.id, v_cost, v_margin_value, v_margin_pct,
    v_rec_fee, v_opp_score, now()
  )
  ON CONFLICT(company_id, client_id) DO UPDATE SET
    estimated_cost    = EXCLUDED.estimated_cost,
    margin_value      = EXCLUDED.margin_value,
    margin_pct        = EXCLUDED.margin_pct,
    recommended_fee   = EXCLUDED.recommended_fee,
    opportunity_score = EXCLUDED.opportunity_score,
    updated_at        = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_client_profitability ON clients;
CREATE TRIGGER trg_client_profitability
  AFTER INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION refresh_client_profitability();

-- 3. Trigger: quando settings mudam, recalcula rentabilidade de todos os clientes
CREATE OR REPLACE FUNCTION refresh_company_profitability_on_settings_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE clients
  SET updated_at = now()
  WHERE company_id = NEW.company_id
    AND deleted_at IS NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_settings_refresh_profitability ON office_financial_settings;
CREATE TRIGGER trg_settings_refresh_profitability
  AFTER INSERT OR UPDATE ON office_financial_settings
  FOR EACH ROW
  EXECUTE FUNCTION refresh_company_profitability_on_settings_change();


-- ====================================================================
-- FASE 2.2 — View de Resumo de Portfólio
-- FASE 3.1 — Histórico de Honorários
-- FASE 4.1 — Benchmark Snapshots
-- ====================================================================

-- View: company_portfolio_stats
DROP VIEW IF EXISTS company_portfolio_stats;

CREATE OR REPLACE VIEW company_portfolio_stats AS
SELECT
  c.company_id,
  COUNT(*)                                                         AS total_clients,
  COUNT(*) FILTER (WHERE c.is_underpriced)                         AS underpriced_count,
  ROUND(AVG(c.complexity_score))::INTEGER                          AS avg_complexity_score,
  SUM(c.current_fee)                                               AS total_mrr,
  COALESCE(SUM(pc.recommended_fee), 0)                            AS potential_mrr,
  COALESCE(SUM(pc.recommended_fee), 0) - SUM(c.current_fee)      AS mrr_gap,
  COALESCE(SUM(pc.estimated_cost), 0)                             AS total_estimated_cost,
  COUNT(*) FILTER (WHERE c.complexity_level = 'basico')            AS count_basico,
  COUNT(*) FILTER (WHERE c.complexity_level = 'intermediario')     AS count_intermediario,
  COUNT(*) FILTER (WHERE c.complexity_level = 'avancado')          AS count_avancado,
  COUNT(*) FILTER (WHERE c.complexity_level = 'alto_risco')        AS count_alto_risco,
  COUNT(*) FILTER (WHERE c.complexity_level = 'critico')           AS count_critico,
  COUNT(*) FILTER (WHERE c.tax_regime = 'mei')                     AS count_mei,
  COUNT(*) FILTER (WHERE c.tax_regime = 'simples')                 AS count_simples,
  COUNT(*) FILTER (WHERE c.tax_regime = 'presumido')               AS count_presumido,
  COUNT(*) FILTER (WHERE c.tax_regime = 'real')                    AS count_real
FROM clients c
LEFT JOIN client_profitability_cache pc
  ON pc.client_id = c.id AND pc.company_id = c.company_id
WHERE c.deleted_at IS NULL
GROUP BY c.company_id;

COMMENT ON VIEW company_portfolio_stats IS
  'Agregação de métricas de portfólio por empresa. Use via RPC ou select com company_id filtrado.';

-- Tabela: client_fee_history
CREATE TABLE IF NOT EXISTS public.client_fee_history (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID          NOT NULL REFERENCES public.companies(id)  ON DELETE CASCADE,
  client_id   UUID          NOT NULL REFERENCES public.clients(id)    ON DELETE CASCADE,
  changed_by  UUID          NOT NULL REFERENCES auth.users(id)        ON DELETE SET NULL,
  old_fee     NUMERIC(15,2) NOT NULL,
  new_fee     NUMERIC(15,2) NOT NULL,
  delta       NUMERIC(15,2) GENERATED ALWAYS AS (new_fee - old_fee) STORED,
  delta_pct   NUMERIC(8,2)  GENERATED ALWAYS AS (
    CASE WHEN old_fee > 0 THEN ((new_fee - old_fee) / old_fee * 100) ELSE NULL END
  ) STORED,
  reason      TEXT,
  changed_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE public.client_fee_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_fee_history_client
  ON client_fee_history(client_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_history_company
  ON client_fee_history(company_id, changed_at DESC);

CREATE POLICY "fee_history_view_company"
  ON client_fee_history FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "fee_history_insert_company"
  ON client_fee_history FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- Trigger: registra mudanças de honorário automaticamente
CREATE OR REPLACE FUNCTION log_fee_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.current_fee IS DISTINCT FROM NEW.current_fee THEN
    INSERT INTO client_fee_history(company_id, client_id, changed_by, old_fee, new_fee)
    VALUES(
      NEW.company_id,
      NEW.id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      COALESCE(OLD.current_fee, 0),
      COALESCE(NEW.current_fee, 0)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fee_history ON clients;
CREATE TRIGGER trg_fee_history
  AFTER UPDATE OF current_fee ON clients
  FOR EACH ROW
  EXECUTE FUNCTION log_fee_change();

-- Tabela: benchmark_snapshots
CREATE TABLE IF NOT EXISTS public.benchmark_snapshots (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_size   TEXT        NOT NULL CHECK (cluster_size IN ('pequeno', 'medio', 'grande')),
  indicator_name TEXT        NOT NULL,
  avg_value      NUMERIC     NOT NULL,
  p25_value      NUMERIC,
  median_value   NUMERIC,
  p75_value      NUMERIC,
  sample_size    INTEGER     NOT NULL DEFAULT 0,
  calculated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cluster_size, indicator_name)
);

ALTER TABLE public.benchmark_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "benchmark_snapshots_read"
  ON benchmark_snapshots FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_benchmark_snapshots_cluster
  ON benchmark_snapshots(cluster_size, indicator_name);

CREATE OR REPLACE FUNCTION refresh_benchmark_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO benchmark_snapshots(cluster_size, indicator_name, avg_value, p25_value, median_value, p75_value, sample_size, calculated_at)
  SELECT
    cluster,
    'avg_fee',
    AVG(avg_fee),
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY avg_fee),
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY avg_fee),
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY avg_fee),
    COUNT(*),
    now()
  FROM (
    SELECT
      CASE
        WHEN COUNT(*) < 20 THEN 'pequeno'
        WHEN COUNT(*) < 50 THEN 'medio'
        ELSE 'grande'
      END AS cluster,
      AVG(current_fee) AS avg_fee
    FROM clients
    WHERE deleted_at IS NULL
    GROUP BY company_id
    HAVING COUNT(*) >= 3
  ) sub
  GROUP BY cluster
  ON CONFLICT(cluster_size, indicator_name) DO UPDATE SET
    avg_value     = EXCLUDED.avg_value,
    p25_value     = EXCLUDED.p25_value,
    median_value  = EXCLUDED.median_value,
    p75_value     = EXCLUDED.p75_value,
    sample_size   = EXCLUDED.sample_size,
    calculated_at = now();

  INSERT INTO benchmark_snapshots(cluster_size, indicator_name, avg_value, p25_value, median_value, p75_value, sample_size, calculated_at)
  SELECT
    cluster,
    'avg_complexity_score',
    AVG(avg_score),
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY avg_score),
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY avg_score),
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY avg_score),
    COUNT(*),
    now()
  FROM (
    SELECT
      CASE
        WHEN COUNT(*) < 20 THEN 'pequeno'
        WHEN COUNT(*) < 50 THEN 'medio'
        ELSE 'grande'
      END AS cluster,
      AVG(complexity_score) AS avg_score
    FROM clients
    WHERE deleted_at IS NULL
    GROUP BY company_id
    HAVING COUNT(*) >= 3
  ) sub
  GROUP BY cluster
  ON CONFLICT(cluster_size, indicator_name) DO UPDATE SET
    avg_value     = EXCLUDED.avg_value,
    p25_value     = EXCLUDED.p25_value,
    median_value  = EXCLUDED.median_value,
    p75_value     = EXCLUDED.p75_value,
    sample_size   = EXCLUDED.sample_size,
    calculated_at = now();

  INSERT INTO benchmark_snapshots(cluster_size, indicator_name, avg_value, p25_value, median_value, p75_value, sample_size, calculated_at)
  SELECT
    cluster,
    'underpriced_pct',
    AVG(underpriced_pct),
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY underpriced_pct),
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY underpriced_pct),
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY underpriced_pct),
    COUNT(*),
    now()
  FROM (
    SELECT
      CASE
        WHEN COUNT(*) < 20 THEN 'pequeno'
        WHEN COUNT(*) < 50 THEN 'medio'
        ELSE 'grande'
      END AS cluster,
      (COUNT(*) FILTER (WHERE is_underpriced)::NUMERIC / NULLIF(COUNT(*), 0) * 100) AS underpriced_pct
    FROM clients
    WHERE deleted_at IS NULL
    GROUP BY company_id
    HAVING COUNT(*) >= 3
  ) sub
  GROUP BY cluster
  ON CONFLICT(cluster_size, indicator_name) DO UPDATE SET
    avg_value     = EXCLUDED.avg_value,
    p25_value     = EXCLUDED.p25_value,
    median_value  = EXCLUDED.median_value,
    p75_value     = EXCLUDED.p75_value,
    sample_size   = EXCLUDED.sample_size,
    calculated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION refresh_benchmark_snapshots() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION refresh_benchmark_snapshots() TO service_role;

-- ====================================================================
-- FIM — Todas as migrations aplicadas com sucesso
-- ====================================================================
