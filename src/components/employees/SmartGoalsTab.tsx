import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useEmployeeGoals, useCreateEmployeeGoal, useUpdateEmployeeGoal, useDeleteEmployeeGoal } from '@/hooks/useEmployeeEvaluations';
import { cn } from '@/lib/utils';

interface SmartGoalsTabProps {
  employeeId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-muted text-muted-foreground' },
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-500 text-white' },
  concluida: { label: 'Concluída', color: 'bg-green-500 text-white' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500 text-white' },
};

export default function SmartGoalsTab({ employeeId }: SmartGoalsTabProps) {
  const { data: goals = [] } = useEmployeeGoals(employeeId);
  const createGoal = useCreateEmployeeGoal();
  const updateGoal = useUpdateEmployeeGoal();
  const deleteGoal = useDeleteEmployeeGoal();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    is_specific: false,
    is_measurable: false,
    is_achievable: false,
    is_relevant: false,
    is_time_bound: false,
    target_value: '',
    unit: '',
    deadline: '',
  });

  const smartCount = [form.is_specific, form.is_measurable, form.is_achievable, form.is_relevant, form.is_time_bound].filter(Boolean).length;

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    await createGoal.mutateAsync({
      employee_id: employeeId,
      title: form.title,
      description: form.description || undefined,
      is_specific: form.is_specific,
      is_measurable: form.is_measurable,
      is_achievable: form.is_achievable,
      is_relevant: form.is_relevant,
      is_time_bound: form.is_time_bound,
      target_value: form.target_value ? Number(form.target_value) : undefined,
      current_value: 0,
      unit: form.unit || undefined,
      deadline: form.deadline || undefined,
      status: 'pendente',
    });
    setForm({ title: '', description: '', is_specific: false, is_measurable: false, is_achievable: false, is_relevant: false, is_time_bound: false, target_value: '', unit: '', deadline: '' });
    setShowForm(false);
  };

  const getGoalSmartCount = (g: typeof goals[0]) =>
    [g.is_specific, g.is_measurable, g.is_achievable, g.is_relevant, g.is_time_bound].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Metas SMART
        </h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Meta
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Título da meta" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Descrição detalhada" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

            <div className="grid grid-cols-5 gap-2">
              {[
                { key: 'is_specific' as const, label: 'S', full: 'Específica' },
                { key: 'is_measurable' as const, label: 'M', full: 'Mensurável' },
                { key: 'is_achievable' as const, label: 'A', full: 'Alcançável' },
                { key: 'is_relevant' as const, label: 'R', full: 'Relevante' },
                { key: 'is_time_bound' as const, label: 'T', full: 'Temporal' },
              ].map(item => (
                <label
                  key={item.key}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border cursor-pointer transition-colors',
                    form[item.key] ? 'border-primary bg-primary/10' : 'border-border'
                  )}
                >
                  <Checkbox
                    checked={form[item.key]}
                    onCheckedChange={checked => setForm({ ...form, [item.key]: !!checked })}
                  />
                  <span className="text-lg font-bold">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground text-center">{item.full}</span>
                </label>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Critérios SMART atendidos: <span className="font-bold text-primary">{smartCount}/5</span>
            </p>

            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Valor alvo" type="number" value={form.target_value} onChange={e => setForm({ ...form, target_value: e.target.value })} />
              <Input placeholder="Unidade (%, R$, un)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
              <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>

            <Button onClick={handleSubmit} disabled={createGoal.isPending || !form.title.trim()} className="w-full">
              Criar Meta
            </Button>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">Nenhuma meta cadastrada</p>
      )}

      {goals.map(goal => {
        const sc = getGoalSmartCount(goal);
        const progress = goal.target_value ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0;
        const statusConf = STATUS_CONFIG[goal.status] || STATUS_CONFIG.pendente;

        return (
          <Card key={goal.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{goal.title}</h4>
                    <Badge className={statusConf.color}>{statusConf.label}</Badge>
                    <Badge variant="outline" className="text-xs">SMART {sc}/5</Badge>
                  </div>
                  {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                </div>
                <div className="flex gap-1">
                  {goal.status !== 'concluida' && (
                    <Select
                      value={goal.status}
                      onValueChange={v => updateGoal.mutate({ id: goal.id, status: v })}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteGoal.mutate(goal.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {goal.target_value != null && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {goal.deadline && (
                <p className="text-xs text-muted-foreground mt-2">
                  Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
