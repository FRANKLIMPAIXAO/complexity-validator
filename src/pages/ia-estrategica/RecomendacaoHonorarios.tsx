import { useState } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { calculateFeeRecommendation, FeeRecommendation } from '@/hooks/useStrategicAI';
import { formatCurrency } from '@/lib/scoreCalculator';

export default function RecomendacaoHonorarios() {
  const [taxRegime, setTaxRegime] = useState('simples');
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [complexityScore, setComplexityScore] = useState(30);
  const [operationalVolume, setOperationalVolume] = useState(50);
  const [result, setResult] = useState<FeeRecommendation | null>(null);

  const handleCalculate = () => {
    const rec = calculateFeeRecommendation(taxRegime, monthlyRevenue, employeesCount, complexityScore, operationalVolume);
    setResult(rec);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Recomendação de Honorários
        </h1>
        <p className="text-muted-foreground">Calcule o honorário ideal baseado nas características do cliente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Cliente</CardTitle>
            <CardDescription>Preencha as informações para calcular o honorário recomendado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Regime Tributário</Label>
              <Select value={taxRegime} onValueChange={setTaxRegime}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples Nacional</SelectItem>
                  <SelectItem value="presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Faturamento Mensal (R$)</Label>
              <Input type="number" min={0} value={monthlyRevenue} onChange={e => setMonthlyRevenue(Number(e.target.value))} />
            </div>
            <div>
              <Label>Número de Funcionários</Label>
              <Input type="number" min={0} value={employeesCount} onChange={e => setEmployeesCount(Number(e.target.value))} />
            </div>
            <div>
              <Label>Score de Complexidade (0-100)</Label>
              <Input type="number" min={0} max={100} value={complexityScore} onChange={e => setComplexityScore(Number(e.target.value))} />
            </div>
            <div>
              <Label>Volume Operacional (NFs, folha, etc.)</Label>
              <Input type="number" min={0} value={operationalVolume} onChange={e => setOperationalVolume(Number(e.target.value))} />
            </div>
            <Button className="w-full" onClick={handleCalculate}>
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Honorário
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <div className="space-y-4">
          {result ? (
            <>
              <Card className="border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-muted-foreground">Honorário Mínimo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-amber-500">{formatCurrency(result.minimum)}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Margem projetada</span>
                      <span className="font-medium">{result.minimumMargin}%</span>
                    </div>
                    <Progress value={result.minimumMargin} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/30 ring-2 ring-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-primary flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Honorário Recomendado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(result.recommended)}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Margem projetada</span>
                      <span className="font-medium">{result.recommendedMargin}%</span>
                    </div>
                    <Progress value={result.recommendedMargin} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-emerald-500">Honorário Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-500">{formatCurrency(result.premium)}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Margem projetada</span>
                      <span className="font-medium">{result.premiumMargin}%</span>
                    </div>
                    <Progress value={result.premiumMargin} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Preencha os dados e clique em calcular para ver a recomendação</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
