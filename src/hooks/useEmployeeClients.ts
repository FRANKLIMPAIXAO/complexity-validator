import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import { Client } from '@/types/database';

export interface EmployeeClient {
  id: string;
  user_id: string;
  company_id: string;
  employee_id: string;
  client_id: string;
  assigned_at: string;
  is_primary: boolean;
  notes?: string;
}

export interface EmployeeClientWithDetails extends EmployeeClient {
  client: Client;
}

// Get all employee-client assignments
export function useEmployeeClients(employeeId?: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['employee-clients', company?.id, employeeId],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];

      let query = supabase
        .from('employee_clients')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('company_id', company.id);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmployeeClientWithDetails[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

// Get clients not assigned to a specific employee
// FIX: era 2 queries separadas + filtro in-memory (N+1). Agora usa NOT IN para 1 roundtrip.
export function useUnassignedClients(employeeId: string) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['unassigned-clients', company?.id, employeeId],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];

      // Busca IDs de clientes já atribuídos a este colaborador
      const { data: assignments, error: assignmentsError } = await supabase
        .from('employee_clients')
        .select('client_id')
        .eq('employee_id', employeeId);

      if (assignmentsError) throw assignmentsError;

      const assignedIds = assignments?.map(a => a.client_id) ?? [];

      // Busca clientes da empresa, excluindo os já atribuídos em uma única query
      let query = supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id)
        .is('deleted_at', null)
        .order('name');

      if (assignedIds.length > 0) {
        query = query.not('id', 'in', `(${assignedIds.join(',')})`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as Client[];
    },
    enabled: !!user?.id && !!employeeId && !!company?.id,
  });
}

// Assign client to employee
export function useAssignClient() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      clientId, 
      isPrimary = false 
    }: { 
      employeeId: string; 
      clientId: string; 
      isPrimary?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const { data, error } = await supabase
        .from('employee_clients')
        .insert({
          user_id: user.id,
          company_id: company.id,
          employee_id: employeeId,
          client_id: clientId,
          is_primary: isPrimary,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-clients'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-clients'] });
      toast.success('Cliente vinculado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao vincular cliente');
      console.error(error);
    },
  });
}

// Unassign client from employee
export function useUnassignClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('employee_clients')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-clients'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-clients'] });
      toast.success('Vínculo removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover vínculo');
      console.error(error);
    },
  });
}

// Calculate auto metrics from assigned clients
export function useAutoMetrics(employeeId: string) {
  const { data: assignments = [] } = useEmployeeClients(employeeId);

  const clients = assignments.map(a => a.client);

  const metrics = {
    clientsServed: clients.length,
    avgClientComplexity: clients.length > 0
      ? clients.reduce((sum, c) => sum + c.complexity_score, 0) / clients.length
      : 0,
    totalMonthlyRevenue: clients.reduce((sum, c) => sum + c.current_fee, 0),
    underpricedClients: clients.filter(c => c.is_underpriced).length,
    highComplexityClients: clients.filter(c => c.complexity_score >= 30).length,
    totalEmployeesManaged: clients.reduce((sum, c) => sum + c.employees_count, 0),
    totalMonthlyEntries: clients.reduce((sum, c) => sum + c.monthly_entries, 0),
    riskClients: clients.filter(c => 
      c.complexity_level === 'alto_risco' || c.complexity_level === 'critico'
    ).length,
    regimeDistribution: {
      simples: clients.filter(c => c.tax_regime === 'simples').length,
      presumido: clients.filter(c => c.tax_regime === 'presumido').length,
      real: clients.filter(c => c.tax_regime === 'real').length,
    },
  };

  return { metrics, clients, assignments };
}
