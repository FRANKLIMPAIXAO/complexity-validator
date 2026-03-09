import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Target, ArrowRight } from 'lucide-react';
import { BenchmarkAlert } from '@/types/benchmark';
import { cn } from '@/lib/utils';

interface BenchmarkAlertCardProps {
  alert: BenchmarkAlert;
  onTransformToObjective: () => void;
}

export default function BenchmarkAlertCard({
  alert,
  onTransformToObjective,
}: BenchmarkAlertCardProps) {
  const isCritical = alert.severity === 'critical';

  return (
    <Card className={cn(
      'border-l-4',
      isCritical ? 'border-l-red-500' : 'border-l-amber-500'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(
              'h-5 w-5',
              isCritical ? 'text-red-500' : 'text-amber-500'
            )} />
            <CardTitle className="text-base font-semibold">
              {alert.indicatorName}
            </CardTitle>
          </div>
          <Badge variant={isCritical ? 'destructive' : 'secondary'}>
            {isCritical ? 'Crítico' : 'Moderado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground">
          {alert.message}
        </p>

        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="font-medium">Objetivo Sugerido:</span>
          </div>
          <p className="text-sm text-muted-foreground pl-6">
            {alert.suggestedObjective}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-medium text-muted-foreground">Pilar Estratégico</p>
            <p className="text-foreground capitalize">{alert.pillar}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Impacto Esperado</p>
            <p className="text-foreground line-clamp-2">{alert.suggestedImpact}</p>
          </div>
        </div>

        <Button 
          className="w-full gap-2"
          onClick={onTransformToObjective}
        >
          <Target className="h-4 w-4" />
          Transformar Desvio em Objetivo Estratégico
        </Button>
      </CardContent>
    </Card>
  );
}
