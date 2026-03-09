
-- Create activity_logs table for audit trail
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- criacao, edicao, exclusao
  entity_type TEXT NOT NULL, -- client, employee, strategy, goal, kpi
  entity_id UUID,
  entity_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs in their company
CREATE POLICY "Users can view activity logs in their company"
ON public.activity_logs
FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

-- Users can insert logs in their company
CREATE POLICY "Users can insert activity logs in their company"
ON public.activity_logs
FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_activity_logs_company_created ON public.activity_logs(company_id, created_at DESC);
