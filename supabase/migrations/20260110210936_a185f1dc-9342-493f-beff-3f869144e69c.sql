-- Junction table to link employees to clients
CREATE TABLE public.employee_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  UNIQUE(employee_id, client_id)
);

-- Enable RLS
ALTER TABLE public.employee_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own employee-client assignments" 
  ON public.employee_clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own employee-client assignments" 
  ON public.employee_clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employee-client assignments" 
  ON public.employee_clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employee-client assignments" 
  ON public.employee_clients FOR DELETE USING (auth.uid() = user_id);