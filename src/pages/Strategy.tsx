import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Target, 
  CheckSquare, 
  BarChart3, 
  ClipboardCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DiagnosisStep from '@/components/strategy/DiagnosisStep';
import ObjectivesStep from '@/components/strategy/ObjectivesStep';
import GoalsStep from '@/components/strategy/GoalsStep';
import KpisStep from '@/components/strategy/KpisStep';
import GovernanceStep from '@/components/strategy/GovernanceStep';

const steps = [
  { id: 'diagnosis', label: 'Diagnóstico', icon: Compass, description: 'Entender onde você está' },
  { id: 'objectives', label: 'Objetivos', icon: Target, description: 'Definir direção estratégica' },
  { id: 'goals', label: 'Metas', icon: CheckSquare, description: 'Desdobrar em SMART' },
  { id: 'kpis', label: 'KPIs', icon: BarChart3, description: 'Medir resultados' },
  { id: 'governance', label: 'Governança', icon: ClipboardCheck, description: 'Acompanhar e corrigir' },
];

export default function Strategy() {
  const [currentStep, setCurrentStep] = useState('diagnosis');

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Planejamento Estratégico</h1>
        <p className="text-muted-foreground mt-1">
          Transforme visão em execução mensurável
        </p>
      </div>

      {/* Step Navigation */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isPast = index < currentIndex;
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-lg transition-all text-sm font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : isPast
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                <step.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.label}</span>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 ml-1 hidden lg:inline text-muted-foreground/50" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Step description */}
        <div className="mt-4 flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          {(() => {
            const StepIcon = steps[currentIndex].icon;
            return <StepIcon className="h-5 w-5 text-primary" />;
          })()}
          <div>
            <p className="font-medium text-foreground">{steps[currentIndex].label}</p>
            <p className="text-sm text-muted-foreground">{steps[currentIndex].description}</p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 'diagnosis' && <DiagnosisStep onNext={() => setCurrentStep('objectives')} />}
        {currentStep === 'objectives' && <ObjectivesStep onNext={() => setCurrentStep('goals')} />}
        {currentStep === 'goals' && <GoalsStep onNext={() => setCurrentStep('kpis')} />}
        {currentStep === 'kpis' && <KpisStep onNext={() => setCurrentStep('governance')} />}
        {currentStep === 'governance' && <GovernanceStep />}
      </motion.div>
    </div>
  );
}
