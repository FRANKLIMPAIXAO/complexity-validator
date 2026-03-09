
-- Create office_expenses table for tracking operational costs
CREATE TABLE public.office_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  value NUMERIC NOT NULL DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.office_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view expenses in their company"
  ON public.office_expenses FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert expenses in their company"
  ON public.office_expenses FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update expenses in their company"
  ON public.office_expenses FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete expenses in their company"
  ON public.office_expenses FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));
