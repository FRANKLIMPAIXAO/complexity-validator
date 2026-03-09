import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

// Types
export interface EmployeeGoal {
  id: string;
  user_id: string;
  company_id: string;
  employee_id: string;
  title: string;
  description?: string;
  is_specific: boolean;
  is_measurable: boolean;
  is_achievable: boolean;
  is_relevant: boolean;
  is_time_bound: boolean;
  target_value?: number;
  current_value: number;
  unit?: string;
  deadline?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCompetenceEvaluation {
  id: string;
  user_id: string;
  company_id: string;
  employee_id: string;
  period_month: number;
  period_year: number;
  evaluator_type: string;
  conhecimento_score: number;
  habilidade_score: number;
  atitude_score: number;
  responsabilidade: number;
  comunicacao: number;
  organizacao: number;
  proatividade: number;
  trabalho_equipe: number;
  lideranca: number;
  comments?: string;
  created_at: string;
}

export interface EmployeePDI {
  id: string;
  user_id: string;
  company_id: string;
  employee_id: string;
  title: string;
  ponto_forte?: string;
  ponto_melhoria?: string;
  acao_pratica?: string;
  deadline?: string;
  responsavel?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Goals hooks
export function useEmployeeGoals(employeeId: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee-goals', company?.id, employeeId],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];
      const { data, error } = await supabase
        .from('employee_goals')
        .select('*')
        .eq('company_id', company.id)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmployeeGoal[];
    },
    enabled: !!user?.id && !!company?.id && !!employeeId,
  });
}

export function useCreateEmployeeGoal() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Omit<EmployeeGoal, 'id' | 'user_id' | 'company_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id || !company?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('employee_goals')
        .insert({ ...goal, user_id: user.id, company_id: company.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-goals'] });
      toast.success('Meta criada com sucesso!');
    },
    onError: () => toast.error('Erro ao criar meta'),
  });
}

export function useUpdateEmployeeGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmployeeGoal> & { id: string }) => {
      const { error } = await supabase
        .from('employee_goals')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-goals'] });
      toast.success('Meta atualizada!');
    },
    onError: () => toast.error('Erro ao atualizar meta'),
  });
}

export function useDeleteEmployeeGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employee_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-goals'] });
      toast.success('Meta removida!');
    },
    onError: () => toast.error('Erro ao remover meta'),
  });
}

// Competence evaluations hooks
export function useAllCompetenceEvaluations() {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee-competence-evaluations', company?.id, 'all'],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];
      const { data, error } = await supabase
        .from('employee_competence_evaluations')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmployeeCompetenceEvaluation[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useCompetenceEvaluations(employeeId: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee-competence-evaluations', company?.id, employeeId],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];
      const { data, error } = await supabase
        .from('employee_competence_evaluations')
        .select('*')
        .eq('company_id', company.id)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmployeeCompetenceEvaluation[];
    },
    enabled: !!user?.id && !!company?.id && !!employeeId,
  });
}

export function useCreateCompetenceEvaluation() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evaluation: Omit<EmployeeCompetenceEvaluation, 'id' | 'user_id' | 'company_id' | 'created_at'>) => {
      if (!user?.id || !company?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('employee_competence_evaluations')
        .insert({ ...evaluation, user_id: user.id, company_id: company.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-competence-evaluations'] });
      toast.success('Avaliação registrada!');
    },
    onError: () => toast.error('Erro ao registrar avaliação'),
  });
}

// PDI hooks
export function useEmployeePDI(employeeId: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee-pdi', company?.id, employeeId],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];
      const { data, error } = await supabase
        .from('employee_pdi')
        .select('*')
        .eq('company_id', company.id)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmployeePDI[];
    },
    enabled: !!user?.id && !!company?.id && !!employeeId,
  });
}

export function useCreateEmployeePDI() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pdi: Omit<EmployeePDI, 'id' | 'user_id' | 'company_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id || !company?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('employee_pdi')
        .insert({ ...pdi, user_id: user.id, company_id: company.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-pdi'] });
      toast.success('PDI criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar PDI'),
  });
}

export function useUpdateEmployeePDI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmployeePDI> & { id: string }) => {
      const { error } = await supabase.from('employee_pdi').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-pdi'] });
      toast.success('PDI atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar PDI'),
  });
}

export function useDeleteEmployeePDI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employee_pdi').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-pdi'] });
      toast.success('PDI removido!');
    },
    onError: () => toast.error('Erro ao remover PDI'),
  });
}
