import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRadarOportunidades } from '@/hooks/useRadarOportunidades';
import { formatCurrency } from '@/lib/scoreCalculator';

export default function ClientesPrejuizo() {
  const { negativeMarginClients, isLoading } = useRadarOportunidades();

  const totalLoss = negativeMarginClients.reduce((s, d) => s + Math.abs(d.marginValue), 0);

  function suggestedAction(marginPct: number, complexity: number): { label: string; variant: 'destructive' | 'secondary' | 'default' } {
    if (marginPct < -0.20) return { label: 'Encerrar', variant: 'destructive' };
    if (complexity >= 50) return { label: 'Reavaliar', variant: 'secondary' };
    return { label: 'Reajustar', variant: 'default' };
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          Clientes com Prejuízo
        </h1>
        <p className="text-muted-foreground">Clientes onde o custo operacional excede o honorário</p>
      </div>

      {negativeMarginClients.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Prejuízo Total: {formatCurrency(totalLoss)}/mês</AlertTitle>
          <AlertDescription>
            {negativeMarginClients.length} cliente(s) gerando prejuízo. Ação imediata recomendada.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{negativeMarginClients.length} clientes com margem negativa</CardTitle>
        </CardHeader>
        <CardContent>
          {negativeMarginClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">🎉 Parabéns!</p>
              <p>Nenhum cliente com margem negativa.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Honorário</TableHead>
                    <TableHead className="text-right">Custo Est.</TableHead>
                    <TableHead className="text-right">Prejuízo</TableHead>
                    <TableHead className="text-right">Ação Sugerida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {negativeMarginClients
                    .sort((a, b) => a.marginValue - b.marginValue)
                    .map(item => {
                      const action = suggestedAction(item.marginPct, item.client.complexity_score);
                      return (
                        <TableRow key={item.client.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.client.name}</p>
                              <p className="text-xs text-muted-foreground">{item.segment} · Score: {item.client.complexity_score}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.client.current_fee)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.estimatedCost)}</TableCell>
                          <TableCell className="text-right font-medium text-destructive">
                            {formatCurrency(Math.abs(item.marginValue))}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={action.variant}>{action.label}</Badge>
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
    </div>
  );
}
