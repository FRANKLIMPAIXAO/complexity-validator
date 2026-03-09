import { useMemo, useRef } from 'react';
import { FileDown, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useClients } from '@/hooks/useClients';
import { useOfficeExpenses } from '@/hooks/useOfficeExpenses';
import { useEmployees } from '@/hooks/useEmployees';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function RelatorioFinanceiro() {
  const { clients } = useClients();
  const { data: expenses = [] } = useOfficeExpenses(currentMonth, currentYear);
  const { data: employees = [] } = useEmployees();

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const report = useMemo(() => {
    const totalRevenue = clients.reduce((s, c) => s + (c.current_fee || 0), 0);
    const totalCosts = expenses.reduce((s, e) => s + e.value, 0);
    const profit = totalRevenue - totalCosts;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const avgTicket = clients.length > 0 ? totalRevenue / clients.length : 0;
    const costPerClient = clients.length > 0 ? totalCosts / clients.length : 0;

    const clientAnalysis = clients.map(client => {
      const complexityMultiplier =
        client.complexity_level === 'critico' ? 2.0 :
        client.complexity_level === 'alto_risco' ? 1.6 :
        client.complexity_level === 'avancado' ? 1.3 :
        client.complexity_level === 'intermediario' ? 1.0 : 0.7;
      const estimatedCost = costPerClient * complexityMultiplier;
      const profitMargin = client.current_fee - estimatedCost;
      return { name: client.name, fee: client.current_fee, cost: estimatedCost, margin: profitMargin, isLoss: profitMargin < 0 };
    }).sort((a, b) => a.margin - b.margin);

    const lossClients = clientAnalysis.filter(c => c.isLoss);

    return { totalRevenue, totalCosts, profit, margin, avgTicket, costPerClient, clientAnalysis, lossClients, employeesCount: employees.length };
  }, [clients, expenses, employees]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const monthName = new Date(currentYear, currentMonth - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    doc.setFontSize(18);
    doc.text('Relatório Financeiro Estratégico', 14, 20);
    doc.setFontSize(11);
    doc.text(`Período: ${monthName}`, 14, 28);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 34);

    doc.setFontSize(14);
    doc.text('Resumo Financeiro', 14, 48);
    autoTable(doc, {
      startY: 52,
      head: [['Indicador', 'Valor']],
      body: [
        ['Receita Total', fmt(report.totalRevenue)],
        ['Custos Totais', fmt(report.totalCosts)],
        ['Lucro', fmt(report.profit)],
        ['Margem de Lucro', `${report.margin.toFixed(1)}%`],
        ['Ticket Médio', fmt(report.avgTicket)],
        ['Total Clientes', String(clients.length)],
        ['Total Colaboradores', String(report.employeesCount)],
      ],
    });

    const y1 = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFontSize(14);
    doc.text('Rentabilidade por Cliente', 14, y1 + 12);
    autoTable(doc, {
      startY: y1 + 16,
      head: [['Cliente', 'Honorário', 'Custo Est.', 'Margem', 'Status']],
      body: report.clientAnalysis.map(c => [
        c.name,
        fmt(c.fee),
        fmt(c.cost),
        fmt(c.margin),
        c.isLoss ? '⚠ Prejuízo' : 'Lucrativo',
      ]),
    });

    doc.save(`relatorio-financeiro-${currentYear}-${currentMonth}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório Estratégico</h1>
          <p className="text-muted-foreground">Relatório financeiro consolidado do escritório</p>
        </div>
        <Button onClick={exportPDF}>
          <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-foreground">{fmt(report.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custos Totais</p>
              <p className="text-2xl font-bold text-foreground">{fmt(report.totalCosts)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lucro</p>
              <p className={`text-2xl font-bold ${report.profit >= 0 ? 'text-green-500' : 'text-destructive'}`}>{fmt(report.profit)}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Margem de Lucro</p>
              <p className="text-lg font-bold text-foreground">{report.margin.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-lg font-bold text-foreground">{fmt(report.avgTicket)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes</p>
              <p className="text-lg font-bold text-foreground">{clients.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Colaboradores</p>
              <p className="text-lg font-bold text-foreground">{report.employeesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {report.lossClients.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Clientes com Prejuízo ({report.lossClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.lossClients.map((c, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="text-destructive font-mono">{fmt(c.margin)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise Completa de Rentabilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {report.clientAnalysis.map((c, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div>
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">Honorário: {fmt(c.fee)}</span>
                </div>
                <div className="text-right">
                  <span className={`font-mono ${c.isLoss ? 'text-destructive' : 'text-green-500'}`}>
                    {fmt(c.margin)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
