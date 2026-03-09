import { useMemo, useState } from 'react';
import { useClients } from './useClients';
import { useEmployees } from './useEmployees';
import { useOfficeExpenses } from './useOfficeExpenses';
import { useFinancialSettings, FINANCIAL_SETTINGS_DEFAULTS } from './useFinancialSettings';
import { supabase } from '@/integrations/supabase/client';
import { Client, ComplexityLevel } from '@/types/database';
import { getExpectedPriceRange } from '@/lib/scoreCalculator';
import { toast } from 'sonner';

// Complexity multiplier for cost estimation
const COMPLEXITY_COST_MULTIPLIER: Record<ComplexityLevel, number> = {
  basico: 1.0,
  intermediario: 1.4,
  avancado: 1.8,
  alto_risco: 2.2,
  critico: 2.8,
};

const CLIENTS_PER_EMPLOYEE = 15;

export interface ClientProfitability {
  client: Client;
  estimatedCost: number;
  estimatedMargin: number;
  marginPercentage: number;
  recommendedFee: number;
  isUnderpriced: boolean;
  loss: number;
}

export interface FeeRecommendation {
  minimum: number;
  recommended: number;
  premium: number;
  minimumMargin: number;
  recommendedMargin: number;
  premiumMargin: number;
}

export interface PortfolioStats {
  totalClients: number;
  avgFee: number;
  avgComplexity: number;
  totalRevenue: number;
  totalCost: number;
  estimatedMargin: number;
  underpricedCount: number;
  underpricedPercentage: number;
  simpleCount: number;
  presumidoCount: number;
  realCount: number;
  basicCount: number;
  intermediarioCount: number;
  avancadoCount: number;
  altoRiscoCount: number;
  criticoCount: number;
  employeeCount: number;
  officeExpenses: number;
  avgCostPerClient: number;
}

function estimateClientCost(client: Client, baseCost: number): number {
  const multiplier = COMPLEXITY_COST_MULTIPLIER[client.complexity_level] || 1;
  return baseCost * multiplier;
}

export function usePortfolioStats() {
  const { clients, isLoading: clientsLoading } = useClients();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { settings: financialSettings } = useFinancialSettings();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { data: expenses = [], isLoading: expensesLoading } = useOfficeExpenses(currentMonth, currentYear);

  const isLoading = clientsLoading || employeesLoading || expensesLoading;

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.value, 0), [expenses]);

  const baseCostPerClient = useMemo(() => {
    if (clients.length === 0) return financialSettings.base_cost_per_client;
    if (totalExpenses > 0 && clients.length > 0) {
      return totalExpenses / clients.length;
    }
    return financialSettings.base_cost_per_client;
  }, [clients, expenses, totalExpenses, financialSettings.base_cost_per_client]);

  const profitability: ClientProfitability[] = useMemo(() => {
    return clients.map(client => {
      const estimatedCost = estimateClientCost(client, baseCostPerClient);
      const margin = client.current_fee - estimatedCost;
      const marginPct = client.current_fee > 0 ? (margin / client.current_fee) * 100 : 0;
      const range = getExpectedPriceRange(client.complexity_level);
      const recommendedFee = (range.min + range.max) / 2;
      const isUnderpriced = marginPct < 20;
      const loss = isUnderpriced ? recommendedFee - client.current_fee : 0;

      return {
        client,
        estimatedCost,
        estimatedMargin: margin,
        marginPercentage: marginPct,
        recommendedFee,
        isUnderpriced,
        loss: Math.max(0, loss),
      };
    });
  }, [clients, baseCostPerClient]);

  const stats: PortfolioStats = useMemo(() => {
    const totalRevenue = clients.reduce((s, c) => s + c.current_fee, 0);
    const totalCost = profitability.reduce((s, p) => s + p.estimatedCost, 0);
    const underpricedCount = profitability.filter(p => p.isUnderpriced).length;

    return {
      totalClients: clients.length,
      avgFee: clients.length > 0 ? totalRevenue / clients.length : 0,
      avgComplexity: clients.length > 0 ? clients.reduce((s, c) => s + c.complexity_score, 0) / clients.length : 0,
      totalRevenue,
      totalCost,
      estimatedMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      underpricedCount,
      underpricedPercentage: clients.length > 0 ? (underpricedCount / clients.length) * 100 : 0,
      simpleCount: clients.filter(c => c.tax_regime === 'simples').length,
      presumidoCount: clients.filter(c => c.tax_regime === 'presumido').length,
      realCount: clients.filter(c => c.tax_regime === 'real').length,
      basicCount: clients.filter(c => c.complexity_level === 'basico').length,
      intermediarioCount: clients.filter(c => c.complexity_level === 'intermediario').length,
      avancadoCount: clients.filter(c => c.complexity_level === 'avancado').length,
      altoRiscoCount: clients.filter(c => c.complexity_level === 'alto_risco').length,
      criticoCount: clients.filter(c => c.complexity_level === 'critico').length,
      employeeCount: employees.length,
      officeExpenses: totalExpenses,
      avgCostPerClient: clients.length > 0 ? totalCost / clients.length : 0,
    };
  }, [clients, profitability, employees, totalExpenses]);

  return { stats, profitability, isLoading, clients, employees };
}

export function calculateFeeRecommendation(
  taxRegime: string,
  monthlyRevenue: number,
  employeesCount: number,
  complexityScore: number,
  operationalVolume: number
): FeeRecommendation {
  let baseCost = FINANCIAL_SETTINGS_DEFAULTS.base_cost_per_client;

  // Tax regime factor
  if (taxRegime === 'presumido') baseCost *= 1.3;
  else if (taxRegime === 'real') baseCost *= 1.8;

  // Revenue factor
  if (monthlyRevenue > 500000) baseCost *= 1.4;
  else if (monthlyRevenue > 200000) baseCost *= 1.2;
  else if (monthlyRevenue > 50000) baseCost *= 1.1;

  // Employees factor
  if (employeesCount > 10) baseCost *= 1.3;
  else if (employeesCount > 3) baseCost *= 1.15;

  // Complexity factor
  if (complexityScore > 75) baseCost *= 1.5;
  else if (complexityScore > 55) baseCost *= 1.3;
  else if (complexityScore > 35) baseCost *= 1.15;

  // Operational volume factor
  if (operationalVolume > 300) baseCost *= 1.3;
  else if (operationalVolume > 100) baseCost *= 1.15;

  const minimum = Math.round(baseCost * 1.2); // 20% margin
  const recommended = Math.round(baseCost * 1.45); // 45% margin
  const premium = Math.round(baseCost * 1.7); // 70% margin

  return {
    minimum,
    recommended,
    premium,
    minimumMargin: 20,
    recommendedMargin: 31,
    premiumMargin: 41,
  };
}

export function useAIAnalysis() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateAnalysis = async (portfolioData: Record<string, any>, analysisType: string = 'portfolio') => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('strategic-ai-analysis', {
        body: { portfolioData, analysisType },
      });

      if (error) {
        // Obter o corpo do erro se a edge function retornar um jsonResposta de erro
        let errorMessage = error.message;
        if (error.context && typeof error.context.json === 'function') {
           try {
              const body = await error.context.json();
              if (body && body.error) {
                 errorMessage = body.error;
              }
           } catch (e) {
             // ignora falha de parse
           }
        }
        throw new Error(errorMessage);
      }
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error('AI analysis error:', err);
      toast.error(err.message || 'Erro ao gerar análise de IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analysis, isAnalyzing, generateAnalysis };
}
