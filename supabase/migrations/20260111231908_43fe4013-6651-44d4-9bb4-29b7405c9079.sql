-- Create security definer function to check admin status
-- This avoids RLS recursion by running with elevated privileges
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND is_admin = true
  )
$$;

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can check email approval status" ON public.beta_signups;
DROP POLICY IF EXISTS "Authenticated users can update signups" ON public.beta_signups;

-- Create new secure policies - only admins can read signups
CREATE POLICY "Only admins can view beta signups"
ON public.beta_signups
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Only admins can update signups
CREATE POLICY "Only admins can update beta signups"
ON public.beta_signups
FOR UPDATE
USING (public.is_admin(auth.uid()));