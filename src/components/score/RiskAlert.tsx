import { AlertTriangle, TrendingUp, ClipboardList, Users, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { STRATEGIC_ALERTS, CORTEXCONT_VOCABULARY } from '@/lib/cortexcont-constants';

interface RiskAlertProps {
  className?: string;
  alertType?: keyof typeof STRATEGIC_ALERTS;
}

export default function RiskAlert({ className, alertType = 'underpricing' }: RiskAlertProps) {
  const alertConfig = STRATEGIC_ALERTS[alertType];
  
  const suggestedActions = [
    { icon: TrendingUp, text: 'Avaliar reajuste do honorário' },
    { icon: ClipboardList, text: 'Redefinir escopo de serviços' },
    { icon: Users, text: 'Reavaliar alocação de equipe' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-base font-semibold flex items-center gap-2">
          {alertConfig.title}
        </AlertTitle>
        <AlertDescription className="mt-3 space-y-4">
          <div>
            <p className="text-xs font-medium text-destructive/80 uppercase tracking-wide mb-1">
              {CORTEXCONT_VOCABULARY.analysis}
            </p>
            <p className="text-sm">
              {alertConfig.description} A análise indica que manter este cenário 
              pode comprometer a sustentabilidade operacional e financeira.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-destructive/80 uppercase tracking-wide mb-1">
              {CORTEXCONT_VOCABULARY.impact}
            </p>
            <ul className="text-sm space-y-1">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 opacity-70" />
                <span>Risco de sobrecarga da equipe operacional</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 opacity-70" />
                <span>Compressão de margem e rentabilidade</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 opacity-70" />
                <span>Exposição a risco operacional não remunerado</span>
              </li>
            </ul>
          </div>
          
          <div className="pt-2 border-t border-destructive/20">
            <p className="text-xs font-medium uppercase tracking-wide mb-2 opacity-80">
              {CORTEXCONT_VOCABULARY.recommendation}
            </p>
            <ul className="space-y-2">
              {suggestedActions.map((action, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-2 text-sm"
                >
                  <action.icon className="h-4 w-4 opacity-70" />
                  {action.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-destructive/20">
            <p className="text-xs italic opacity-70">
              CORTEXCONT sugere caminhos. A decisão final é sempre do gestor.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
