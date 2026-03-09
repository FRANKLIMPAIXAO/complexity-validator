import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplexityLevel, COMPLEXITY_LEVEL_LABELS } from '@/types/database';
import { cn } from '@/lib/utils';

interface ComplexityDistributionProps {
  distribution: Record<ComplexityLevel, number>;
  total: number;
  className?: string;
}

const levelStyles: Record<ComplexityLevel, { bg: string; bar: string }> = {
  basico: { bg: 'bg-green-500/20', bar: 'bg-green-500' },
  intermediario: { bg: 'bg-blue-500/20', bar: 'bg-blue-500' },
  avancado: { bg: 'bg-yellow-500/20', bar: 'bg-yellow-500' },
  alto_risco: { bg: 'bg-orange-500/20', bar: 'bg-orange-500' },
  critico: { bg: 'bg-red-500/20', bar: 'bg-red-500' },
};

export default function ComplexityDistribution({
  distribution,
  total,
  className,
}: ComplexityDistributionProps) {
  const levels: ComplexityLevel[] = ['basico', 'intermediario', 'avancado', 'alto_risco', 'critico'];

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição por Complexidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {levels.map((level) => {
          const count = distribution[level] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={level} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {COMPLEXITY_LEVEL_LABELS[level]}
                </span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
              <div className={cn('h-2 rounded-full', levelStyles[level].bg)}>
                <div
                  className={cn('h-full rounded-full transition-all duration-500', levelStyles[level].bar)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
