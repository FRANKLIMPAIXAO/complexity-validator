import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PerformanceBehaviorMatrixProps {
  performanceScore: number; // 0-100
  behaviorScore: number; // 1-5 (avg competence)
  employeeName: string;
}

export default function PerformanceBehaviorMatrix({
  performanceScore,
  behaviorScore,
  employeeName,
}: PerformanceBehaviorMatrixProps) {
  // Normalize: performance 0-100 -> 0-1, behavior 1-5 -> 0-1
  const perfNorm = performanceScore / 100;
  const behNorm = (behaviorScore - 1) / 4;

  // Determine quadrant
  const isHighPerf = perfNorm >= 0.5;
  const isHighBeh = behNorm >= 0.5;

  let quadrant: string;
  let quadrantColor: string;
  let quadrantDesc: string;

  if (isHighPerf && isHighBeh) {
    quadrant = 'Desenvolver';
    quadrantColor = 'text-green-600';
    quadrantDesc = 'Colaborador com alta entrega e bom comportamento. Investir em crescimento.';
  } else if (isHighPerf && !isHighBeh) {
    quadrant = 'Treinar';
    quadrantColor = 'text-amber-600';
    quadrantDesc = 'Boa entrega, mas precisa desenvolver competências comportamentais.';
  } else if (!isHighPerf && isHighBeh) {
    quadrant = 'Alerta';
    quadrantColor = 'text-orange-600';
    quadrantDesc = 'Bom comportamento, mas entrega abaixo do esperado. Requer acompanhamento.';
  } else {
    quadrant = 'Desligar';
    quadrantColor = 'text-red-600';
    quadrantDesc = 'Baixa entrega e baixo alinhamento comportamental. Ação urgente necessária.';
  }

  // Position on grid (invert Y for visual)
  const dotLeft = `${Math.max(5, Math.min(95, behNorm * 100))}%`;
  const dotBottom = `${Math.max(5, Math.min(95, perfNorm * 100))}%`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Matriz Desempenho × Comportamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-square max-w-[280px] mx-auto border border-border rounded-lg overflow-hidden">
          {/* Quadrants */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-orange-500/10 flex items-center justify-center p-1 border-r border-b border-border/30">
              <span className="text-[10px] text-orange-600 font-medium text-center">Alerta</span>
            </div>
            <div className="bg-green-500/10 flex items-center justify-center p-1 border-b border-border/30">
              <span className="text-[10px] text-green-600 font-medium text-center">Desenvolver</span>
            </div>
            <div className="bg-red-500/10 flex items-center justify-center p-1 border-r border-border/30">
              <span className="text-[10px] text-red-600 font-medium text-center">Desligar</span>
            </div>
            <div className="bg-amber-500/10 flex items-center justify-center p-1">
              <span className="text-[10px] text-amber-600 font-medium text-center">Treinar</span>
            </div>
          </div>

          {/* Dot */}
          <div
            className="absolute w-4 h-4 rounded-full bg-primary border-2 border-white shadow-lg z-10 -translate-x-1/2 translate-y-1/2"
            style={{ left: dotLeft, bottom: dotBottom }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
          <span>← Comportamento baixo</span>
          <span>Comportamento alto →</span>
        </div>

        {/* Result */}
        <div className="mt-3 text-center">
          <p className={cn('font-bold text-lg', quadrantColor)}>{quadrant}</p>
          <p className="text-xs text-muted-foreground">{quadrantDesc}</p>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <span>Entrega: <strong>{performanceScore}%</strong></span>
            <span>Comportamento: <strong>{behaviorScore.toFixed(1)}/5</strong></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
