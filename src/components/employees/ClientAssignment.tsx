import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  X,
  Building2,
  TrendingUp,
  AlertTriangle,
  Search,
  Star,
} from 'lucide-react';
import { Employee } from '@/types/employee';
import { Client } from '@/types/database';
import { 
  useEmployeeClients, 
  useUnassignedClients, 
  useAssignClient, 
  useUnassignClient,
  useAutoMetrics,
} from '@/hooks/useEmployeeClients';
import { cn } from '@/lib/utils';

interface ClientAssignmentProps {
  employee: Employee;
}

export default function ClientAssignment({ employee }: ClientAssignmentProps) {
  const { data: assignments = [], isLoading } = useEmployeeClients(employee.id);
  const { data: unassignedClients = [] } = useUnassignedClients(employee.id);
  const { metrics } = useAutoMetrics(employee.id);
  const assignClient = useAssignClient();
  const unassignClient = useUnassignClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredClients = unassignedClients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async (clientId: string) => {
    await assignClient.mutateAsync({
      employeeId: employee.id,
      clientId,
    });
  };

  const handleUnassign = async (assignmentId: string) => {
    await unassignClient.mutateAsync(assignmentId);
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'basico': return 'bg-green-500';
      case 'intermediario': return 'bg-blue-500';
      case 'avancado': return 'bg-amber-500';
      case 'alto_risco': return 'bg-orange-500';
      case 'critico': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      {/* Auto Metrics Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Métricas Automáticas (baseadas nos clientes vinculados)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-2xl font-bold">{metrics.clientsServed}</p>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-2xl font-bold">{metrics.avgClientComplexity.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Complex. Média</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL',
                  maximumFractionDigits: 0 
                }).format(metrics.totalMonthlyRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">Receita Gerida</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-2xl font-bold">{metrics.totalEmployeesManaged}</p>
              <p className="text-xs text-muted-foreground">Func. Geridos</p>
            </div>
          </div>

          {(metrics.underpricedClients > 0 || metrics.riskClients > 0) && (
            <div className="flex gap-2 mt-3">
              {metrics.underpricedClients > 0 && (
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {metrics.underpricedClients} subprecificado(s)
                </Badge>
              )}
              {metrics.riskClients > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {metrics.riskClients} de risco
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes Vinculados ({assignments.length})
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Vincular Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Vincular Cliente</DialogTitle>
                  <DialogDescription>
                    Selecione um cliente para vincular a {employee.name}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {filteredClients.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      {unassignedClients.length === 0 
                        ? 'Todos os clientes já estão vinculados'
                        : 'Nenhum cliente encontrado'}
                    </p>
                  ) : (
                    filteredClients.map(client => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            getComplexityColor(client.complexity_level)
                          )} />
                          <div>
                            <p className="font-medium text-sm">{client.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {client.tax_regime.toUpperCase()} • Score: {client.complexity_score}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(client.id)}
                          disabled={assignClient.isPending}
                        >
                          Vincular
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-6">
              <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum cliente vinculado
              </p>
              <p className="text-xs text-muted-foreground">
                Vincule clientes para calcular métricas automaticamente
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      getComplexityColor(assignment.client.complexity_level)
                    )} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{assignment.client.name}</p>
                        {assignment.is_primary && (
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        )}
                        {assignment.client.is_underpriced && (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                            Subprecificado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{assignment.client.tax_regime.toUpperCase()}</span>
                        <span>•</span>
                        <span>Score: {assignment.client.complexity_score}</span>
                        <span>•</span>
                        <span>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(assignment.client.current_fee)}/mês
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleUnassign(assignment.id)}
                    disabled={unassignClient.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
