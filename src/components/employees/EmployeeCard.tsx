import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Star, 
  AlertCircle, 
  BarChart3,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Employee, EmployeeMetrics, PERFORMANCE_LEVEL_CONFIG } from '@/types/employee';
import { cn } from '@/lib/utils';

interface EmployeeCardProps {
  employee: Employee;
  metrics?: EmployeeMetrics;
  avgFeedback?: number;
  pendingActions?: number;
  onClick: () => void;
  onAddMetrics: () => void;
}

export default function EmployeeCard({
  employee,
  metrics,
  avgFeedback,
  pendingActions = 0,
  onClick,
  onAddMetrics,
}: EmployeeCardProps) {
  const config = metrics?.performance_level 
    ? PERFORMANCE_LEVEL_CONFIG[metrics.performance_level]
    : null;

  const hireDate = new Date(employee.hire_date);
  const tenure = Math.floor((Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <Card 
      className={cn(
        'cursor-pointer hover:shadow-md transition-all',
        config && metrics?.performance_level === 'risco_operacional' && 'border-red-500/50',
        config && metrics?.performance_level === 'atencao' && 'border-amber-500/50',
        config && metrics?.performance_level === 'alto_desempenho' && 'border-green-500/50'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {employee.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {employee.role} • {employee.department}
              </p>
            </div>
          </div>
          {config && (
            <Badge className={cn('text-xs', config.bgColor, 'text-white')}>
              {config.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics ? (
          <>
            {/* Performance Score */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Score de Performance</span>
                <span className="font-semibold">{metrics.performance_score}/100</span>
              </div>
              <Progress 
                value={metrics.performance_score} 
                className={cn(
                  'h-2',
                  metrics.performance_level === 'alto_desempenho' && '[&>div]:bg-green-500',
                  metrics.performance_level === 'desempenho_adequado' && '[&>div]:bg-blue-500',
                  metrics.performance_level === 'atencao' && '[&>div]:bg-amber-500',
                  metrics.performance_level === 'risco_operacional' && '[&>div]:bg-red-500'
                )}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{metrics.clients_served}</p>
                <p className="text-xs text-muted-foreground">Clientes</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">
                  {metrics.tasks_assigned > 0 
                    ? Math.round((metrics.tasks_completed / metrics.tasks_assigned) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Conclusão</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">
                  {metrics.tasks_completed > 0 
                    ? Math.round((metrics.tasks_on_time / metrics.tasks_completed) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">No Prazo</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Sem métricas registradas
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                onAddMetrics();
              }}
            >
              Registrar Métricas
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {avgFeedback !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500" />
                {avgFeedback.toFixed(1)}
              </div>
            )}
            {pendingActions > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                {pendingActions} ação(ões)
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {tenure}m
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
