import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

export interface OfficeExpense {
  id: string;
  company_id: string;
  user_id: string;
  category: string;
  description: string | null;
  value: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export type OfficeExpenseFormData = {
  category: string;
  description?: string;
  value: number;
  month: number;
  year: number;
};

export const EXPENSE_CATEGORIES = [
  'Aluguel',
  'Softwares',
  'Marketing',
  'Internet',
  'Energia',
  'Ferramentas',
  'Salários',
  'Benefícios',
  'Contabilidade',
  'Materiais',
  'Manutenção',
  'Telefone',
  'Outros',
];

export function useOfficeExpenses(month?: number, year?: number) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['office-expenses', company?.id, month, year],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];

      let query = supabase
        .from('office_expenses')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (month !== undefined) query = query.eq('month', month);
      if (year !== undefined) query = query.eq('year', year);

      const { data, error } = await query;
      if (error) throw error;
      return data as OfficeExpense[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useCreateExpense() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: OfficeExpenseFormData) => {
      if (!user?.id || !company?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('office_expenses')
        .insert({
          company_id: company.id,
          user_id: user.id,
          category: formData.category,
          description: formData.description || null,
          value: formData.value,
          month: formData.month,
          year: formData.year,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-expenses'] });
      toast.success('Despesa registrada!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar despesa: ' + error.message);
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<OfficeExpenseFormData> & { id: string }) => {
      const { error } = await supabase
        .from('office_expenses')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-expenses'] });
      toast.success('Despesa atualizada!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar despesa: ' + error.message);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('office_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-expenses'] });
      toast.success('Despesa removida!');
    },
    onError: (error) => {
      toast.error('Erro ao remover despesa: ' + error.message);
    },
  });
}
