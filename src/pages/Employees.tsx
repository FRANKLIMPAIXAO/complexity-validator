import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Users,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  Award,
  BarChart3,
  Target,
  Grid3X3,
  Download,
} from 'lucide-react';
import { useEmployees, useEmployeeMetrics, useEmployeeFeedback, useEmployeeActions } from '@/hooks/useEmployees';
import { useAllCompetenceEvaluations } from '@/hooks/useEmployeeEvaluations';
import EmployeeCard from '@/components/employees/EmployeeCard';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeDetail from '@/components/employees/EmployeeDetail';
import MetricsForm from '@/components/employees/MetricsForm';
import NineBoxMatrix from '@/components/employees/NineBoxMatrix';
import { Employee, EmployeeMetrics, PERFORMANCE_LEVEL_CONFIG } from '@/types/employee';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExportPDFButton } from '@/components/reports/ExportPDFButton';
import { exportToCSV } from '@/lib/csvExporter';
import { toast } from 'sonner';
export default function Employees() {
  const { data: employees = [], isLoading } = useEmployees();
  const { data: allMetrics = [] } = useEmployeeMetrics();
  const { data: allFeedback = [] } = useEmployeeFeedback();
  const { data: allActions = [] } = useEmployeeActions();
  const { data: allEvaluations = [] } = useAllCompetenceEvaluations();

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showMetricsForm, setShowMetricsForm] = useState(false);
  const [metricsEmployeeId, setMetricsEmployeeId] = useState<string | null>(null);

  // Get latest metrics for each employee
  const getEmployeeMetrics = (employeeId: string): EmployeeMetrics | undefined => {
    return allMetrics.find(m => m.employee_id === employeeId);
  };

  const getEmployeeFeedbackAvg = (employeeId: string): number | undefined => {
    const feedback = allFeedback.filter(f => f.employee_id === employeeId);
    if (feedback.length === 0) return undefined;
    return feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
  };

  const getPendingActions = (employeeId: string): number => {
    return allActions.filter(a => a.employee_id === employeeId && !a.is_completed).length;
  };

  // Summary stats
  const totalEmployees = employees.length;
  const highPerformers = allMetrics.filter(m => m.performance_level === 'alto_desempenho').length;
  const atRisk = allMetrics.filter(m => m.performance_level === 'risco_operacional').length;
  const needsAttention = allMetrics.filter(m => m.performance_level === 'atencao').length;

  const handleAddMetrics = (employeeId: string) => {
    setMetricsEmployeeId(employeeId);
    setShowMetricsForm(true);
  };

  const handleExportCSV = () => {
    const performanceLevels: Record<string, string> = {
      alto_desempenho: 'Alto Desempenho',
      desempenho_adequado: 'Adequado',
      atencao: 'Atenção',
      risco_operacional: 'Risco',
    };
    exportToCSV(
      employees.map(e => {
        const m = getEmployeeMetrics(e.id);
        return {
          ...e,
          performance_label: m?.performance_level ? performanceLevels[m.performance_level] || '' : 'Sem avaliação',
          performance_score: m?.performance_score ?? '',
        };
      }),
      'colaboradores',
      [
        { key: 'name', label: 'Nome' },
        { key: 'role', label: 'Cargo' },
        { key: 'department', label: 'Departamento' },
        { key: 'email', label: 'Email' },
        { key: 'hire_date', label: 'Data Admissão' },
        { key: 'performance_score', label: 'Score Performance' },
        { key: 'performance_label', label: 'Nível Performance' },
      ]
    );
    toast.success('CSV exportado com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Análise de Colaboradores
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão de pessoas baseada em dados • Foco em desenvolvimento
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <ExportPDFButton type="employees" />
          <Button onClick={() => setShowEmployeeForm(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Colaboradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Alto Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{highPerformers}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Atenção Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{needsAttention}</div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risco Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{atRisk}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alert */}
      {atRisk > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Colaboradores em Risco</AlertTitle>
          <AlertDescription>
            {atRisk} colaborador(es) apresentam indicadores críticos que demandam atenção imediata.
          </AlertDescription>
        </Alert>
      )}

      {employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum colaborador cadastrado</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Cadastre seus colaboradores para começar a acompanhar o desempenho da equipe.
            </p>
            <Button onClick={() => setShowEmployeeForm(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastrar Primeiro Colaborador
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grid">Visão em Cards</TabsTrigger>
            <TabsTrigger value="performance">Por Performance</TabsTrigger>
            <TabsTrigger value="nine-box" className="gap-1">
              <Grid3X3 className="h-3.5 w-3.5" />
              Matriz 9-Box
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(employee => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  metrics={getEmployeeMetrics(employee.id)}
                  avgFeedback={getEmployeeFeedbackAvg(employee.id)}
                  pendingActions={getPendingActions(employee.id)}
                  onClick={() => setSelectedEmployee(employee)}
                  onAddMetrics={() => handleAddMetrics(employee.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {(['alto_desempenho', 'desempenho_adequado', 'atencao', 'risco_operacional'] as const).map(level => {
              const config = PERFORMANCE_LEVEL_CONFIG[level];
              const levelEmployees = employees.filter(e => {
                const metrics = getEmployeeMetrics(e.id);
                return metrics?.performance_level === level;
              });

              if (levelEmployees.length === 0) return null;

              return (
                <div key={level}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${config.color}`}>
                    <div className={`w-3 h-3 rounded-full ${config.bgColor}`} />
                    {config.label} ({levelEmployees.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levelEmployees.map(employee => (
                      <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        metrics={getEmployeeMetrics(employee.id)}
                        avgFeedback={getEmployeeFeedbackAvg(employee.id)}
                        pendingActions={getPendingActions(employee.id)}
                        onClick={() => setSelectedEmployee(employee)}
                        onAddMetrics={() => handleAddMetrics(employee.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Employees without metrics */}
            {employees.filter(e => !getEmployeeMetrics(e.id)).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-5 w-5" />
                  Sem Avaliação ({employees.filter(e => !getEmployeeMetrics(e.id)).length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.filter(e => !getEmployeeMetrics(e.id)).map(employee => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      onClick={() => setSelectedEmployee(employee)}
                      onAddMetrics={() => handleAddMetrics(employee.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="nine-box">
            <NineBoxMatrix
              employees={employees}
              metrics={allMetrics}
              evaluations={allEvaluations}
              onEmployeeClick={setSelectedEmployee}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Employee Form Dialog */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Colaborador</DialogTitle>
            <DialogDescription>
              Cadastre um novo colaborador para acompanhar seu desempenho
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm onSuccess={() => setShowEmployeeForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Employee Detail Dialog */}
      {selectedEmployee && (
        <EmployeeDetail
          open={!!selectedEmployee}
          onOpenChange={(open) => !open && setSelectedEmployee(null)}
          employee={selectedEmployee}
          onAddMetrics={() => handleAddMetrics(selectedEmployee.id)}
        />
      )}

      {/* Metrics Form Dialog */}
      <Dialog open={showMetricsForm} onOpenChange={setShowMetricsForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Métricas</DialogTitle>
            <DialogDescription>
              Informe os dados de desempenho do período
            </DialogDescription>
          </DialogHeader>
          {metricsEmployeeId && (
            <MetricsForm
              employeeId={metricsEmployeeId}
              onSuccess={() => {
                setShowMetricsForm(false);
                setMetricsEmployeeId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
