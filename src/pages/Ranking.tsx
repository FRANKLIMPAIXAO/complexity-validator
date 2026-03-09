import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  ArrowUpDown,
  Eye,
  Target,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, getExpectedPriceRange, checkRiskClient } from '@/lib/scoreCalculator';
import { COMPLEXITY_LEVEL_LABELS } from '@/types/database';
import ComplexityBadge from '@/components/score/ComplexityBadge';
import BatchStrategicWizard from '@/components/strategy/BatchStrategicWizard';
import { cn } from '@/lib/utils';

type SortOption = 'score_desc' | 'underpriced' | 'risk';

type ClientStatus = 'risk' | 'below' | 'within';

interface ClientWithStatus {
  id: string;
  name: string;
  complexity_score: number;
  complexity_level: 'basico' | 'intermediario' | 'avancado' | 'alto_risco' | 'critico';
  current_fee: number;
  is_underpriced: boolean;
  status: ClientStatus;
  rangeMin: number;
  rangeMax: number;
}

export default function Ranking() {
  const { clients, isLoading } = useClients();
  const [sortBy, setSortBy] = useState<SortOption>('risk');
  const [isBatchWizardOpen, setIsBatchWizardOpen] = useState(false);

  const clientsWithStatus = useMemo((): ClientWithStatus[] => {
    if (!clients) return [];

    return clients.map((client) => {
      const range = getExpectedPriceRange(client.complexity_level);
      const currentFee = Number(client.current_fee);
      const isRisk = checkRiskClient(currentFee, client.complexity_level, client.complexity_score);
      const isBelow = currentFee < range.min;

      let status: ClientStatus;
      if (isRisk) {
        status = 'risk';
      } else if (isBelow) {
        status = 'below';
      } else {
        status = 'within';
      }

      return {
        id: client.id,
        name: client.name,
        complexity_score: client.complexity_score,
        complexity_level: client.complexity_level,
        current_fee: currentFee,
        is_underpriced: client.is_underpriced,
        status,
        rangeMin: range.min,
        rangeMax: range.max,
      };
    });
  }, [clients]);

  const sortedClients = useMemo(() => {
    const sorted = [...clientsWithStatus];

    switch (sortBy) {
      case 'score_desc':
        sorted.sort((a, b) => b.complexity_score - a.complexity_score);
        break;
      case 'underpriced':
        sorted.sort((a, b) => {
          // Primeiro por diferença em relação ao mínimo
          const diffA = a.rangeMin - a.current_fee;
          const diffB = b.rangeMin - b.current_fee;
          return diffB - diffA;
        });
        break;
      case 'risk':
        sorted.sort((a, b) => {
          // Prioridade: risk > below > within, depois por score
          const priority = { risk: 0, below: 1, within: 2 };
          if (priority[a.status] !== priority[b.status]) {
            return priority[a.status] - priority[b.status];
          }
          return b.complexity_score - a.complexity_score;
        });
        break;
    }

    return sorted;
  }, [clientsWithStatus, sortBy]);

  const summary = useMemo(() => {
    const total = clientsWithStatus.length;
    const atRisk = clientsWithStatus.filter((c) => c.status === 'risk').length;
    const belowRange = clientsWithStatus.filter((c) => c.status === 'below').length;
    const withinRange = clientsWithStatus.filter((c) => c.status === 'within').length;
    
    // Calculate potential revenue
    const potentialRevenue = clientsWithStatus
      .filter(c => c.status === 'risk' || c.status === 'below')
      .reduce((acc, c) => acc + Math.max(0, c.rangeMin - c.current_fee), 0);

    return { total, atRisk, belowRange, withinRange, potentialRevenue };
  }, [clientsWithStatus]);

  const statusConfig: Record<ClientStatus, { label: string; variant: 'destructive' | 'warning' | 'success'; icon: typeof AlertTriangle }> = {
    risk: { label: 'Cliente de Risco', variant: 'destructive', icon: AlertTriangle },
    below: { label: 'Abaixo da Faixa', variant: 'warning', icon: TrendingDown },
    within: { label: 'Dentro da Faixa', variant: 'success', icon: CheckCircle },
  };

  const riskAndBelowClients = clientsWithStatus.filter(c => c.status === 'risk' || c.status === 'below');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Ranking da Carteira
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada de risco e precificação
          </p>
        </div>
      </div>

      {/* Strategic Action Banner */}
      {riskAndBelowClients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Oportunidade Estratégica Identificada
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {riskAndBelowClients.length} cliente{riskAndBelowClients.length !== 1 ? 's' : ''} com 
                      potencial de recuperação de {formatCurrency(summary.potentialRevenue)}/mês
                    </p>
                  </div>
                </div>
                <Button onClick={() => setIsBatchWizardOpen(true)}>
                  <Target className="h-4 w-4 mr-2" />
                  Criar Plano Estratégico
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{summary.total}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border border-l-4 border-l-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Clientes em Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">{summary.atRisk}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border-border border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-yellow-500" />
                Abaixo da Faixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-500">{summary.belowRange}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-border border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Dentro da Faixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{summary.withinRange}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sort Controls */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Classificação de Clientes</CardTitle>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">Maior risco operacional</SelectItem>
                  <SelectItem value="underpriced">Mais subprecificados</SelectItem>
                  <SelectItem value="score_desc">Maior score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {sortedClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cliente cadastrado.</p>
              <Button className="mt-4" asChild>
                <Link to="/clients/new">Adicionar Cliente</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Classificação</TableHead>
                    <TableHead className="text-right">Valor Cobrado</TableHead>
                    <TableHead className="text-right">Faixa Sugerida</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedClients.map((client, index) => {
                    const config = statusConfig[client.status];
                    const StatusIcon = config.icon;

                    return (
                      <TableRow 
                        key={client.id}
                        className={cn(
                          client.status === 'risk' && 'bg-destructive/5',
                          client.status === 'below' && 'bg-yellow-500/5'
                        )}
                      >
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-lg">{client.complexity_score}</span>
                          <span className="text-muted-foreground text-sm"> pts</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <ComplexityBadge level={client.complexity_level} size="sm" />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(client.current_fee)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatCurrency(client.rangeMin)} - {formatCurrency(client.rangeMax)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              'gap-1',
                              client.status === 'risk' && 'border-destructive text-destructive bg-destructive/10',
                              client.status === 'below' && 'border-yellow-500 text-yellow-600 bg-yellow-500/10',
                              client.status === 'within' && 'border-green-500 text-green-600 bg-green-500/10'
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/clients/${client.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Note */}
      <p className="text-xs text-muted-foreground text-center italic">
        Este ranking é uma ferramenta de apoio à decisão. Avalie cada caso considerando o contexto do relacionamento.
      </p>

      {/* Batch Strategic Wizard */}
      <BatchStrategicWizard
        clients={riskAndBelowClients}
        potentialRevenue={summary.potentialRevenue}
        isOpen={isBatchWizardOpen}
        onClose={() => setIsBatchWizardOpen(false)}
      />
    </div>
  );
}
