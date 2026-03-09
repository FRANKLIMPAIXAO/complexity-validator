import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InterpretationResult, formatCurrency } from '@/lib/scoreCalculator';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Target, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { CORTEXCONT_VOCABULARY } from '@/lib/cortexcont-constants';

interface InterpretationSectionProps {
  interpretation: InterpretationResult;
}

export default function InterpretationSection({ interpretation }: InterpretationSectionProps) {
  const {
    classification,
    score,
    relationWithValue,
    rangeMin,
    rangeMax,
    currentValue,
    positionInRange,
    diagnosis,
  } = interpretation;

  // Determinar nível de risco baseado no diagnóstico
  const isRisk = diagnosis.toLowerCase().includes('subpreci') || 
                 diagnosis.toLowerCase().includes('abaixo') ||
                 diagnosis.toLowerCase().includes('risco');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Diagnóstico CORTEXCONT
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Rentabilidade & Precificação
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Diagnóstico */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              {CORTEXCONT_VOCABULARY.analysis}
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Este cliente apresenta nível de complexidade operacional{' '}
              <strong className="text-primary">{classification}</strong> (score: {score} pontos).
              A análise indica que o esforço operacional exigido está{' '}
              <strong className={isRisk ? 'text-destructive' : 'text-primary'}>
                {relationWithValue}
              </strong>{' '}
              ao honorário praticado.
            </p>
          </div>

          <Separator className="opacity-50" />

          {/* Fatores de Impacto */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Indicadores Avaliados
            </p>
            <ul className="space-y-1">
              {['Regime tributário', 'Volume de lançamentos', 'Faturamento mensal', 'Movimentação de folha'].map((indicator, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="opacity-50" />

          {/* Impacto Estratégico */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              {CORTEXCONT_VOCABULARY.impact}
            </p>
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <p className="text-sm text-foreground">
                <span className="font-medium">Faixa técnica recomendada:</span>{' '}
                <strong className="text-primary">{formatCurrency(rangeMin)}</strong> a{' '}
                <strong className="text-primary">{formatCurrency(rangeMax)}</strong>
              </p>
              <p className="text-sm text-foreground">
                <span className="font-medium">Honorário atual:</span>{' '}
                {formatCurrency(currentValue)} — {positionInRange}
              </p>
              <p className="text-sm font-medium">
                <span className={isRisk ? 'text-destructive' : 'text-emerald-500'}>
                  {diagnosis}
                </span>
              </p>
            </div>
          </div>

          {/* Risco identificado */}
          {isRisk && (
            <>
              <Separator className="opacity-50" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {CORTEXCONT_VOCABULARY.risk}
                </p>
                <p className="text-sm text-destructive">
                  Risco de erosão de margem identificado. Manter este contrato sem ajuste pode gerar 
                  sobrecarga operacional e comprometer a rentabilidade do escritório.
                </p>
              </div>
            </>
          )}

          {/* Footer CORTEXCONT */}
          <div className="mt-4 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground italic text-center">
              CORTEXCONT sugere caminhos e explica consequências. A decisão final é sempre do gestor.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
