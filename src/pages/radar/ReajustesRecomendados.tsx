import { useState, useMemo } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRadarOportunidades } from '@/hooks/useRadarOportunidades';
import { formatCurrency } from '@/lib/scoreCalculator';
import { TAX_REGIME_LABELS } from '@/types/database';

export default function ReajustesRecomendados() {
  const { radarData, isLoading } = useRadarOportunidades();
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [regimeFilter, setRegimeFilter] = useState('all');
  const [marginFilter, setMarginFilter] = useState('all');
  const [sortField, setSortField] = useState<'opportunity' | 'margin' | 'difference'>('opportunity');

  const segments = useMemo(() => [...new Set(radarData.map(d => d.segment))], [radarData]);

  const filtered = useMemo(() => {
    let result = radarData.filter(d => d.isUnderpriced);
    if (segmentFilter !== 'all') result = result.filter(d => d.segment === segmentFilter);
    if (regimeFilter !== 'all') result = result.filter(d => d.client.tax_regime === regimeFilter);
    if (marginFilter === 'negative') result = result.filter(d => d.marginPct < 0);
    else if (marginFilter === 'low') result = result.filter(d => d.marginPct >= 0 && d.marginPct < 0.10);
    else if (marginFilter === 'medium') result = result.filter(d => d.marginPct >= 0.10 && d.marginPct < 0.20);

    if (sortField === 'opportunity') result.sort((a, b) => b.opportunityScore - a.opportunityScore);
    else if (sortField === 'margin') result.sort((a, b) => a.marginPct - b.marginPct);
    else result.sort((a, b) => (b.recommendedFee - b.client.current_fee) - (a.recommendedFee - a.client.current_fee));

    return result;
  }, [radarData, segmentFilter, regimeFilter, marginFilter, sortField]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reajustes Recomendados</h1>
        <p className="text-muted-foreground">Clientes com honorários abaixo da margem ideal</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Segmento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os segmentos</SelectItem>
                {segments.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={regimeFilter} onValueChange={setRegimeFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Regime" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os regimes</SelectItem>
                {Object.entries(TAX_REGIME_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={marginFilter} onValueChange={setMarginFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Faixa de margem" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as faixas</SelectItem>
                <SelectItem value="negative">Negativa</SelectItem>
                <SelectItem value="low">0-10%</SelectItem>
                <SelectItem value="medium">10-20%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{filtered.length} clientes para reajuste</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum cliente encontrado com os filtros selecionados.</p>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Segmento</TableHead>
                    <TableHead className="hidden lg:table-cell">Regime</TableHead>
                    <TableHead className="text-right">Honorário</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Custo Est.</TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSortField('margin')} className="h-auto p-0 text-xs">
                        Margem <ArrowUpDown className="h-3 w-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right hidden md:table-cell">Recomendado</TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSortField('difference')} className="h-auto p-0 text-xs">
                        Diferença <ArrowUpDown className="h-3 w-3 ml-1" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(item => (
                    <TableRow key={item.client.id}>
                      <TableCell className="font-medium">{item.client.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{item.segment}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{TAX_REGIME_LABELS[item.client.tax_regime]}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.client.current_fee)}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{formatCurrency(item.estimatedCost)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.marginPct < 0 ? 'destructive' : 'secondary'}>
                          {(item.marginPct * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell font-medium text-green-500">{formatCurrency(item.recommendedFee)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="default">+{formatCurrency(item.recommendedFee - item.client.current_fee)}</Badge>
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
