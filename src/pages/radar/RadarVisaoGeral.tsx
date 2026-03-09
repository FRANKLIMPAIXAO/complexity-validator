import { useMemo, useState } from 'react';
import { Radar, Users, AlertTriangle, TrendingUp, Loader2, Sparkles, ArrowUpRight, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRadarOportunidades } from '@/hooks/useRadarOportunidades';
import { useAIAnalysis } from '@/hooks/useStrategicAI';
import { formatCurrency } from '@/lib/scoreCalculator';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444'];

export default function RadarVisaoGeral() {
  const { radarData, negativeMarginClients, underpricedClients, potentialIncrease, portfolioMargin, topAdjustments, topNegative, segments, isLoading } = useRadarOportunidades();
  const { analysis, isAnalyzing, generateAnalysis } = useAIAnalysis();

  const segmentChartData = useMemo(() =>
    segments.slice(0, 6).map(s => ({ name: s.segment, margem: Number(s.avgMarginPct.toFixed(1)), clientes: s.clientCount })),
    [segments]
  );

  const profitabilityDist = useMemo(() => {
    const profitable = radarData.filter(d => d.marginPct >= 0.30).length;
    const adequate = radarData.filter(d => d.marginPct >= 0.20 && d.marginPct < 0.30).length;
    const low = radarData.filter(d => d.marginPct >= 0 && d.marginPct < 0.20).length;
    const negative = radarData.filter(d => d.marginPct < 0).length;
    return [
      { name: 'Rentável (>30%)', value: profitable },
      { name: 'Adequado (20-30%)', value: adequate },
      { name: 'Baixo (<20%)', value: low },
      { name: 'Negativo', value: negative },
    ].filter(d => d.value > 0);
  }, [radarData]);

  const handleAI = () => {
    generateAnalysis({
      totalClients: radarData.length,
      negativeMarginCount: negativeMarginClients.length,
      underpricedCount: underpricedClients.length,
      potentialIncrease,
      portfolioMargin,
      topSegments: segments.slice(0, 3).map(s => s.segment),
      topAdjustmentClients: topAdjustments.slice(0, 5).map(a => ({ name: a.client.name, opportunityScore: a.opportunityScore.toFixed(0) })),
    }, 'radar_oportunidades');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radar className="h-6 w-6 text-primary" />
            Radar de Oportunidades
          </h1>
          <p className="text-muted-foreground">Detecte oportunidades de precificação e crescimento</p>
        </div>
        <Button onClick={handleAI} disabled={isAnalyzing}>
          {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Análise IA
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem Negativa</p>
                <p className="text-3xl font-bold text-destructive">{negativeMarginClients.length}</p>
                <p className="text-xs text-muted-foreground">clientes com prejuízo</p>
              </div>
              <div className="p-3 rounded-full bg-destructive/10"><AlertTriangle className="h-6 w-6 text-destructive" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subprecificados</p>
                <p className="text-3xl font-bold text-amber-500">{underpricedClients.length}</p>
                <p className="text-xs text-muted-foreground">abaixo da margem ideal</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10"><DollarSign className="h-6 w-6 text-amber-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aumento Potencial</p>
                <p className="text-3xl font-bold text-green-500">{formatCurrency(potentialIncrease)}</p>
                <p className="text-xs text-muted-foreground">por mês</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10"><ArrowUpRight className="h-6 w-6 text-green-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem do Portfólio</p>
                <p className="text-3xl font-bold">{portfolioMargin.toFixed(1)}%</p>
              </div>
              <div className={`p-3 rounded-full ${portfolioMargin >= 20 ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                <TrendingUp className={`h-6 w-6 ${portfolioMargin >= 20 ? 'text-green-500' : 'text-destructive'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Distribuição de Rentabilidade</CardTitle></CardHeader>
          <CardContent>
            {profitabilityDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={profitabilityDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={({ value }) => value}>
                    {profitabilityDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12">Sem dados</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Margem por Segmento</CardTitle></CardHeader>
          <CardContent>
            {segmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={segmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Bar dataKey="margem" name="Margem %" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12">Sem dados</p>}
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Adjustments */}
      {topAdjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Reajustes Recomendados</CardTitle>
            <CardDescription>Ordenado por oportunidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topAdjustments.map(item => (
                <div key={item.client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{item.client.name}</p>
                    <p className="text-xs text-muted-foreground">{item.segment} · Score: {item.client.complexity_score}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{formatCurrency(item.client.current_fee)}</span>
                    <span>→</span>
                    <span className="font-medium text-green-500">{formatCurrency(item.recommendedFee)}</span>
                    <Badge variant="secondary">+{formatCurrency(item.recommendedFee - item.client.current_fee)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 10 Negative */}
      {topNegative.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Top 10 Clientes com Prejuízo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topNegative.map(item => (
                <div key={item.client.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                  <div>
                    <p className="font-medium">{item.client.name}</p>
                    <p className="text-xs text-muted-foreground">Honorário: {formatCurrency(item.client.current_fee)} · Custo: {formatCurrency(item.estimatedCost)}</p>
                  </div>
                  <Badge variant="destructive">Prejuízo: {formatCurrency(Math.abs(item.marginValue))}/mês</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segments */}
      {segments.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Segmentos Mais Rentáveis</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Segmento</th>
                    <th className="pb-2 font-medium text-muted-foreground text-center">Clientes</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Honorário Médio</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Complexidade</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((s, i) => (
                    <tr key={s.segment} className="border-b border-border/50">
                      <td className="py-2 flex items-center gap-2">
                        {i < 3 && <Badge variant="default" className="text-xs">Top {i + 1}</Badge>}
                        {s.segment}
                      </td>
                      <td className="py-2 text-center">{s.clientCount}</td>
                      <td className="py-2 text-right">{formatCurrency(s.avgFee)}</td>
                      <td className="py-2 text-right">{s.avgComplexity.toFixed(1)}</td>
                      <td className={`py-2 text-right font-medium ${s.avgMarginPct >= 20 ? 'text-green-500' : s.avgMarginPct >= 0 ? 'text-amber-500' : 'text-destructive'}`}>
                        {s.avgMarginPct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI */}
      {(analysis || isAnalyzing) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Análise IA</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center gap-3 py-8 justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="text-muted-foreground">Gerando análise...</span></div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{analysis}</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
