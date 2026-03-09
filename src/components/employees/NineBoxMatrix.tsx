import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee, EmployeeMetrics } from '@/types/employee';
import { EmployeeCompetenceEvaluation } from '@/hooks/useEmployeeEvaluations';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';

interface NineBoxMatrixProps {
  employees: Employee[];
  metrics: EmployeeMetrics[];
  evaluations: EmployeeCompetenceEvaluation[];
  onEmployeeClick: (employee: Employee) => void;
}

interface EmployeePlacement {
  employee: Employee;
  performanceScore: number;
  behaviorScore: number;
  perfLevel: 'low' | 'mid' | 'high';
  behLevel: 'low' | 'mid' | 'high';
}

const BOX_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'high-low': { label: 'Enigma', color: 'text-amber-700', bg: 'bg-amber-500/10' },
  'high-mid': { label: 'Futuro Líder', color: 'text-blue-700', bg: 'bg-blue-500/10' },
  'high-high': { label: 'Estrela', color: 'text-green-700', bg: 'bg-green-500/15' },
  'mid-low': { label: 'Risco', color: 'text-orange-700', bg: 'bg-orange-500/10' },
  'mid-mid': { label: 'Mantenedor', color: 'text-muted-foreground', bg: 'bg-muted/40' },
  'mid-high': { label: 'Alto Potencial', color: 'text-emerald-700', bg: 'bg-emerald-500/10' },
  'low-low': { label: 'Desligar', color: 'text-red-700', bg: 'bg-red-500/10' },
  'low-mid': { label: 'Recuperar', color: 'text-orange-600', bg: 'bg-orange-500/8' },
  'low-high': { label: 'Realocar', color: 'text-amber-600', bg: 'bg-amber-500/8' },
};

function getLevel(value: number, max: number): 'low' | 'mid' | 'high' {
  const normalized = value / max;
  if (normalized >= 0.67) return 'high';
  if (normalized >= 0.33) return 'mid';
  return 'low';
}

export default function NineBoxMatrix({ employees, metrics, evaluations, onEmployeeClick }: NineBoxMatrixProps) {
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  // Extract unique departments
  const departments = useMemo(() => {
    const deps = [...new Set(employees.map(e => e.department).filter(Boolean))].sort();
    return deps as string[];
  }, [employees]);

  // Extract unique periods from metrics
  const periods = useMemo(() => {
    const periodSet = new Map<string, string>();
    metrics.forEach(m => {
      const key = `${m.period_year}-${m.period_month}`;
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      periodSet.set(key, `${monthNames[m.period_month - 1]}/${m.period_year}`);
    });
    return [...periodSet.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, label]) => ({ key, label }));
  }, [metrics]);

  // Filter employees and metrics
  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(e => e.department === departmentFilter);
    }
    return filtered;
  }, [employees, departmentFilter]);

  const filteredMetrics = useMemo(() => {
    if (periodFilter === 'all') return metrics;
    const [year, month] = periodFilter.split('-').map(Number);
    return metrics.filter(m => m.period_year === year && m.period_month === month);
  }, [metrics, periodFilter]);

  // Calculate placements
  const placements: EmployeePlacement[] = filteredEmployees.map(emp => {
    const empMetrics = filteredMetrics.find(m => m.employee_id === emp.id);
    const empEvals = evaluations.filter(e => e.employee_id === emp.id);

    const performanceScore = empMetrics?.performance_score ?? 50;

    let behaviorScore = 3;
    if (empEvals.length > 0) {
      const latest = empEvals[0];
      behaviorScore = (
        latest.conhecimento_score + latest.habilidade_score + latest.atitude_score +
        latest.responsabilidade + latest.comunicacao + latest.organizacao +
        latest.proatividade + latest.trabalho_equipe + latest.lideranca
      ) / 9;
    }

    return {
      employee: emp,
      performanceScore,
      behaviorScore,
      perfLevel: getLevel(performanceScore, 100),
      behLevel: getLevel(behaviorScore, 5),
    };
  });

  const getBoxEmployees = (perf: 'low' | 'mid' | 'high', beh: 'low' | 'mid' | 'high') =>
    placements.filter(p => p.perfLevel === perf && p.behLevel === beh);

  const perfRows: ('high' | 'mid' | 'low')[] = ['high', 'mid', 'low'];
  const behCols: ('low' | 'mid' | 'high')[] = ['low', 'mid', 'high'];

  const perfLabels = { high: 'Alta', mid: 'Média', low: 'Baixa' };
  const behLabels = { low: 'Baixo', mid: 'Médio', high: 'Alto' };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Matriz 9-Box — Desempenho × Comportamento
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Posicionamento automático baseado em métricas e avaliações de competência
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os depto.</SelectItem>
                {departments.map(dep => (
                  <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                {periods.map(p => (
                  <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {/* Y-axis label */}
          <div className="flex flex-col justify-center items-center w-6 shrink-0">
            <span className="text-[10px] text-muted-foreground font-medium [writing-mode:vertical-lr] rotate-180">
              DESEMPENHO →
            </span>
          </div>

          <div className="flex-1 space-y-1">
            {/* Grid */}
            {perfRows.map(perf => (
              <div key={perf} className="flex gap-1">
                {/* Row label */}
                <div className="w-14 flex items-center justify-end pr-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-medium">{perfLabels[perf]}</span>
                </div>
                {behCols.map(beh => {
                  const key = `${perf}-${beh}`;
                  const config = BOX_CONFIG[key];
                  const boxEmployees = getBoxEmployees(perf, beh);

                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex-1 min-h-[100px] rounded-lg border border-border/50 p-2 flex flex-col',
                        config.bg
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn('text-[10px] font-semibold', config.color)}>
                          {config.label}
                        </span>
                        {boxEmployees.length > 0 && (
                          <Badge variant="secondary" className="text-[9px] h-4 px-1">
                            {boxEmployees.length}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-auto">
                        <TooltipProvider>
                          {boxEmployees.slice(0, 6).map(p => (
                            <Tooltip key={p.employee.id}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => onEmployeeClick(p.employee)}
                                  className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-bold text-primary hover:bg-primary/30 transition-colors"
                                >
                                  {p.employee.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                <p className="font-semibold">{p.employee.name}</p>
                                <p>Entrega: {p.performanceScore}% | Comportamento: {p.behaviorScore.toFixed(1)}/5</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {boxEmployees.length > 6 && (
                            <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                              +{boxEmployees.length - 6}
                            </span>
                          )}
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* X-axis labels */}
            <div className="flex gap-1 ml-14">
              {behCols.map(beh => (
                <div key={beh} className="flex-1 text-center">
                  <span className="text-[10px] text-muted-foreground font-medium">{behLabels[beh]}</span>
                </div>
              ))}
            </div>
            <div className="text-center ml-14">
              <span className="text-[10px] text-muted-foreground font-medium">COMPORTAMENTO →</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-2 font-medium">Legenda dos quadrantes:</p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            {Object.entries(BOX_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={cn('w-2 h-2 rounded-sm', config.bg, 'border border-border/50')} />
                <span className={cn('text-[10px]', config.color)}>{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
