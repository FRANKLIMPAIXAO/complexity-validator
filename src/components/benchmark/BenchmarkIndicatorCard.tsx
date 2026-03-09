import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Target,
  Loader2
} from 'lucide-react';
import { BenchmarkIndicator, AIAnalysis } from '@/types/benchmark';
import { cn } from '@/lib/utils';

interface BenchmarkIndicatorCardProps {
  indicator: BenchmarkIndicator;
  aiAnalysis?: AIAnalysis;
  isLoadingAI?: boolean;
  onRequestAI?: () => void;
  onTransformToObjective?: () => void;
  expanded?: boolean;
}

export default function BenchmarkIndicatorCard({
  indicator,
  aiAnalysis,
  isLoadingAI,
  onRequestAI,
  onTransformToObjective,
  expanded = false,
}: BenchmarkIndicatorCardProps) {
  const formatValue = (value: number, unit: string) => {
    if (unit === 'R$') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return `${value.toFixed(1)} ${unit}`;
  };

  const getSeverityColor = () => {
    switch (indicator.severity) {
      case 'critical':
        return 'border-red-500 bg-red-500/5';
      case 'moderate':
        return 'border-amber-500 bg-amber-500/5';
      default:
        return 'border-border';
    }
  };

  const getSeverityBadge = () => {
    switch (indicator.severity) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'moderate':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Moderado</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getDirectionIcon = () => {
    // For underpriced and complexity, below is good
    const isInvertedMetric = ['percentual-subprecificados', 'complexidade-media'].includes(indicator.id);
    const isPositive = isInvertedMetric 
      ? indicator.direction === 'below'
      : indicator.direction === 'above';

    if (indicator.differencePercent < 5) {
      return <Minus className="h-5 w-5 text-muted-foreground" />;
    }

    if (isPositive) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    }
    return <TrendingDown className="h-5 w-5 text-red-500" />;
  };

  return (
    <Card className={cn('transition-all', getSeverityColor())}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              {indicator.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {indicator.description}
            </p>
          </div>
          {getSeverityBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Values Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Seu Escritório</p>
            <p className="text-lg font-bold text-foreground">
              {formatValue(indicator.userValue, indicator.unit)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Média do Cluster</p>
            <p className="text-lg font-semibold text-muted-foreground">
              {formatValue(indicator.clusterAverage, indicator.unit)}
            </p>
          </div>
        </div>

        {/* Difference */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            {getDirectionIcon()}
            <span className="text-sm font-medium">
              {indicator.differencePercent}% {indicator.direction === 'above' ? 'acima' : 'abaixo'}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {indicator.pillar === 'financeiro' ? 'Financeiro' : 'Operações'}
          </Badge>
        </div>

        {/* AI Analysis */}
        {(expanded || aiAnalysis) && (
          <div className="space-y-3">
            {!aiAnalysis && onRequestAI && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                onClick={onRequestAI}
                disabled={isLoadingAI}
              >
                {isLoadingAI ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoadingAI ? 'Analisando...' : 'Análise com IA'}
              </Button>
            )}

            {aiAnalysis && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Análise Inteligente</span>
                </div>
                
                <p className="text-sm text-foreground">
                  {aiAnalysis.explanation}
                </p>

                {aiAnalysis.factors.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Fatores Identificados:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {aiAnalysis.factors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs">
                  <span className="font-medium text-foreground">Recomendação: </span>
                  <span className="text-muted-foreground">{aiAnalysis.recommendation}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {onTransformToObjective && (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full gap-2"
            onClick={onTransformToObjective}
          >
            <Target className="h-4 w-4" />
            Transformar em Objetivo Estratégico
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
