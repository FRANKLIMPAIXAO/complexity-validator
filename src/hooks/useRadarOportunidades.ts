import { useMemo } from 'react';
import { useClients } from './useClients';
import { Client, TAX_REGIME_LABELS } from '@/types/database';
import { useFinancialSettings } from './useFinancialSettings';

export interface RadarClientData {
  client: Client;
  estimatedCost: number;
  marginValue: number;
  marginPct: number;
  recommendedFee: number;
  opportunityScore: number;
  isNegativeMargin: boolean;
  isUnderpriced: boolean;
  isRecommendedAdjustment: boolean;
  segment: string;
}

export interface SegmentData {
  segment: string;
  clientCount: number;
  avgFee: number;
  avgComplexity: number;
  avgMarginPct: number;
  totalRevenue: number;
}

function getSegment(client: Client): string {
  const regime = TAX_REGIME_LABELS[client.tax_regime] || client.tax_regime;
  if ((client as any).is_ecommerce) return `E-commerce (${regime})`;
  if ((client as any).has_import_operations) return `Importação (${regime})`;
  if ((client as any).has_tax_substitution) return `ST (${regime})`;
  return regime;
}

export function useRadarOportunidades() {
  const { clients, isLoading: clientsLoading } = useClients();
  const { settings, isLoading: settingsLoading } = useFinancialSettings();

  const isLoading = clientsLoading || settingsLoading;

  const radarData: RadarClientData[] = useMemo(() => {
    return clients.map(client => {
      const estimatedCost = settings.base_cost_per_client + (client.complexity_score * settings.complexity_cost_factor);
      const marginValue = client.current_fee - estimatedCost;
      const marginPct = client.current_fee > 0 ? marginValue / client.current_fee : -1;
      const recommendedFee = estimatedCost / (1 - settings.target_margin);
      const opportunityScore = Math.max(0, recommendedFee - client.current_fee) + (client.complexity_score * 2);
      const isNegativeMargin = marginValue < 0;
      const isUnderpriced = marginPct < settings.target_margin;
      const isRecommendedAdjustment = isUnderpriced && client.complexity_score >= 35;

      return {
        client,
        estimatedCost,
        marginValue,
        marginPct,
        recommendedFee,
        opportunityScore,
        isNegativeMargin,
        isUnderpriced,
        isRecommendedAdjustment,
        segment: getSegment(client),
      };
    });
  }, [clients, settings]);

  const negativeMarginClients = useMemo(() => radarData.filter(d => d.isNegativeMargin), [radarData]);
  const underpricedClients = useMemo(() => radarData.filter(d => d.isUnderpriced), [radarData]);
  const potentialIncrease = useMemo(() =>
    radarData.reduce((sum, d) => sum + Math.max(0, d.recommendedFee - d.client.current_fee), 0),
    [radarData]
  );
  const portfolioMargin = useMemo(() => {
    const totalRevenue = clients.reduce((s, c) => s + c.current_fee, 0);
    const totalCost = radarData.reduce((s, d) => s + d.estimatedCost, 0);
    return totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
  }, [clients, radarData]);

  const topAdjustments = useMemo(() =>
    [...radarData].filter(d => d.isUnderpriced).sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 10),
    [radarData]
  );

  const topNegative = useMemo(() =>
    [...negativeMarginClients].sort((a, b) => a.marginValue - b.marginValue).slice(0, 10),
    [negativeMarginClients]
  );

  const segments: SegmentData[] = useMemo(() => {
    const map = new Map<string, RadarClientData[]>();
    radarData.forEach(d => {
      const arr = map.get(d.segment) || [];
      arr.push(d);
      map.set(d.segment, arr);
    });
    return Array.from(map.entries()).map(([segment, items]) => ({
      segment,
      clientCount: items.length,
      avgFee: items.reduce((s, i) => s + i.client.current_fee, 0) / items.length,
      avgComplexity: items.reduce((s, i) => s + i.client.complexity_score, 0) / items.length,
      avgMarginPct: items.reduce((s, i) => s + i.marginPct, 0) / items.length * 100,
      totalRevenue: items.reduce((s, i) => s + i.client.current_fee, 0),
    })).sort((a, b) => b.avgMarginPct - a.avgMarginPct);
  }, [radarData]);

  return {
    radarData,
    negativeMarginClients,
    underpricedClients,
    potentialIncrease,
    portfolioMargin,
    topAdjustments,
    topNegative,
    segments,
    isLoading,
    settings,
  };
}
