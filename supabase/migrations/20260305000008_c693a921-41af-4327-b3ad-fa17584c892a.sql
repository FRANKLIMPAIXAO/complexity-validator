
-- Table: office_financial_settings
CREATE TABLE public.office_financial_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  base_cost_per_client numeric NOT NULL DEFAULT 350,
  complexity_cost_factor numeric NOT NULL DEFAULT 5,
  target_margin numeric NOT NULL DEFAULT 0.30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

ALTER TABLE public.office_financial_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view settings in their company"
  ON public.office_financial_settings FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert settings in their company"
  ON public.office_financial_settings FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update settings in their company"
  ON public.office_financial_settings FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- Table: client_profitability_cache
CREATE TABLE public.client_profitability_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  estimated_cost numeric NOT NULL DEFAULT 0,
  margin_value numeric NOT NULL DEFAULT 0,
  margin_pct numeric NOT NULL DEFAULT 0,
  recommended_fee numeric NOT NULL DEFAULT 0,
  opportunity_score numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, client_id)
);

ALTER TABLE public.client_profitability_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cache in their company"
  ON public.client_profitability_cache FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert cache in their company"
  ON public.client_profitability_cache FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update cache in their company"
  ON public.client_profitability_cache FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete cache in their company"
  ON public.client_profitability_cache FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));
