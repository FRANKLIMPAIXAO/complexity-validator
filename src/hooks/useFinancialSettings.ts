import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import { ComplexityLevel } from '@/types/database';

// ============================================================
// Configurações financeiras do escritório
// Centraliza os valores que antes estavam hardcoded em:
//   - useStrategicAI.ts (base_cost = 350)
//   - useRadarOportunidades.ts (base_cost = 350, complexity_factor = 5, target_margin = 0.30)
//   - src/lib/scoreCalculator.ts (PRICE_RANGES)
// ============================================================

export interface FinancialSettings {
  id: string;
  company_id: string;
  base_cost_per_client: number;
  complexity_cost_factor: number;
  target_margin: number;
  created_at: string;
  updated_at: string;
}

// Valores padrão quando não há configuração cadastrada
export const FINANCIAL_SETTINGS_DEFAULTS: Omit<FinancialSettings, 'id' | 'company_id' | 'created_at' | 'updated_at'> = {
  base_cost_per_client: 350,
  complexity_cost_factor: 5,
  target_margin: 0.30,
};

// Faixas de precificação de referência por nível de complexidade
export const PRICE_RANGES: Record<ComplexityLevel, { min: number; max: number }> = {
  basico:        { min: 300,  max: 600 },
  intermediario: { min: 600,  max: 1200 },
  avancado:      { min: 1200, max: 2500 },
  alto_risco:    { min: 2500, max: 5000 },
  critico:       { min: 5000, max: 10000 },
};

export function useFinancialSettings() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['financial-settings', company?.id],
    queryFn: async () => {
      if (!user || !company?.id) return null;

      const { data, error } = await supabase
        .from('office_financial_settings')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();

      if (error) throw error;
      return data as FinancialSettings | null;
    },
    enabled: !!user && !!company?.id,
  });

  // Retorna settings reais ou defaults
  const settings = query.data ?? {
    ...FINANCIAL_SETTINGS_DEFAULTS,
    id: '',
    company_id: company?.id ?? '',
    created_at: '',
    updated_at: '',
  };

  // Calcula custo estimado e honorário recomendado para um dado score
  const calcProfitability = (complexityScore: number, currentFee: number) => {
    const estimatedCost = settings.base_cost_per_client + (complexityScore * settings.complexity_cost_factor);
    const recommendedFee = settings.target_margin < 1
      ? estimatedCost / (1 - settings.target_margin)
      : estimatedCost * 2;
    const marginValue = currentFee - estimatedCost;
    const marginPct = recommendedFee > 0 ? marginValue / recommendedFee : 0;
    const opportunityScore = Math.max(recommendedFee - currentFee, 0) + (complexityScore * 2);

    return { estimatedCost, recommendedFee, marginValue, marginPct, opportunityScore };
  };

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<FinancialSettings, 'id' | 'company_id' | 'created_at' | 'updated_at'>>) => {
      if (!user || !company?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('office_financial_settings')
        .upsert({ company_id: company.id, ...updates })
        .select()
        .single();

      if (error) throw error;
      return data as FinancialSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-settings', company?.id] });
      toast.success('Configurações financeiras atualizadas!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar configurações: ' + error.message);
    },
  });

  return {
    settings,
    isLoading: query.isLoading,
    calcProfitability,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    PRICE_RANGES,
  };
}
