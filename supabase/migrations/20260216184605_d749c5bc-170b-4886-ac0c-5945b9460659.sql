
-- Fix the correct function name
CREATE OR REPLACE FUNCTION public.set_trial_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.trial_expires_at := now() + interval '15 days';
  NEW.subscription_status := 'trial';
  RETURN NEW;
END;
$function$;

-- Drop the incorrectly created function
DROP FUNCTION IF EXISTS public.set_trial_defaults();
