import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Sparkles,
  ShieldCheck,
  Building2,
  Info
} from 'lucide-react';
import { useBenchmark } from '@/hooks/useBenchmark';
import BenchmarkIndicatorCard from '@/components/benchmark/BenchmarkIndicatorCard';
import BenchmarkAlertCard from '@/components/benchmark/BenchmarkAlertCard';
import ClusterProfileCard from '@/components/benchmark/ClusterProfileCard';
import BenchmarkStrategicWizard from '@/components/benchmark/BenchmarkStrategicWizard';
import { BenchmarkAlert } from '@/types/benchmark';

export default function Benchmark() {
  const { 
    indicators, 
    alerts, 
    clusterProfile, 
    userMetrics,
    clusterAverages,
    aiAnalyses,
    loadingAnalysis,
    fetchAIAnalysis,
    isLoading,
    hasClients,
    totalClients
  } = useBenchmark();

  const [selectedAlert, setSelectedAlert] = useState<BenchmarkAlert | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const moderateAlerts = alerts.filter(a => a.severity === 'moderate');

  const financialIndicators = indicators.filter(i => i.category === 'financial');
  const portfolioIndicators = indicators.filter(i => i.category === 'portfolio');
  const operationalIndicators = indicators.filter(i => i.category === 'operational');

  const handleTransformToObjective = (alert: BenchmarkAlert) => {
    setSelectedAlert(alert);
    setWizardOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasClients) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Benchmark Estratégico Inteligente
          </h1>
          <p className="text-muted-foreground mt-2">
            Compare seu escritório com a média do mercado
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Cadastre seus clientes no PrecificAI para começar a comparar seu 
              desempenho com escritórios semelhantes.
            </p>
            <Button className="mt-4" asChild>
              <a href="/clients/new">Cadastrar Primeiro Cliente</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Benchmark Estratégico Inteligente
          </h1>
          <p className="text-muted-foreground mt-2">
            Benchmark orientado por dados • Comparação anônima com {totalClients} clientes na carteira
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Dados Anonimizados
          </Badge>
        </div>
      </div>

      {/* Cluster Profile */}
      <ClusterProfileCard profile={clusterProfile} />

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alertas Críticos Identificados</AlertTitle>
          <AlertDescription>
            {criticalAlerts.length} indicador(es) apresentam desvio crítico em relação ao benchmark. 
            Considere transformar esses desvios em objetivos estratégicos.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Indicadores Analisados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{indicators.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Comparados com escritórios semelhantes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Acima da Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {indicators.filter(i => i.direction === 'above' && !['percentual-subprecificados', 'complexidade-media'].includes(i.id)).length +
                   indicators.filter(i => i.direction === 'below' && ['percentual-subprecificados', 'complexidade-media'].includes(i.id)).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Indicadores com desempenho positivo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Atenção Necessária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {alerts.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Desvios que requerem ação
                </p>
              </CardContent>
            </Card>
          </div>

          {/* All Indicators Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Todos os Indicadores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indicators.map(indicator => (
                <BenchmarkIndicatorCard
                  key={indicator.id}
                  indicator={indicator}
                  aiAnalysis={aiAnalyses[indicator.id]}
                  isLoadingAI={loadingAnalysis === indicator.id}
                  onRequestAI={() => fetchAIAnalysis(indicator)}
                  onTransformToObjective={
                    indicator.severity !== 'normal'
                      ? () => handleTransformToObjective(alerts.find(a => a.indicatorId === indicator.id)!)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Indicadores Financeiros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...financialIndicators, ...portfolioIndicators].map(indicator => (
              <BenchmarkIndicatorCard
                key={indicator.id}
                indicator={indicator}
                aiAnalysis={aiAnalyses[indicator.id]}
                isLoadingAI={loadingAnalysis === indicator.id}
                onRequestAI={() => fetchAIAnalysis(indicator)}
                onTransformToObjective={
                  indicator.severity !== 'normal'
                    ? () => handleTransformToObjective(alerts.find(a => a.indicatorId === indicator.id)!)
                    : undefined
                }
                expanded
              />
            ))}
          </div>
        </TabsContent>

        {/* Operational Tab */}
        <TabsContent value="operational" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Indicadores Operacionais</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operationalIndicators.map(indicator => (
              <BenchmarkIndicatorCard
                key={indicator.id}
                indicator={indicator}
                aiAnalysis={aiAnalyses[indicator.id]}
                isLoadingAI={loadingAnalysis === indicator.id}
                onRequestAI={() => fetchAIAnalysis(indicator)}
                onTransformToObjective={
                  indicator.severity !== 'normal'
                    ? () => handleTransformToObjective(alerts.find(a => a.indicatorId === indicator.id)!)
                    : undefined
                }
                expanded
              />
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShieldCheck className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum alerta identificado</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Seu escritório está dentro dos padrões de mercado em todos os indicadores analisados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {criticalAlerts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas Críticos
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {criticalAlerts.map(alert => (
                      <BenchmarkAlertCard
                        key={alert.indicatorId}
                        alert={alert}
                        onTransformToObjective={() => handleTransformToObjective(alert)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {moderateAlerts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-600">
                    <Info className="h-5 w-5" />
                    Alertas Moderados
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {moderateAlerts.map(alert => (
                      <BenchmarkAlertCard
                        key={alert.indicatorId}
                        alert={alert}
                        onTransformToObjective={() => handleTransformToObjective(alert)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Strategic Wizard */}
      {selectedAlert && (
        <BenchmarkStrategicWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          alert={selectedAlert}
        />
      )}
    </div>
  );
}
