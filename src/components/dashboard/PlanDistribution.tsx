import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Client } from '@/types/database';
import { ClientPlan } from '@/types/clientPlan';
import { Crown } from 'lucide-react';

interface PlanDistributionProps {
  clients: Client[];
  plans: ClientPlan[];
}

export default function PlanDistribution({ clients, plans }: PlanDistributionProps) {
  // Agrupar clientes por plano
  const planCounts = clients.reduce((acc, client) => {
    const planId = client.plan_id || 'sem-plano';
    acc[planId] = (acc[planId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Criar dados para o gráfico
  const chartData = [
    // Planos existentes
    ...plans.map((plan) => ({
      name: plan.name,
      value: planCounts[plan.id] || 0,
      color: plan.color,
    })),
    // Clientes sem plano
    ...(planCounts['sem-plano']
      ? [{ name: 'Sem Plano', value: planCounts['sem-plano'], color: '#6B7280' }]
      : []),
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Distribuição por Plano
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-sm">
            Nenhum cliente cadastrado ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Distribuição por Plano
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} clientes`, 'Quantidade']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}:</span>
              <span className="font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Total: {total} clientes
        </p>
      </CardContent>
    </Card>
  );
}
