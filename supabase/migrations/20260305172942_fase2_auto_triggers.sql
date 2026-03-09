-- ============================================================
-- FASE 2.1 — Triggers de Auto-Cálculo
-- ============================================================
-- 1. calculate_client_complexity(): recalcula complexity_score,
--    complexity_level e is_underpriced no banco a cada INSERT/UPDATE
--    de clients (elimina dependência exclusiva do frontend)
-- 2. refresh_client_profitability(): mantém client_profitability_cache
--    atualizado automaticamente usando office_financial_settings
-- ============================================================

-- ============================================================
-- 1. FUNÇÃO DE CÁLCULO DE COMPLEXIDADE
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_client_complexity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_score INTEGER := 0;
BEGIN
  -- Regime tributário
  v_score := v_score + CASE NEW.tax_regime
    WHEN 'mei'       THEN 2
    WHEN 'simples'   THEN 10
    WHEN 'presumido' THEN 20
    WHEN 'real'      THEN 30
    ELSE 10
  END;

  -- Faturamento mensal
  v_score := v_score + CASE
    WHEN NEW.monthly_revenue <= 50000  THEN 2
    WHEN NEW.monthly_revenue <= 100000 THEN 5
    WHEN NEW.monthly_revenue <= 500000 THEN 10
    ELSE 15
  END;

  -- Funcionários (capped em 30 para evitar distorção)
  v_score := v_score + LEAST(
    ROUND(COALESCE(NEW.employees_count, 0) * 1.5)::INTEGER,
    30
  );

  -- Volume de NFs
  v_score := v_score + CASE
    WHEN COALESCE(NEW.monthly_invoices, 0) <= 20  THEN 2
    WHEN COALESCE(NEW.monthly_invoices, 0) <= 100 THEN 5
    WHEN COALESCE(NEW.monthly_invoices, 0) <= 500 THEN 10
    ELSE 15
  END;

  -- Complexidades adicionais
  IF COALESCE(NEW.has_tax_substitution,  false) THEN v_score := v_score + 8;  END IF;
  IF COALESCE(NEW.has_import_operations, false) THEN v_score := v_score + 10; END IF;
  IF COALESCE(NEW.is_ecommerce,          false) THEN v_score := v_score + 5;  END IF;
  IF COALESCE(NEW.complex_payroll,       false) THEN v_score := v_score + 5;  END IF;

  NEW.complexity_score := LEAST(v_score, 100);

  -- Classificação por faixa
  NEW.complexity_level := CASE
    WHEN NEW.complexity_score <= 20 THEN 'basico'
    WHEN NEW.complexity_score <= 40 THEN 'intermediario'
    WHEN NEW.complexity_score <= 60 THEN 'avancado'
    WHEN NEW.complexity_score <= 80 THEN 'alto_risco'
    ELSE 'critico'
  END::complexity_level;

  -- Detecção de subprecificação: compara honorário atual com mínimo de referência
  -- Nota: o frontend usa faixas configuráveis, aqui usamos as faixas padrão
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

-- Trigger BEFORE INSERT OR UPDATE para recalcular no banco
DROP TRIGGER IF EXISTS trg_client_complexity ON clients;
CREATE TRIGGER trg_client_complexity
  BEFORE INSERT OR UPDATE
    OF tax_regime, monthly_revenue, employees_count, monthly_invoices,
       has_tax_substitution, has_import_operations, is_ecommerce,
       complex_payroll, current_fee
  ON clients
  FOR EACH ROW
  EXECUTE FUNCTION calculate_client_complexity();

-- ============================================================
-- 2. FUNÇÃO DE ATUALIZAÇÃO DE RENTABILIDADE
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_client_profitability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_cost        NUMERIC;
  v_complexity_factor NUMERIC;
  v_target_margin    NUMERIC;
  v_cost             NUMERIC;
  v_rec_fee          NUMERIC;
  v_margin_value     NUMERIC;
  v_margin_pct       NUMERIC;
  v_opp_score        NUMERIC;
BEGIN
  -- Buscar configurações financeiras da empresa, com defaults
  SELECT
    COALESCE(base_cost_per_client, 350),
    COALESCE(complexity_cost_factor, 5),
    COALESCE(target_margin, 0.30)
  INTO v_base_cost, v_complexity_factor, v_target_margin
  FROM office_financial_settings
  WHERE company_id = NEW.company_id
  LIMIT 1;

  -- Se não encontrou configurações, usar defaults
  IF NOT FOUND THEN
    v_base_cost         := 350;
    v_complexity_factor := 5;
    v_target_margin     := 0.30;
  END IF;

  -- Cálculos de rentabilidade
  v_cost        := v_base_cost + (NEW.complexity_score * v_complexity_factor);
  v_rec_fee     := CASE WHEN v_target_margin < 1 THEN v_cost / (1 - v_target_margin) ELSE v_cost * 2 END;
  v_margin_value := COALESCE(NEW.current_fee, 0) - v_cost;
  v_margin_pct   := CASE WHEN v_rec_fee > 0 THEN v_margin_value / v_rec_fee ELSE 0 END;
  v_opp_score    := GREATEST(v_rec_fee - COALESCE(NEW.current_fee, 0), 0) + (NEW.complexity_score * 2);

  -- UPSERT no cache de rentabilidade
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

-- Trigger AFTER INSERT OR UPDATE para atualizar cache de rentabilidade
DROP TRIGGER IF EXISTS trg_client_profitability ON clients;
CREATE TRIGGER trg_client_profitability
  AFTER INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION refresh_client_profitability();

-- ============================================================
-- 3. TRIGGER PARA REATUALIZAR RENTABILIDADE QUANDO SETTINGS MUDAM
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_company_profitability_on_settings_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Quando as configurações financeiras da empresa mudam,
  -- forçar recálculo de rentabilidade de todos os clientes
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
