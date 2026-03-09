
-- Alterar o trigger para 15 dias
CREATE OR REPLACE FUNCTION set_trial_defaults()
RETURNS TRIGGER AS $$
BEGIN
  NEW.trial_expires_at := now() + interval '15 days';
  NEW.subscription_status := 'trial';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Atualizar usuarios existentes em trial para ganhar mais tempo
UPDATE public.profiles
SET trial_expires_at = created_at + interval '15 days'
WHERE subscription_status = 'trial';
