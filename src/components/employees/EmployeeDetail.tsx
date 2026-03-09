import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  BarChart3,
  MessageSquare,
  Target,
  Sparkles,
  Loader2,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Brain,
  BookOpen,
  FileDown,
} from 'lucide-react';
import { Employee, PERFORMANCE_LEVEL_CONFIG, AIPerformanceAnalysis, ACTION_TYPE_CONFIG } from '@/types/employee';
import { 
  useEmployeeMetrics, 
  useEmployeeFeedback, 
  useEmployeeActions,
  useCreateEmployeeFeedback,
  useCreateEmployeeAction,
  useCompleteEmployeeAction,
} from '@/hooks/useEmployees';
import { useCompetenceEvaluations, useEmployeeGoals, useEmployeePDI } from '@/hooks/useEmployeeEvaluations';
import { supabase } from '@/integrations/supabase/client';
import { generateEmployeeEvaluationReport } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ClientAssignment from './ClientAssignment';
import CortexContDiscourseGenerator from './CortexContDiscourseGenerator';
import SmartGoalsTab from './SmartGoalsTab';
import CompetenceEvaluationTab from './CompetenceEvaluationTab';
import StructuredFeedbackTab from './StructuredFeedbackTab';
import PDITab from './PDITab';
import PerformanceBehaviorMatrix from './PerformanceBehaviorMatrix';

interface EmployeeDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onAddMetrics: () => void;
}

export default function EmployeeDetail({
  open,
  onOpenChange,
  employee,
  onAddMetrics,
}: EmployeeDetailProps) {
  const { data: metrics = [] } = useEmployeeMetrics(employee.id);
  const { data: feedback = [] } = useEmployeeFeedback(employee.id);
  const { data: actions = [] } = useEmployeeActions(employee.id);
  const { data: competenceEvals = [] } = useCompetenceEvaluations(employee.id);
  const { data: goals = [] } = useEmployeeGoals(employee.id);
  const { data: pdis = [] } = useEmployeePDI(employee.id);
  const createFeedback = useCreateEmployeeFeedback();
  const createAction = useCreateEmployeeAction();
  const completeAction = useCompleteEmployeeAction();

  const [aiAnalysis, setAiAnalysis] = useState<AIPerformanceAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const currentMetrics = metrics[0];
  const config = currentMetrics?.performance_level 
    ? PERFORMANCE_LEVEL_CONFIG[currentMetrics.performance_level]
    : null;

  const avgFeedback = feedback.length > 0
    ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
    : null;

  const pendingActions = actions.filter(a => !a.is_completed);
  const completedActions = actions.filter(a => a.is_completed);

  // Calculate behavior score from latest competence evaluation
  const latestEval = competenceEvals[0];
  const behaviorScore = latestEval
    ? (latestEval.responsabilidade + latestEval.comunicacao + latestEval.organizacao + latestEval.proatividade + latestEval.trabalho_equipe + latestEval.lideranca) / 6
    : null;

  const fetchAIAnalysis = async () => {
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('employee-analysis', {
        body: {
          employee,
          metrics: currentMetrics,
          feedback,
        },
      });

      if (error) throw error;
      setAiAnalysis(data as AIPerformanceAnalysis);
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      toast.error('Erro ao gerar análise de IA');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleApplyRecommendation = async (rec: AIPerformanceAnalysis['recommendations'][0]) => {
    try {
      await createAction.mutateAsync({
        employee_id: employee.id,
        action_type: rec.type,
        description: rec.description,
        is_completed: false,
      });
      toast.success('Ação criada com sucesso!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{employee.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {employee.role} • {employee.department}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {config && (
                <Badge className={cn(config.bgColor, 'text-white')}>
                  {config.label}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateEmployeeEvaluationReport(employee, currentMetrics, goals, competenceEvals, feedback, pdis)}
              >
                <FileDown className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="cortexcont" className="text-xs">CORTEXCONT</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">Metas SMART</TabsTrigger>
            <TabsTrigger value="competences" className="text-xs">Competências</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs">Feedback</TabsTrigger>
            <TabsTrigger value="pdi" className="text-xs">PDI</TabsTrigger>
            <TabsTrigger value="clients" className="text-xs">Clientes</TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs">Métricas</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Ações</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {currentMetrics ? (
              <>
                {/* Performance Score */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Score de Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold">{currentMetrics.performance_score}</div>
                      <div className="flex-1">
                        <Progress 
                          value={currentMetrics.performance_score} 
                          className={cn('h-3', config && `[&>div]:${config.bgColor}`)}
                        />
                      </div>
                    </div>
                    {config && (
                      <p className="text-sm text-muted-foreground mt-2">{config.description}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{currentMetrics.clients_served}</p>
                      <p className="text-xs text-muted-foreground">Clientes Atendidos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">
                        {currentMetrics.tasks_assigned > 0 
                          ? Math.round((currentMetrics.tasks_completed / currentMetrics.tasks_assigned) * 100) 
                          : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">
                        {currentMetrics.tasks_completed > 0 
                          ? Math.round((currentMetrics.tasks_on_time / currentMetrics.tasks_completed) * 100) 
                          : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">No Prazo</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{avgFeedback?.toFixed(1) || '-'}</p>
                      <p className="text-xs text-muted-foreground">Avaliação Média</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance x Behavior Matrix */}
                {behaviorScore != null && (
                  <PerformanceBehaviorMatrix
                    performanceScore={currentMetrics.performance_score}
                    behaviorScore={behaviorScore}
                    employeeName={employee.name}
                  />
                )}

                {/* CORTEXCONT Analysis */}
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Diagnóstico CORTEXCONT
                      </CardTitle>
                      {!aiAnalysis && (
                        <Button variant="outline" size="sm" onClick={fetchAIAnalysis} disabled={loadingAI}>
                          {loadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gerar Diagnóstico'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {aiAnalysis ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Diagnóstico</p>
                          <p className="text-sm leading-relaxed">{aiAnalysis.summary}</p>
                        </div>
                        
                        {aiAnalysis.factors.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Fatores de Impacto</p>
                            <ul className="text-sm space-y-1.5">
                              {aiAnalysis.factors.map((factor, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiAnalysis.riskLevel && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risco Operacional:</span>
                            <Badge className={cn(
                              'text-xs',
                              aiAnalysis.riskLevel === 'baixo' && 'bg-emerald-500',
                              aiAnalysis.riskLevel === 'moderado' && 'bg-amber-500',
                              aiAnalysis.riskLevel === 'alto' && 'bg-red-500'
                            )}>
                              {aiAnalysis.riskLevel === 'baixo' ? 'Risco Baixo' : aiAnalysis.riskLevel === 'moderado' ? 'Risco Moderado' : 'Risco Alto'}
                            </Badge>
                          </div>
                        )}

                        {aiAnalysis.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ações Recomendadas</p>
                            <div className="space-y-2">
                              {aiAnalysis.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{ACTION_TYPE_CONFIG[rec.type]?.label || rec.type}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
                                  </div>
                                  <Button size="sm" variant="outline" className="ml-3" onClick={() => handleApplyRecommendation(rec)}>
                                    Aplicar
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t border-border/30">
                          <p className="text-xs text-muted-foreground italic text-center">
                            CORTEXCONT sugere caminhos e explica consequências. A decisão final é sempre do gestor.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-1">Gere o diagnóstico CORTEXCONT para obter análise objetiva de desempenho.</p>
                        <p className="text-xs text-muted-foreground">Baseado em indicadores operacionais e feedbacks registrados.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Sem métricas registradas</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">Registre as métricas de desempenho para começar a análise</p>
                  <Button onClick={onAddMetrics}>Registrar Métricas</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CORTEXCONT Tab */}
          <TabsContent value="cortexcont" className="mt-4">
            <CortexContDiscourseGenerator employee={employee} metrics={currentMetrics} feedback={feedback} />
          </TabsContent>

          {/* Smart Goals Tab */}
          <TabsContent value="goals" className="mt-4">
            <SmartGoalsTab employeeId={employee.id} />
          </TabsContent>

          {/* Competences Tab */}
          <TabsContent value="competences" className="mt-4">
            <CompetenceEvaluationTab employeeId={employee.id} />
          </TabsContent>

          {/* Structured Feedback Tab */}
          <TabsContent value="feedback" className="mt-4">
            <StructuredFeedbackTab employeeId={employee.id} />
          </TabsContent>

          {/* PDI Tab */}
          <TabsContent value="pdi" className="mt-4">
            <PDITab employeeId={employee.id} />
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-4">
            <ClientAssignment employee={employee} />
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4 mt-4">
            {metrics.length > 0 ? (
              metrics.map((m) => (
                <Card key={m.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{m.period_month}/{m.period_year}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Clientes</p>
                        <p className="font-medium">{m.clients_served}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tarefas</p>
                        <p className="font-medium">{m.tasks_completed}/{m.tasks_assigned}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">No Prazo</p>
                        <p className="font-medium">{m.tasks_on_time}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Score</p>
                        <p className="font-medium">{m.performance_score}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma métrica registrada</p>
            )}
            <Button onClick={onAddMetrics} className="w-full">Registrar Novas Métricas</Button>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4 mt-4">
            {pendingActions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Ações Pendentes
                </h4>
                {pendingActions.map((action) => (
                  <Card key={action.id} className="mb-2">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {ACTION_TYPE_CONFIG[action.action_type]?.label || action.action_type}
                          </Badge>
                          <p className="text-sm">{action.description}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => completeAction.mutateAsync({ id: action.id })}>
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Concluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {completedActions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" /> Ações Concluídas
                </h4>
                {completedActions.map((action) => (
                  <Card key={action.id} className="mb-2 opacity-60">
                    <CardContent className="pt-4">
                      <Badge variant="secondary" className="mb-2">
                        {ACTION_TYPE_CONFIG[action.action_type]?.label || action.action_type}
                      </Badge>
                      <p className="text-sm">{action.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Concluída em {new Date(action.completed_at!).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {actions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma ação registrada</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
