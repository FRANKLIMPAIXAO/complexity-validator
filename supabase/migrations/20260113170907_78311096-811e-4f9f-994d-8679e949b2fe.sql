-- Remove the conflicting trigger that uses auth.uid() which returns NULL with service_role
DROP TRIGGER IF EXISTS on_company_created ON public.companies;

-- Optionally, also drop the function if it's no longer needed
DROP FUNCTION IF EXISTS public.assign_admin_role_on_company_creation();