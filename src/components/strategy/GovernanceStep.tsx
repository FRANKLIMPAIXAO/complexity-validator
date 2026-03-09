import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Plus, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  useGovernanceReports, 
  useCreateGovernanceReport, 
  useUpdateGovernanceReport,
  useKpis,
  useGoals 
} from '@/hooks/useStrategy';
import { 
  CYCLE_LABELS,
  GOAL_STATUS_LABELS,
  GOAL_STATUS_COLORS,
  type GovernanceCycle,
  type GovernanceReport 
} from '@/types/strategy';
import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GovernanceStep() {
  const { data: reports = [], isLoading: reportsLoading } = useGovernanceReports();
  const { data: kpis = [] } = useKpis();
  const { data: goals = [] } = useGoals();
  const createReport = useCreateGovernanceReport();
  const updateReport = useUpdateGovernanceReport();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<GovernanceCycle>('mensal');
  const [formData, setFormData] = useState({
    cycle_type: 'mensal' as GovernanceCycle,
    period_start: '',
    period_end: '',
    what_worked: '',
    what_didnt_work: '',
    adjustments_needed: '',
    decisions_made: '',
    critical_analysis: '',
    action_plan: '',
  });

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const goalsOnTrack = goals.filter(g => g.status === 'em_andamento' || g.status === 'concluida').length;
    const goalsAtRisk = goals.filter(g => g.status === 'atrasada').length;
    
    const kpisAchieved = kpis.filter(k => k.current_value >= k.target_value).length;
    const kpisAtRisk = kpis.filter(k => {
      const min = k.minimum_acceptable || k.target_value * 0.5;
      return k.current_value < min;
    }).length;

    return {
      totalGoals: goals.length,
      goalsOnTrack,
      goalsAtRisk,
      goalCompletion: goals.length > 0 ? Math.round((goalsOnTrack / goals.length) * 100) : 0,
      totalKpis: kpis.length,
      kpisAchieved,
      kpisAtRisk,
      kpiPerformance: kpis.length > 0 ? Math.round((kpisAchieved / kpis.length) * 100) : 0,
    };
  }, [goals, kpis]);

  const handleCreateReport = () => {
    const now = new Date();
    let start: Date, end: Date;

    switch (selectedCycle) {
      case 'semanal':
        start = startOfWeek(now, { locale: ptBR });
        end = endOfWeek(now, { locale: ptBR });
        break;
      case 'mensal':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'trimestral':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
    }

    setFormData({
      ...formData,
      cycle_type: selectedCycle,
      period_start: format(start, 'yyyy-MM-dd'),
      period_end: format(end, 'yyyy-MM-dd'),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    createReport.mutate(formData);
    setIsDialogOpen(false);
    setFormData({
      cycle_type: 'mensal',
      period_start: '',
      period_end: '',
      what_worked: '',
      what_didnt_work: '',
      adjustments_needed: '',
      decisions_made: '',
      critical_analysis: '',
      action_plan: '',
    });
  };

  if (reportsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.goalsOnTrack}</p>
                <p className="text-xs text-muted-foreground">Metas no prazo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.goalsAtRisk}</p>
                <p className="text-xs text-muted-foreground">Metas em risco</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.kpisAchieved}</p>
                <p className="text-xs text-muted-foreground">KPIs atingidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <TrendingDown className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.kpisAtRisk}</p>
                <p className="text-xs text-muted-foreground">KPIs abaixo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status das Metas</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma meta cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {goals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{goal.goal_description}</p>
                    <p className="text-xs text-muted-foreground">
                      Prazo: {format(new Date(goal.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${GOAL_STATUS_COLORS[goal.status]} bg-opacity-20 border-0 text-xs`}
                    >
                      {GOAL_STATUS_LABELS[goal.status]}
                    </Badge>
                    <span className="text-sm font-medium">{goal.progress_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Governance Cycles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Ciclos de Governança</CardTitle>
              <CardDescription>
                Acompanhamento periódico para garantir execução
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={handleCreateReport}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Relatório
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Relatório de Governança</DialogTitle>
                  <DialogDescription>
                    Registre a análise do período e decisões tomadas
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Ciclo</Label>
                      <Select
                        value={formData.cycle_type}
                        onValueChange={(v) => setFormData((prev) => ({ ...prev, cycle_type: v as GovernanceCycle }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(CYCLE_LABELS) as GovernanceCycle[]).map((c) => (
                            <SelectItem key={c} value={c}>{CYCLE_LABELS[c]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Início</Label>
                      <Input
                        type="date"
                        value={formData.period_start}
                        onChange={(e) => setFormData((prev) => ({ ...prev, period_start: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fim</Label>
                      <Input
                        type="date"
                        value={formData.period_end}
                        onChange={(e) => setFormData((prev) => ({ ...prev, period_end: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        O que funcionou
                      </Label>
                      <Textarea
                        value={formData.what_worked}
                        onChange={(e) => setFormData((prev) => ({ ...prev, what_worked: e.target.value }))}
                        placeholder="Ações e resultados positivos..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        O que não funcionou
                      </Label>
                      <Textarea
                        value={formData.what_didnt_work}
                        onChange={(e) => setFormData((prev) => ({ ...prev, what_didnt_work: e.target.value }))}
                        placeholder="Obstáculos e problemas encontrados..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ajustes Necessários</Label>
                    <Textarea
                      value={formData.adjustments_needed}
                      onChange={(e) => setFormData((prev) => ({ ...prev, adjustments_needed: e.target.value }))}
                      placeholder="Mudanças que precisam ser feitas..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Decisões Tomadas</Label>
                    <Textarea
                      value={formData.decisions_made}
                      onChange={(e) => setFormData((prev) => ({ ...prev, decisions_made: e.target.value }))}
                      placeholder="Decisões estratégicas do período..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Análise Crítica</Label>
                    <Textarea
                      value={formData.critical_analysis}
                      onChange={(e) => setFormData((prev) => ({ ...prev, critical_analysis: e.target.value }))}
                      placeholder="Reflexão sobre o período..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Plano de Ação Corretivo</Label>
                    <Textarea
                      value={formData.action_plan}
                      onChange={(e) => setFormData((prev) => ({ ...prev, action_plan: e.target.value }))}
                      placeholder="Ações para o próximo período..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                      Salvar Relatório
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="semanal" onValueChange={(v) => setSelectedCycle(v as GovernanceCycle)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="semanal">Semanal</TabsTrigger>
              <TabsTrigger value="mensal">Mensal</TabsTrigger>
              <TabsTrigger value="trimestral">Trimestral</TabsTrigger>
            </TabsList>

            {(['semanal', 'mensal', 'trimestral'] as GovernanceCycle[]).map((cycle) => {
              const cycleReports = reports.filter(r => r.cycle_type === cycle);
              
              return (
                <TabsContent key={cycle} value={cycle} className="space-y-4 mt-4">
                  {cycleReports.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Nenhum relatório {CYCLE_LABELS[cycle].toLowerCase()} ainda.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={handleCreateReport}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Relatório
                      </Button>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {cycleReports.map((report) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <CardTitle className="text-sm">
                                    {format(new Date(report.period_start), 'dd/MM', { locale: ptBR })} - {format(new Date(report.period_end), 'dd/MM/yyyy', { locale: ptBR })}
                                  </CardTitle>
                                </div>
                                <Badge variant="outline">{CYCLE_LABELS[report.cycle_type]}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                              {report.what_worked && (
                                <div>
                                  <p className="font-medium text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> O que funcionou
                                  </p>
                                  <p className="text-muted-foreground">{report.what_worked}</p>
                                </div>
                              )}
                              {report.what_didnt_work && (
                                <div>
                                  <p className="font-medium text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> O que não funcionou
                                  </p>
                                  <p className="text-muted-foreground">{report.what_didnt_work}</p>
                                </div>
                              )}
                              {report.decisions_made && (
                                <div>
                                  <p className="font-medium">Decisões</p>
                                  <p className="text-muted-foreground">{report.decisions_made}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
