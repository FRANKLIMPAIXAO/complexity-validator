import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import { useLogActivity } from './useActivityLog';
import type {
  Employee,
  EmployeeMetrics,
  EmployeeFeedback,
  EmployeeAction,
  EmployeePerformanceHistory,
  PerformanceLevel,
  FeedbackType,
  EmployeeActionType,
} from '@/types/employee';

// Calculate performance score based on metrics
export function calculatePerformanceScore(metrics: Partial<EmployeeMetrics>): {
  score: number;
  level: PerformanceLevel;
} {
  let score = 50; // Base score

  // Tasks completion rate (0-25 points)
  if (metrics.tasks_assigned && metrics.tasks_assigned > 0) {
    const completionRate = (metrics.tasks_completed || 0) / metrics.tasks_assigned;
    score += Math.round(completionRate * 25);
  }

  // On-time delivery (0-25 points)
  if (metrics.tasks_completed && metrics.tasks_completed > 0) {
    const onTimeRate = (metrics.tasks_on_time || 0) / metrics.tasks_completed;
    score += Math.round(onTimeRate * 25);
  }

  // Rework penalty (-15 points max)
  if (metrics.tasks_completed && metrics.tasks_completed > 0) {
    const reworkRate = (metrics.tasks_rework || 0) / metrics.tasks_completed;
    score -= Math.round(reworkRate * 15);
  }

  // Obligations on time (0-15 points)
  if (metrics.obligations_delivered && metrics.obligations_delivered > 0) {
    const obligationsOnTimeRate = 1 - ((metrics.obligations_delayed || 0) / metrics.obligations_delivered);
    score += Math.round(obligationsOnTimeRate * 15);
  }

  // Errors penalty (-10 points max)
  if (metrics.obligations_delivered && metrics.obligations_delivered > 0) {
    const errorRate = (metrics.obligations_errors || 0) / metrics.obligations_delivered;
    score -= Math.round(errorRate * 10);
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  // Determine level
  let level: PerformanceLevel;
  if (score >= 85) level = 'alto_desempenho';
  else if (score >= 65) level = 'desempenho_adequado';
  else if (score >= 45) level = 'atencao';
  else level = 'risco_operacional';

  return { score, level };
}

// Employees hooks
export function useEmployees() {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employees', company?.id],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useEmployee(employeeId: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!user?.id || !employeeId || !company?.id) return null;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('company_id', company.id)
        .single();

      if (error) throw error;
      return data as Employee;
    },
    enabled: !!user?.id && !!employeeId && !!company?.id,
  });
}

export function useCreateEmployee() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id' | 'user_id' | 'company_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('employees')
        .insert({ ...employee, user_id: user.id, company_id: company.id })
        .select()
        .single();

      if (error) throw error;
      return data as Employee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      logActivity.mutate({
        action_type: 'criacao',
        entity_type: 'employee',
        entity_id: data.id,
        entity_name: data.name,
        description: `Novo colaborador cadastrado: ${data.name}`,
      });
      toast.success('Colaborador cadastrado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar colaborador');
      console.error(error);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Employee> & { id: string }) => {
      const { error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Colaborador atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar colaborador');
      console.error(error);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      logActivity.mutate({
        action_type: 'exclusao',
        entity_type: 'employee',
        entity_id: id,
        description: `Colaborador desativado`,
      });
      toast.success('Colaborador desativado!');
    },
    onError: (error) => {
      toast.error('Erro ao desativar colaborador');
      console.error(error);
    },
  });
}

// Metrics hooks
export function useEmployeeMetrics(employeeId?: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee-metrics', company?.id, employeeId],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];

      let query = supabase
        .from('employee_metrics')
        .select('*')
        .eq('company_id', company.id)
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmployeeMetrics[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useCreateEmployeeMetrics() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metrics: Omit<EmployeeMetrics, 'id' | 'user_id' | 'company_id' | 'created_at' | 'updated_at' | 'performance_score' | 'performance_level'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { score, level } = calculatePerformanceScore(metrics);

      const { data, error } = await supabase
        .from('employee_metrics')
        .insert({
          ...metrics,
          user_id: user.id,
          company_id: company.id,
          performance_score: score,
          performance_level: level,
        })
        .select()
        .single();

      if (error) throw error;
      return data as EmployeeMetrics;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-metrics'] });
      toast.success('Métricas registradas com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar métricas');
      console.error(error);
    },
  });
}

export function useUpdateEmployeeMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmployeeMetrics> & { id: string }) => {
      const { score, level } = calculatePerformanceScore(data);

      const { error } = await supabase
        .from('employee_metrics')
        .update({
          ...data,
          performance_score: score,
          performance_level: level,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-metrics'] });
      toast.success('Métricas atualizadas!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar métricas');
      console.error(error);
    },
  });
}

// Feedback hooks
export function useEmployeeFeedback(employeeId?: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee-feedback', company?.id, employeeId],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];

      let query = supabase
        .from('employee_feedback')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmployeeFeedback[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useCreateEmployeeFeedback() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedback: Omit<EmployeeFeedback, 'id' | 'user_id' | 'company_id' | 'created_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('employee_feedback')
        .insert({ ...feedback, user_id: user.id, company_id: company.id })
        .select()
        .single();

      if (error) throw error;
      return data as EmployeeFeedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-feedback'] });
      toast.success('Feedback registrado!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar feedback');
      console.error(error);
    },
  });
}

// Actions hooks
export function useEmployeeActions(employeeId?: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee-actions', company?.id, employeeId],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];

      let query = supabase
        .from('employee_actions')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmployeeAction[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useCreateEmployeeAction() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: Omit<EmployeeAction, 'id' | 'user_id' | 'company_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('employee_actions')
        .insert({ ...action, user_id: user.id, company_id: company.id })
        .select()
        .single();

      if (error) throw error;
      return data as EmployeeAction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-actions'] });
      toast.success('Ação criada!');
    },
    onError: (error) => {
      toast.error('Erro ao criar ação');
      console.error(error);
    },
  });
}

export function useCompleteEmployeeAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from('employee_actions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          notes,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-actions'] });
      toast.success('Ação concluída!');
    },
    onError: (error) => {
      toast.error('Erro ao concluir ação');
      console.error(error);
    },
  });
}

// Performance history hooks
export function useEmployeePerformanceHistory(employeeId?: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee-performance-history', company?.id, employeeId],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];

      let query = supabase
        .from('employee_performance_history')
        .select('*')
        .eq('company_id', company.id)
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmployeePerformanceHistory[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useRecordPerformanceHistory() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (history: Omit<EmployeePerformanceHistory, 'id' | 'user_id' | 'company_id' | 'recorded_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('employee_performance_history')
        .insert({ ...history, user_id: user.id, company_id: company.id })
        .select()
        .single();

      if (error) throw error;
      return data as EmployeePerformanceHistory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-performance-history'] });
    },
    onError: (error) => {
      console.error('Error recording performance history:', error);
    },
  });
}
