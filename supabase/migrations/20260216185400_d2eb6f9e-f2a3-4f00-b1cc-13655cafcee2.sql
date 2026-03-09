
-- Make audit columns nullable so SET NULL works on user deletion
ALTER TABLE public.documents ALTER COLUMN uploaded_by DROP NOT NULL;
ALTER TABLE public.document_adjustments ALTER COLUMN adjusted_by DROP NOT NULL;
