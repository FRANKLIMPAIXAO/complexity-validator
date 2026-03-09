import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  CheckSquare, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Check,
  Users,
  DollarSign,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateObjective } from '@/hooks/useStrategy';
import { formatCurrency } from '@/lib/scoreCalculator';
import { PILLAR_LABELS, type StrategicPillar } from '@/types/strategy';
import { toast } from 'sonner';

interface ClientData {
  id: string;
  name: string;
  complexity_score: number;
  current_fee: number;
  rangeMin: number;
  status: 'risk' | 'below' | 'within';
}

interface BatchStrategicWizardProps {
  clients: ClientData[];
  potentialRevenue: number;
  isOpen: boolean;
  onClose: () => void;
}

interface SuggestedGoal {
  id: string;
  description: string;
  selected: boolean;
}

interface SuggestedKpi {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export default function BatchStrategicWizard({ 
  clients, 
  potentialRevenue,
  isOpen, 
  onClose 
}: BatchStrategicWizardProps) {
  const navigate = useNavigate();
  const createObjective = useCreateObjective();

  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  
  const riskClients = clients.filter(c => c.status === 'risk');
  const belowClients = clients.filter(c => c.status === 'below');
  const currentYear = new Date().getFullYear();

  // Step 1: Objective
  const [objective, setObjective] = useState({
    pillar: 'financeiro' as StrategicPillar,
    objective: 'Aumentar a rentabilidade da carteira de clientes ativos',
    justification: `Análise do PrecificAI identificou ${clients.length} clientes com oportunidade de ajuste de honorários. ${riskClients.length} clientes em risco operacional e ${belowClients.length} abaixo da faixa mínima, com potencial de recuperação de ${formatCurrency(potentialRevenue)}/mês.`,
    expected_impact: 'Recuperação de margem operacional, redução de risco não remunerado e aumento da sustentabilidade financeira do escritório.',
  });

  // Step 2: Goals
  const [goals, setGoals] = useState<SuggestedGoal[]>([
    {
      id: '1',
      description: `Reajustar ${Math.min(clients.length, Math.ceil(clients.length * 0.2))} clientes subprecificados até ${currentYear + 1}`,
      selected: true,
    },
    {
      id: '2',
      description: `Reduzir em 50% a quantidade de clientes abaixo da faixa mínima até o final de ${currentYear + 1}`,
      selected: true,
    },
    {
      id: '3',
      description: `Eliminar todos os clientes em risco operacional da carteira até ${currentYear + 1}`,
      selected: riskClients.length > 0,
    },
    {
      id: '4',
      description: `Implementar revisão trimestral de honorários para clientes com score acima de 40 pontos`,
      selected: false,
    },
  ]);

  // Step 3: KPIs
  const [kpis, setKpis] = useState<SuggestedKpi[]>([
    {
      id: '1',
      name: 'Percentual de Clientes Subprecificados',
      description: 'Meta: reduzir para menos de 15%',
      selected: true,
    },
    {
      id: '2',
      name: 'Gap de Receita Mensal',
      description: `Meta: reduzir de ${formatCurrency(potentialRevenue)} para R$ 0`,
      selected: true,
    },
    {
      id: '3',
      name: 'Ticket Médio da Carteira',
      description: 'Meta: crescimento de 15% em 12 meses',
      selected: true,
    },
    {
      id: '4',
      name: 'Clientes em Risco Operacional',
      description: 'Meta: zero clientes em risco',
      selected: riskClients.length > 0,
    },
    {
      id: '5',
      name: 'Taxa de Reajuste Executado',
      description: 'Meta: 80% dos reajustes planejados realizados',
      selected: false,
    },
  ]);

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, selected: !g.selected } : g));
  };

  const toggleKpi = (id: string) => {
    setKpis(prev => prev.map(k => k.id === id ? { ...k, selected: !k.selected } : k));
  };

  const handleCreate = async () => {
    setIsCreating(true);
    
    try {
      await createObjective.mutateAsync({
        pillar: objective.pillar,
        objective: objective.objective,
        justification: objective.justification,
        expected_impact: objective.expected_impact,
      });

      toast.success('Planejamento estratégico criado com sucesso!', {
        description: `Objetivo criado com ${goals.filter(g => g.selected).length} metas e ${kpis.filter(k => k.selected).length} KPIs sugeridos`,
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
            Criar Plano Estratégico da Carteira
          </DialogTitle>
          <DialogDescription>
            Transforme diagnósticos de precificação em um plano de ação estruturado
          </DialogDescription>
        </DialogHeader>

        {/* Summary Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-primary">
                  <Users className="h-4 w-4" />
                  <span className="text-2xl font-bold">{clients.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Clientes afetados</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-orange-500">
                  <Target className="h-4 w-4" />
                  <span className="text-2xl font-bold">{riskClients.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Em risco</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-green-500">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-lg font-bold">{formatCurrency(potentialRevenue)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Potencial/mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-4">
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
              <span className={`ml-2 text-sm font-medium hidden sm:inline ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-3 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />
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
                    <SelectItem value="comercial">{PILLAR_LABELS.comercial}</SelectItem>
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
                <Label>Justificativa (baseada nos dados)</Label>
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
                Selecione as metas SMART para este objetivo:
              </p>

              <div className="space-y-2">
                {goals.map((goal) => (
                  <Card key={goal.id} className={goal.selected ? 'border-primary/50' : 'opacity-60'}>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={goal.selected}
                          onCheckedChange={() => toggleGoal(goal.id)}
                        />
                        <span className={`text-sm ${goal.selected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {goal.description}
                        </span>
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
                Selecione os KPIs para acompanhar o progresso:
              </p>

              <div className="space-y-2">
                {kpis.map((kpi) => (
                  <Card key={kpi.id} className={kpi.selected ? 'border-primary/50' : 'opacity-60'}>
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={kpi.selected}
                          onCheckedChange={() => toggleKpi(kpi.id)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className={`text-sm font-medium ${kpi.selected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {kpi.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{kpi.description}</p>
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
