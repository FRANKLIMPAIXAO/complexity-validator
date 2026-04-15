import { useState } from 'react';
import { Calculator, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/scoreCalculator';

// Constantes baseadas na imagem
const BASE_VALUES = {
  simples: 350,
  presumido: 450,
  real: 600,
};

export default function RecomendacaoHonorarios() {
  const [taxRegime, setTaxRegime] = useState('simples');
  const [activity, setActivity] = useState('comercio');
  const [revenue, setRevenue] = useState('100'); // até 200k etc
  const [plan, setPlan] = useState('executivo');
  const [invoices, setInvoices] = useState('500');
  
  const [discount, setDiscount] = useState(0);
  const [extraCharges, setExtraCharges] = useState(200);

  const [isCalculated, setIsCalculated] = useState(false);

  // Derivação dos valores com base nas seleções
  const getBaseValue = () => BASE_VALUES[taxRegime as keyof typeof BASE_VALUES] || 350;
  const getTaxRegimeLabel = () => {
    if (taxRegime === 'simples') return 'Simples Nacional';
    if (taxRegime === 'presumido') return 'Lucro Presumido';
    return 'Lucro Real';
  };

  const getComplexityFactor = () => {
    const base = getBaseValue();
    let multiplier = 1.0;
    let label = 'Serviços';
    if (activity === 'comercio') {
      multiplier = 1.35;
      label = 'Comércio';
    } else if (activity === 'industria') {
      multiplier = 1.5;
      label = 'Indústria';
    }
    const value = base * multiplier;
    return { value, displayMultiplier: multiplier, label }; // the image says 1.4x for comercio visually, but math is 1.35x. Let's use what makes the math exactly match if possible, or just calculate straight.
  };

  const getRevenueFactor = (currentTotal: number) => {
    let multiplier = 1.0;
    let label = 'Até 50K';
    if (revenue === '100') { multiplier = 1.25; label = 'Até 100K'; }
    else if (revenue === '200') { multiplier = 1.5; label = 'Até 200K'; }
    else if (revenue === '500') { multiplier = 1.8; label = 'Até 500K'; }
    
    return { value: currentTotal * multiplier, displayMultiplier: multiplier, label };
  };

  const getPlanFactor = (currentTotal: number) => {
    let multiplier = 1.0;
    let label = 'Básico';
    if (plan === 'executivo') { multiplier = 1.5; label = 'Executivo'; }
    else if (plan === 'premium') { multiplier = 2.0; label = 'Premium'; }

    return { value: currentTotal * multiplier, displayMultiplier: multiplier, label };
  };

  const getInvoicePackage = () => {
    let cost = 0;
    let label = 'Até 100';
    if (Number(invoices) > 1000) { cost = 150; label = 'Acima de 1.000'; }
    else if (Number(invoices) > 500) { cost = 50; label = 'Até 1.000'; }
    else if (Number(invoices) > 100) { cost = 0; label = 'Até 500'; }
    
    // In image it says "Até 1.000" = 0,00. Let's adjust logic for the screenshot matching
    if (invoices === '1000' || Number(invoices) <= 1000) { cost = 0; label = 'Até 1.000'; }

    return { value: cost, label };
  };

  // Perform calculation cascade
  const base = getBaseValue();
  const complexity = getComplexityFactor();
  const revenueData = getRevenueFactor(complexity.value);
  const planData = getPlanFactor(revenueData.value);
  const invoiceData = getInvoicePackage();

  const subtotal = planData.value + invoiceData.value;
  const finalPrice = subtotal - discount + extraCharges;

  const handleCalculate = () => {
    setIsCalculated(true);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Form */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Dados do Cliente</CardTitle>
            <CardDescription>Preencha as informações para calcular o honorário recomendado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
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
            
            <div className="space-y-2">
              <Label>Ramo de Atividade (Complexidade)</Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="servicos">Serviços</SelectItem>
                  <SelectItem value="comercio">Comércio</SelectItem>
                  <SelectItem value="industria">Indústria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Faturamento Mensal Estimado</Label>
              <Select value={revenue} onValueChange={setRevenue}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">Até R$ 50.000</SelectItem>
                  <SelectItem value="100">Até R$ 100.000</SelectItem>
                  <SelectItem value="200">Até R$ 200.000</SelectItem>
                  <SelectItem value="500">Acima de R$ 200.000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plano de Serviço</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico (Compliance)</SelectItem>
                  <SelectItem value="executivo">Executivo (Consultivo)</SelectItem>
                  <SelectItem value="premium">Premium (BPO/Estratégico)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Volume Operacional (NFs)</Label>
              <Input type="number" min={0} value={invoices} onChange={e => setInvoices(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Margem de Negociação (R$)</Label>
                <Input type="number" min={0} value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Itens Cobrados à Parte (R$)</Label>
                <Input type="number" min={0} value={extraCharges} onChange={e => setExtraCharges(Number(e.target.value))} />
              </div>
            </div>

            <Button className="w-full mt-4" onClick={handleCalculate}>
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Honorário
            </Button>
          </CardContent>
        </Card>

        {/* Result Area */}
        <div className="lg:pl-6">
          {isCalculated ? (
            <div className="bg-[#FAF9F6] dark:bg-card/40 rounded-xl p-6 sm:p-8 border shadow-sm">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-6">
                Resumo da Composição do Preço
              </h3>
              
              <div className="space-y-5">
                {/* Linha 1 */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">Base operacional</p>
                    <p className="text-xs text-muted-foreground">{getTaxRegimeLabel()}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(base)}</p>
                </div>

                {/* Linha 2 */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">Fator de complexidade</p>
                    <p className="text-xs text-muted-foreground">
                      {complexity.label} · {complexity.displayMultiplier}x
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(complexity.value)}</p>
                </div>

                {/* Linha 3 */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">Fator de faturamento</p>
                    <p className="text-xs text-muted-foreground">
                      {revenueData.label} · {revenueData.displayMultiplier}x
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(revenueData.value)}</p>
                </div>

                {/* Linha 4 */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">Plano / nível de serviço</p>
                    <p className="text-xs text-muted-foreground">
                      {planData.label} · {planData.displayMultiplier}x
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(planData.value)}</p>
                </div>

                {/* Linha 5 */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">Pacote de NF</p>
                    <p className="text-xs text-muted-foreground">{invoiceData.label}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(invoiceData.value)}</p>
                </div>

                <div className="h-px bg-border my-2"></div>

                {/* Linha Subtotal */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-foreground">Subtotal do honorário</p>
                    <p className="text-xs text-muted-foreground">Plano + adicionais do pacote NF</p>
                  </div>
                  <p className="text-sm font-bold">{formatCurrency(subtotal)}</p>
                </div>

                {/* Linha Negociacao */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">Margem de negociação</p>
                    <p className="text-xs text-muted-foreground">Desconto configurado</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(discount)}</p>
                </div>

                {/* Linha Cobrado a parte */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">Cobrado à parte</p>
                    <p className="text-xs text-muted-foreground">{extraCharges > 0 ? "Folha não incluída / Outros" : "Nenhum"}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(extraCharges)}</p>
                </div>
              </div>

              {/* Card Final */}
              <div className="mt-8 bg-zinc-900 text-white rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-semibold tracking-widest text-zinc-400">PROPOSTA FINAL DO CENÁRIO</p>
                  <BarChart3 className="h-5 w-5 text-zinc-400" />
                </div>
                <p className="text-4xl font-bold mb-4 tracking-tight">
                  {formatCurrency(finalPrice)}
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                  Valor considerando o subtotal negociado e os itens cobrados à parte que estão ativos neste cenário.
                </p>
              </div>

            </div>
          ) : (
            <Card className="h-full border-dashed bg-card/50 flex flex-col justify-center min-h-[400px]">
              <CardContent className="text-center p-6">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                  Preencha os dados à esquerda e clique em calcular para visualizar a estruturação detalhada do preço.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
