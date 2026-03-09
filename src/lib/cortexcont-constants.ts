// ========================================
// CORTEXCONT - Constantes e Vocabulário
// ========================================

// Glossário de termos CORTEXCONT
export const CORTEXCONT_VOCABULARY = {
  analysis: 'Diagnóstico',
  recommendation: 'Ação Recomendada',
  risk: 'Risco Operacional',
  impact: 'Impacto Estratégico',
  decision: 'Decisão',
  execution: 'Execução',
  governance: 'Governança',
  indicator: 'Indicador',
  context: 'Contexto Analisado',
  factors: 'Fatores de Impacto',
} as const;

// Níveis de risco
export const RISK_LEVELS = {
  baixo: {
    label: 'Risco Baixo',
    color: 'emerald',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    description: 'Operação sob controle',
  },
  moderado: {
    label: 'Risco Moderado',
    color: 'amber',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-500',
    bgLightClass: 'bg-amber-500/10',
    description: 'Requer atenção',
  },
  alto: {
    label: 'Risco Alto',
    color: 'red',
    bgClass: 'bg-red-500',
    textClass: 'text-red-500',
    bgLightClass: 'bg-red-500/10',
    description: 'Ação imediata recomendada',
  },
} as const;

// Alertas estratégicos padrão
export const STRATEGIC_ALERTS = {
  margin_erosion: {
    title: 'Risco de erosão de margem',
    description: 'A relação entre esforço operacional e honorário indica compressão de margem.',
    severity: 'alto' as const,
  },
  operational_overload: {
    title: 'Risco de sobrecarga operacional',
    description: 'A demanda operacional excede a capacidade sustentável da equipe.',
    severity: 'alto' as const,
  },
  control_loss: {
    title: 'Risco de perda de controle',
    description: 'Indicadores sugerem redução na capacidade de monitoramento e governança.',
    severity: 'moderado' as const,
  },
  underpricing: {
    title: 'Risco de subprecificação',
    description: 'Complexidade operacional não está refletida no honorário praticado.',
    severity: 'alto' as const,
  },
  performance_decline: {
    title: 'Risco de queda de performance',
    description: 'Indicadores de desempenho apresentam tendência de deterioração.',
    severity: 'moderado' as const,
  },
  team_capacity: {
    title: 'Risco de capacidade da equipe',
    description: 'Distribuição de carga entre colaboradores apresenta desequilíbrio.',
    severity: 'moderado' as const,
  },
} as const;

// Domínios CORTEXCONT
export const CORTEXCONT_DOMAINS = {
  rentabilidade: {
    label: 'Rentabilidade & Precificação',
    icon: 'DollarSign',
    description: 'Análise de margem, precificação e sustentabilidade financeira',
  },
  planejamento: {
    label: 'Planejamento Estratégico',
    icon: 'Target',
    description: 'Definição e acompanhamento de objetivos e metas',
  },
  benchmark: {
    label: 'Benchmark Estratégico',
    icon: 'BarChart3',
    description: 'Comparação com indicadores de mercado e clusters',
  },
  pessoas: {
    label: 'Pessoas & Performance',
    icon: 'Users',
    description: 'Gestão de desempenho e desenvolvimento de equipe',
  },
  governanca: {
    label: 'Governança & Execução',
    icon: 'Shield',
    description: 'Controle, monitoramento e ciclos de gestão',
  },
} as const;

// Ações sugeridas por contexto
export const SUGGESTED_ACTIONS = {
  underpricing: [
    { icon: 'TrendingUp', text: 'Avaliar reajuste do honorário' },
    { icon: 'ClipboardList', text: 'Redefinir escopo de serviços' },
    { icon: 'Users', text: 'Reavaliar alocação de equipe' },
  ],
  performance_low: [
    { icon: 'MessageSquare', text: 'Aplicar feedback estruturado' },
    { icon: 'GraduationCap', text: 'Avaliar necessidade de treinamento' },
    { icon: 'Target', text: 'Redefinir metas e expectativas' },
  ],
  benchmark_deviation: [
    { icon: 'Search', text: 'Investigar causas do desvio' },
    { icon: 'Settings', text: 'Revisar processos operacionais' },
    { icon: 'BarChart3', text: 'Monitorar evolução do indicador' },
  ],
} as const;

// Labels de classificação
export const CLASSIFICATION_LABELS = {
  complexity: {
    basico: { label: 'Básico', color: 'emerald' },
    intermediario: { label: 'Intermediário', color: 'blue' },
    avancado: { label: 'Avançado', color: 'amber' },
    alto_risco: { label: 'Alto Risco', color: 'orange' },
    critico: { label: 'Crítico', color: 'red' },
  },
  performance: {
    alto_desempenho: { label: 'Alto Desempenho', color: 'emerald' },
    desempenho_adequado: { label: 'Desempenho Adequado', color: 'blue' },
    atencao: { label: 'Atenção', color: 'amber' },
    risco_operacional: { label: 'Risco Operacional', color: 'red' },
  },
} as const;
