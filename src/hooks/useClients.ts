import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client, ClientFormData } from '@/types/database';
import { calculateComplexityScore } from '@/lib/scoreCalculator';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import { useLogActivity } from './useActivityLog';
export function useClients() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  const clientsQuery = useQuery({
    queryKey: ['clients', company?.id],
    queryFn: async () => {
      if (!user || !company?.id) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user && !!company?.id,
  });

  const createClientMutation = useMutation({
    mutationFn: async (formData: ClientFormData) => {
      if (!user) throw new Error('Not authenticated');
      if (!company?.id) throw new Error('No company selected');

      const scoreResult = calculateComplexityScore(formData);

      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          company_id: company.id,
          name: formData.name,
          tax_regime: formData.tax_regime,
          monthly_entries: formData.monthly_entries,
          monthly_revenue: formData.monthly_revenue,
          employees_count: formData.employees_count,
          monthly_hires: formData.monthly_hires,
          monthly_terminations: formData.monthly_terminations,
          current_fee: formData.current_fee,
          complexity_score: scoreResult.score,
          complexity_level: scoreResult.level,
          is_underpriced: scoreResult.isUnderpriced,
          plan_id: formData.plan_id || null,
          monthly_invoices: formData.monthly_invoices || 0,
          has_tax_substitution: formData.has_tax_substitution || false,
          has_import_operations: formData.has_import_operations || false,
          is_ecommerce: formData.is_ecommerce || false,
          complex_payroll: formData.complex_payroll || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients', company?.id] });
      logActivity.mutate({
        action_type: 'criacao',
        entity_type: 'client',
        entity_id: data.id,
        entity_name: data.name,
        description: `Novo cliente cadastrado: ${data.name}`,
      });
      toast.success('Cliente cadastrado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar cliente: ' + error.message);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: ClientFormData }) => {
      if (!user) throw new Error('Not authenticated');

      const scoreResult = calculateComplexityScore(formData);

      const { data, error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          tax_regime: formData.tax_regime,
          monthly_entries: formData.monthly_entries,
          monthly_revenue: formData.monthly_revenue,
          employees_count: formData.employees_count,
          monthly_hires: formData.monthly_hires,
          monthly_terminations: formData.monthly_terminations,
          current_fee: formData.current_fee,
          complexity_score: scoreResult.score,
          complexity_level: scoreResult.level,
          is_underpriced: scoreResult.isUnderpriced,
          plan_id: formData.plan_id || null,
          monthly_invoices: formData.monthly_invoices || 0,
          has_tax_substitution: formData.has_tax_substitution || false,
          has_import_operations: formData.has_import_operations || false,
          is_ecommerce: formData.is_ecommerce || false,
          complex_payroll: formData.complex_payroll || false,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients', company?.id] });
      logActivity.mutate({
        action_type: 'edicao',
        entity_type: 'client',
        entity_id: data.id,
        entity_name: data.name,
        description: `Cliente atualizado: ${data.name}`,
      });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar cliente: ' + error.message);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      // A tabela clients não possui coluna deleted_at: remoção definitiva
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      const deletedClient = clientsQuery.data?.find(c => c.id === id);
      queryClient.invalidateQueries({ queryKey: ['clients', company?.id] });
      logActivity.mutate({
        action_type: 'exclusao',
        entity_type: 'client',
        entity_id: id,
        entity_name: deletedClient?.name,
        description: `Cliente removido: ${deletedClient?.name || id}`,
      });
      toast.success('Cliente removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover cliente: ' + error.message);
    },
  });

  const getClientById = async (id: string): Promise<Client | null> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Client | null;
  };

  return {
    clients: clientsQuery.data ?? [],
    isLoading: clientsQuery.isLoading,
    error: clientsQuery.error,
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    getClientById,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
  };
}
