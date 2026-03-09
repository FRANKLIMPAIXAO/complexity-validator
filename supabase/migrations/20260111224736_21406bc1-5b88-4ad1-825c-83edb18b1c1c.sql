-- Add onboarding_completed field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Add onboarding_completed_at timestamp
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone;