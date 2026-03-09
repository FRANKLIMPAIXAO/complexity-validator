export type PerformanceLevel = 'alto_desempenho' | 'desempenho_adequado' | 'atencao' | 'risco_operacional';
export type FeedbackType = 'cliente' | 'gestor' | 'autoavaliacao';
export type EmployeeActionType = 
  | 'melhoria_salarial' 
  | 'reconhecimento' 
  | 'feedback_periodico' 
  | 'feedback_estruturado' 
  | 'treinamento' 
  | 'plano_desenvolvimento' 
  | 'reavaliacao_funcao' 
  | 'plano_corretivo';

export interface Employee {
  id: string;
  user_id: string;
  company_id: string;
  name: string;
  role: string;
  department: string;
  hire_date: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeMetrics {
  id: string;
  user_id: string;
  company_id: string;
  employee_id: string;
  period_month: number;
  period_year: number;
  clients_served: number;
  avg_client_complexity: number;
  monthly_demands: number;
  tasks_assigned: number;
  tasks_completed: number;
  tasks_on_time: number;
  tasks_rework: number;
  obligations_delivered: number;
  obligations_delayed: number;
  obligations_errors: number;
  performance_score: number;
  performance_level: PerformanceLevel;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFeedback {
  id: string;
  user_id: string;
  company_id: string;
  employee_id: string;
  feedback_type: FeedbackType;
  rating: number;
  comment?: string;
  created_by?: string;
  created_at: string;
}

export interface EmployeeAction {
  id: string;
  user_id: string;
  company_id: string;
  employee_id: string;
  action_type: EmployeeActionType;
  description: string;
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeePerformanceHistory {
  id: string;
  user_id: string;
  company_id: string;
  employee_id: string;
  period_month: number;
  period_year: number;
  performance_score: number;
  performance_level: PerformanceLevel;
  ai_analysis?: string;
  factors?: {
    positive: string[];
    negative: string[];
  } | null;
  recorded_at: string;
}

export interface EmployeeWithMetrics extends Employee {
  currentMetrics?: EmployeeMetrics;
  avgFeedbackRating?: number;
  pendingActions?: number;
}

export interface AIPerformanceAnalysis {
  summary: string;
  factors: string[];
  recommendations: {
    type: EmployeeActionType;
    description: string;
    priority: 'alta' | 'media' | 'baixa';
  }[];
  riskLevel: 'baixo' | 'moderado' | 'alto';
}

export const PERFORMANCE_LEVEL_CONFIG: Record<PerformanceLevel, {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  alto_desempenho: {
    label: 'Alto Desempenho',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    description: 'Colaborador com excelente performance em todas as dimensões avaliadas.',
  },
  desempenho_adequado: {
    label: 'Desempenho Adequado',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    description: 'Colaborador atende às expectativas e mantém entregas consistentes.',
  },
  atencao: {
    label: 'Atenção',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    description: 'Colaborador apresenta pontos de melhoria que requerem acompanhamento.',
  },
  risco_operacional: {
    label: 'Risco Operacional',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    description: 'Colaborador apresenta indicadores críticos que demandam intervenção.',
  },
};

export const ACTION_TYPE_CONFIG: Record<EmployeeActionType, {
  label: string;
  icon: string;
  performanceLevels: PerformanceLevel[];
}> = {
  melhoria_salarial: {
    label: 'Melhoria Salarial',
    icon: 'TrendingUp',
    performanceLevels: ['alto_desempenho'],
  },
  reconhecimento: {
    label: 'Reconhecimento',
    icon: 'Award',
    performanceLevels: ['alto_desempenho'],
  },
  feedback_periodico: {
    label: 'Feedback Periódico',
    icon: 'MessageSquare',
    performanceLevels: ['desempenho_adequado'],
  },
  feedback_estruturado: {
    label: 'Feedback Estruturado',
    icon: 'FileText',
    performanceLevels: ['atencao'],
  },
  treinamento: {
    label: 'Treinamento',
    icon: 'BookOpen',
    performanceLevels: ['atencao', 'risco_operacional'],
  },
  plano_desenvolvimento: {
    label: 'Plano de Desenvolvimento',
    icon: 'Target',
    performanceLevels: ['atencao'],
  },
  reavaliacao_funcao: {
    label: 'Reavaliação de Função',
    icon: 'RefreshCw',
    performanceLevels: ['risco_operacional'],
  },
  plano_corretivo: {
    label: 'Plano Corretivo',
    icon: 'AlertTriangle',
    performanceLevels: ['risco_operacional'],
  },
};
