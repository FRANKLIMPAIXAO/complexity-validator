export type TaxRegime = 'mei' | 'simples' | 'presumido' | 'real';

export type ComplexityLevel = 'basico' | 'intermediario' | 'avancado' | 'alto_risco' | 'critico';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  company_id: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  trial_expires_at: string | null;
  subscription_status: SubscriptionStatus | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  company_id: string;
  name: string;
  cnpj?: string | null;
  tax_regime: TaxRegime;
  monthly_entries: number;
  monthly_revenue: number;
  employees_count: number;
  monthly_hires: number;
  monthly_terminations: number;
  current_fee: number;
  complexity_score: number;
  complexity_level: ComplexityLevel;
  is_underpriced: boolean;
  plan_id?: string | null;
  monthly_invoices: number;
  has_tax_substitution: boolean;
  has_import_operations: boolean;
  is_ecommerce: boolean;
  complex_payroll: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  tax_regime: TaxRegime;
  monthly_entries: number;
  monthly_revenue: number;
  employees_count: number;
  monthly_hires: number;
  monthly_terminations: number;
  current_fee: number;
  plan_id?: string;
  monthly_invoices: number;
  has_tax_substitution: boolean;
  has_import_operations: boolean;
  is_ecommerce: boolean;
  complex_payroll: boolean;
}

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  mei: 'MEI',
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
};

export const COMPLEXITY_LEVEL_LABELS: Record<ComplexityLevel, string> = {
  basico: 'Baixa Complexidade',
  intermediario: 'Média Complexidade',
  avancado: 'Alta Complexidade',
  alto_risco: 'Alto Risco',
  critico: 'Complexidade Crítica',
};

export const COMPLEXITY_LEVEL_COLORS: Record<ComplexityLevel, string> = {
  basico: 'bg-green-500',
  intermediario: 'bg-yellow-500',
  avancado: 'bg-orange-500',
  alto_risco: 'bg-red-500',
  critico: 'bg-red-700',
};
