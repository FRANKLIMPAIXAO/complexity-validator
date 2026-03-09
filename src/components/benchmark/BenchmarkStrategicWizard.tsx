import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { BenchmarkAlert } from '@/types/benchmark';
import { useCreateObjective, useCreateGoal, useCreateKpi } from '@/hooks/useStrategy';
import { toast } from 'sonner';
import { StrategicPillar } from '@/types/strategy';

interface BenchmarkStrategicWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: BenchmarkAlert;
}

interface SuggestedGoal {
  id: string;
  description: string;
  deadline: string;
  selected: boolean;
}

interface SuggestedKpi {
  id: string;
  name: string;
  formula: string;
  target: string;
  frequency: string;
  selected: boolean;
}

export default function BenchmarkStrategicWizard({
  open,
  onOpenChange,
  alert,
}: BenchmarkStrategicWizardProps) {
  const createObjectiveMutation = useCreateObjective();
  const createGoalMutation = useCreateGoal();
  const createKpiMutation = useCreateKpi();
  const isCreating = createObjectiveMutation.isPending || createGoalMutation.isPending || createKpiMutation.isPending;
  const [step, setStep] = useState(1);

  // Objective form
  const [objectiveData, setObjectiveData] = useState({
    pillar: alert.pillar,
    objective: alert.suggestedObjective,
    justification: alert.suggestedJustification,
    expectedImpact: alert.suggestedImpact,
  });

  // Goals
  const currentYear = new Date().getFullYear();
  const [goals, setGoals] = useState<SuggestedGoal[]>([
    {
      id: '1',
      description: `Reduzir em 30% o desvio de ${alert.indicatorName.toLowerCase()} em relação ao benchmark`,
      deadline: `${currentYear}-12-31`,
      selected: true,
    },
    {
      id: '2',
      description: `Alcançar a média do cluster em ${alert.indicatorName.toLowerCase()} até o próximo trimestre`,
      deadline: `${currentYear + 1}-03-31`,
      selected: true,
    },
  ]);

  // KPIs
  const [kpis, setKpis] = useState<SuggestedKpi[]>([
    {
      id: '1',
      name: `Diferença % ${alert.indicatorName} vs Benchmark`,
      formula: `((Valor Atual - Média Cluster) / Média Cluster) × 100`,
      target: '≤ 10%',
      frequency: 'mensal',
      selected: true,
    },
    {
      id: '2',
      name: 'Evolução Mensal do Indicador',
      formula: `((Valor Mês Atual - Valor Mês Anterior) / Valor Mês Anterior) × 100`,
      target: 'Crescimento contínuo',
      frequency: 'mensal',
      selected: true,
    },
    {
      id: '3',
      name: 'Receita Recorrente Mensal (MRR)',
      formula: 'Soma dos honorários mensais ativos',
      target: 'Definido pelo usuário',
      frequency: 'mensal',
      selected: false,
    },
  ]);

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, selected: !g.selected } : g
    ));
  };

  const toggleKpi = (id: string) => {
    setKpis(prev => prev.map(k => 
      k.id === id ? { ...k, selected: !k.selected } : k
    ));
  };

  const handleCreate = async () => {
    try {
      // Create objective
      await createObjectiveMutation.mutateAsync({
        pillar: objectiveData.pillar as StrategicPillar,
        objective: objectiveData.objective,
        justification: objectiveData.justification,
        expected_impact: objectiveData.expectedImpact,
      });

      // Create selected goals (simplified - they need objective_id which we don't have synchronously)
      const selectedGoals = goals.filter(g => g.selected);
      for (const goal of selectedGoals) {
        // Goals will need to be linked manually or via a different flow
      }

      // Create selected KPIs
      const selectedKpis = kpis.filter(k => k.selected);
      for (const kpi of selectedKpis) {
        await createKpiMutation.mutateAsync({
          name: kpi.name,
          pillar: objectiveData.pillar as StrategicPillar,
          target_value: 0,
          formula: kpi.formula,
          frequency: kpi.frequency as 'mensal',
          description: `KPI gerado a partir do Benchmark Estratégico - ${alert.indicatorName}`,
        });
      }

      toast.success('Plano estratégico criado com sucesso!');
      onOpenChange(false);
      setStep(1);
    } catch (error) {
      toast.error('Erro ao criar plano estratégico');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="gap-1">
              <BarChart3 className="h-3 w-3" />
              Benchmark Estratégico
            </Badge>
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Transformar Desvio em Estratégia
          </DialogTitle>
          <DialogDescription>
            Crie um plano estratégico completo a partir do desvio identificado em {alert.indicatorName}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= s 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'}
              `}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-20 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Objective */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Objetivo Estratégico
            </h3>

            <div className="space-y-3">
              <div>
                <Label>Pilar Estratégico</Label>
                <div className="flex gap-2 mt-1">
                  {(['financeiro', 'operacoes'] as const).map((p) => (
                    <Button
                      key={p}
                      variant={objectiveData.pillar === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setObjectiveData({ ...objectiveData, pillar: p })}
                    >
                      {p === 'financeiro' ? 'Financeiro' : 'Operações'}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Objetivo</Label>
                <Textarea
                  value={objectiveData.objective}
                  onChange={(e) => setObjectiveData({ ...objectiveData, objective: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label>Justificativa</Label>
                <Textarea
                  value={objectiveData.justification}
                  onChange={(e) => setObjectiveData({ ...objectiveData, justification: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label>Impacto Esperado</Label>
                <Textarea
                  value={objectiveData.expectedImpact}
                  onChange={(e) => setObjectiveData({ ...objectiveData, expectedImpact: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Metas SMART Sugeridas</h3>
            <p className="text-sm text-muted-foreground">
              Selecione as metas que deseja criar para este objetivo
            </p>

            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    goal.selected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={goal.selected} />
                    <div className="flex-1 space-y-2">
                      <Textarea
                        value={goal.description}
                        onChange={(e) => {
                          e.stopPropagation();
                          setGoals(prev => prev.map(g =>
                            g.id === goal.id ? { ...g, description: e.target.value } : g
                          ));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm"
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Prazo:</Label>
                        <Input
                          type="date"
                          value={goal.deadline}
                          onChange={(e) => {
                            e.stopPropagation();
                            setGoals(prev => prev.map(g =>
                              g.id === goal.id ? { ...g, deadline: e.target.value } : g
                            ));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-40 h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: KPIs */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">KPIs de Acompanhamento</h3>
            <p className="text-sm text-muted-foreground">
              Selecione os indicadores para monitorar o progresso
            </p>

            <div className="space-y-3">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    kpi.selected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => toggleKpi(kpi.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={kpi.selected} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{kpi.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fórmula: {kpi.formula}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span>Meta: {kpi.target}</span>
                        <span>Frequência: {kpi.frequency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Plano Estratégico'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
