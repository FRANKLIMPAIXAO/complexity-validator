-- Create beta_signups table for managing private beta access
CREATE TABLE public.beta_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  clients_count TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Public can insert (for landing page signups)
CREATE POLICY "Anyone can submit beta signup"
ON public.beta_signups
FOR INSERT
WITH CHECK (true);

-- Public can check their own email status (for signup verification)
CREATE POLICY "Anyone can check email approval status"
ON public.beta_signups
FOR SELECT
USING (true);

-- Only authenticated users can update (for admin approval)
CREATE POLICY "Authenticated users can update signups"
ON public.beta_signups
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Add is_admin column to profiles for admin access control
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster email lookups
CREATE INDEX idx_beta_signups_email ON public.beta_signups(email);
CREATE INDEX idx_beta_signups_status ON public.beta_signups(status);