export interface ClusterProfile {
  sizeCategory: 'pequeno' | 'medio' | 'grande';
  predominantRegime: 'simples' | 'presumido' | 'real';
  hasTeam: boolean;
}

export interface BenchmarkIndicator {
  id: string;
  name: string;
  description: string;
  userValue: number;
  clusterAverage: number;
  differencePercent: number;
  direction: 'above' | 'below';
  severity: 'normal' | 'moderate' | 'critical';
  unit: string;
  category: 'financial' | 'portfolio' | 'operational';
  pillar: 'financeiro' | 'operacoes';
}

export interface BenchmarkAlert {
  indicatorId: string;
  indicatorName: string;
  message: string;
  severity: 'moderate' | 'critical';
  suggestedObjective: string;
  suggestedJustification: string;
  suggestedImpact: string;
  pillar: 'financeiro' | 'operacoes';
}

export interface AIAnalysis {
  explanation: string;
  factors: string[];
  strategicImpact: string;
  riskOrOpportunity: string;
  recommendation: string;
}

export interface BenchmarkMetrics {
  ticketMedio: number;
  percentualSubprecificados: number;
  scoreMedioComplexidade: number;
  mrrTotal: number;
  receitaPorColaborador: number;
  complexidadeMediaCliente: number;
}

// Simulated cluster averages (in a real scenario, this would come from aggregated anonymous data)
export const CLUSTER_AVERAGES: Record<string, Record<string, number>> = {
  'pequeno-simples': {
    ticketMedio: 850,
    percentualSubprecificados: 25,
    scoreMedioComplexidade: 18,
    mrrTotal: 12000,
    receitaPorColaborador: 8500,
    complexidadeMediaCliente: 15,
  },
  'pequeno-presumido': {
    ticketMedio: 1200,
    percentualSubprecificados: 20,
    scoreMedioComplexidade: 22,
    mrrTotal: 18000,
    receitaPorColaborador: 10000,
    complexidadeMediaCliente: 20,
  },
  'pequeno-real': {
    ticketMedio: 2500,
    percentualSubprecificados: 15,
    scoreMedioComplexidade: 28,
    mrrTotal: 35000,
    receitaPorColaborador: 15000,
    complexidadeMediaCliente: 25,
  },
  'medio-simples': {
    ticketMedio: 750,
    percentualSubprecificados: 22,
    scoreMedioComplexidade: 16,
    mrrTotal: 45000,
    receitaPorColaborador: 9000,
    complexidadeMediaCliente: 14,
  },
  'medio-presumido': {
    ticketMedio: 1100,
    percentualSubprecificados: 18,
    scoreMedioComplexidade: 20,
    mrrTotal: 65000,
    receitaPorColaborador: 11000,
    complexidadeMediaCliente: 18,
  },
  'medio-real': {
    ticketMedio: 2200,
    percentualSubprecificados: 12,
    scoreMedioComplexidade: 26,
    mrrTotal: 120000,
    receitaPorColaborador: 16000,
    complexidadeMediaCliente: 24,
  },
  'grande-simples': {
    ticketMedio: 680,
    percentualSubprecificados: 20,
    scoreMedioComplexidade: 15,
    mrrTotal: 150000,
    receitaPorColaborador: 8000,
    complexidadeMediaCliente: 13,
  },
  'grande-presumido': {
    ticketMedio: 950,
    percentualSubprecificados: 15,
    scoreMedioComplexidade: 19,
    mrrTotal: 200000,
    receitaPorColaborador: 12000,
    complexidadeMediaCliente: 17,
  },
  'grande-real': {
    ticketMedio: 1900,
    percentualSubprecificados: 10,
    scoreMedioComplexidade: 24,
    mrrTotal: 350000,
    receitaPorColaborador: 18000,
    complexidadeMediaCliente: 22,
  },
};
