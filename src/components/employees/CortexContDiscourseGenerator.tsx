import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  MessageSquare,
  TrendingUp,
  GraduationCap,
  AlertTriangle,
  UserX,
  Loader2,
  Copy,
  CheckCircle2,
  Target,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Employee, EmployeeMetrics, EmployeeFeedback, PerformanceLevel } from '@/types/employee';
import { motion, AnimatePresence } from 'framer-motion';

type DiscourseType = 
  | 'reajuste_salarial'
  | 'feedback_desenvolvimento'
  | 'treinamento_direcionado'
  | 'alerta_atencao'
  | 'avaliacao_desligamento';

interface DiscourseResult {
  title: string;
  context: string;
  diagnosis: string;
  indicators: string[];
  impact: string;
  direction: string;
  nextStep: string;
  fullDiscourse: string;
}

interface CortexContDiscourseGeneratorProps {
  employee: Employee;
  metrics?: EmployeeMetrics;
  feedback?: EmployeeFeedback[];
}

const DISCOURSE_TYPES: Record<DiscourseType, {
  label: string;
  icon: typeof TrendingUp;
  description: string;
  color: string;
  bgColor: string;
  allowedLevels: PerformanceLevel[];
}> = {
  reajuste_salarial: {
    label: 'Reajuste Salarial',
    icon: TrendingUp,
    description: 'Para colaboradores com alto desempenho consistente',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    allowedLevels: ['alto_desempenho'],
  },
  feedback_desenvolvimento: {
    label: 'Feedback de Desenvolvimento',
    icon: MessageSquare,
    description: 'Para desempenho adequado com pontos de melhoria',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    allowedLevels: ['alto_desempenho', 'desempenho_adequado', 'atencao'],
  },
  treinamento_direcionado: {
    label: 'Treinamento Direcionado',
    icon: GraduationCap,
    description: 'Quando há padrão de erro ou retrabalho recorrente',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    allowedLevels: ['desempenho_adequado', 'atencao', 'risco_operacional'],
  },
  alerta_atencao: {
    label: 'Alerta (Zona de Atenção)',
    icon: AlertTriangle,
    description: 'Quando há risco operacional crescente',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    allowedLevels: ['atencao', 'risco_operacional'],
  },
  avaliacao_desligamento: {
    label: 'Avaliação de Desligamento',
    icon: UserX,
    description: 'Última alternativa - risco operacional recorrente',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    allowedLevels: ['risco_operacional'],
  },
};

export default function CortexContDiscourseGenerator({
  employee,
  metrics,
  feedback = [],
}: CortexContDiscourseGeneratorProps) {
  const [selectedType, setSelectedType] = useState<DiscourseType | null>(null);
  const [discourse, setDiscourse] = useState<DiscourseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter available discourse types based on performance level
  const availableTypes = Object.entries(DISCOURSE_TYPES).filter(([_, config]) => {
    if (!metrics?.performance_level) return true;
    return config.allowedLevels.includes(metrics.performance_level);
  });

  const generateDiscourse = async () => {
    if (!selectedType) {
      toast.error('Selecione o tipo de discurso');
      return;
    }

    setLoading(true);
    setDiscourse(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-discourse', {
        body: {
          employee,
          metrics,
          feedback,
          discourseType: selectedType,
        },
      });

      if (error) throw error;
      setDiscourse(data as DiscourseResult);
    } catch (error) {
      console.error('Error generating discourse:', error);
      toast.error('Erro ao gerar discurso');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!discourse?.fullDiscourse) return;
    
    try {
      await navigator.clipboard.writeText(discourse.fullDiscourse);
      setCopied(true);
      toast.success('Discurso copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const selectedConfig = selectedType ? DISCOURSE_TYPES[selectedType] : null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          CORTEXCONT | Pessoas & Performance
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Gerador de discursos técnicos para gestão de pessoas
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Discourse Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tipo de Discurso
          </label>
          <Select
            value={selectedType || ''}
            onValueChange={(value) => {
              setSelectedType(value as DiscourseType);
              setDiscourse(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de discurso..." />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-4 w-4', config.color)} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {selectedConfig && (
            <p className={cn('text-xs', selectedConfig.color)}>
              {selectedConfig.description}
            </p>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateDiscourse}
          disabled={!selectedType || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando discurso...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Discurso CORTEXCONT
            </>
          )}
        </Button>

        {/* Discourse Result */}
        <AnimatePresence mode="wait">
          {discourse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Separator />

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={cn(selectedConfig?.bgColor, selectedConfig?.color, 'border-0')}>
                    {discourse.title}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>

              {/* Structured View */}
              <div className="space-y-3">
                {/* Context */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    Contexto
                  </p>
                  <p className="text-sm">{discourse.context}</p>
                </div>

                {/* Diagnosis */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5" />
                    Diagnóstico Técnico
                  </p>
                  <p className="text-sm">{discourse.diagnosis}</p>
                </div>

                {/* Indicators */}
                {discourse.indicators.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Evidências (Dados)
                    </p>
                    <ul className="space-y-1.5">
                      {discourse.indicators.map((indicator, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Impact */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Impacto Operacional
                  </p>
                  <p className="text-sm">{discourse.impact}</p>
                </div>

                {/* Direction */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    Direcionamento Estratégico
                  </p>
                  <p className="text-sm">{discourse.direction}</p>
                </div>

                {/* Next Step */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                    Próximo Passo Sugerido
                  </p>
                  <p className="text-sm font-medium">{discourse.nextStep}</p>
                </div>
              </div>

              <Separator />

              {/* Full Discourse for Copy */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Discurso Completo
                </p>
                <ScrollArea className="h-48">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-sm whitespace-pre-wrap">{discourse.fullDiscourse}</p>
                  </div>
                </ScrollArea>
              </div>

              {/* CORTEXCONT Footer */}
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground italic text-center">
                  CORTEXCONT apoia decisões justas, técnicas e sustentáveis. A decisão final é sempre do gestor.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State Info */}
        {!discourse && !loading && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              Selecione o tipo de discurso e clique em "Gerar" para criar um discurso 
              estruturado baseado nos indicadores do colaborador.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
