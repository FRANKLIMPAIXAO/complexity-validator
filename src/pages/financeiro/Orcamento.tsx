import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Percent, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/dashboard/StatsCard';
import { useClients } from '@/hooks/useClients';
import { useOfficeExpenses } from '@/hooks/useOfficeExpenses';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function Orcamento() {
  const { clients } = useClients();
  const { data: expenses = [] } = useOfficeExpenses();

  const metrics = useMemo(() => {
    const totalRevenue = clients.reduce((sum, c) => sum + (c.current_fee || 0), 0);
    const totalExpenses = expenses
      .filter(e => e.month === currentMonth && e.year === currentYear)
      .reduce((sum, e) => sum + e.value, 0);
    const profit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const avgTicket = clients.length > 0 ? totalRevenue / clients.length : 0;

    return { totalRevenue, totalExpenses, profit, margin, avgTicket };
  }, [clients, expenses]);

  const revenueVsCosts = useMemo(() => {
    const months: Record<string, { name: string; receita: number; custos: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const name = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months[key] = { name, receita: 0, custos: 0 };
    }

    // Revenue is the same each month (recurring clients)
    const monthlyRevenue = clients.reduce((sum, c) => sum + (c.current_fee || 0), 0);
    Object.keys(months).forEach(k => { months[k].receita = monthlyRevenue; });

    expenses.forEach(e => {
      const key = `${e.year}-${e.month}`;
      if (months[key]) months[key].custos += e.value;
    });

    return Object.values(months);
  }, [clients, expenses]);

  const profitEvolution = useMemo(() => {
    return revenueVsCosts.map(m => ({
      name: m.name,
      lucro: m.receita - m.custos,
    }));
  }, [revenueVsCosts]);

  const costPerClient = useMemo(() => {
    if (clients.length === 0) return 0;
    const currentExpenses = expenses
      .filter(e => e.month === currentMonth && e.year === currentYear)
      .reduce((sum, e) => sum + e.value, 0);
    return currentExpenses / clients.length;
  }, [clients, expenses]);

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orçamento do Escritório</h1>
        <p className="text-muted-foreground">Visão financeira consolidada do escritório</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Receita Mensal" value={fmt(metrics.totalRevenue)} icon={DollarSign} description="Soma dos honorários" />
        <StatsCard title="Custos Totais" value={fmt(metrics.totalExpenses)} icon={TrendingDown} description="Mês atual" />
        <StatsCard title="Lucro Estimado" value={fmt(metrics.profit)} icon={TrendingUp} description={metrics.profit >= 0 ? 'Positivo' : 'Negativo'} />
        <StatsCard title="Margem" value={`${metrics.margin.toFixed(1)}%`} icon={Percent} description="Margem de lucro" />
        <StatsCard title="Ticket Médio" value={fmt(metrics.avgTicket)} icon={Users} description={`${clients.length} clientes`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita vs Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueVsCosts}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custos" name="Custos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução do Lucro Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitEvolution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="lucro" name="Lucro" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custo Médio por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{fmt(costPerClient)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Baseado em {clients.length} clientes e custos do mês atual
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
