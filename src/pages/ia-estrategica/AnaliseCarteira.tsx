import { useMemo } from 'react';
import { Brain, Users, DollarSign, BarChart3, TrendingUp, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePortfolioStats, useAIAnalysis } from '@/hooks/useStrategicAI';
import { formatCurrency } from '@/lib/scoreCalculator';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444'];
const REGIME_COLORS = ['#3b82f6', '#8b5cf6', '#f97316'];

export default function AnaliseCarteira() {
  const { stats, profitability, isLoading } = usePortfolioStats();
  const { analysis, isAnalyzing, generateAnalysis } = useAIAnalysis();

  const complexityData = useMemo(() => [
    { name: 'Básico', value: stats.basicCount },
    { name: 'Intermediário', value: stats.intermediarioCount },
    { name: 'Avançado', value: stats.avancadoCount },
    { name: 'Alto Risco', value: stats.altoRiscoCount },
    { name: 'Crítico', value: stats.criticoCount },
  ].filter(d => d.value > 0), [stats]);

  const profitabilityData = useMemo(() => {
    const profitable = profitability.filter(p => p.marginPercentage >= 30).length;
    const adequate = profitability.filter(p => p.marginPercentage >= 20 && p.marginPercentage < 30).length;
    const low = profitability.filter(p => p.marginPercentage >= 0 && p.marginPercentage < 20).length;
    const negative = profitability.filter(p => p.marginPercentage < 0).length;
    return [
      { name: 'Rentável (>30%)', value: profitable },
      { name: 'Adequado (20-30%)', value: adequate },
      { name: 'Baixo (<20%)', value: low },
      { name: 'Negativo', value: negative },
    ].filter(d => d.value > 0);
  }, [profitability]);

  const revenueDistribution = useMemo(() => [
    { name: 'Simples', clientes: stats.simpleCount },
    { name: 'Presumido', clientes: stats.presumidoCount },
    { name: 'Real', clientes: stats.realCount },
  ], [stats]);

  const handleGenerateAI = () => {
    generateAnalysis(stats, 'portfolio');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Análise da Carteira
          </h1>
          <p className="text-muted-foreground">Visão estratégica do portfólio de clientes</p>
        </div>
        <Button onClick={handleGenerateAI} disabled={isAnalyzing}>
          {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Gerar Análise IA
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Honorário Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgFee)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Complexidade Média</p>
                <p className="text-2xl font-bold">{stats.avgComplexity.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Custo Médio/Cliente</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgCostPerClient)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Margem Estimada</p>
                <p className="text-2xl font-bold">{stats.estimatedMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Underpriced Alert */}
      {stats.underpricedPercentage > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <div>
                <p className="font-semibold text-foreground">
                  {stats.underpricedCount} clientes ({stats.underpricedPercentage.toFixed(1)}%) com margem abaixo do ideal
                </p>
                <p className="text-sm text-muted-foreground">
                  Acesse "Clientes Subprecificados" para ver detalhes e recomendações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clientes por Complexidade</CardTitle>
          </CardHeader>
          <CardContent>
            {complexityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={complexityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                    {complexityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clientes por Rentabilidade</CardTitle>
          </CardHeader>
          <CardContent>
            {profitabilityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={profitabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${value}`}>
                    {profitabilityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Regime</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clientes" fill="hsl(var(--primary))">
                  {revenueDistribution.map((_, i) => <Cell key={i} fill={REGIME_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      {(analysis || isAnalyzing) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análise Estratégica (IA)
            </CardTitle>
            <CardDescription>Insights gerados por inteligência artificial</CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Analisando portfólio...</span>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {analysis}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
