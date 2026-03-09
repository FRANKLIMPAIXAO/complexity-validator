import { useMemo, useState } from 'react';
import { useClients } from './useClients';
import { supabase } from '@/integrations/supabase/client';
import { 
  BenchmarkIndicator, 
  BenchmarkAlert, 
  ClusterProfile, 
  AIAnalysis,
  CLUSTER_AVERAGES 
} from '@/types/benchmark';

export function useBenchmark() {
  const { clients, isLoading } = useClients();
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, AIAnalysis>>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<string | null>(null);

  // Determine cluster profile based on portfolio
  const clusterProfile = useMemo((): ClusterProfile => {
    if (!clients.length) {
      return { sizeCategory: 'pequeno', predominantRegime: 'simples', hasTeam: false };
    }

    // Size category based on number of clients
    let sizeCategory: ClusterProfile['sizeCategory'] = 'pequeno';
    if (clients.length >= 50) sizeCategory = 'grande';
    else if (clients.length >= 20) sizeCategory = 'medio';

    // Predominant tax regime
    const regimeCounts = clients.reduce((acc, client) => {
      acc[client.tax_regime] = (acc[client.tax_regime] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const predominantRegime = Object.entries(regimeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as ClusterProfile['predominantRegime'] || 'simples';

    // Has team if total employees > 5
    const totalEmployees = clients.reduce((sum, c) => sum + c.employees_count, 0);
    const hasTeam = totalEmployees > 5;

    return { sizeCategory, predominantRegime, hasTeam };
  }, [clients]);

  // Get cluster averages based on profile
  const clusterAverages = useMemo(() => {
    const key = `${clusterProfile.sizeCategory}-${clusterProfile.predominantRegime}`;
    return CLUSTER_AVERAGES[key] || CLUSTER_AVERAGES['pequeno-simples'];
  }, [clusterProfile]);

  // Calculate user metrics
  const userMetrics = useMemo(() => {
    if (!clients.length) {
      return {
        ticketMedio: 0,
        percentualSubprecificados: 0,
        scoreMedioComplexidade: 0,
        mrrTotal: 0,
        receitaPorColaborador: 0,
        complexidadeMediaCliente: 0,
      };
    }

    const totalFees = clients.reduce((sum, c) => sum + c.current_fee, 0);
    const ticketMedio = totalFees / clients.length;

    const underpricedCount = clients.filter(c => c.is_underpriced).length;
    const percentualSubprecificados = (underpricedCount / clients.length) * 100;

    const totalScore = clients.reduce((sum, c) => sum + c.complexity_score, 0);
    const scoreMedioComplexidade = totalScore / clients.length;

    const mrrTotal = totalFees;

    const totalEmployees = clients.reduce((sum, c) => sum + c.employees_count, 0);
    const receitaPorColaborador = totalEmployees > 0 ? totalFees / Math.max(totalEmployees / clients.length, 1) : totalFees;

    const complexidadeMediaCliente = scoreMedioComplexidade;

    return {
      ticketMedio,
      percentualSubprecificados,
      scoreMedioComplexidade,
      mrrTotal,
      receitaPorColaborador,
      complexidadeMediaCliente,
    };
  }, [clients]);

  // Calculate benchmark indicators
  const indicators = useMemo((): BenchmarkIndicator[] => {
    const calculateIndicator = (
      id: string,
      name: string,
      description: string,
      userValue: number,
      clusterAvg: number,
      unit: string,
      category: BenchmarkIndicator['category'],
      pillar: BenchmarkIndicator['pillar'],
      invertDirection = false
    ): BenchmarkIndicator => {
      const diff = ((userValue - clusterAvg) / clusterAvg) * 100;
      const absDiff = Math.abs(diff);
      
      let direction: 'above' | 'below' = diff >= 0 ? 'above' : 'below';
      if (invertDirection) {
        direction = direction === 'above' ? 'below' : 'above';
      }

      let severity: 'normal' | 'moderate' | 'critical' = 'normal';
      
      // For metrics where lower is worse (ticket, MRR, revenue per employee)
      const isNegativeDeviation = (
        (id === 'ticket-medio' || id === 'mrr-total' || id === 'receita-colaborador') && direction === 'below'
      ) || (
        (id === 'percentual-subprecificados' || id === 'complexidade-media') && direction === 'above'
      );

      if (isNegativeDeviation) {
        if (absDiff >= 30) severity = 'critical';
        else if (absDiff >= 15) severity = 'moderate';
      }

      return {
        id,
        name,
        description,
        userValue,
        clusterAverage: clusterAvg,
        differencePercent: Math.round(absDiff * 10) / 10,
        direction,
        severity,
        unit,
        category,
        pillar,
      };
    };

    return [
      calculateIndicator(
        'ticket-medio',
        'Ticket Médio por Cliente',
        'Valor médio cobrado por cliente na carteira',
        userMetrics.ticketMedio,
        clusterAverages.ticketMedio,
        'R$',
        'financial',
        'financeiro'
      ),
      calculateIndicator(
        'percentual-subprecificados',
        'Clientes Subprecificados',
        'Percentual de clientes com valor abaixo do recomendado',
        userMetrics.percentualSubprecificados,
        clusterAverages.percentualSubprecificados,
        '%',
        'portfolio',
        'financeiro',
        true
      ),
      calculateIndicator(
        'score-complexidade',
        'Score Médio de Complexidade',
        'Pontuação média de complexidade da carteira',
        userMetrics.scoreMedioComplexidade,
        clusterAverages.scoreMedioComplexidade,
        'pts',
        'operational',
        'operacoes'
      ),
      calculateIndicator(
        'mrr-total',
        'Receita Recorrente Mensal (MRR)',
        'Total de receita recorrente mensal da carteira',
        userMetrics.mrrTotal,
        clusterAverages.mrrTotal,
        'R$',
        'financial',
        'financeiro'
      ),
      calculateIndicator(
        'receita-colaborador',
        'Receita por Colaborador',
        'Média de receita gerada por colaborador',
        userMetrics.receitaPorColaborador,
        clusterAverages.receitaPorColaborador,
        'R$',
        'operational',
        'operacoes'
      ),
      calculateIndicator(
        'complexidade-media',
        'Complexidade Média por Cliente',
        'Nível médio de complexidade operacional por cliente',
        userMetrics.complexidadeMediaCliente,
        clusterAverages.complexidadeMediaCliente,
        'pts',
        'operational',
        'operacoes',
        true
      ),
    ];
  }, [userMetrics, clusterAverages]);

  // Generate alerts for critical/moderate deviations
  const alerts = useMemo((): BenchmarkAlert[] => {
    return indicators
      .filter(ind => ind.severity !== 'normal')
      .map(ind => {
        const isFinancial = ind.pillar === 'financeiro';
        
        return {
          indicatorId: ind.id,
          indicatorName: ind.name,
          message: `Seu escritório apresenta ${ind.name.toLowerCase()} ${ind.differencePercent}% ${ind.direction === 'below' ? 'abaixo' : 'acima'} da média de escritórios semelhantes.`,
          severity: ind.severity as 'moderate' | 'critical',
          suggestedObjective: isFinancial
            ? 'Alinhar ticket médio e rentabilidade da carteira ao padrão técnico do mercado'
            : 'Otimizar eficiência operacional e reduzir sobrecarga de trabalho',
          suggestedJustification: `Benchmark Estratégico identificou desvio ${ind.severity === 'critical' ? 'crítico' : 'moderado'} em ${ind.name} em relação a escritórios com perfil semelhante.`,
          suggestedImpact: isFinancial
            ? 'Melhoria da margem, redução de risco operacional e aumento da previsibilidade financeira.'
            : 'Redução de sobrecarga operacional, melhoria da qualidade de entrega e satisfação da equipe.',
          pillar: ind.pillar,
        };
      });
  }, [indicators]);

  // Fetch AI analysis for an indicator
  const fetchAIAnalysis = async (indicator: BenchmarkIndicator) => {
    setLoadingAnalysis(indicator.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('benchmark-analysis', {
        body: {
          benchmarkData: {
            indicatorName: indicator.name,
            userValue: indicator.userValue,
            clusterAverage: indicator.clusterAverage,
            differencePercent: indicator.differencePercent,
            direction: indicator.direction,
            severity: indicator.severity,
          },
          portfolioContext: {
            totalClients: clients.length,
            underpricedClients: clients.filter(c => c.is_underpriced).length,
            predominantRegime: clusterProfile.predominantRegime,
            averageComplexityScore: userMetrics.scoreMedioComplexidade,
          },
        },
      });

      if (error) throw error;

      setAiAnalyses(prev => ({
        ...prev,
        [indicator.id]: data as AIAnalysis,
      }));
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      setAiAnalyses(prev => ({
        ...prev,
        [indicator.id]: {
          explanation: 'Não foi possível gerar a análise de IA no momento.',
          factors: ['Tente novamente em alguns instantes'],
          strategicImpact: 'Análise pendente',
          riskOrOpportunity: 'A ser determinado',
          recommendation: 'Aguarde e tente novamente',
        },
      }));
    } finally {
      setLoadingAnalysis(null);
    }
  };

  return {
    indicators,
    alerts,
    clusterProfile,
    userMetrics,
    clusterAverages,
    aiAnalyses,
    loadingAnalysis,
    fetchAIAnalysis,
    isLoading,
    hasClients: clients.length > 0,
    totalClients: clients.length,
  };
}
