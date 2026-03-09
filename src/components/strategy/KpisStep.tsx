import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  Zap,
  DollarSign,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKpis, useCreateKpi, useUpdateKpi, useDeleteKpi, useRecordKpiValue, useGoals } from '@/hooks/useStrategy';
import { useClientMetrics, type AutoKpi } from '@/hooks/useClientMetrics';
import { formatCurrency } from '@/lib/scoreCalculator';
import { 
  PILLAR_LABELS,
  FREQUENCY_LABELS,
  type StrategicPillar,
  type KpiFrequency,
  type StrategicKpi 
} from '@/types/strategy';

interface KpisStepProps {
  onNext: () => void;
}

const categoryLabels = {
  financeiro: { label: 'Financeiro', icon: DollarSign, color: 'text-green-500' },
  carteira: { label: 'Carteira', icon: Users, color: 'text-blue-500' },
  operacional: { label: 'Operacional', icon: BarChart3, color: 'text-orange-500' },
};

function AutoKpiCard({ kpi }: { kpi: AutoKpi }) {
  const percentage = kpi.target > 0 ? Math.min((kpi.value / kpi.target) * 100, 100) : 100;
  const CategoryIcon = categoryLabels[kpi.category].icon;
  
  const formatValue = (value: number, unit: string) => {
    if (unit === 'R$') return formatCurrency(value);
    if (unit === '%') return `${value.toFixed(1)}%`;
    return value.toLocaleString('pt-BR');
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary" />
              {kpi.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {kpi.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20">
            <CategoryIcon className={`h-3 w-3 mr-1 ${categoryLabels[kpi.category].color}`} />
            Auto
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">
              {formatValue(kpi.value, kpi.unit)}
            </p>
            {kpi.target !== kpi.value && (
              <p className="text-xs text-muted-foreground">
                Meta: {formatValue(kpi.target, kpi.unit)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {kpi.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
            {kpi.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            {kpi.trend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground" />}
            <Badge variant={kpi.isGood ? 'default' : 'destructive'} className="text-xs">
              {kpi.isGood ? 'Saudável' : 'Atenção'}
            </Badge>
          </div>
        </div>
        
        {kpi.target > 0 && kpi.target !== kpi.value && (
          <Progress value={percentage} className="h-2" />
        )}
      </CardContent>
    </Card>
  );
}

export default function KpisStep({ onNext }: KpisStepProps) {
  const { data: kpis = [], isLoading: kpisLoading } = useKpis();
  const { data: goals = [] } = useGoals();
  const { autoKpis, metrics, isLoading: metricsLoading, hasClients } = useClientMetrics();
  const createKpi = useCreateKpi();
  const updateKpi = useUpdateKpi();
  const deleteKpi = useDeleteKpi();
  const recordValue = useRecordKpiValue();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<StrategicKpi | null>(null);
  const [recordingKpiId, setRecordingKpiId] = useState<string | null>(null);
  const [newValue, setNewValue] = useState('');
  
  const [formData, setFormData] = useState({
    goal_id: '',
    name: '',
    description: '',
    formula: '',
    data_source: '',
    frequency: 'mensal' as KpiFrequency,
    target_value: 0,
    minimum_acceptable: 0,
    unit: '%',
    pillar: 'financeiro' as StrategicPillar,
    responsible: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.target_value) return;

    if (editingKpi) {
      updateKpi.mutate({ id: editingKpi.id, ...formData });
    } else {
      createKpi.mutate(formData);
    }
    
    setIsDialogOpen(false);
    setEditingKpi(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      goal_id: '',
      name: '',
      description: '',
      formula: '',
      data_source: '',
      frequency: 'mensal',
      target_value: 0,
      minimum_acceptable: 0,
      unit: '%',
      pillar: 'financeiro',
      responsible: '',
    });
  };

  const handleEdit = (kpi: StrategicKpi) => {
    setEditingKpi(kpi);
    setFormData({
      goal_id: kpi.goal_id || '',
      name: kpi.name,
      description: kpi.description || '',
      formula: kpi.formula || '',
      data_source: kpi.data_source || '',
      frequency: kpi.frequency,
      target_value: kpi.target_value,
      minimum_acceptable: kpi.minimum_acceptable || 0,
      unit: kpi.unit,
      pillar: kpi.pillar,
      responsible: kpi.responsible || '',
    });
    setIsDialogOpen(true);
  };

  const handleRecordValue = (kpiId: string) => {
    if (!newValue) return;
    recordValue.mutate({ kpi_id: kpiId, value: parseFloat(newValue) });
    setRecordingKpiId(null);
    setNewValue('');
  };

  const getKpiStatus = (kpi: StrategicKpi) => {
    const percentage = (kpi.current_value / kpi.target_value) * 100;
    const minPercentage = kpi.minimum_acceptable 
      ? (kpi.minimum_acceptable / kpi.target_value) * 100 
      : 50;
    
    if (percentage >= 100) return { status: 'achieved', color: 'text-green-500', icon: TrendingUp };
    if (percentage >= minPercentage) return { status: 'on-track', color: 'text-blue-500', icon: Minus };
    return { status: 'at-risk', color: 'text-red-500', icon: TrendingDown };
  };

  // Separate auto KPIs by category
  const autoKpisByCategory = {
    financeiro: autoKpis.filter(k => k.category === 'financeiro'),
    carteira: autoKpis.filter(k => k.category === 'carteira'),
    operacional: autoKpis.filter(k => k.category === 'operacional'),
  };

  if (kpisLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">KPIs - Indicadores de Performance</h3>
          <p className="text-sm text-muted-foreground">
            Meta sem KPI é achismo. Meça o que importa.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingKpi(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo KPI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingKpi ? 'Editar KPI' : 'Novo KPI'}</DialogTitle>
              <DialogDescription>
                Defina um indicador claro e mensurável
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do KPI</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Receita Recorrente Mensal (MRR)"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="O que este KPI mede?"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pilar</Label>
                  <Select
                    value={formData.pillar}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, pillar: v as StrategicPillar }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PILLAR_LABELS) as StrategicPillar[]).map((p) => (
                        <SelectItem key={p} value={p}>{PILLAR_LABELS[p]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Meta Relacionada (opcional)</Label>
                  <Select
                    value={formData.goal_id}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, goal_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhuma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {goals.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.goal_description.substring(0, 40)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fórmula de Cálculo</Label>
                <Input
                  value={formData.formula}
                  onChange={(e) => setFormData((prev) => ({ ...prev, formula: e.target.value }))}
                  placeholder="Ex: Soma dos contratos recorrentes ativos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fonte dos Dados</Label>
                  <Input
                    value={formData.data_source}
                    onChange={(e) => setFormData((prev) => ({ ...prev, data_source: e.target.value }))}
                    placeholder="Ex: Sistema ERP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, frequency: v as KpiFrequency }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(FREQUENCY_LABELS) as KpiFrequency[]).map((f) => (
                        <SelectItem key={f} value={f}>{FREQUENCY_LABELS[f]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Meta</Label>
                  <Input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData((prev) => ({ ...prev, target_value: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mínimo Aceitável</Label>
                  <Input
                    type="number"
                    value={formData.minimum_acceptable}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minimum_acceptable: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                    placeholder="%"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input
                  value={formData.responsible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, responsible: e.target.value }))}
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.name || !formData.target_value}>
                  {editingKpi ? 'Salvar' : 'Criar KPI'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="auto" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            KPIs Automáticos
            {hasClients && <Badge variant="secondary" className="ml-1 text-xs">{autoKpis.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            KPIs Personalizados
            {kpis.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{kpis.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Auto KPIs from PrecificAI */}
        <TabsContent value="auto" className="space-y-6 mt-4">
          {!hasClients ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Cadastre clientes no PrecificAI para ver os KPIs automáticos.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/clients/new">Cadastrar Primeiro Cliente</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Alert */}
              {metrics.riskClients > 0 && (
                <Card className="border-orange-500/50 bg-orange-500/10">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-orange-700 dark:text-orange-400">
                          Atenção: {metrics.riskClients} cliente{metrics.riskClients > 1 ? 's' : ''} em risco
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Potencial de recuperação de {formatCurrency(metrics.revenueGap)} em receita mensal
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Financial KPIs */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Indicadores Financeiros
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  {autoKpisByCategory.financeiro.map((kpi) => (
                    <AutoKpiCard key={kpi.id} kpi={kpi} />
                  ))}
                </div>
              </div>

              {/* Portfolio KPIs */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Indicadores de Carteira
                </h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {autoKpisByCategory.carteira.map((kpi) => (
                    <AutoKpiCard key={kpi.id} kpi={kpi} />
                  ))}
                </div>
              </div>

              {/* Operational KPIs */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  Indicadores Operacionais
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {autoKpisByCategory.operacional.map((kpi) => (
                    <AutoKpiCard key={kpi.id} kpi={kpi} />
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                * Dados calculados automaticamente a partir da sua carteira de clientes no PrecificAI
              </p>
            </>
          )}
        </TabsContent>

        {/* Custom KPIs */}
        <TabsContent value="custom" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {kpis.map((kpi) => {
                const { status, color, icon: StatusIcon } = getKpiStatus(kpi);
                const percentage = Math.min((kpi.current_value / kpi.target_value) * 100, 100);
                
                return (
                  <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${color}`} />
                              {kpi.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {PILLAR_LABELS[kpi.pillar]} • {FREQUENCY_LABELS[kpi.frequency]}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(kpi)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-destructive"
                              onClick={() => deleteKpi.mutate(kpi.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold">
                              {kpi.current_value.toLocaleString('pt-BR')}
                              <span className="text-sm font-normal text-muted-foreground ml-1">{kpi.unit}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Meta: {kpi.target_value.toLocaleString('pt-BR')} {kpi.unit}
                            </p>
                          </div>
                          <Badge 
                            variant={status === 'achieved' ? 'default' : status === 'on-track' ? 'secondary' : 'destructive'}
                          >
                            {percentage.toFixed(0)}%
                          </Badge>
                        </div>
                        
                        <Progress value={percentage} className="h-2" />

                        {recordingKpiId === kpi.id ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={newValue}
                              onChange={(e) => setNewValue(e.target.value)}
                              placeholder="Novo valor"
                              className="h-8"
                            />
                            <Button size="sm" onClick={() => handleRecordValue(kpi.id)}>
                              <Save className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setRecordingKpiId(kpi.id)}
                          >
                            Registrar Valor
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {kpis.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum KPI personalizado cadastrado. Crie indicadores para medir seus resultados.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onNext}>
          Próximo: Governança
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
