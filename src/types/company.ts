export type AppRole = 'admin' | 'gestor' | 'operacional' | 'visualizador';

export interface Company {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  tax_regime: 'simples' | 'presumido' | 'real';
  responsible_name: string | null;
  responsible_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  company_id: string;
  role: AppRole;
  created_at: string;
}

export interface MonthlyCompetence {
  id: string;
  company_id: string;
  year: number;
  month: number;
  status: 'open' | 'closed' | 'archived';
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyAnalysis {
  id: string;
  company_id: string;
  competence_id: string;
  employees_count: number;
  total_payroll: number;
  total_charges: number;
  hires_count: number;
  terminations_count: number;
  period_revenue: number;
  accumulated_revenue: number;
  simples_anexo: string | null;
  das_value: number;
  calculated_metrics: Record<string, unknown>;
  payroll_validated: boolean;
  payroll_validated_at: string | null;
  payroll_validated_by: string | null;
  pgdas_validated: boolean;
  pgdas_validated_at: string | null;
  pgdas_validated_by: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'folha_pagamento' | 'pgdas' | 'balancete' | 'dctf' | 'sped' | 'outros';
export type DocumentStatus = 'uploaded' | 'processing' | 'extracted' | 'validated' | 'error';

export interface Document {
  id: string;
  company_id: string;
  competence_id: string;
  uploaded_by: string;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string;
  status: DocumentStatus;
  extracted_data: Record<string, unknown>;
  extraction_confidence: number | null;
  extraction_error: string | null;
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentAdjustment {
  id: string;
  document_id: string;
  adjusted_by: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  created_at: string;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  operacional: 'Operacional',
  visualizador: 'Visualizador',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  folha_pagamento: 'Folha de Pagamento',
  pgdas: 'PGDAS',
  balancete: 'Balancete',
  dctf: 'DCTF',
  sped: 'SPED',
  outros: 'Outros',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  uploaded: 'Enviado',
  processing: 'Processando',
  extracted: 'Extraído',
  validated: 'Validado',
  error: 'Erro',
};

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
