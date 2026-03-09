import { useMemo } from 'react';
import { Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useClients } from '@/hooks/useClients';
import { useOfficeExpenses } from '@/hooks/useOfficeExpenses';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function PontoEquilibrio() {
  const { clients } = useClients();
  const { data: expenses = [] } = useOfficeExpenses(currentMonth, currentYear);

  const analysis = useMemo(() => {
    const totalCosts = expenses.reduce((s, e) => s + e.value, 0);
    const totalRevenue = clients.reduce((s, c) => s + (c.current_fee || 0), 0);
    const avgFee = clients.length > 0 ? totalRevenue / clients.length : 0;
    const breakEvenRevenue = totalCosts;
    const breakEvenClients = avgFee > 0 ? Math.ceil(totalCosts / avgFee) : 0;
    const ratio = totalRevenue > 0 ? (totalCosts / totalRevenue) * 100 : 100;

    let zone: 'green' | 'yellow' | 'red';
    if (ratio <= 70) zone = 'green';
    else if (ratio <= 95) zone = 'yellow';
    else zone = 'red';

    return { totalCosts, totalRevenue, avgFee, breakEvenRevenue, breakEvenClients, ratio, zone };
  }, [clients, expenses]);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const zoneConfig = {
    green: { label: 'Lucrativo', color: 'bg-green-500', textColor: 'text-green-500', icon: CheckCircle, desc: 'O escritório está operando com boa margem de lucro.' },
    yellow: { label: 'Próximo ao Equilíbrio', color: 'bg-yellow-500', textColor: 'text-yellow-500', icon: AlertTriangle, desc: 'O escritório está perto do ponto de equilíbrio. Atenção com custos.' },
    red: { label: 'Zona de Risco', color: 'bg-destructive', textColor: 'text-destructive', icon: AlertTriangle, desc: 'O escritório está operando com prejuízo ou muito próximo do limite.' },
  };

  const zoneInfo = zoneConfig[analysis.zone];
  const ZoneIcon = zoneInfo.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ponto de Equilíbrio</h1>
        <p className="text-muted-foreground">Análise do ponto de equilíbrio financeiro</p>
      </div>

      <Card className={`border-2 ${analysis.zone === 'green' ? 'border-green-500/30' : analysis.zone === 'yellow' ? 'border-yellow-500/30' : 'border-destructive/30'}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${zoneInfo.color}/10`}>
              <ZoneIcon className={`h-8 w-8 ${zoneInfo.textColor}`} />
            </div>
            <div>
              <Badge variant={analysis.zone === 'green' ? 'default' : analysis.zone === 'yellow' ? 'secondary' : 'destructive'}>
                {zoneInfo.label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">{zoneInfo.desc}</p>
            </div>
          </div>
          <Progress value={Math.min(analysis.ratio, 100)} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>Custos / Receita: {analysis.ratio.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Receita Break-even</p>
            <p className="text-2xl font-bold text-foreground mt-1">{fmt(analysis.breakEvenRevenue)}</p>
            <p className="text-xs text-muted-foreground">Receita mínima para cobrir custos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Clientes Necessários</p>
            <p className="text-2xl font-bold text-foreground mt-1">{analysis.breakEvenClients}</p>
            <p className="text-xs text-muted-foreground">Com ticket médio de {fmt(analysis.avgFee)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Receita Atual</p>
            <p className="text-2xl font-bold text-foreground mt-1">{fmt(analysis.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">{clients.length} clientes ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Custos Atuais</p>
            <p className="text-2xl font-bold text-foreground mt-1">{fmt(analysis.totalCosts)}</p>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
