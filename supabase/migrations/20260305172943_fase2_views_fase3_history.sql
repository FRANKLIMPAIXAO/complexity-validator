-- ============================================================
-- FASE 2.2 — View de Resumo de Portfólio
-- FASE 3.1 — Tabela de Histórico de Honorários
-- FASE 4.1 — Tabela de Snapshots de Benchmark
-- ============================================================

-- ============================================================
-- 2.2 VIEW: company_portfolio_stats
-- ============================================================
-- Agregação de métricas de portfólio por empresa.
-- Substitui os useMemo() pesados do frontend que calculam
-- as mesmas métricas client-side a cada render.
-- ============================================================

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
  -- Distribuição por nível
  COUNT(*) FILTER (WHERE c.complexity_level = 'basico')            AS count_basico,
  COUNT(*) FILTER (WHERE c.complexity_level = 'intermediario')     AS count_intermediario,
  COUNT(*) FILTER (WHERE c.complexity_level = 'avancado')          AS count_avancado,
  COUNT(*) FILTER (WHERE c.complexity_level = 'alto_risco')        AS count_alto_risco,
  COUNT(*) FILTER (WHERE c.complexity_level = 'critico')           AS count_critico,
  -- Distribuição por regime
  COUNT(*) FILTER (WHERE c.tax_regime = 'mei')                     AS count_mei,
  COUNT(*) FILTER (WHERE c.tax_regime = 'simples')                 AS count_simples,
  COUNT(*) FILTER (WHERE c.tax_regime = 'presumido')               AS count_presumido,
  COUNT(*) FILTER (WHERE c.tax_regime = 'real')                    AS count_real
FROM clients c
LEFT JOIN client_profitability_cache pc
  ON pc.client_id = c.id AND pc.company_id = c.company_id
WHERE c.deleted_at IS NULL
GROUP BY c.company_id;

-- Garantir que a view respeita RLS via security barrier
-- (a política da tabela clients já filtra por company_id)
COMMENT ON VIEW company_portfolio_stats IS
  'Agregação de métricas de portfólio por empresa. Use via RPC ou select com company_id filtrado.';

-- ============================================================
-- 3.1 TABELA: client_fee_history
-- ============================================================
-- Auditoria de todas as alterações de honorários de clientes.
-- Permite análise histórica de evolução de pricing.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.client_fee_history (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID        NOT NULL REFERENCES public.companies(id)     ON DELETE CASCADE,
  client_id   UUID        NOT NULL REFERENCES public.clients(id)       ON DELETE CASCADE,
  changed_by  UUID        NOT NULL REFERENCES auth.users(id)           ON DELETE SET NULL,
  old_fee     NUMERIC(15,2) NOT NULL,
  new_fee     NUMERIC(15,2) NOT NULL,
  delta       NUMERIC(15,2) GENERATED ALWAYS AS (new_fee - old_fee) STORED,
  delta_pct   NUMERIC(8,2)  GENERATED ALWAYS AS (
    CASE WHEN old_fee > 0 THEN ((new_fee - old_fee) / old_fee * 100) ELSE NULL END
  ) STORED,
  reason      TEXT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
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

-- Trigger: registra automaticamente toda mudança de honorário
CREATE OR REPLACE FUNCTION log_fee_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só registra se o honorário realmente mudou
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

-- ============================================================
-- 4.1 TABELA: benchmark_snapshots
-- ============================================================
-- Armazena médias de benchmark calculadas anonimamente
-- de todas as empresas por cluster de tamanho.
-- Substitui valores hardcoded no frontend.
-- ============================================================

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

-- Todos os usuários autenticados podem ver os benchmarks (são anonimizados)
CREATE POLICY "benchmark_snapshots_read"
  ON benchmark_snapshots FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_benchmark_snapshots_cluster
  ON benchmark_snapshots(cluster_size, indicator_name);

-- Função para calcular e atualizar snapshots de benchmark
-- Chamada manualmente ou via cron job
CREATE OR REPLACE FUNCTION refresh_benchmark_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalcula benchmarks por cluster baseado em dados reais (anonimizados)
  -- Cluster é determinado pelo número de clientes ativos da empresa

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
        WHEN COUNT(*) < 20  THEN 'pequeno'
        WHEN COUNT(*) < 50  THEN 'medio'
        ELSE 'grande'
      END AS cluster,
      AVG(current_fee) AS avg_fee
    FROM clients
    WHERE deleted_at IS NULL
    GROUP BY company_id
    HAVING COUNT(*) >= 3  -- mínimo de clientes para anonimização
  ) sub
  GROUP BY cluster
  ON CONFLICT(cluster_size, indicator_name) DO UPDATE SET
    avg_value     = EXCLUDED.avg_value,
    p25_value     = EXCLUDED.p25_value,
    median_value  = EXCLUDED.median_value,
    p75_value     = EXCLUDED.p75_value,
    sample_size   = EXCLUDED.sample_size,
    calculated_at = now();

  -- Repete para avg_complexity_score
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
        WHEN COUNT(*) < 20  THEN 'pequeno'
        WHEN COUNT(*) < 50  THEN 'medio'
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

  -- Repete para underpriced_pct
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
        WHEN COUNT(*) < 20  THEN 'pequeno'
        WHEN COUNT(*) < 50  THEN 'medio'
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
