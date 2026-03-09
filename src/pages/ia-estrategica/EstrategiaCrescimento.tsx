import { useState } from 'react';
import { TrendingUp, AlertTriangle, Loader2, Sparkles, Users, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePortfolioStats, useAIAnalysis } from '@/hooks/useStrategicAI';
import { formatCurrency } from '@/lib/scoreCalculator';

const CLIENTS_PER_EMPLOYEE = 15;

export default function EstrategiaCrescimento() {
  const { stats, isLoading } = usePortfolioStats();
  const { analysis, isAnalyzing, generateAnalysis } = useAIAnalysis();
  const [targetNewClients, setTargetNewClients] = useState(10);
  const [targetAvgFee, setTargetAvgFee] = useState(800);
  const [plannedHires, setPlannedHires] = useState(0);

  const totalClientsAfter = stats.totalClients + targetNewClients;
  const currentCapacity = stats.employeeCount * CLIENTS_PER_EMPLOYEE;
  const capacityAfterHires = (stats.employeeCount + plannedHires) * CLIENTS_PER_EMPLOYEE;
  const overCapacity = totalClientsAfter > capacityAfterHires;

  const projectedNewRevenue = targetNewClients * targetAvgFee;
  const projectedTotalRevenue = stats.totalRevenue + projectedNewRevenue;
  const avgCostPerNewClient = stats.avgCostPerClient > 0 ? stats.avgCostPerClient : 350;
  const projectedNewCost = targetNewClients * avgCostPerNewClient;
  const hireCost = plannedHires * 3500; // Average salary estimate
  const projectedTotalCost = stats.totalCost + projectedNewCost + hireCost;
  const projectedMargin = projectedTotalRevenue > 0
    ? ((projectedTotalRevenue - projectedTotalCost) / projectedTotalRevenue) * 100
    : 0;

  const recommendedHires = Math.max(0, Math.ceil((totalClientsAfter - currentCapacity) / CLIENTS_PER_EMPLOYEE));

  const handleGenerateAI = () => {
    generateAnalysis({
      currentClients: stats.totalClients,
      currentEmployees: stats.employeeCount,
      currentRevenue: stats.totalRevenue,
      currentCost: stats.totalCost,
      targetNewClients,
      targetAvgFee,
      plannedHires,
      capacity: CLIENTS_PER_EMPLOYEE,
    }, 'growth');
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
            <TrendingUp className="h-6 w-6 text-primary" />
            Estratégia de Crescimento
          </h1>
          <p className="text-muted-foreground">Simule cenários e projete o crescimento do escritório</p>
        </div>
        <Button onClick={handleGenerateAI} disabled={isAnalyzing}>
          {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Análise IA
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parâmetros de Crescimento</CardTitle>
            <CardDescription>Configure o cenário desejado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Novos clientes desejados</Label>
              <Input type="number" min={0} value={targetNewClients} onChange={e => setTargetNewClients(Number(e.target.value))} />
            </div>
            <div>
              <Label>Honorário médio pretendido (R$)</Label>
              <Input type="number" min={0} value={targetAvgFee} onChange={e => setTargetAvgFee(Number(e.target.value))} />
            </div>
            <div>
              <Label>Novas contratações planejadas</Label>
              <Input type="number" min={0} value={plannedHires} onChange={e => setPlannedHires(Number(e.target.value))} />
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <p className="text-muted-foreground">Situação atual:</p>
              <p><strong>{stats.totalClients}</strong> clientes | <strong>{stats.employeeCount}</strong> colaboradores</p>
              <p>Capacidade atual: <strong>{currentCapacity}</strong> clientes</p>
              <p>Receita mensal: <strong>{formatCurrency(stats.totalRevenue)}</strong></p>
            </div>
          </CardContent>
        </Card>

        {/* Projections */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Receita Projetada</p>
                  <p className="text-2xl font-bold">{formatCurrency(projectedTotalRevenue)}</p>
                  <p className="text-xs text-emerald-500">+{formatCurrency(projectedNewRevenue)} novos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Custo Operacional Projetado</p>
                  <p className="text-2xl font-bold">{formatCurrency(projectedTotalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Margem Projetada</p>
                  <p className={`text-2xl font-bold ${projectedMargin < 20 ? 'text-destructive' : 'text-emerald-500'}`}>
                    {projectedMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {recommendedHires > 0 && plannedHires < recommendedHires && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contratações Recomendadas</p>
                    <p className="text-2xl font-bold text-blue-500">{recommendedHires}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {overCapacity && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Capacidade operacional atingida</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Com {totalClientsAfter} clientes e {stats.employeeCount + plannedHires} colaboradores, 
                      a capacidade de {capacityAfterHires} clientes será excedida. 
                      Considere contratar pelo menos mais {recommendedHires - plannedHires} colaborador(es).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      {(analysis || isAnalyzing) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análise de Crescimento (IA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Analisando cenário de crescimento...</span>
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
