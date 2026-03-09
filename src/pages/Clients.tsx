import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useClientPlans } from '@/hooks/useClientPlans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ClientTable from '@/components/clients/ClientTable';
import { ExportPDFButton } from '@/components/reports/ExportPDFButton';
import { exportToCSV } from '@/lib/csvExporter';
import { toast } from 'sonner';

const complexityLabels: Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  alto_risco: 'Alto Risco',
  critico: 'Crítico',
};

const regimeLabels: Record<string, string> = {
  simples: 'Simples',
  presumido: 'Presumido',
  real: 'Real',
};

export default function Clients() {
  const { clients, isLoading, deleteClient, isDeleting } = useClients();
  const { plans } = useClientPlans();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');
  const [regimeFilter, setRegimeFilter] = useState<string>('all');
  const [underpricedFilter, setUnderpricedFilter] = useState<string>('all');
  const [revenueFilter, setRevenueFilter] = useState<string>('all');

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase());
    const matchesPlan =
      planFilter === 'all' ||
      (planFilter === 'sem-plano' && !client.plan_id) ||
      client.plan_id === planFilter;
    const matchesComplexity = complexityFilter === 'all' || client.complexity_level === complexityFilter;
    const matchesRegime = regimeFilter === 'all' || client.tax_regime === regimeFilter;
    const matchesUnderpriced = underpricedFilter === 'all' ||
      (underpricedFilter === 'sim' && client.is_underpriced) ||
      (underpricedFilter === 'nao' && !client.is_underpriced);
    const revenue = Number(client.monthly_revenue);
    const matchesRevenue = revenueFilter === 'all' ||
      (revenueFilter === '0-10k' && revenue <= 10000) ||
      (revenueFilter === '10k-50k' && revenue > 10000 && revenue <= 50000) ||
      (revenueFilter === '50k-200k' && revenue > 50000 && revenue <= 200000) ||
      (revenueFilter === '200k+' && revenue > 200000);

    return matchesSearch && matchesPlan && matchesComplexity && matchesRegime && matchesUnderpriced && matchesRevenue;
  });

  const handleExportCSV = () => {
    exportToCSV(
      filteredClients.map(c => ({
        ...c,
        complexity_label: complexityLabels[c.complexity_level] || c.complexity_level,
        regime_label: regimeLabels[c.tax_regime] || c.tax_regime,
        underpriced_label: c.is_underpriced ? 'Sim' : 'Não',
      })),
      'clientes',
      [
        { key: 'name', label: 'Nome' },
        { key: 'cnpj', label: 'CNPJ' },
        { key: 'regime_label', label: 'Regime Tributário' },
        { key: 'complexity_score', label: 'Score' },
        { key: 'complexity_label', label: 'Nível' },
        { key: 'current_fee', label: 'Honorário' },
        { key: 'monthly_revenue', label: 'Faturamento' },
        { key: 'employees_count', label: 'Funcionários' },
        { key: 'underpriced_label', label: 'Subprecificado' },
      ]
    );
    toast.success('CSV exportado com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes do seu escritório
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <ExportPDFButton type="clients" />
          <Button asChild>
            <Link to="/clients/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os planos</SelectItem>
              <SelectItem value="sem-plano">Sem plano</SelectItem>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                    {plan.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={complexityFilter} onValueChange={setComplexityFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Complexidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas complexidades</SelectItem>
              {Object.entries(complexityLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regimeFilter} onValueChange={setRegimeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Regime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos regimes</SelectItem>
              {Object.entries(regimeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={underpricedFilter} onValueChange={setUnderpricedFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Subprecificação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sim">Subprecificado</SelectItem>
              <SelectItem value="nao">Preço adequado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={revenueFilter} onValueChange={setRevenueFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Faturamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas faixas</SelectItem>
              <SelectItem value="0-10k">Até R$ 10k</SelectItem>
              <SelectItem value="10k-50k">R$ 10k - 50k</SelectItem>
              <SelectItem value="50k-200k">R$ 50k - 200k</SelectItem>
              <SelectItem value="200k+">Acima de R$ 200k</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <ClientTable
        clients={filteredClients}
        plans={plans}
        onDelete={deleteClient}
        isDeleting={isDeleting}
      />
    </div>
  );
}
