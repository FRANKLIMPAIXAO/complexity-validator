import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RISK_LEVELS, CORTEXCONT_VOCABULARY } from '@/lib/cortexcont-constants';
import { motion } from 'framer-motion';

interface Recommendation {
  type: string;
  description: string;
  priority?: 'alta' | 'media' | 'baixa';
}

interface CortexContAnalysisCardProps {
  domain: string;
  context: string;
  diagnosis: string;
  factors: string[];
  impact?: string;
  recommendations?: Recommendation[];
  riskLevel?: 'baixo' | 'moderado' | 'alto';
  className?: string;
  onApplyRecommendation?: (rec: Recommendation) => void;
}

export default function CortexContAnalysisCard({
  domain,
  context,
  diagnosis,
  factors,
  impact,
  recommendations = [],
  riskLevel = 'moderado',
  className,
  onApplyRecommendation,
}: CortexContAnalysisCardProps) {
  const riskConfig = RISK_LEVELS[riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('border-border/50', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Diagnóstico CORTEXCONT
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {domain}
              </Badge>
              <Badge className={cn(riskConfig.bgClass, 'text-white text-xs')}>
                {riskConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contexto */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              {CORTEXCONT_VOCABULARY.context}
            </p>
            <p className="text-sm text-foreground leading-relaxed">{context}</p>
          </div>

          <Separator className="opacity-50" />

          {/* Diagnóstico */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              {CORTEXCONT_VOCABULARY.analysis}
            </p>
            <p className="text-sm text-foreground leading-relaxed">{diagnosis}</p>
          </div>

          {/* Fatores de Impacto */}
          {factors.length > 0 && (
            <>
              <Separator className="opacity-50" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {CORTEXCONT_VOCABULARY.factors}
                </p>
                <ul className="space-y-1.5">
                  {factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Impacto Estratégico */}
          {impact && (
            <>
              <Separator className="opacity-50" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                  {CORTEXCONT_VOCABULARY.impact}
                </p>
                <p className="text-sm text-foreground leading-relaxed">{impact}</p>
              </div>
            </>
          )}

          {/* Ações Recomendadas */}
          {recommendations.length > 0 && (
            <>
              <Separator className="opacity-50" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {CORTEXCONT_VOCABULARY.recommendation}
                </p>
                <div className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {rec.type}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                      {onApplyRecommendation && (
                        <button
                          onClick={() => onApplyRecommendation(rec)}
                          className="ml-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          Aplicar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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
