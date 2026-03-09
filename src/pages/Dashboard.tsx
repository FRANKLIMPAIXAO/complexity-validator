import { useState, useMemo } from 'react';
import { Users, AlertTriangle, TrendingUp, Info, DollarSign, UserCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClients } from '@/hooks/useClients';
import { useClientPlans } from '@/hooks/useClientPlans';
import { useEmployees, useEmployeeMetrics } from '@/hooks/useEmployees';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/dashboard/StatsCard';
import ComplexityDistribution from '@/components/dashboard/ComplexityDistribution';
import PlanDistribution from '@/components/dashboard/PlanDistribution';
import UnderpriceList from '@/components/dashboard/UnderpriceList';
import PerformanceOverview from '@/components/dashboard/PerformanceOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer';
import { ExportPDFButton } from '@/components/reports/ExportPDFButton';
import PeriodFilter, { PeriodValue, getPeriodDateRange } from '@/components/dashboard/PeriodFilter';
import { ComplexityLevel } from '@/types/database';
import { formatCurrency } from '@/lib/scoreCalculator';

export default function Dashboard() {
  const { profile } = useAuth();
  const { clients, isLoading: clientsLoading } = useClients();
  const { plans, isLoading: plansLoading } = useClientPlans();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: metrics = [] } = useEmployeeMetrics();
  const [period, setPeriod] = useState<PeriodValue>('all');
  const {
    widgets,
    enabledWidgets,
    smallWidgets,
    mediumWidgets,
    largeWidgets,
    isLoading: layoutLoading,
    toggleWidget,
    updateWidgetOrder,
    resetLayout,
  } = useDashboardLayout();

  const isLoading = clientsLoading || employeesLoading || layoutLoading || plansLoading;

  // Filter clients by period
  const filteredClients = useMemo(() => {
    const { start } = getPeriodDateRange(period);
    if (!start) return clients;
    return clients.filter(c => new Date(c.created_at) >= start);
  }, [clients, period]);

  // Client stats
  const totalClients = filteredClients.length;
  const underpricedCount = filteredClients.filter((c) => c.is_underpriced).length;
  const avgComplexity = totalClients > 0
    ? Math.round(filteredClients.reduce((sum, c) => sum + c.complexity_score, 0) / totalClients)
    : 0;
  const totalRevenue = filteredClients.reduce((sum, c) => sum + Number(c.current_fee), 0);

  const distribution = filteredClients.reduce((acc, client) => {
    acc[client.complexity_level] = (acc[client.complexity_level] || 0) + 1;
    return acc;
  }, {} as Record<ComplexityLevel, number>);

  // Employee stats
  const totalEmployees = employees.length;
  const highPerformers = metrics.filter((m) => m.performance_level === 'alto_desempenho').length;
  const atRisk = metrics.filter((m) => m.performance_level === 'risco_operacional').length;

  // Widget renderer
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'total-clients':
        return (
          <StatsCard
            key={widgetId}
            title="Total de Clientes"
            value={totalClients}
            icon={Users}
            description="Clientes cadastrados"
          />
        );
      case 'underpriced-alerts':
        return (
          <StatsCard
            key={widgetId}
            title="Alertas de Subprecificação"
            value={underpricedCount}
            icon={AlertTriangle}
            description="Requerem análise"
          />
        );
      case 'avg-complexity':
        return (
          <StatsCard
            key={widgetId}
            title="Score Médio"
            value={avgComplexity}
            icon={TrendingUp}
            description="Complexidade média"
          />
        );
      case 'employee-count':
        return (
          <StatsCard
            key={widgetId}
            title="Total de Colaboradores"
            value={totalEmployees}
            icon={UserCheck}
            description="Colaboradores ativos"
          />
        );
      case 'high-performers':
        return (
          <StatsCard
            key={widgetId}
            title="Alto Desempenho"
            value={highPerformers}
            icon={Award}
            description="Colaboradores destaque"
          />
        );
      case 'at-risk':
        return (
          <StatsCard
            key={widgetId}
            title="Risco Operacional"
            value={atRisk}
            icon={AlertTriangle}
            description="Requerem atenção"
          />
        );
      case 'monthly-revenue':
        return (
          <StatsCard
            key={widgetId}
            title="Faturamento Mensal"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            description="Total de honorários"
          />
        );
      case 'complexity-distribution':
        return (
          <ComplexityDistribution
            key={widgetId}
            distribution={distribution}
            total={totalClients}
          />
        );
      case 'plan-distribution':
        return (
          <PlanDistribution
            key={widgetId}
            clients={filteredClients}
            plans={plans}
          />
        );
      case 'underprice-list':
        return <UnderpriceList key={widgetId} clients={filteredClients} />;
      case 'performance-overview':
        return <PerformanceOverview key={widgetId} />;
      case 'recent-activity':
        return <RecentActivity key={widgetId} />;
      case 'quick-info':
        return (
          <Card key={widgetId} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Sobre o Score de Complexidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                O <strong className="text-foreground">Score de Complexidade</strong> é uma pontuação de 0 a 100 que mede 
                o esforço operacional necessário para atender cada cliente do seu escritório.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium text-foreground mb-2">O que analisamos:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Regime tributário (Simples, Presumido, Real)</li>
                    <li>Volume de lançamentos contábeis</li>
                    <li>Faturamento mensal</li>
                    <li>Quantidade de funcionários</li>
                    <li>Movimentação de admissões e rescisões</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Níveis de complexidade:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><span className="text-green-400">Básico</span>: 0-20 pontos</li>
                    <li><span className="text-blue-400">Intermediário</span>: 21-40 pontos</li>
                    <li><span className="text-yellow-400">Avançado</span>: 41-60 pontos</li>
                    <li><span className="text-orange-400">Alto Risco</span>: 61-80 pontos</li>
                    <li><span className="text-red-400">Crítico</span>: 81-100 pontos</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs opacity-80">
                * A análise de subprecificação compara o valor cobrado com faixas de referência do mercado.
                Os valores são indicativos e devem ser usados como ponto de partida para sua análise estratégica.
              </p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Olá, {profile?.full_name?.split(' ')[0] || 'Contador'}!
          </h1>
          <p className="text-muted-foreground">
            Aqui está o resumo dos seus clientes e colaboradores
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodFilter value={period} onChange={setPeriod} />
          <DashboardCustomizer
            widgets={widgets}
            onToggle={toggleWidget}
            onReorder={updateWidgetOrder}
            onReset={resetLayout}
          />
          <ExportPDFButton type="all" />
          <Button asChild>
            <Link to="/clients/new">Novo Cliente</Link>
          </Button>
        </div>
      </div>

      {/* Small Widgets (Stats Cards) */}
      {smallWidgets.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {smallWidgets.map((widget) => renderWidget(widget.id))}
        </div>
      )}

      {/* Medium Widgets (Charts and Lists) */}
      {mediumWidgets.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {mediumWidgets.map((widget) => renderWidget(widget.id))}
        </div>
      )}

      {/* Large Widgets (Full Width) */}
      {largeWidgets.length > 0 && (
        <div className="space-y-6">
          {largeWidgets.map((widget) => renderWidget(widget.id))}
        </div>
      )}

      {/* Empty State */}
      {enabledWidgets.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dashboard vazio</h3>
            <p className="text-muted-foreground text-center mb-4">
              Nenhum widget está visível. Clique em "Personalizar" para escolher o que exibir.
            </p>
            <DashboardCustomizer
              widgets={widgets}
              onToggle={toggleWidget}
              onReorder={updateWidgetOrder}
              onReset={resetLayout}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
