import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePortfolioStats } from '@/hooks/useStrategicAI';
import { formatCurrency } from '@/lib/scoreCalculator';
import { TAX_REGIME_LABELS } from '@/types/database';

type SortBy = 'loss' | 'complexity' | 'margin';

export default function ClientesSubprecificados() {
  const { profitability, isLoading } = usePortfolioStats();
  const [sortBy, setSortBy] = useState<SortBy>('loss');

  const underpricedClients = useMemo(() => {
    const filtered = profitability.filter(p => p.isUnderpriced);
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'loss': return b.loss - a.loss;
        case 'complexity': return b.client.complexity_score - a.client.complexity_score;
        case 'margin': return a.marginPercentage - b.marginPercentage;
        default: return 0;
      }
    });
  }, [profitability, sortBy]);

  const totalLoss = useMemo(() => underpricedClients.reduce((s, c) => s + c.loss, 0), [underpricedClients]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Clientes Subprecificados
        </h1>
        <p className="text-muted-foreground">Clientes com margem abaixo de 20% — potencial de reajuste</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Clientes Subprecificados</p>
            <p className="text-3xl font-bold text-amber-500">{underpricedClients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">% do Portfólio</p>
            <p className="text-3xl font-bold text-amber-500">
              {profitability.length > 0 ? ((underpricedClients.length / profitability.length) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Perda Mensal Estimada</p>
            <p className="text-3xl font-bold text-destructive">{formatCurrency(totalLoss)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sorting */}
      <div className="flex items-center gap-3">
        <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Ordenar por:</span>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loss">Maior Perda</SelectItem>
            <SelectItem value="complexity">Maior Complexidade</SelectItem>
            <SelectItem value="margin">Menor Margem</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhamento</CardTitle>
        </CardHeader>
        <CardContent>
          {underpricedClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">🎉 Nenhum cliente subprecificado encontrado!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Regime</TableHead>
                    <TableHead className="text-center">Complexidade</TableHead>
                    <TableHead className="text-right">Honorário</TableHead>
                    <TableHead className="text-right">Custo Est.</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                    <TableHead className="text-right">Recomendado</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {underpricedClients.map((item) => (
                    <TableRow key={item.client.id}>
                      <TableCell className="font-medium">{item.client.name}</TableCell>
                      <TableCell>{TAX_REGIME_LABELS[item.client.tax_regime]}</TableCell>
                      <TableCell className="text-center">{item.client.complexity_score}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.client.current_fee)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.estimatedCost)}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.marginPercentage < 0 ? 'text-destructive font-semibold' : 'text-amber-500 font-semibold'}>
                          {item.marginPercentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary font-semibold">
                        {formatCurrency(item.recommendedFee)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-amber-500 text-amber-500">
                          ⚠ Subprecificado
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
