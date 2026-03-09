export interface ClientPlan {
  id: string;
  company_id: string;
  name: string;
  color: string;
  description: string | null;
  is_default: boolean;
  default_fee: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ClientPlanFormData {
  name: string;
  color: string;
  description?: string;
  is_default?: boolean;
  default_fee?: number | null;
}

// Cores predefinidas para seleção
export const PLAN_COLOR_OPTIONS = [
  { value: '#1F2937', label: 'Preto' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#F59E0B', label: 'Dourado' },
  { value: '#10B981', label: 'Verde' },
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6366F1', label: 'Índigo' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#F97316', label: 'Laranja' },
];
