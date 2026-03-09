import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface AdjustmentGuidanceProps {
  className?: string;
}

export default function AdjustmentGuidance({ className }: AdjustmentGuidanceProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />
            Como comunicar este ajuste ao cliente
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                Ocultar <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Expandir <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-2 space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-sm text-foreground leading-relaxed italic">
                  "Esta análise indica que o nível de complexidade operacional do cliente 
                  exige mais esforço técnico do que o valor atualmente contratado.
                </p>
                <p className="text-sm text-foreground leading-relaxed italic mt-3">
                  O objetivo do ajuste não é aumento pontual, mas alinhamento técnico para 
                  manter qualidade, segurança e sustentabilidade do serviço."
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pontos-chave para a conversa:
                </p>
                <ul className="text-sm text-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Explique a metodologia de análise de complexidade
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Demonstre o valor agregado dos serviços prestados
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Apresente a faixa técnica de mercado como referência
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Proponha ajuste gradual se necessário
                  </li>
                </ul>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isExpanded && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Orientação estratégica para comunicar reajustes de forma profissional.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
