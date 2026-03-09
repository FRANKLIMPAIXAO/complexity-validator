import { useMemo } from 'react';
import { useClients } from './useClients';
import { getExpectedPriceRange, checkRiskClient } from '@/lib/scoreCalculator';
import type { Client } from '@/types/database';

export interface ClientMetrics {
  // Financeiro
  totalMRR: number;
  averageFee: number;
  potentialMRR: number; // Se todos clientes estivessem no mínimo da faixa
  revenueGap: number; // Diferença entre potencial e atual
  
  // Carteira
  totalClients: number;
  underpricedClients: number;
  riskClients: number;
  healthyClients: number;
  
  // Complexidade
  averageScore: number;
  highComplexityClients: number; // score >= 50
  
  // Operacional
  totalEmployees: number;
  totalMonthlyEntries: number;
  totalMonthlyRevenue: number;
  
  // Percentuais
  underpricedPercentage: number;
  riskPercentage: number;
  healthyPercentage: number;
}

export interface AutoKpi {
  id: string;
  name: string;
  description: string;
  value: number;
  target: number;
  unit: string;
  category: 'financeiro' | 'carteira' | 'operacional';
  trend: 'up' | 'down' | 'neutral';
  isGood: boolean;
}

export function useClientMetrics() {
  const { clients, isLoading } = useClients();

  const metrics = useMemo<ClientMetrics>(() => {
    if (!clients || clients.length === 0) {
      return {
        totalMRR: 0,
        averageFee: 0,
        potentialMRR: 0,
        revenueGap: 0,
        totalClients: 0,
        underpricedClients: 0,
        riskClients: 0,
        healthyClients: 0,
        averageScore: 0,
        highComplexityClients: 0,
        totalEmployees: 0,
        totalMonthlyEntries: 0,
        totalMonthlyRevenue: 0,
        underpricedPercentage: 0,
        riskPercentage: 0,
        healthyPercentage: 0,
      };
    }

    let totalMRR = 0;
    let potentialMRR = 0;
    let totalScore = 0;
    let underpricedClients = 0;
    let riskClients = 0;
    let highComplexityClients = 0;
    let totalEmployees = 0;
    let totalMonthlyEntries = 0;
    let totalMonthlyRevenue = 0;

    clients.forEach((client: Client) => {
      totalMRR += client.current_fee;
      totalScore += client.complexity_score;
      totalEmployees += client.employees_count;
      totalMonthlyEntries += client.monthly_entries;
      totalMonthlyRevenue += client.monthly_revenue;

      const range = getExpectedPriceRange(client.complexity_level);
      potentialMRR += Math.max(client.current_fee, range.min);

      if (client.is_underpriced) {
        underpricedClients++;
      }

      if (checkRiskClient(client.current_fee, client.complexity_level, client.complexity_score)) {
        riskClients++;
      }

      if (client.complexity_score >= 50) {
        highComplexityClients++;
      }
    });

    const totalClients = clients.length;
    const healthyClients = totalClients - underpricedClients;

    return {
      totalMRR,
      averageFee: totalClients > 0 ? totalMRR / totalClients : 0,
      potentialMRR,
      revenueGap: potentialMRR - totalMRR,
      totalClients,
      underpricedClients,
      riskClients,
      healthyClients,
      averageScore: totalClients > 0 ? totalScore / totalClients : 0,
      highComplexityClients,
      totalEmployees,
      totalMonthlyEntries,
      totalMonthlyRevenue,
      underpricedPercentage: totalClients > 0 ? (underpricedClients / totalClients) * 100 : 0,
      riskPercentage: totalClients > 0 ? (riskClients / totalClients) * 100 : 0,
      healthyPercentage: totalClients > 0 ? (healthyClients / totalClients) * 100 : 0,
    };
  }, [clients]);

  const autoKpis = useMemo<AutoKpi[]>(() => {
    const kpis: AutoKpi[] = [
      // KPIs Financeiros
      {
        id: 'auto-mrr',
        name: 'Receita Recorrente (MRR)',
        description: 'Soma de todos os honorários da carteira',
        value: metrics.totalMRR,
        target: metrics.potentialMRR,
        unit: 'R$',
        category: 'financeiro',
        trend: metrics.revenueGap > 0 ? 'down' : 'up',
        isGood: metrics.revenueGap === 0,
      },
      {
        id: 'auto-gap',
        name: 'Gap de Receita',
        description: 'Receita perdida por subprecificação',
        value: metrics.revenueGap,
        target: 0,
        unit: 'R$',
        category: 'financeiro',
        trend: metrics.revenueGap > 0 ? 'down' : 'up',
        isGood: metrics.revenueGap === 0,
      },
      {
        id: 'auto-ticket',
        name: 'Ticket Médio',
        description: 'Valor médio de honorário por cliente',
        value: metrics.averageFee,
        target: metrics.averageFee * 1.2, // Meta de +20%
        unit: 'R$',
        category: 'financeiro',
        trend: 'neutral',
        isGood: true,
      },
      
      // KPIs de Carteira
      {
        id: 'auto-clients',
        name: 'Total de Clientes',
        description: 'Número total de clientes ativos',
        value: metrics.totalClients,
        target: metrics.totalClients,
        unit: '',
        category: 'carteira',
        trend: 'neutral',
        isGood: true,
      },
      {
        id: 'auto-healthy',
        name: 'Clientes Saudáveis',
        description: 'Clientes com honorário adequado',
        value: metrics.healthyPercentage,
        target: 100,
        unit: '%',
        category: 'carteira',
        trend: metrics.healthyPercentage >= 80 ? 'up' : 'down',
        isGood: metrics.healthyPercentage >= 80,
      },
      {
        id: 'auto-underpriced',
        name: 'Clientes Subprecificados',
        description: 'Clientes abaixo da faixa recomendada',
        value: metrics.underpricedClients,
        target: 0,
        unit: '',
        category: 'carteira',
        trend: metrics.underpricedClients > 0 ? 'down' : 'up',
        isGood: metrics.underpricedClients === 0,
      },
      {
        id: 'auto-risk',
        name: 'Clientes em Risco',
        description: 'Alta complexidade + subprecificação',
        value: metrics.riskClients,
        target: 0,
        unit: '',
        category: 'carteira',
        trend: metrics.riskClients > 0 ? 'down' : 'up',
        isGood: metrics.riskClients === 0,
      },
      
      // KPIs Operacionais
      {
        id: 'auto-complexity',
        name: 'Score Médio de Complexidade',
        description: 'Média de complexidade da carteira',
        value: Math.round(metrics.averageScore),
        target: 40, // Meta ideal
        unit: 'pts',
        category: 'operacional',
        trend: metrics.averageScore > 50 ? 'down' : 'up',
        isGood: metrics.averageScore <= 50,
      },
      {
        id: 'auto-employees',
        name: 'Total de Funcionários',
        description: 'Funcionários gerenciados na carteira',
        value: metrics.totalEmployees,
        target: metrics.totalEmployees,
        unit: '',
        category: 'operacional',
        trend: 'neutral',
        isGood: true,
      },
    ];

    return kpis;
  }, [metrics]);

  return {
    metrics,
    autoKpis,
    isLoading,
    hasClients: clients.length > 0,
  };
}
