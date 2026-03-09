import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Calculator } from 'lucide-react';
import { formatCurrency } from '@/lib/scoreCalculator';
import { cn } from '@/lib/utils';

interface AdjustmentSimulatorProps {
  currentFee: number;
  rangeMin: number;
  rangeMax: number;
  className?: string;
}

type PositionType = 'below' | 'within' | 'above';
type MarginImpact = 'baixo' | 'adequado' | 'confortável';

interface SimulationResult {
  position: PositionType;
  positionLabel: string;
  marginImpact: MarginImpact;
  message: string;
  percentageInRange: number;
}

export default function AdjustmentSimulator({
  currentFee,
  rangeMin,
  rangeMax,
  className,
}: AdjustmentSimulatorProps) {
  // Slider range: from 50% of min to 150% of max
  const sliderMin = Math.floor(rangeMin * 0.5);
  const sliderMax = Math.ceil(rangeMax * 1.5);
  
  const [simulatedValue, setSimulatedValue] = useState(currentFee);

  const simulation = useMemo((): SimulationResult => {
    let position: PositionType;
    let positionLabel: string;
    let marginImpact: MarginImpact;
    let message: string;
    
    // Calculate percentage within range (0% = min, 100% = max)
    const percentageInRange = ((simulatedValue - rangeMin) / (rangeMax - rangeMin)) * 100;
    
    if (simulatedValue < rangeMin) {
      position = 'below';
      positionLabel = 'Abaixo da faixa';
      marginImpact = 'baixo';
      message = 'Mesmo com este ajuste, o valor ainda está abaixo do mínimo técnico recomendado.';
    } else if (simulatedValue > rangeMax) {
      position = 'above';
      positionLabel = 'Acima da faixa';
      marginImpact = 'confortável';
      message = 'Este valor posiciona o cliente acima da média para este perfil.';
    } else {
      position = 'within';
      positionLabel = 'Dentro da faixa';
      marginImpact = 'adequado';
      message = 'Este valor está alinhado ao nível de complexidade do cliente.';
    }
    
    return { position, positionLabel, marginImpact, message, percentageInRange };
  }, [simulatedValue, rangeMin, rangeMax]);

  const handleSliderChange = (value: number[]) => {
    setSimulatedValue(value[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^\d]/g, ''));
    if (!isNaN(value)) {
      setSimulatedValue(Math.max(sliderMin, Math.min(sliderMax, value)));
    }
  };

  const percentageChange = ((simulatedValue - currentFee) / currentFee) * 100;

  const positionStyles: Record<PositionType, { bg: string; text: string; icon: typeof Target }> = {
    below: { bg: 'bg-destructive/10', text: 'text-destructive', icon: TrendingDown },
    within: { bg: 'bg-primary/10', text: 'text-primary', icon: Target },
    above: { bg: 'bg-green-500/10', text: 'text-green-600', icon: TrendingUp },
  };

  const marginStyles: Record<MarginImpact, string> = {
    baixo: 'bg-destructive text-destructive-foreground',
    adequado: 'bg-primary text-primary-foreground',
    confortável: 'bg-green-500 text-white',
  };

  const PositionIcon = positionStyles[simulation.position].icon;

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Simulação de Reajuste
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Simule novos valores sem alterar o contrato atual
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input + Slider */}
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="simulated-value" className="text-sm text-muted-foreground">
                Valor Simulado
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="simulated-value"
                  type="text"
                  value={simulatedValue.toLocaleString('pt-BR')}
                  onChange={handleInputChange}
                  className="pl-10 text-lg font-semibold"
                />
              </div>
            </div>
            <div className="text-right pb-2">
              <span className={cn(
                'text-sm font-medium',
                percentageChange > 0 ? 'text-green-600' : percentageChange < 0 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
              </span>
              <p className="text-xs text-muted-foreground">vs. atual</p>
            </div>
          </div>

          <Slider
            value={[simulatedValue]}
            onValueChange={handleSliderChange}
            min={sliderMin}
            max={sliderMax}
            step={50}
            className="py-2"
          />

          {/* Range labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(sliderMin)}</span>
            <span className="text-primary font-medium">
              Faixa: {formatCurrency(rangeMin)} - {formatCurrency(rangeMax)}
            </span>
            <span>{formatCurrency(sliderMax)}</span>
          </div>
        </div>

        {/* Position Visualization */}
        <div className="space-y-3">
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            {/* Recommended range indicator */}
            <div
              className="absolute inset-y-0 bg-primary/30 rounded-full"
              style={{
                left: `${((rangeMin - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
                width: `${((rangeMax - rangeMin) / (sliderMax - sliderMin)) * 100}%`,
              }}
            />
            {/* Current fee marker */}
            <div
              className="absolute top-1/2 w-1 h-6 bg-muted-foreground/50 -translate-y-1/2"
              style={{
                left: `${((currentFee - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
              }}
              title="Valor atual"
            />
            {/* Simulated value marker */}
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-background shadow-lg transition-all',
                simulation.position === 'below' ? 'bg-destructive' :
                simulation.position === 'above' ? 'bg-green-500' : 'bg-primary'
              )}
              style={{
                left: `${Math.max(0, Math.min(100, ((simulatedValue - sliderMin) / (sliderMax - sliderMin)) * 100))}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={cn(
            'p-3 rounded-lg flex items-center gap-3',
            positionStyles[simulation.position].bg
          )}>
            <PositionIcon className={cn('h-5 w-5', positionStyles[simulation.position].text)} />
            <div>
              <p className="text-xs text-muted-foreground">Posição na Faixa</p>
              <p className={cn('font-semibold', positionStyles[simulation.position].text)}>
                {simulation.positionLabel}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Impacto na Margem</p>
              <Badge className={cn('mt-1', marginStyles[simulation.marginImpact])}>
                {simulation.marginImpact.charAt(0).toUpperCase() + simulation.marginImpact.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Dynamic Message */}
        <div className={cn(
          'p-4 rounded-lg border',
          simulation.position === 'below' ? 'border-destructive/30 bg-destructive/5' :
          simulation.position === 'above' ? 'border-green-500/30 bg-green-500/5' :
          'border-primary/30 bg-primary/5'
        )}>
          <p className={cn(
            'text-sm leading-relaxed',
            simulation.position === 'below' ? 'text-destructive' :
            simulation.position === 'above' ? 'text-green-600' :
            'text-primary'
          )}>
            {simulation.message}
          </p>
        </div>

        {/* Comparison Summary */}
        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Valor Atual</p>
              <p className="font-semibold text-foreground">{formatCurrency(currentFee)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor Simulado</p>
              <p className={cn(
                'font-semibold',
                simulation.position === 'below' ? 'text-destructive' :
                simulation.position === 'above' ? 'text-green-600' : 'text-primary'
              )}>
                {formatCurrency(simulatedValue)}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center italic">
          Esta simulação é apenas para análise. O valor do contrato não será alterado.
        </p>
      </CardContent>
    </Card>
  );
}
