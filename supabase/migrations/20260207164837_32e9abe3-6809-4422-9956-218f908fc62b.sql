-- Fix: Corrigir política de INSERT para notifications
-- O problema é que a política atual não permite que usuários criem suas próprias notificações

-- Remover política problemática
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;

-- Criar política correta que permite inserir notificações para o próprio usuário
CREATE POLICY "Users can create own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND (
    company_id IS NULL 
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- Também adicionar política para service role/triggers criarem notificações
DROP POLICY IF EXISTS "Service can create notifications" ON public.notifications;

-- Nota: Para notificações geradas pelo sistema (background jobs), 
-- precisamos permitir inserção via trigger/function
-- Isso é feito automaticamente pelo SECURITY DEFINER em functions