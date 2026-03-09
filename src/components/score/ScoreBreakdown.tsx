import { motion } from 'framer-motion';
import { FileText, DollarSign, Users, ArrowUpDown, Building, Info, TrendingUp } from 'lucide-react';
import { ClientFormData } from '@/types/database';
import { calculateComplexityScore, formatCurrency } from '@/lib/scoreCalculator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface ScoreBreakdownProps {
  data: ClientFormData;
  className?: string;
}

const breakdownItems = [
  { key: 'taxRegime', label: 'Regime Tributário', icon: Building, max: 15 },
  { key: 'entries', label: 'Lançamentos Contábeis', icon: FileText, max: 20 },
  { key: 'revenue', label: 'Faturamento Mensal', icon: DollarSign, max: 20 },
  { key: 'employees', label: 'Funcionários', icon: Users, max: 15 },
  { key: 'movement', label: 'Movimentação DP', icon: ArrowUpDown, max: 15 },
] as const;

// Função para gerar explicação contextual de cada critério
function getScoreExplanation(
  key: string,
  data: ClientFormData,
  score: number,
  maxScore: number
): { situation: string; range: string; reason: string } {
  const percentage = (score / maxScore) * 100;
  
  switch (key) {
    case 'taxRegime': {
      const regimeLabels: Record<string, string> = {
        simples: 'Simples Nacional',
        presumido: 'Lucro Presumido',
        real: 'Lucro Real',
      };
      const regimeName = regimeLabels[data.tax_regime] || 'Simples Nacional';
      
      if (data.tax_regime === 'simples') {
        return {
          situation: `Este cliente opera no ${regimeName}.`,
          range: 'Faixa de menor complexidade tributária (6 pontos)',
          reason: 'O Simples Nacional possui apuração simplificada com guia única (DAS), reduzindo o esforço operacional mensal de obrigações acessórias.',
        };
      } else if (data.tax_regime === 'presumido') {
        return {
          situation: `Este cliente opera no ${regimeName}.`,
          range: 'Faixa de complexidade moderada (10 pontos)',
          reason: 'O Lucro Presumido exige apuração trimestral de IRPJ/CSLL e mensal de PIS/COFINS, com mais declarações acessórias que o Simples.',
        };
      } else {
        return {
          situation: `Este cliente opera no ${regimeName}.`,
          range: 'Faixa de alta complexidade tributária (15 pontos)',
          reason: 'O Lucro Real demanda controle detalhado de despesas, apuração complexa de tributos e maior volume de obrigações acessórias (ECF, ECD, etc.).',
        };
      }
    }
    
    case 'entries': {
      const entries = data.monthly_entries;
      let rangeText: string;
      let impactText: string;
      
      if (entries <= 50) {
        rangeText = 'Até 50 lançamentos/mês (5 pontos)';
        impactText = 'Volume baixo de lançamentos permite processamento ágil e menor tempo de conciliação.';
      } else if (entries <= 150) {
        rangeText = '51 a 150 lançamentos/mês (10 pontos)';
        impactText = 'Volume moderado exige rotina estruturada de conciliação e atenção a divergências.';
      } else if (entries <= 300) {
        rangeText = '151 a 300 lançamentos/mês (15 pontos)';
        impactText = 'Volume alto demanda equipe dedicada e processos de validação contínuos.';
      } else {
        rangeText = 'Acima de 300 lançamentos/mês (20 pontos)';
        impactText = 'Volume muito alto representa carga operacional intensa e risco elevado de retrabalho.';
      }
      
      return {
        situation: `Este cliente gera aproximadamente ${entries} lançamentos contábeis por mês.`,
        range: rangeText,
        reason: impactText,
      };
    }
    
    case 'revenue': {
      const revenue = data.monthly_revenue;
      let rangeText: string;
      let impactText: string;
      
      if (revenue <= 50000) {
        rangeText = 'Até R$ 50.000/mês (5 pontos)';
        impactText = 'Faturamento baixo geralmente está associado a menor volume de notas fiscais e operações financeiras simples.';
      } else if (revenue <= 200000) {
        rangeText = 'R$ 50.001 a R$ 200.000/mês (10 pontos)';
        impactText = 'Faturamento moderado implica volume crescente de documentos fiscais e maior atenção ao fluxo de caixa.';
      } else if (revenue <= 500000) {
        rangeText = 'R$ 200.001 a R$ 500.000/mês (15 pontos)';
        impactText = 'Faturamento expressivo exige controles robustos, análise de rentabilidade e gestão fiscal detalhada.';
      } else {
        rangeText = 'Acima de R$ 500.000/mês (20 pontos)';
        impactText = 'Faturamento elevado demanda assessoria estratégica, planejamento tributário ativo e monitoramento contínuo.';
      }
      
      return {
        situation: `Este cliente possui faturamento mensal de ${formatCurrency(revenue)}.`,
        range: rangeText,
        reason: impactText,
      };
    }
    
    case 'employees': {
      const employees = data.employees_count;
      let rangeText: string;
      let impactText: string;
      
      if (employees === 0) {
        rangeText = 'Sem funcionários (0 pontos)';
        impactText = 'Ausência de folha de pagamento elimina obrigações trabalhistas mensais e reduz significativamente a carga operacional.';
      } else if (employees <= 3) {
        rangeText = '1 a 3 funcionários (5 pontos)';
        impactText = 'Equipe pequena gera folha simplificada, mas ainda requer eSocial, FGTS Digital e demais obrigações trabalhistas.';
      } else if (employees <= 10) {
        rangeText = '4 a 10 funcionários (10 pontos)';
        impactText = 'Equipe média aumenta a complexidade da folha, com maior risco de férias, benefícios e variações salariais.';
      } else {
        rangeText = 'Acima de 10 funcionários (15 pontos)';
        impactText = 'Equipe grande demanda gestão trabalhista intensa, múltiplas apurações e atenção constante a prazos do eSocial.';
      }
      
      return {
        situation: `Este cliente possui ${employees} funcionário${employees !== 1 ? 's' : ''} registrado${employees !== 1 ? 's' : ''}.`,
        range: rangeText,
        reason: impactText,
      };
    }
    
    case 'movement': {
      const movement = data.monthly_hires + data.monthly_terminations;
      let rangeText: string;
      let impactText: string;
      
      if (movement <= 1) {
        rangeText = '0 a 1 movimentação/mês (3 pontos)';
        impactText = 'Baixa rotatividade permite planejamento estável e reduz urgências no departamento pessoal.';
      } else if (movement <= 3) {
        rangeText = '2 a 3 movimentações/mês (8 pontos)';
        impactText = 'Rotatividade moderada exige atenção a prazos de admissão, rescisões e seus reflexos tributários.';
      } else {
        rangeText = 'Acima de 3 movimentações/mês (15 pontos)';
        impactText = 'Alta rotatividade gera carga operacional intensa com cálculos rescisórios frequentes e risco de erros.';
      }
      
      return {
        situation: `Este cliente tem em média ${movement} movimentação${movement !== 1 ? 'ões' : ''} de DP por mês (admissões + rescisões).`,
        range: rangeText,
        reason: impactText,
      };
    }
    
    default:
      return {
        situation: '',
        range: '',
        reason: '',
      };
  }
}

// Função para identificar os principais impactadores do score
function getTopImpactors(
  breakdown: Record<string, number>,
  data: ClientFormData
): { key: string; label: string; impact: 'high' | 'medium' | 'low' }[] {
  const items = breakdownItems.map((item) => {
    const score = breakdown[item.key];
    const percentage = (score / item.max) * 100;
    
    return {
      key: item.key,
      label: item.label,
      score,
      max: item.max,
      percentage,
      impact: percentage >= 80 ? 'high' : percentage >= 50 ? 'medium' : 'low' as 'high' | 'medium' | 'low',
    };
  });
  
  // Ordena por porcentagem decrescente e retorna os top impactadores
  return items
    .sort((a, b) => b.percentage - a.percentage)
    .filter((item) => item.impact === 'high' || item.impact === 'medium')
    .slice(0, 3);
}

export default function ScoreBreakdown({ data, className }: ScoreBreakdownProps) {
  const { breakdown, score: totalScore } = calculateComplexityScore(data);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  const topImpactors = getTopImpactors(breakdown as unknown as Record<string, number>, data);
  
  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={className}>
      <h4 className="font-semibold text-foreground mb-4">Detalhamento do Score</h4>
      <div className="space-y-4">
        {breakdownItems.map((item, index) => {
          const value = breakdown[item.key];
          const percentage = (value / item.max) * 100;
          const explanation = getScoreExplanation(item.key, data, value, item.max);
          const isExpanded = expandedItems[item.key];

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <Collapsible open={isExpanded} onOpenChange={() => toggleItem(item.key)}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {value}/{item.max}
                      </span>
                      <CollapsibleTrigger asChild>
                        <button
                          className="p-1 rounded-md hover:bg-muted transition-colors"
                          title="Ver explicação"
                        >
                          <Info className={`h-4 w-4 transition-colors ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
                        </button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    />
                  </div>
                </div>
                
                <CollapsibleContent>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <p className="text-sm text-foreground">{explanation.situation}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/70 mt-2 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{explanation.range}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground italic">{explanation.reason}</p>
                      </div>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}
      </div>
      
      {/* Resumo dos principais impactadores */}
      {topImpactors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h5 className="font-medium text-foreground text-sm">Principais fatores de complexidade</h5>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {topImpactors.length === 1 ? (
              <>
                O critério <span className="font-medium text-foreground">{topImpactors[0].label}</span> é 
                o principal responsável pelo score de complexidade deste cliente.
              </>
            ) : topImpactors.length === 2 ? (
              <>
                Os critérios <span className="font-medium text-foreground">{topImpactors[0].label}</span> e{' '}
                <span className="font-medium text-foreground">{topImpactors[1].label}</span> são 
                os principais responsáveis pelo score de complexidade deste cliente.
              </>
            ) : (
              <>
                Os critérios <span className="font-medium text-foreground">{topImpactors[0].label}</span>,{' '}
                <span className="font-medium text-foreground">{topImpactors[1].label}</span> e{' '}
                <span className="font-medium text-foreground">{topImpactors[2].label}</span> são 
                os principais responsáveis pelo score de {totalScore} pontos deste cliente.
              </>
            )}
            {' '}Clique no ícone <Info className="h-3 w-3 inline text-muted-foreground" /> de cada item para 
            entender o impacto operacional detalhado.
          </p>
        </motion.div>
      )}
    </div>
  );
}
