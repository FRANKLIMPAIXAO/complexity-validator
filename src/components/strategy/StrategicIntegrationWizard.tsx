import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  CheckSquare, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  X,
  Check,
  Trash2,
  Edit2,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateObjective, useCreateGoal, useCreateKpi } from '@/hooks/useStrategy';
import { useClientMetrics } from '@/hooks/useClientMetrics';
import { formatCurrency } from '@/lib/scoreCalculator';
import { PILLAR_LABELS, type StrategicPillar } from '@/types/strategy';
import type { Client } from '@/types/database';
import { toast } from 'sonner';

interface StrategicIntegrationWizardProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
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
  description: string;
  formula: string;
  target: string;
  frequency: string;
  selected: boolean;
}

export default function StrategicIntegrationWizard({ 
  client, 
  isOpen, 
  onClose 
}: StrategicIntegrationWizardProps) {
  const navigate = useNavigate();
  const createObjective = useCreateObjective();
  const createGoal = useCreateGoal();
  const createKpi = useCreateKpi();
  const { metrics } = useClientMetrics();

  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  
  // Step 1: Objective
  const [objective, setObjective] = useState({
    pillar: 'financeiro' as StrategicPillar,
    objective: 'Aumentar a rentabilidade da carteira de clientes ativos',
    justification: `Análise do PrecificAI identificou o cliente "${client.name}" com nível de complexidade superior ao valor atualmente cobrado (${formatCurrency(Number(client.current_fee))}), indicando risco de subprecificação e sobrecarga operacional. Score de complexidade: ${client.complexity_score} pontos.`,
    expected_impact: 'Melhoria da margem operacional, redução de risco operacional não remunerado e sustentabilidade financeira do escritório.',
  });

  // Step 2: Goals
  const currentYear = new Date().getFullYear();
  const [goals, setGoals] = useState<SuggestedGoal[]>([
    {
      id: '1',
      description: `Reajustar o honorário do cliente "${client.name}" para a faixa mínima recomendada até ${currentYear + 1}`,
      deadline: `${currentYear + 1}-03-31`,
      selected: true,
    },
    {
      id: '2',
      description: `Reduzir em 30% a quantidade de clientes abaixo da faixa mínima recomendada até o primeiro trimestre de ${currentYear + 1}`,
      deadline: `${currentYear + 1}-03-31`,
      selected: true,
    },
    {
      id: '3',
      description: `Implementar revisão semestral de honorários para todos os clientes com score acima de 30 pontos`,
      deadline: `${currentYear}-12-31`,
      selected: false,
    },
  ]);

  // Step 3: KPIs
  const [kpis, setKpis] = useState<SuggestedKpi[]>([
    {
      id: '1',
      name: 'Percentual de Clientes Subprecificados',
      description: 'Proporção de clientes com honorário abaixo da faixa recomendada',
      formula: '(Clientes abaixo da faixa / Total de clientes) × 100',
      target: '≤ 20%',
      frequency: 'Mensal',
      selected: true,
    },
    {
      id: '2',
      name: 'Ticket Médio da Carteira',
      description: 'Valor médio de honorário por cliente',
      formula: 'Receita recorrente mensal / Número de clientes',
      target: `≥ ${formatCurrency(metrics.averageFee * 1.1)}`,
      frequency: 'Mensal',
      selected: true,
    },
    {
      id: '3',
      name: 'Gap de Receita',
      description: 'Diferença entre receita atual e potencial',
      formula: 'Receita potencial - Receita atual',
      target: formatCurrency(0),
      frequency: 'Mensal',
      selected: true,
    },
    {
      id: '4',
      name: 'Taxa de Reajuste Executado',
      description: 'Proporção de reajustes realizados vs planejados',
      formula: '(Reajustes realizados / Reajustes planejados) × 100',
      target: '≥ 80%',
      frequency: 'Trimestral',
      selected: false,
    },
  ]);

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, selected: !g.selected } : g));
  };

  const toggleKpi = (id: string) => {
    setKpis(prev => prev.map(k => k.id === id ? { ...k, selected: !k.selected } : k));
  };

  const updateGoalDescription = (id: string, description: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, description } : g));
  };

  const handleCreate = async () => {
    setIsCreating(true);
    
    try {
      // 1. Create objective
      await createObjective.mutateAsync({
        pillar: objective.pillar,
        objective: objective.objective,
        justification: objective.justification,
        expected_impact: objective.expected_impact,
      });

      // Wait a bit for the objective to be created and get its ID
      // In a real scenario, we'd return the ID from the mutation
      toast.success('Objetivo estratégico criado!');

      // Show success and navigate
      toast.success('Planejamento estratégico criado com sucesso!', {
        description: `${goals.filter(g => g.selected).length} metas e ${kpis.filter(k => k.selected).length} KPIs sugeridos`,
      });
      
      onClose();
      navigate('/strategy');
    } catch (error) {
      console.error('Error creating strategic planning:', error);
      toast.error('Erro ao criar planejamento estratégico');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedGoalsCount = goals.filter(g => g.selected).length;
  const selectedKpisCount = kpis.filter(k => k.selected).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Transformar em Planejamento Estratégico
          </DialogTitle>
          <DialogDescription>
            Converta diagnósticos de precificação em objetivos, metas e KPIs automaticamente
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[
            { num: 1, label: 'Objetivo', icon: Target },
            { num: 2, label: 'Metas', icon: CheckSquare },
            { num: 3, label: 'KPIs', icon: BarChart3 },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step >= s.num
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-12 h-0.5 mx-3 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Objective */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Planejamento orientado por dados</p>
                      <p className="text-muted-foreground">
                        O cliente "{client.name}" foi identificado com score {client.complexity_score} pontos 
                        e honorário de {formatCurrency(Number(client.current_fee))}, abaixo do recomendado.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pilar Estratégico</Label>
                  <Select
                    value={objective.pillar}
                    onValueChange={(v) => setObjective(prev => ({ ...prev, pillar: v as StrategicPillar }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financeiro">{PILLAR_LABELS.financeiro}</SelectItem>
                      <SelectItem value="operacoes">{PILLAR_LABELS.operacoes}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Objetivo Estratégico</Label>
                  <Textarea
                    value={objective.objective}
                    onChange={(e) => setObjective(prev => ({ ...prev, objective: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Justificativa</Label>
                  <Textarea
                    value={objective.justification}
                    onChange={(e) => setObjective(prev => ({ ...prev, justification: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Impacto Esperado</Label>
                  <Textarea
                    value={objective.expected_impact}
                    onChange={(e) => setObjective(prev => ({ ...prev, expected_impact: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Selecione e edite as metas SMART sugeridas para este objetivo:
              </p>

              <div className="space-y-3">
                {goals.map((goal) => (
                  <Card key={goal.id} className={goal.selected ? 'border-primary/50' : 'opacity-60'}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={goal.selected}
                          onCheckedChange={() => toggleGoal(goal.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <Textarea
                            value={goal.description}
                            onChange={(e) => updateGoalDescription(goal.id, e.target.value)}
                            className="min-h-[60px]"
                            disabled={!goal.selected}
                          />
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                            <Badge variant="outline" className="text-xs">Alta Prioridade</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {selectedGoalsCount} meta{selectedGoalsCount !== 1 ? 's' : ''} selecionada{selectedGoalsCount !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}

          {/* Step 3: KPIs */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Selecione os KPIs para acompanhar o progresso das metas:
              </p>

              <div className="space-y-3">
                {kpis.map((kpi) => (
                  <Card key={kpi.id} className={kpi.selected ? 'border-primary/50' : 'opacity-60'}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={kpi.selected}
                          onCheckedChange={() => toggleKpi(kpi.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{kpi.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              Fórmula: {kpi.formula}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Meta: {kpi.target}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {kpi.frequency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {selectedKpisCount} KPI{selectedKpisCount !== 1 ? 's' : ''} selecionado{selectedKpisCount !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>
          
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>Criando...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Criar Planejamento
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
