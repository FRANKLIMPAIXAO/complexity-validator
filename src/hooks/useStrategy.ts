import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import type {
  StrategicDiagnosis,
  StrategicObjective,
  StrategicGoal,
  StrategicKpi,
  KpiHistory,
  GovernanceReport,
  StrategicPillar,
  GoalStatus,
  PriorityLevel,
  KpiFrequency,
  GovernanceCycle,
} from '@/types/strategy';

// Diagnosis hooks
export function useDiagnosis() {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['strategic-diagnosis', company?.id],
    queryFn: async () => {
      if (!user?.id || !company?.id) return null;
      
      const { data, error } = await supabase
        .from('strategic_diagnosis')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();

      if (error) throw error;
      return data as StrategicDiagnosis | null;
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useSaveDiagnosis() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (diagnosis: Partial<StrategicDiagnosis>) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { data: existing } = await supabase
        .from('strategic_diagnosis')
        .select('id')
        .eq('company_id', company.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('strategic_diagnosis')
          .update(diagnosis)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('strategic_diagnosis')
          .insert({ ...diagnosis, user_id: user.id, company_id: company.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-diagnosis'] });
      toast.success('Diagnóstico salvo com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar diagnóstico');
      console.error(error);
    },
  });
}

// Objectives hooks
export function useObjectives() {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['strategic-objectives', company?.id],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];
      
      const { data, error } = await supabase
        .from('strategic_objectives')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StrategicObjective[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useCreateObjective() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objective: {
      pillar: StrategicPillar;
      objective: string;
      justification?: string;
      expected_impact?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { error } = await supabase
        .from('strategic_objectives')
        .insert({ ...objective, user_id: user.id, company_id: company.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-objectives'] });
      toast.success('Objetivo criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar objetivo');
      console.error(error);
    },
  });
}

export function useUpdateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<StrategicObjective> & { id: string }) => {
      const { error } = await supabase
        .from('strategic_objectives')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-objectives'] });
      toast.success('Objetivo atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar objetivo');
      console.error(error);
    },
  });
}

export function useDeleteObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('strategic_objectives')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-objectives'] });
      toast.success('Objetivo removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover objetivo');
      console.error(error);
    },
  });
}

// Goals hooks
export function useGoals() {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['strategic-goals', company?.id],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];
      
      const { data, error } = await supabase
        .from('strategic_goals')
        .select(`
          *,
          objective:strategic_objectives(*)
        `)
        .eq('company_id', company.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      return data as StrategicGoal[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useCreateGoal() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: {
      objective_id: string;
      goal_description: string;
      deadline: string;
      responsible: string;
      priority?: PriorityLevel;
      is_specific?: boolean;
      is_measurable?: boolean;
      is_achievable?: boolean;
      is_relevant?: boolean;
      is_time_bound?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { error } = await supabase
        .from('strategic_goals')
        .insert({ ...goal, user_id: user.id, company_id: company.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      toast.success('Meta criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar meta');
      console.error(error);
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<StrategicGoal> & { id: string }) => {
      const { error } = await supabase
        .from('strategic_goals')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      toast.success('Meta atualizada!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar meta');
      console.error(error);
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('strategic_goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      toast.success('Meta removida!');
    },
    onError: (error) => {
      toast.error('Erro ao remover meta');
      console.error(error);
    },
  });
}

// KPIs hooks
export function useKpis() {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['strategic-kpis', company?.id],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];
      
      const { data, error } = await supabase
        .from('strategic_kpis')
        .select(`
          *,
          goal:strategic_goals(*)
        `)
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StrategicKpi[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useCreateKpi() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kpi: {
      goal_id?: string;
      name: string;
      description?: string;
      formula?: string;
      data_source?: string;
      frequency?: KpiFrequency;
      target_value: number;
      minimum_acceptable?: number;
      unit?: string;
      pillar: StrategicPillar;
      responsible?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { error } = await supabase
        .from('strategic_kpis')
        .insert({ ...kpi, user_id: user.id, company_id: company.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-kpis'] });
      toast.success('KPI criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar KPI');
      console.error(error);
    },
  });
}

export function useUpdateKpi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<StrategicKpi> & { id: string }) => {
      const { error } = await supabase
        .from('strategic_kpis')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-kpis'] });
      toast.success('KPI atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar KPI');
      console.error(error);
    },
  });
}

export function useDeleteKpi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('strategic_kpis')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-kpis'] });
      toast.success('KPI removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover KPI');
      console.error(error);
    },
  });
}

export function useRecordKpiValue() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kpi_id, value, notes }: { kpi_id: string; value: number; notes?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      // Update current value
      const { error: updateError } = await supabase
        .from('strategic_kpis')
        .update({ current_value: value })
        .eq('id', kpi_id);
      if (updateError) throw updateError;

      // Record in history
      const { error: historyError } = await supabase
        .from('kpi_history')
        .insert({ kpi_id, recorded_value: value, notes, user_id: user.id, company_id: company.id });
      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-history'] });
      toast.success('Valor registrado!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar valor');
      console.error(error);
    },
  });
}

// Governance hooks
export function useGovernanceReports() {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['governance-reports', company?.id],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];
      
      const { data, error } = await supabase
        .from('governance_reports')
        .select('*')
        .eq('company_id', company.id)
        .order('period_end', { ascending: false });

      if (error) throw error;
      return data as GovernanceReport[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useCreateGovernanceReport() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: {
      cycle_type: GovernanceCycle;
      period_start: string;
      period_end: string;
      what_worked?: string;
      what_didnt_work?: string;
      adjustments_needed?: string;
      decisions_made?: string;
      critical_analysis?: string;
      action_plan?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { error } = await supabase
        .from('governance_reports')
        .insert({ ...report, user_id: user.id, company_id: company.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-reports'] });
      toast.success('Relatório criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar relatório');
      console.error(error);
    },
  });
}

export function useUpdateGovernanceReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<GovernanceReport> & { id: string }) => {
      const { error } = await supabase
        .from('governance_reports')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-reports'] });
      toast.success('Relatório atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar relatório');
      console.error(error);
    },
  });
}
