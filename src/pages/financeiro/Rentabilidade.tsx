import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useClients } from '@/hooks/useClients';
import { useOfficeExpenses } from '@/hooks/useOfficeExpenses';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function Rentabilidade() {
  const { clients } = useClients();
  const { data: expenses = [] } = useOfficeExpenses(currentMonth, currentYear);

  const analysis = useMemo(() => {
    const totalCosts = expenses.reduce((s, e) => s + e.value, 0);
    const costPerClient = clients.length > 0 ? totalCosts / clients.length : 0;

    return clients.map(client => {
      // Estimate operational cost based on complexity
      const complexityMultiplier =
        client.complexity_level === 'critico' ? 2.0 :
        client.complexity_level === 'alto_risco' ? 1.6 :
        client.complexity_level === 'avancado' ? 1.3 :
        client.complexity_level === 'intermediario' ? 1.0 : 0.7;

      const estimatedCost = costPerClient * complexityMultiplier;
      const profitMargin = client.current_fee - estimatedCost;
      const marginPercent = client.current_fee > 0 ? (profitMargin / client.current_fee) * 100 : -100;

      return {
        ...client,
        estimatedCost,
        profitMargin,
        marginPercent,
        isLoss: profitMargin < 0,
      };
    }).sort((a, b) => a.marginPercent - b.marginPercent);
  }, [clients, expenses]);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const lossClients = analysis.filter(c => c.isLoss).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rentabilidade por Cliente</h1>
        <p className="text-muted-foreground">Análise de lucratividade de cada cliente</p>
      </div>

      {lossClients > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-foreground">
              <strong>{lossClients} cliente(s)</strong> operando com prejuízo estimado. Revise a precificação.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{analysis.length} clientes analisados</CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.length === 0 ? (
            <p className="text-muted-foreground">Cadastre clientes e custos para ver a análise.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Honorário</TableHead>
                  <TableHead className="text-center">Complexidade</TableHead>
                  <TableHead className="text-right">Custo Estimado</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(client.current_fee)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{client.complexity_score}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{fmt(client.estimatedCost)}</TableCell>
                    <TableCell className={`text-right font-mono ${client.isLoss ? 'text-destructive' : 'text-green-500'}`}>
                      {client.marginPercent.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      {client.isLoss ? (
                        <span className="text-destructive text-sm font-medium">⚠ Cliente com prejuízo</span>
                      ) : (
                        <span className="text-green-500 text-sm">Lucrativo</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
