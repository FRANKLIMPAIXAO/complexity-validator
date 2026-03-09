import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmployees, useEmployeeMetrics } from '@/hooks/useEmployees';
import { Award, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceOverviewProps {
  className?: string;
}

export default function PerformanceOverview({ className }: PerformanceOverviewProps) {
  const { data: employees = [] } = useEmployees();
  const { data: metrics = [] } = useEmployeeMetrics();

  const highPerformers = metrics.filter((m) => m.performance_level === 'alto_desempenho').length;
  const adequate = metrics.filter((m) => m.performance_level === 'desempenho_adequado').length;
  const attention = metrics.filter((m) => m.performance_level === 'atencao').length;
  const atRisk = metrics.filter((m) => m.performance_level === 'risco_operacional').length;

  const avgScore = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.performance_score || 0), 0) / metrics.length)
    : 0;

  const levels = [
    {
      label: 'Alto Desempenho',
      count: highPerformers,
      icon: Award,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Desempenho Adequado',
      count: adequate,
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Atenção',
      count: attention,
      icon: Target,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Risco Operacional',
      count: atRisk,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ];

  if (employees.length === 0) {
    return (
      <Card className={cn('bg-card border-border', className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Visão Geral de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum colaborador cadastrado.</p>
            <p className="text-sm mt-1">Adicione colaboradores para ver a performance.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Visão Geral de Performance
          </span>
          <Badge variant="secondary" className="font-normal">
            Score médio: {avgScore}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {levels.map((level) => (
            <div
              key={level.label}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                level.bg
              )}
            >
              <level.icon className={cn('h-5 w-5', level.color)} />
              <div>
                <p className="text-2xl font-bold text-foreground">{level.count}</p>
                <p className="text-xs text-muted-foreground">{level.label}</p>
              </div>
            </div>
          ))}
        </div>

        {metrics.length === 0 && employees.length > 0 && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Registre métricas dos colaboradores para ver a distribuição de performance.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
