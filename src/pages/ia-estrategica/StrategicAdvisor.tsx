import { useMemo } from 'react';
import {
  Brain, Users, DollarSign, TrendingUp, AlertTriangle, Loader2, Sparkles,
  ShieldAlert, UserCheck, Target, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { usePortfolioStats, useAIAnalysis } from '@/hooks/useStrategicAI';
import { formatCurrency } from '@/lib/scoreCalculator';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444'];
const CLIENTS_PER_EMPLOYEE_THRESHOLD = 15;

export default function StrategicAdvisor() {
  const { stats, profitability, isLoading, employees } = usePortfolioStats();
  const { analysis, isAnalyzing, generateAnalysis } = useAIAnalysis();

  // Analysis 1: Client Profitability
  const negativeMarginsClients = useMemo(
    () => profitability.filter(p => p.marginPercentage < 0),
    [profitability]
  );

  const lowMarginClients = useMemo(
    () => profitability.filter(p => p.marginPercentage >= 0 && p.marginPercentage < 10),
    [profitability]
  );

  // Analysis 2: Portfolio Health
  const portfolioHealthData = useMemo(() => {
    const profitable = profitability.filter(p => p.marginPercentage >= 30).length;
    const adequate = profitability.filter(p => p.marginPercentage >= 20 && p.marginPercentage < 30).length;
    const low = profitability.filter(p => p.marginPercentage >= 0 && p.marginPercentage < 20).length;
    const negative = profitability.filter(p => p.marginPercentage < 0).length;
    return [
      { name: 'Rentável (>30%)', value: profitable, color: '#22c55e' },
      { name: 'Adequado (20-30%)', value: adequate, color: '#3b82f6' },
      { name: 'Baixo (<20%)', value: low, color: '#eab308' },
      { name: 'Negativo', value: negative, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [profitability]);

  // Analysis 3: Team Capacity
  const clientsPerEmployee = useMemo(() => {
    if (employees.length === 0) return 0;
    return stats.totalClients / employees.length;
  }, [stats.totalClients, employees]);

  const capacityExceeded = clientsPerEmployee > CLIENTS_PER_EMPLOYEE_THRESHOLD;
  const capacityPercentage = (clientsPerEmployee / CLIENTS_PER_EMPLOYEE_THRESHOLD) * 100;

  // Analysis 4: Growth Potential
  const hasGrowthOpportunity = stats.estimatedMargin > 30;
  const hasFinancialRisk = stats.estimatedMargin < 10;

  // Complexity distribution for chart
  const complexityData = useMemo(() => [
    { name: 'Baixa', value: stats.basicCount },
    { name: 'Média', value: stats.intermediarioCount },
    { name: 'Alta', value: stats.avancadoCount },
    { name: 'Alto Risco', value: stats.altoRiscoCount },
    { name: 'Crítica', value: stats.criticoCount },
  ].filter(d => d.value > 0), [stats]);

  // Top 5 most critical clients by margin
  const criticalClients = useMemo(
    () => [...profitability]
      .sort((a, b) => a.marginPercentage - b.marginPercentage)
      .slice(0, 5),
    [profitability]
  );

  const handleGenerateAI = () => {
    generateAnalysis({
      ...stats,
      clientsPerEmployee: clientsPerEmployee.toFixed(1),
      negativeMarginsCount: negativeMarginsClients.length,
      lowMarginCount: lowMarginClients.length,
      capacityExceeded,
      hasGrowthOpportunity,
      hasFinancialRisk,
    }, 'strategic_advisor');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Consultor Estratégico
          </h1>
          <p className="text-muted-foreground">Diagnóstico estratégico automatizado do seu escritório</p>
        </div>
        <Button onClick={handleGenerateAI} disabled={isAnalyzing}>
          {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Gerar Relatório IA
        </Button>
      </div>

      {/* Critical Alerts */}
      <div className="space-y-3">
        {negativeMarginsClients.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Clientes com Margem Negativa</AlertTitle>
            <AlertDescription>
              {negativeMarginsClients.length} cliente(s) estão gerando prejuízo operacional. 
              Reavalie os honorários imediatamente.
            </AlertDescription>
          </Alert>
        )}

        {capacityExceeded && (
          <Alert className="border-amber-500/50 bg-amber-500/5 text-amber-700 dark:text-amber-400">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Capacidade Operacional Atingida</AlertTitle>
            <AlertDescription>
              Média de {clientsPerEmployee.toFixed(1)} clientes por colaborador (limite: {CLIENTS_PER_EMPLOYEE_THRESHOLD}). 
              Considere contratar mais colaboradores.
            </AlertDescription>
          </Alert>
        )}

        {hasFinancialRisk && (
          <Alert className="border-red-500/50 bg-red-500/5 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Risco Financeiro</AlertTitle>
            <AlertDescription>
              Margem do portfólio abaixo de 10% ({stats.estimatedMargin.toFixed(1)}%). 
              Revise a precificação de toda a carteira.
            </AlertDescription>
          </Alert>
        )}

        {hasGrowthOpportunity && (
          <Alert className="border-green-500/50 bg-green-500/5 text-green-700 dark:text-green-400">
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Oportunidade de Crescimento</AlertTitle>
            <AlertDescription>
              Margem saudável de {stats.estimatedMargin.toFixed(1)}%. 
              Há espaço para investir em crescimento e novos clientes.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem do Portfólio</p>
                <p className="text-3xl font-bold">{stats.estimatedMargin.toFixed(1)}%</p>
              </div>
              <div className={`p-3 rounded-full ${stats.estimatedMargin >= 20 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {stats.estimatedMargin >= 20 
                  ? <ArrowUpRight className="h-6 w-6 text-green-500" />
                  : <ArrowDownRight className="h-6 w-6 text-red-500" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Subprecificados</p>
                <p className="text-3xl font-bold">{stats.underpricedCount}</p>
                <p className="text-xs text-muted-foreground">{stats.underpricedPercentage.toFixed(0)}% do total</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes/Colaborador</p>
                <p className="text-3xl font-bold">{clientsPerEmployee.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Limite: {CLIENTS_PER_EMPLOYEE_THRESHOLD}</p>
              </div>
              <div className={`p-3 rounded-full ${capacityExceeded ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                <UserCheck className={`h-6 w-6 ${capacityExceeded ? 'text-red-500' : 'text-green-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-3xl font-bold text-lg">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Custo: {formatCurrency(stats.totalCost)}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Saúde do Portfólio
            </CardTitle>
            <CardDescription>Distribuição de rentabilidade</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolioHealthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={portfolioHealthData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${value}`}>
                    {portfolioHealthData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Distribuição de Complexidade
            </CardTitle>
            <CardDescription>Clientes por nível de complexidade</CardDescription>
          </CardHeader>
          <CardContent>
            {complexityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={complexityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Clientes">
                    {complexityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Capacity Gauge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Capacidade da Equipe
          </CardTitle>
          <CardDescription>
            {employees.length} colaboradores atendendo {stats.totalClients} clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Utilização</span>
              <span className="font-medium">{Math.min(capacityPercentage, 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  capacityPercentage > 100 ? 'bg-red-500' :
                  capacityPercentage > 80 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>Limite ({CLIENTS_PER_EMPLOYEE_THRESHOLD} cl/colab)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Critical Clients */}
      {criticalClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Clientes Mais Críticos
            </CardTitle>
            <CardDescription>Top 5 clientes com menor margem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalClients.map((item) => (
                <div key={item.client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{item.client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Honorário: {formatCurrency(item.client.current_fee)} | Custo: {formatCurrency(item.estimatedCost)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.marginPercentage < 0 ? 'destructive' : item.marginPercentage < 20 ? 'secondary' : 'default'}>
                      {item.marginPercentage.toFixed(1)}%
                    </Badge>
                    {item.marginPercentage < 0 && (
                      <Badge variant="destructive" className="text-xs">Prejuízo</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Recomendações Estratégicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {negativeMarginsClients.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <ArrowDownRight className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Corrigir subprecificação urgente</p>
                  <p className="text-xs text-muted-foreground">
                    {negativeMarginsClients.length} cliente(s) com margem negativa. Perda estimada: {formatCurrency(negativeMarginsClients.reduce((s, c) => s + Math.abs(c.estimatedMargin), 0))}/mês
                  </p>
                </div>
              </div>
            )}
            {capacityExceeded && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <Users className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Expandir equipe</p>
                  <p className="text-xs text-muted-foreground">
                    Contrate {Math.ceil((stats.totalClients - employees.length * CLIENTS_PER_EMPLOYEE_THRESHOLD) / CLIENTS_PER_EMPLOYEE_THRESHOLD)} colaborador(es) para manter a capacidade ideal.
                  </p>
                </div>
              </div>
            )}
            {hasGrowthOpportunity && !capacityExceeded && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Oportunidade de expansão</p>
                  <p className="text-xs text-muted-foreground">
                    Capacidade disponível para mais {Math.floor(employees.length * CLIENTS_PER_EMPLOYEE_THRESHOLD - stats.totalClients)} clientes sem necessidade de contratação.
                  </p>
                </div>
              </div>
            )}
            {stats.totalClients === 0 && (
              <p className="text-muted-foreground text-center py-4">Cadastre clientes para ver recomendações.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {(analysis || isAnalyzing) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Relatório Estratégico (IA)
            </CardTitle>
            <CardDescription>Diagnóstico completo gerado por inteligência artificial</CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Gerando relatório estratégico...</span>
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
