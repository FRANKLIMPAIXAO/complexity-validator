-- ============================================================
-- FASE 1.2 — Soft Delete, Trial Auto-Expiry e Rate Limiting
-- ============================================================
-- 1. Soft delete em clients e employees (deleted_at)
-- 2. Atualiza políticas RLS para excluir registros deletados
-- 3. Função expire_trials() para expirar trials automaticamente
-- 4. Tabela api_rate_limits para controle de chamadas às Edge Functions
-- ============================================================

-- ============================================================
-- 1. SOFT DELETE: adicionar coluna deleted_at
-- ============================================================

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Índice parcial: apenas registros ativos (mais comuns nas queries)
CREATE INDEX IF NOT EXISTS idx_clients_company_active
  ON clients(company_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_employees_company_active_full
  ON employees(company_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- 2. ATUALIZAR RLS POLICIES para excluir soft-deleted
-- ============================================================
-- Clients: substituir política de SELECT para ignorar deletados

DROP POLICY IF EXISTS "Users can view clients in their company" ON clients;
CREATE POLICY "Users can view clients in their company"
  ON clients FOR SELECT TO authenticated
  USING (
    company_id = get_user_company_id(auth.uid())
    AND deleted_at IS NULL
  );

-- Employees: substituir política de SELECT
DROP POLICY IF EXISTS "Users can view employees in their company" ON employees;
CREATE POLICY "Users can view employees in their company"
  ON employees FOR SELECT TO authenticated
  USING (
    company_id = get_user_company_id(auth.uid())
    AND deleted_at IS NULL
  );

-- ============================================================
-- 3. TRIAL AUTO-EXPIRY
-- ============================================================

-- Função que expira trials vencidos
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

-- Revoke acesso público, apenas service_role pode chamar
REVOKE ALL ON FUNCTION expire_trials() FROM PUBLIC;

-- ============================================================
-- 4. TABELA DE RATE LIMITING PARA EDGE FUNCTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint     TEXT        NOT NULL,
  calls_count  INTEGER     NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ver seus próprios limites
CREATE POLICY "Users can view own rate limits"
  ON api_rate_limits FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Apenas service_role pode inserir/atualizar/deletar
-- (Edge Functions usam service_role para gerenciar rate limits)

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint
  ON api_rate_limits(user_id, endpoint);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON api_rate_limits(window_start);

-- Função de upsert para rate limiting (chamada pelas Edge Functions via service_role)
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_user_id     UUID,
  p_endpoint    TEXT,
  p_max_calls   INTEGER DEFAULT 10,
  p_window_min  INTEGER DEFAULT 60
)
RETURNS BOOLEAN  -- TRUE = dentro do limite, FALSE = excedeu
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
    -- Primeira chamada: registra
    INSERT INTO api_rate_limits(user_id, endpoint, calls_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, v_now);
    RETURN TRUE;
  END IF;

  v_window_end := v_current.window_start + (p_window_min || ' minutes')::INTERVAL;

  IF v_now > v_window_end THEN
    -- Janela expirou: reinicia contagem
    UPDATE api_rate_limits
    SET calls_count = 1, window_start = v_now
    WHERE user_id = p_user_id AND endpoint = p_endpoint;
    RETURN TRUE;
  END IF;

  IF v_current.calls_count >= p_max_calls THEN
    -- Excedeu o limite
    RETURN FALSE;
  END IF;

  -- Incrementa contador
  UPDATE api_rate_limits
  SET calls_count = calls_count + 1
  WHERE user_id = p_user_id AND endpoint = p_endpoint;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION check_and_increment_rate_limit(UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_and_increment_rate_limit(UUID, TEXT, INTEGER, INTEGER) TO service_role;
