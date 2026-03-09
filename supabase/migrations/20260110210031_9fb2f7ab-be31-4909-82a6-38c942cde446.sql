-- Enum for employee performance level
CREATE TYPE public.performance_level AS ENUM (
  'alto_desempenho',
  'desempenho_adequado',
  'atencao',
  'risco_operacional'
);

-- Enum for feedback type
CREATE TYPE public.feedback_type AS ENUM (
  'cliente',
  'gestor',
  'autoavaliacao'
);

-- Enum for action type
CREATE TYPE public.employee_action_type AS ENUM (
  'melhoria_salarial',
  'reconhecimento',
  'feedback_periodico',
  'feedback_estruturado',
  'treinamento',
  'plano_desenvolvimento',
  'reavaliacao_funcao',
  'plano_corretivo'
);

-- Main employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Assistente',
  department TEXT DEFAULT 'Operações',
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee metrics (monthly tracking)
CREATE TABLE public.employee_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  -- Atendimento
  clients_served INTEGER NOT NULL DEFAULT 0,
  avg_client_complexity NUMERIC DEFAULT 0,
  monthly_demands INTEGER NOT NULL DEFAULT 0,
  -- Tarefas
  tasks_assigned INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_on_time INTEGER NOT NULL DEFAULT 0,
  tasks_rework INTEGER NOT NULL DEFAULT 0,
  -- Obrigações
  obligations_delivered INTEGER NOT NULL DEFAULT 0,
  obligations_delayed INTEGER NOT NULL DEFAULT 0,
  obligations_errors INTEGER NOT NULL DEFAULT 0,
  -- Computed
  performance_score INTEGER DEFAULT 0,
  performance_level performance_level DEFAULT 'desempenho_adequado',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, period_month, period_year)
);

-- Employee feedback
CREATE TABLE public.employee_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  feedback_type feedback_type NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee actions/recommendations
CREATE TABLE public.employee_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  action_type employee_action_type NOT NULL,
  description TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance history (for tracking evolution)
CREATE TABLE public.employee_performance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  performance_score INTEGER NOT NULL,
  performance_level performance_level NOT NULL,
  ai_analysis TEXT,
  factors JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_performance_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Users can view their own employees" ON public.employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employees" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employees" ON public.employees FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for employee_metrics
CREATE POLICY "Users can view their own employee metrics" ON public.employee_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own employee metrics" ON public.employee_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employee metrics" ON public.employee_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employee metrics" ON public.employee_metrics FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for employee_feedback
CREATE POLICY "Users can view their own employee feedback" ON public.employee_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own employee feedback" ON public.employee_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employee feedback" ON public.employee_feedback FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for employee_actions
CREATE POLICY "Users can view their own employee actions" ON public.employee_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own employee actions" ON public.employee_actions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employee actions" ON public.employee_actions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employee actions" ON public.employee_actions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for employee_performance_history
CREATE POLICY "Users can view their own performance history" ON public.employee_performance_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own performance history" ON public.employee_performance_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_metrics_updated_at BEFORE UPDATE ON public.employee_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_actions_updated_at BEFORE UPDATE ON public.employee_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();