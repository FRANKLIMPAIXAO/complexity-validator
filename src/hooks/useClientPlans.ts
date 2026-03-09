import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPlan, ClientPlanFormData } from '@/types/clientPlan';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

export function useClientPlans() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ['client-plans', company?.id],
    queryFn: async () => {
      if (!user || !company?.id) return [];
      
      const { data, error } = await supabase
        .from('client_plans')
        .select('*')
        .eq('company_id', company.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ClientPlan[];
    },
    enabled: !!user && !!company?.id,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (formData: ClientPlanFormData) => {
      if (!user) throw new Error('Not authenticated');
      if (!company?.id) throw new Error('No company selected');

      // Get max sort_order
      const maxOrder = (plansQuery.data || []).reduce(
        (max, p) => Math.max(max, p.sort_order),
        0
      );

      const { data, error } = await supabase
        .from('client_plans')
        .insert({
          company_id: company.id,
          name: formData.name,
          color: formData.color,
          description: formData.description || null,
          is_default: formData.is_default || false,
          sort_order: maxOrder + 1,
          default_fee: formData.default_fee ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ClientPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-plans'] });
      toast.success('Plano criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar plano: ' + error.message);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: ClientPlanFormData }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_plans')
        .update({
          name: formData.name,
          color: formData.color,
          description: formData.description || null,
          is_default: formData.is_default || false,
          default_fee: formData.default_fee ?? null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ClientPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-plans'] });
      toast.success('Plano atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar plano: ' + error.message);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('client_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-plans'] });
      toast.success('Plano removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover plano: ' + error.message);
    },
  });

  return {
    plans: plansQuery.data ?? [],
    isLoading: plansQuery.isLoading,
    error: plansQuery.error,
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
  };
}
