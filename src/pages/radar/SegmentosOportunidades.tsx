import { Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRadarOportunidades } from '@/hooks/useRadarOportunidades';
import { formatCurrency } from '@/lib/scoreCalculator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SegmentosOportunidades() {
  const { segments, isLoading } = useRadarOportunidades();

  const chartData = segments.map(s => ({
    name: s.segment,
    margem: Number(s.avgMarginPct.toFixed(1)),
    honorario: Number(s.avgFee.toFixed(0)),
  }));

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Segmentos e Oportunidades
        </h1>
        <p className="text-muted-foreground">Análise de rentabilidade por segmento de cliente</p>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Margem Média por Segmento</CardTitle>
          <CardDescription>Comparação entre segmentos de clientes</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={110} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="margem" name="Margem %" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">Sem dados</p>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Detalhamento por Segmento</CardTitle></CardHeader>
        <CardContent>
          {segments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Cadastre clientes para ver análise de segmentos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Segmento</th>
                    <th className="pb-3 font-medium text-muted-foreground text-center">Clientes</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Honorário Médio</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Complexidade Média</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Margem Média</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Receita Total</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((s, i) => (
                    <tr key={s.segment} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 flex items-center gap-2">
                        {i < 3 && <Badge className="text-xs">Top {i + 1}</Badge>}
                        <span className="font-medium">{s.segment}</span>
                      </td>
                      <td className="py-3 text-center">{s.clientCount}</td>
                      <td className="py-3 text-right">{formatCurrency(s.avgFee)}</td>
                      <td className="py-3 text-right">{s.avgComplexity.toFixed(1)}</td>
                      <td className={`py-3 text-right font-semibold ${s.avgMarginPct >= 20 ? 'text-green-500' : s.avgMarginPct >= 0 ? 'text-amber-500' : 'text-destructive'}`}>
                        {s.avgMarginPct.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{formatCurrency(s.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
