import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Users,
  BarChart3,
  Target,
  Compass,
  Rocket,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Building2,
  UserPlus,
  ClipboardList,
  TrendingUp,
  FileText,
  Settings,
  ArrowRight,
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  actions: { step: string; detail: string; icon: React.ReactNode }[];
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    stepNumber: 'Início',
    title: 'Bem-vindo ao PRAXIS',
    subtitle: 'Seu guia passo a passo',
    description: 'Vamos te guiar por cada etapa para você tirar o máximo do sistema. Siga este roteiro e seu escritório estará configurado em poucos minutos.',
    icon: <Sparkles className="h-10 w-10" />,
    color: 'from-primary to-accent',
    actions: [
      { step: 'Cadastre seu escritório', detail: 'Configure dados da empresa, CNPJ e regime tributário', icon: <Building2 className="h-4 w-4" /> },
      { step: 'Defina seus planos', detail: 'Vá em Configurações > Planos e crie suas categorias de serviço', icon: <Settings className="h-4 w-4" /> },
      { step: 'Personalize o sistema', detail: 'Ajuste as configurações conforme seu escritório', icon: <ClipboardList className="h-4 w-4" /> },
      { step: 'Siga os próximos passos', detail: 'Use as setas para ver o roteiro completo', icon: <ArrowRight className="h-4 w-4" /> },
    ],
  },
  {
    id: 'first-client',
    stepNumber: 'Passo 1',
    title: 'Cadastre seu Primeiro Cliente',
    subtitle: 'Menu: Clientes > Novo Cliente',
    description: 'O primeiro passo é cadastrar seus clientes. O sistema calculará automaticamente o score de complexidade e verificará se o honorário está adequado.',
    icon: <Users className="h-10 w-10" />,
    color: 'from-blue-500 to-cyan-400',
    actions: [
      { step: 'Acesse "Clientes" no menu lateral', detail: 'Clique em "Novo Cliente" no canto superior', icon: <UserPlus className="h-4 w-4" /> },
      { step: 'Preencha os dados do cliente', detail: 'Nome, CNPJ, regime tributário, faturamento e número de funcionários', icon: <ClipboardList className="h-4 w-4" /> },
      { step: 'Informe o honorário atual', detail: 'O sistema comparará com o valor justo calculado', icon: <TrendingUp className="h-4 w-4" /> },
      { step: 'Veja o resultado', detail: 'Score de complexidade, nível e alerta de subpreço aparecerão automaticamente', icon: <CheckCircle2 className="h-4 w-4" /> },
    ],
  },
  {
    id: 'after-client',
    stepNumber: 'Passo 2',
    title: 'Após Cadastrar Clientes',
    subtitle: 'Explore o Dashboard e Simulador',
    description: 'Com clientes cadastrados, o Dashboard ganha vida. Explore as análises, use o simulador de ajustes e identifique oportunidades.',
    icon: <TrendingUp className="h-10 w-10" />,
    color: 'from-violet-500 to-purple-400',
    actions: [
      { step: 'Veja o Dashboard', detail: 'Gráficos de distribuição, receita, complexidade e clientes subprecificados', icon: <BarChart3 className="h-4 w-4" /> },
      { step: 'Clique em um cliente', detail: 'Veja o detalhamento do score, o gauge de complexidade e a interpretação', icon: <Target className="h-4 w-4" /> },
      { step: 'Use o Simulador de Ajustes', detail: 'Simule reajustes e veja o impacto na receita total', icon: <TrendingUp className="h-4 w-4" /> },
      { step: 'Exporte o relatório em PDF', detail: 'No detalhe do cliente, clique em "Exportar PDF" para apresentar ao cliente', icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    id: 'first-employee',
    stepNumber: 'Passo 3',
    title: 'Cadastre seus Colaboradores',
    subtitle: 'Menu: Colaboradores > Novo',
    description: 'Adicione sua equipe para acompanhar performance, atribuir clientes e gerar planos de desenvolvimento individual.',
    icon: <BarChart3 className="h-10 w-10" />,
    color: 'from-emerald-500 to-teal-400',
    actions: [
      { step: 'Acesse "Colaboradores" no menu', detail: 'Clique em "Novo Colaborador" e preencha nome, cargo e departamento', icon: <UserPlus className="h-4 w-4" /> },
      { step: 'Atribua clientes ao colaborador', detail: 'Na aba "Clientes", vincule quais clientes ele atende', icon: <Users className="h-4 w-4" /> },
      { step: 'Registre as métricas mensais', detail: 'Obrigações entregues, prazos, demandas e retrabalho', icon: <ClipboardList className="h-4 w-4" /> },
      { step: 'Veja o score de performance', detail: 'O sistema calcula automaticamente o nível de desempenho', icon: <CheckCircle2 className="h-4 w-4" /> },
    ],
  },
  {
    id: 'after-employee',
    stepNumber: 'Passo 4',
    title: 'Após Cadastrar Colaboradores',
    subtitle: 'Feedbacks, PDI e Matriz Nine-Box',
    description: 'Com a equipe cadastrada, utilize as ferramentas de gestão de pessoas para desenvolver talentos e identificar riscos.',
    icon: <Target className="h-10 w-10" />,
    color: 'from-amber-500 to-orange-400',
    actions: [
      { step: 'Registre feedbacks', detail: 'Na aba "Feedback" do colaborador, adicione avaliações de gestores e clientes', icon: <ClipboardList className="h-4 w-4" /> },
      { step: 'Crie Metas SMART', detail: 'Aba "Metas" — defina objetivos específicos, mensuráveis e com prazo', icon: <Target className="h-4 w-4" /> },
      { step: 'Monte o PDI', detail: 'Plano de Desenvolvimento Individual com pontos fortes, melhorias e ações', icon: <FileText className="h-4 w-4" /> },
      { step: 'Veja a Matriz Nine-Box', detail: 'No Ranking, visualize performance vs. potencial de toda a equipe', icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    id: 'strategy',
    stepNumber: 'Passo 5',
    title: 'Monte sua Estratégia',
    subtitle: 'Menu: Estratégia',
    description: 'Defina a direção do escritório com um planejamento estratégico completo, conectando visão, objetivos, metas e indicadores.',
    icon: <Compass className="h-10 w-10" />,
    color: 'from-rose-500 to-pink-400',
    actions: [
      { step: 'Preencha o Diagnóstico', detail: 'Missão, visão, valores, análise interna e externa', icon: <ClipboardList className="h-4 w-4" /> },
      { step: 'Defina Objetivos por Pilar', detail: 'Financeiro, comercial, pessoas, operações, tecnologia...', icon: <Target className="h-4 w-4" /> },
      { step: 'Crie Metas e KPIs', detail: 'Vincule indicadores mensuráveis a cada objetivo', icon: <TrendingUp className="h-4 w-4" /> },
      { step: 'Configure a Governança', detail: 'Defina ciclos de revisão semanal, mensal e trimestral', icon: <Settings className="h-4 w-4" /> },
    ],
  },
  {
    id: 'start',
    stepNumber: 'Pronto!',
    title: 'Você está Preparado!',
    subtitle: 'Comece Agora',
    description: 'Seu roteiro está completo. Comece pelo Passo 1 e evolua no seu ritmo. O PRAXIS vai te guiar com alertas e recomendações ao longo do caminho.',
    icon: <Rocket className="h-10 w-10" />,
    color: 'from-primary to-accent',
    actions: [
      { step: '1. Cadastre clientes', detail: 'Comece adicionando sua carteira atual', icon: <Users className="h-4 w-4" /> },
      { step: '2. Adicione a equipe', detail: 'Inclua colaboradores e atribua clientes', icon: <UserPlus className="h-4 w-4" /> },
      { step: '3. Defina a estratégia', detail: 'Monte seu planejamento estratégico', icon: <Target className="h-4 w-4" /> },
      { step: '4. Acompanhe no Dashboard', detail: 'Monitore tudo em tempo real', icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
];

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingWizard({ open, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, handleNext, handlePrev, onSkip]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          key={step.id + '-glow'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
          style={{ background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsla(199,89%,48%,0.05)_0%,_transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col h-full max-h-screen py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground font-['Space_Grotesk']">PRAXIS</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <button key={i} onClick={() => setCurrentStep(i)}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? 'w-8 bg-primary'
                        : i < currentStep
                        ? 'w-3 bg-primary/50'
                        : 'w-3 bg-muted-foreground/20'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{currentStep + 1}/{STEPS.length}</span>
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground hover:text-foreground text-xs">
              Pular
            </Button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="grid md:grid-cols-2 gap-10 items-center">
                {/* Left */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg`}
                    >
                      {step.icon}
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${step.color} text-white`}
                    >
                      {step.stepNumber}
                    </motion.span>
                  </div>

                  <div className="space-y-2">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl md:text-4xl font-bold text-foreground font-['Space_Grotesk'] leading-tight"
                    >
                      {step.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22 }}
                      className="text-sm font-medium text-primary"
                    >
                      {step.subtitle}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-muted-foreground text-sm leading-relaxed max-w-lg"
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </div>

                {/* Right: step-by-step actions */}
                <div className="space-y-2.5">
                  {step.actions.map((action, i) => (
                    <motion.div
                      key={action.step}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                      className="group flex items-start gap-4 p-4 rounded-xl bg-card/60 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white opacity-80 group-hover:opacity-100 transition-opacity`}>
                          {action.icon}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{action.step}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{action.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between pt-6 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="gap-2 text-muted-foreground hover:text-foreground disabled:opacity-0"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            size="lg"
            className={`gap-2 min-w-40 font-semibold ${
              isLastStep ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground' : ''
            }`}
          >
            {isLastStep ? (
              <>
                <Rocket className="h-4 w-4" />
                Começar a Usar
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
