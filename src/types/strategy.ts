// Types for Strategic Planning Module

export type StrategicPillar = 
  | 'financeiro'
  | 'comercial'
  | 'marketing'
  | 'operacoes'
  | 'pessoas'
  | 'tecnologia'
  | 'compliance';

export type GoalStatus = 
  | 'nao_iniciada'
  | 'em_andamento'
  | 'concluida'
  | 'atrasada'
  | 'cancelada';

export type PriorityLevel = 'baixa' | 'media' | 'alta' | 'critica';

export type KpiFrequency = 
  | 'diaria'
  | 'semanal'
  | 'quinzenal'
  | 'mensal'
  | 'trimestral'
  | 'semestral'
  | 'anual';

export type GovernanceCycle = 'semanal' | 'mensal' | 'trimestral';

export interface StrategicDiagnosis {
  id: string;
  user_id: string;
  company_id: string;
  
  // Strategic Identity
  mission: string | null;
  vision: string | null;
  core_values: string | null;
  value_proposition: string | null;
  target_audience: string | null;
  
  // Internal Diagnosis (SWOT - Strengths and Weaknesses)
  internal_financial: string | null;
  internal_processes: string | null;
  internal_people: string | null;
  internal_technology: string | null;
  internal_commercial: string | null;
  internal_brand: string | null;
  
  // External Diagnosis (SWOT - Opportunities and Threats)
  external_market: string | null;
  external_legislation: string | null;
  external_competition: string | null;
  external_technology: string | null;
  external_economy: string | null;
  
  strategic_summary: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface StrategicObjective {
  id: string;
  user_id: string;
  company_id: string;
  pillar: StrategicPillar;
  objective: string;
  justification: string | null;
  expected_impact: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StrategicGoal {
  id: string;
  user_id: string;
  company_id: string;
  objective_id: string;
  goal_description: string;
  deadline: string;
  responsible: string;
  status: GoalStatus;
  priority: PriorityLevel;
  
  is_specific: boolean;
  is_measurable: boolean;
  is_achievable: boolean;
  is_relevant: boolean;
  is_time_bound: boolean;
  
  progress_percentage: number;
  notes: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  objective?: StrategicObjective;
}

export interface StrategicKpi {
  id: string;
  user_id: string;
  company_id: string;
  goal_id: string | null;
  
  name: string;
  description: string | null;
  formula: string | null;
  data_source: string | null;
  frequency: KpiFrequency;
  target_value: number;
  minimum_acceptable: number | null;
  current_value: number;
  unit: string;
  pillar: StrategicPillar;
  responsible: string | null;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  goal?: StrategicGoal;
}

export interface KpiHistory {
  id: string;
  user_id: string;
  company_id: string;
  kpi_id: string;
  recorded_value: number;
  recorded_at: string;
  notes: string | null;
}

export interface GovernanceReport {
  id: string;
  user_id: string;
  company_id: string;
  cycle_type: GovernanceCycle;
  period_start: string;
  period_end: string;
  
  what_worked: string | null;
  what_didnt_work: string | null;
  adjustments_needed: string | null;
  decisions_made: string | null;
  critical_analysis: string | null;
  action_plan: string | null;
  
  created_at: string;
  updated_at: string;
}

// Labels
export const PILLAR_LABELS: Record<StrategicPillar, string> = {
  financeiro: 'Financeiro',
  comercial: 'Comercial',
  marketing: 'Marketing & Marca',
  operacoes: 'Operações',
  pessoas: 'Pessoas',
  tecnologia: 'Tecnologia & Automação',
  compliance: 'Compliance & Risco',
};

export const PILLAR_ICONS: Record<StrategicPillar, string> = {
  financeiro: 'DollarSign',
  comercial: 'ShoppingCart',
  marketing: 'Megaphone',
  operacoes: 'Settings',
  pessoas: 'Users',
  tecnologia: 'Cpu',
  compliance: 'Shield',
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  nao_iniciada: 'Não Iniciada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
  cancelada: 'Cancelada',
};

export const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
  nao_iniciada: 'bg-gray-500',
  em_andamento: 'bg-blue-500',
  concluida: 'bg-green-500',
  atrasada: 'bg-red-500',
  cancelada: 'bg-gray-400',
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  baixa: 'bg-gray-500',
  media: 'bg-blue-500',
  alta: 'bg-orange-500',
  critica: 'bg-red-500',
};

export const FREQUENCY_LABELS: Record<KpiFrequency, string> = {
  diaria: 'Diária',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};

export const CYCLE_LABELS: Record<GovernanceCycle, string> = {
  semanal: 'Semanal (Operacional)',
  mensal: 'Mensal (Tático)',
  trimestral: 'Trimestral (Estratégico)',
};
