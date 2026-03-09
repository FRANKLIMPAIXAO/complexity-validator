import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComplexityLevel } from '@/types/database';
import { getExpectedPriceRange, formatCurrency } from '@/lib/scoreCalculator';

interface UnderpriceAlertProps {
  currentFee: number;
  level: ComplexityLevel;
  className?: string;
}

export default function UnderpriceAlert({ currentFee, level, className }: UnderpriceAlertProps) {
  const range = getExpectedPriceRange(level);

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Cliente Potencialmente Subprecificado</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>
          O valor cobrado atualmente ({formatCurrency(currentFee)}) está abaixo da faixa 
          esperada para o nível de complexidade deste cliente.
        </p>
        <p className="font-medium">
          Faixa sugerida: {formatCurrency(range.min)} - {formatCurrency(range.max)}
        </p>
        <p className="text-sm opacity-80">
          Recomendamos uma análise estratégica para avaliar possíveis ajustes.
        </p>
      </AlertDescription>
    </Alert>
  );
}
