
-- Fix RLS policies to be RESTRICTIVE instead of PERMISSIVE
DROP POLICY IF EXISTS "Users can view expenses in their company" ON public.office_expenses;
DROP POLICY IF EXISTS "Users can insert expenses in their company" ON public.office_expenses;
DROP POLICY IF EXISTS "Users can update expenses in their company" ON public.office_expenses;
DROP POLICY IF EXISTS "Admins can delete expenses in their company" ON public.office_expenses;

CREATE POLICY "Users can view expenses in their company"
  ON public.office_expenses AS RESTRICTIVE FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert expenses in their company"
  ON public.office_expenses AS RESTRICTIVE FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update expenses in their company"
  ON public.office_expenses AS RESTRICTIVE FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can delete expenses in their company"
  ON public.office_expenses AS RESTRICTIVE FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')));
