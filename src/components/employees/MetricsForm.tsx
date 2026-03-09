import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateEmployeeMetrics } from '@/hooks/useEmployees';

interface MetricsFormProps {
  employeeId: string;
  onSuccess: () => void;
}

export default function MetricsForm({ employeeId, onSuccess }: MetricsFormProps) {
  const createMetrics = useCreateEmployeeMetrics();
  const now = new Date();
  
  const [formData, setFormData] = useState({
    period_month: now.getMonth() + 1,
    period_year: now.getFullYear(),
    clients_served: 0,
    avg_client_complexity: 0,
    monthly_demands: 0,
    tasks_assigned: 0,
    tasks_completed: 0,
    tasks_on_time: 0,
    tasks_rework: 0,
    obligations_delivered: 0,
    obligations_delayed: 0,
    obligations_errors: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMetrics.mutateAsync({
        ...formData,
        employee_id: employeeId,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  const handleNumberChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: parseFloat(value) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Period */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Mês</Label>
          <Input
            type="number"
            min={1}
            max={12}
            value={formData.period_month}
            onChange={(e) => handleNumberChange('period_month', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Ano</Label>
          <Input
            type="number"
            min={2020}
            max={2030}
            value={formData.period_year}
            onChange={(e) => handleNumberChange('period_year', e.target.value)}
          />
        </div>
      </div>

      {/* Atendimento */}
      <div>
        <h4 className="font-medium mb-3">📌 Atendimento</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Clientes Atendidos</Label>
            <Input
              type="number"
              min={0}
              value={formData.clients_served}
              onChange={(e) => handleNumberChange('clients_served', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Complexidade Média</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={formData.avg_client_complexity}
              onChange={(e) => handleNumberChange('avg_client_complexity', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Demandas Mensais</Label>
            <Input
              type="number"
              min={0}
              value={formData.monthly_demands}
              onChange={(e) => handleNumberChange('monthly_demands', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tarefas */}
      <div>
        <h4 className="font-medium mb-3">📌 Tarefas</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tarefas Atribuídas</Label>
            <Input
              type="number"
              min={0}
              value={formData.tasks_assigned}
              onChange={(e) => handleNumberChange('tasks_assigned', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tarefas Concluídas</Label>
            <Input
              type="number"
              min={0}
              value={formData.tasks_completed}
              onChange={(e) => handleNumberChange('tasks_completed', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tarefas no Prazo</Label>
            <Input
              type="number"
              min={0}
              value={formData.tasks_on_time}
              onChange={(e) => handleNumberChange('tasks_on_time', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Retrabalho</Label>
            <Input
              type="number"
              min={0}
              value={formData.tasks_rework}
              onChange={(e) => handleNumberChange('tasks_rework', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Obrigações */}
      <div>
        <h4 className="font-medium mb-3">📌 Obrigações Acessórias</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Entregues</Label>
            <Input
              type="number"
              min={0}
              value={formData.obligations_delivered}
              onChange={(e) => handleNumberChange('obligations_delivered', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Atrasadas</Label>
            <Input
              type="number"
              min={0}
              value={formData.obligations_delayed}
              onChange={(e) => handleNumberChange('obligations_delayed', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Erros</Label>
            <Input
              type="number"
              min={0}
              value={formData.obligations_errors}
              onChange={(e) => handleNumberChange('obligations_errors', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={createMetrics.isPending}>
          {createMetrics.isPending ? 'Salvando...' : 'Registrar Métricas'}
        </Button>
      </div>
    </form>
  );
}
