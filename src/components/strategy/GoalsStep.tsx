import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit2,
  ArrowRight,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useObjectives } from '@/hooks/useStrategy';
import { 
  GOAL_STATUS_LABELS, 
  GOAL_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  PILLAR_LABELS,
  type GoalStatus, 
  type PriorityLevel,
  type StrategicGoal 
} from '@/types/strategy';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoalsStepProps {
  onNext: () => void;
}

const statusIcons: Record<GoalStatus, React.ElementType> = {
  nao_iniciada: Clock,
  em_andamento: AlertTriangle,
  concluida: CheckCircle,
  atrasada: XCircle,
  cancelada: Pause,
};

export default function GoalsStep({ onNext }: GoalsStepProps) {
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: objectives = [], isLoading: objectivesLoading } = useObjectives();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StrategicGoal | null>(null);
  const [formData, setFormData] = useState({
    objective_id: '',
    goal_description: '',
    deadline: '',
    responsible: '',
    priority: 'media' as PriorityLevel,
    is_specific: false,
    is_measurable: false,
    is_achievable: false,
    is_relevant: false,
    is_time_bound: false,
  });

  const smartScore = [
    formData.is_specific,
    formData.is_measurable,
    formData.is_achievable,
    formData.is_relevant,
    formData.is_time_bound,
  ].filter(Boolean).length;

  const handleSubmit = () => {
    if (!formData.objective_id || !formData.goal_description || !formData.deadline || !formData.responsible) return;

    if (editingGoal) {
      updateGoal.mutate({ id: editingGoal.id, ...formData });
    } else {
      createGoal.mutate(formData);
    }
    
    setIsDialogOpen(false);
    setEditingGoal(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      objective_id: '',
      goal_description: '',
      deadline: '',
      responsible: '',
      priority: 'media',
      is_specific: false,
      is_measurable: false,
      is_achievable: false,
      is_relevant: false,
      is_time_bound: false,
    });
  };

  const handleEdit = (goal: StrategicGoal) => {
    setEditingGoal(goal);
    setFormData({
      objective_id: goal.objective_id,
      goal_description: goal.goal_description,
      deadline: goal.deadline,
      responsible: goal.responsible,
      priority: goal.priority,
      is_specific: goal.is_specific,
      is_measurable: goal.is_measurable,
      is_achievable: goal.is_achievable,
      is_relevant: goal.is_relevant,
      is_time_bound: goal.is_time_bound,
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (goal: StrategicGoal, status: GoalStatus) => {
    updateGoal.mutate({ id: goal.id, status });
  };

  const handleProgressChange = (goal: StrategicGoal, progress: number) => {
    updateGoal.mutate({ id: goal.id, progress_percentage: progress });
  };

  if (goalsLoading || objectivesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Metas SMART</h3>
          <p className="text-sm text-muted-foreground">
            Transforme objetivos em metas específicas e mensuráveis
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingGoal(null); resetForm(); }} disabled={objectives.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta SMART'}</DialogTitle>
              <DialogDescription>
                Defina uma meta que atenda aos critérios SMART
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Objetivo Relacionado</Label>
                <Select
                  value={formData.objective_id}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, objective_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {objectives.map((obj) => (
                      <SelectItem key={obj.id} value={obj.id}>
                        <span className="text-xs text-muted-foreground mr-2">
                          [{PILLAR_LABELS[obj.pillar]}]
                        </span>
                        {obj.objective}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição da Meta</Label>
                <Textarea
                  value={formData.goal_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, goal_description: e.target.value }))}
                  placeholder="Ex: Aumentar o MRR de R$ 80.000 para R$ 120.000 até dezembro"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input
                    value={formData.responsible}
                    onChange={(e) => setFormData((prev) => ({ ...prev, responsible: e.target.value }))}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, priority: v as PriorityLevel }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PRIORITY_LABELS) as PriorityLevel[]).map((p) => (
                      <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SMART Validation */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Validação SMART</Label>
                  <Badge variant={smartScore >= 4 ? 'default' : 'secondary'}>
                    {smartScore}/5
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {[
                    { key: 'is_specific', label: 'Específica', desc: 'A meta é clara e bem definida?' },
                    { key: 'is_measurable', label: 'Mensurável', desc: 'É possível medir o progresso?' },
                    { key: 'is_achievable', label: 'Atingível', desc: 'É realista com os recursos disponíveis?' },
                    { key: 'is_relevant', label: 'Relevante', desc: 'Contribui para o objetivo estratégico?' },
                    { key: 'is_time_bound', label: 'Temporal', desc: 'Tem prazo definido?' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.key}
                        checked={formData[item.key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, [item.key]: checked }))
                        }
                      />
                      <div className="flex-1">
                        <label htmlFor={item.key} className="text-sm font-medium cursor-pointer">
                          {item.label}
                        </label>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={smartScore < 3}>
                  {editingGoal ? 'Salvar' : 'Criar Meta'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {objectives.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Você precisa criar objetivos estratégicos antes de definir metas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {goals.map((goal) => {
            const StatusIcon = statusIcons[goal.status];
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${GOAL_STATUS_COLORS[goal.status]} bg-opacity-20`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{goal.goal_description}</p>
                            {goal.objective && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Objetivo: {goal.objective.objective}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(goal)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteGoal.mutate(goal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(goal.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {goal.responsible}
                          </div>
                          <Badge variant="outline" className={PRIORITY_COLORS[goal.priority] + ' bg-opacity-20 border-0'}>
                            {PRIORITY_LABELS[goal.priority]}
                          </Badge>
                          <Select
                            value={goal.status}
                            onValueChange={(v) => handleStatusChange(goal, v as GoalStatus)}
                          >
                            <SelectTrigger className="h-7 w-auto text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(GOAL_STATUS_LABELS) as GoalStatus[]).map((s) => (
                                <SelectItem key={s} value={s}>{GOAL_STATUS_LABELS[s]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">{goal.progress_percentage}%</span>
                          </div>
                          <Progress value={goal.progress_percentage} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onNext}>
          Próximo: KPIs
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
