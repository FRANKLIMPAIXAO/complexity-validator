-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'expired', 'cancelled');

-- Add trial fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN trial_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
ADD COLUMN subscription_status public.subscription_status DEFAULT 'trial';

-- Update existing users to have 'active' status (they were beta users, so they get full access)
UPDATE public.profiles 
SET subscription_status = 'active',
    trial_expires_at = NULL
WHERE id IS NOT NULL;

-- Create function to set trial on new user signup
CREATE OR REPLACE FUNCTION public.set_trial_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  NEW.trial_expires_at := now() + interval '7 days';
  NEW.subscription_status := 'trial';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically set trial for new profiles
CREATE TRIGGER on_profile_created_set_trial
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_trial_on_signup();