
-- Fix FK constraints that block user deletion

-- beta_signups.approved_by
ALTER TABLE public.beta_signups DROP CONSTRAINT beta_signups_approved_by_fkey;
ALTER TABLE public.beta_signups ADD CONSTRAINT beta_signups_approved_by_fkey 
  FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- monthly_competences.closed_by
ALTER TABLE public.monthly_competences DROP CONSTRAINT monthly_competences_closed_by_fkey;
ALTER TABLE public.monthly_competences ADD CONSTRAINT monthly_competences_closed_by_fkey 
  FOREIGN KEY (closed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- monthly_analyses.payroll_validated_by
ALTER TABLE public.monthly_analyses DROP CONSTRAINT monthly_analyses_payroll_validated_by_fkey;
ALTER TABLE public.monthly_analyses ADD CONSTRAINT monthly_analyses_payroll_validated_by_fkey 
  FOREIGN KEY (payroll_validated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- monthly_analyses.pgdas_validated_by
ALTER TABLE public.monthly_analyses DROP CONSTRAINT monthly_analyses_pgdas_validated_by_fkey;
ALTER TABLE public.monthly_analyses ADD CONSTRAINT monthly_analyses_pgdas_validated_by_fkey 
  FOREIGN KEY (pgdas_validated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- documents.uploaded_by
ALTER TABLE public.documents DROP CONSTRAINT documents_uploaded_by_fkey;
ALTER TABLE public.documents ADD CONSTRAINT documents_uploaded_by_fkey 
  FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- documents.validated_by
ALTER TABLE public.documents DROP CONSTRAINT documents_validated_by_fkey;
ALTER TABLE public.documents ADD CONSTRAINT documents_validated_by_fkey 
  FOREIGN KEY (validated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- document_adjustments.adjusted_by
ALTER TABLE public.document_adjustments DROP CONSTRAINT document_adjustments_adjusted_by_fkey;
ALTER TABLE public.document_adjustments ADD CONSTRAINT document_adjustments_adjusted_by_fkey 
  FOREIGN KEY (adjusted_by) REFERENCES auth.users(id) ON DELETE SET NULL;
