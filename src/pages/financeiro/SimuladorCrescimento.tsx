import { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { useOfficeExpenses } from '@/hooks/useOfficeExpenses';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();
const CLIENTS_PER_EMPLOYEE = 15; // capacity assumption

export default function SimuladorCrescimento() {
  const { clients } = useClients();
  const { data: employees = [] } = useEmployees();
  const { data: expenses = [] } = useOfficeExpenses(currentMonth, currentYear);

  const [newClients, setNewClients] = useState(5);
  const [avgFee, setAvgFee] = useState(800);
  const [newHires, setNewHires] = useState(0);
  const [avgSalary, setAvgSalary] = useState(3000);

  const simulation = useMemo(() => {
    const currentRevenue = clients.reduce((s, c) => s + (c.current_fee || 0), 0);
    const currentCosts = expenses.reduce((s, e) => s + e.value, 0);

    const projectedRevenue = currentRevenue + (newClients * avgFee);
    const hiringCost = newHires * avgSalary;
    const projectedCosts = currentCosts + hiringCost;
    const projectedProfit = projectedRevenue - projectedCosts;

    const totalClients = clients.length + newClients;
    const totalEmployees = employees.length + newHires;
    const capacityRatio = totalEmployees > 0 ? totalClients / totalEmployees : totalClients;
    const isOverloaded = capacityRatio > CLIENTS_PER_EMPLOYEE;
    const recommendedHires = Math.max(0, Math.ceil(totalClients / CLIENTS_PER_EMPLOYEE) - totalEmployees);

    return {
      currentRevenue, currentCosts, projectedRevenue, projectedCosts, projectedProfit,
      totalClients, totalEmployees, capacityRatio, isOverloaded, recommendedHires,
    };
  }, [clients, employees, expenses, newClients, avgFee, newHires, avgSalary]);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Simulador de Crescimento</h1>
        <p className="text-muted-foreground">Projete o impacto de novos clientes e contratações</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parâmetros da Simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Novos clientes</Label>
              <Input type="number" min={0} value={newClients} onChange={e => setNewClients(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Honorário médio mensal (R$)</Label>
              <Input type="number" min={0} step={50} value={avgFee} onChange={e => setAvgFee(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Novas contratações (opcional)</Label>
              <Input type="number" min={0} value={newHires} onChange={e => setNewHires(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Salário médio das contratações (R$)</Label>
              <Input type="number" min={0} step={100} value={avgSalary} onChange={e => setAvgSalary(parseFloat(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resultado da Simulação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Projetada</p>
                  <p className="text-xl font-bold text-foreground">{fmt(simulation.projectedRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Custos Projetados</p>
                  <p className="text-xl font-bold text-foreground">{fmt(simulation.projectedCosts)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Projetado</p>
                  <p className={`text-xl font-bold ${simulation.projectedProfit >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                    {fmt(simulation.projectedProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clientes</p>
                  <p className="text-xl font-bold text-foreground">{simulation.totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {simulation.isOverloaded && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Equipe sobrecarregada</AlertTitle>
              <AlertDescription>
                Considerar nova contratação. Recomendação: {simulation.recommendedHires} novo(s) colaborador(es) para manter a proporção ideal de {CLIENTS_PER_EMPLOYEE} clientes por colaborador.
              </AlertDescription>
            </Alert>
          )}

          {!simulation.isOverloaded && simulation.recommendedHires === 0 && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertTitle>Capacidade adequada</AlertTitle>
              <AlertDescription>
                A equipe tem capacidade para absorver os novos clientes sem sobrecarga.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
