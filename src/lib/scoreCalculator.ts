import { ClientFormData, ComplexityLevel, COMPLEXITY_LEVEL_LABELS } from '@/types/database';

interface ScoreResult {
  score: number;
  level: ComplexityLevel;
  isUnderpriced: boolean;
  breakdown: ScoreBreakdown;
}

interface ScoreBreakdown {
  taxRegime: number;
  revenue: number;
  employees: number;
  invoices: number;
  additional: number;
}

export interface InterpretationResult {
  classification: string;
  score: number;
  relationWithValue: string;
  rangeMin: number;
  rangeMax: number;
  currentValue: number;
  positionInRange: string;
  diagnosis: string;
  isAtRisk: boolean;
}

// Faixas de referência para análise de subprecificação
const PRICE_RANGES: Record<ComplexityLevel, { min: number; max: number }> = {
  basico: { min: 300, max: 600 },
  intermediario: { min: 600, max: 1200 },
  avancado: { min: 1200, max: 2500 },
  alto_risco: { min: 2500, max: 5000 },
  critico: { min: 5000, max: 10000 },
};

export function calculateComplexityScore(data: ClientFormData): ScoreResult {
  const breakdown: ScoreBreakdown = {
    taxRegime: calculateTaxRegimeScore(data.tax_regime),
    revenue: calculateRevenueScore(data.monthly_revenue),
    employees: calculateEmployeesScore(data.employees_count),
    invoices: calculateInvoiceScore(data.monthly_invoices || 0),
    additional: calculateAdditionalComplexity(data),
  };

  const score = Math.min(
    100,
    breakdown.taxRegime + breakdown.revenue + breakdown.employees + breakdown.invoices + breakdown.additional
  );

  const level = getComplexityLevel(score);
  const isUnderpriced = checkUnderpricing(data.current_fee, level, score);

  return { score, level, isUnderpriced, breakdown };
}

// Tax Regime Score
function calculateTaxRegimeScore(regime: string): number {
  switch (regime) {
    case 'mei':
      return 2;
    case 'simples':
      return 10;
    case 'presumido':
      return 20;
    case 'real':
      return 30;
    default:
      return 10;
  }
}

// Revenue Score
function calculateRevenueScore(revenue: number): number {
  if (revenue <= 50000) return 2;
  if (revenue <= 100000) return 5;
  if (revenue <= 500000) return 10;
  return 15;
}

// Employees Score
function calculateEmployeesScore(employees: number): number {
  return Math.round(employees * 1.5);
}

// Invoice Volume Score
function calculateInvoiceScore(invoices: number): number {
  if (invoices <= 20) return 2;
  if (invoices <= 100) return 5;
  if (invoices <= 500) return 10;
  return 15;
}

// Additional Complexity
function calculateAdditionalComplexity(data: ClientFormData): number {
  let score = 0;
  if (data.has_tax_substitution) score += 8;
  if (data.has_import_operations) score += 10;
  if (data.is_ecommerce) score += 5;
  if (data.complex_payroll) score += 5;
  return score;
}

// Classification
function getComplexityLevel(score: number): ComplexityLevel {
  if (score <= 20) return 'basico';
  if (score <= 40) return 'intermediario';
  if (score <= 60) return 'avancado';
  if (score <= 80) return 'alto_risco';
  return 'critico';
}

function checkUnderpricing(currentFee: number, level: ComplexityLevel, score: number): boolean {
  const range = PRICE_RANGES[level];
  // FIX: o parâmetro score era ignorado. Agora interpola o mínimo esperado
  // dentro do nível com base na posição do score (mais preciso).
  const levelBounds: Record<ComplexityLevel, { min: number; max: number }> = {
    basico:        { min: 0,  max: 20 },
    intermediario: { min: 21, max: 40 },
    avancado:      { min: 41, max: 60 },
    alto_risco:    { min: 61, max: 80 },
    critico:       { min: 81, max: 100 },
  };
  const bounds = levelBounds[level];
  const position = Math.min(Math.max((score - bounds.min) / (bounds.max - bounds.min), 0), 1);
  const adjustedMin = range.min + (range.max - range.min) * 0.3 * position;
  return currentFee < adjustedMin;
}

export function checkRiskClient(currentFee: number, level: ComplexityLevel, score: number): boolean {
  const range = PRICE_RANGES[level];
  return score >= 30 && currentFee < range.min;
}

export function getExpectedPriceRange(level: ComplexityLevel): { min: number; max: number } {
  return PRICE_RANGES[level];
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function generateInterpretation(
  score: number,
  level: ComplexityLevel,
  currentFee: number
): InterpretationResult {
  const range = PRICE_RANGES[level];
  const classification = COMPLEXITY_LEVEL_LABELS[level];
  
  let relationWithValue: string;
  let positionInRange: string;
  let diagnosis: string;
  
  if (currentFee < range.min) {
    relationWithValue = 'superior';
    positionInRange = 'abaixo da faixa recomendada';
    diagnosis = 'potencial subprecificação e necessidade de reavaliação';
  } else if (currentFee > range.max) {
    relationWithValue = 'inferior';
    positionInRange = 'acima da faixa recomendada';
    diagnosis = 'margem saudável com espaço para serviços adicionais';
  } else {
    relationWithValue = 'compatível';
    positionInRange = 'dentro da faixa recomendada';
    diagnosis = 'equilíbrio adequado entre complexidade e honorário';
  }
  
  const isAtRisk = checkRiskClient(currentFee, level, score);
  
  return {
    classification,
    score,
    relationWithValue,
    rangeMin: range.min,
    rangeMax: range.max,
    currentValue: currentFee,
    positionInRange,
    diagnosis,
    isAtRisk,
  };
}

export function getScoreBreakdownLabels() {
  return {
    taxRegime: {
      label: 'Regime Tributário',
      description: 'MEI (2pts) | Simples (10pts) | Presumido (20pts) | Real (30pts)',
    },
    revenue: {
      label: 'Faturamento Mensal',
      description: 'Até 50k (2pts) | 50-100k (5pts) | 100-500k (10pts) | +500k (15pts)',
    },
    employees: {
      label: 'Funcionários',
      description: 'Funcionários × 1.5',
    },
    invoices: {
      label: 'Volume de Notas Fiscais',
      description: 'Até 20 (2pts) | 20-100 (5pts) | 100-500 (10pts) | +500 (15pts)',
    },
    additional: {
      label: 'Complexidade Adicional',
      description: 'ST (+8) | Importação (+10) | E-commerce (+5) | Folha complexa (+5)',
    },
  };
}
