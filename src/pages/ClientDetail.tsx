import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { useClients } from '@/hooks/useClients';
import { useClientPlans } from '@/hooks/useClientPlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client, TAX_REGIME_LABELS, ClientFormData } from '@/types/database';
import { formatCurrency, getExpectedPriceRange, generateInterpretation, checkRiskClient } from '@/lib/scoreCalculator';
import ScoreGauge from '@/components/score/ScoreGauge';
import ComplexityBadge from '@/components/score/ComplexityBadge';
import UnderpriceAlert from '@/components/score/UnderpriceAlert';
import ScoreBreakdown from '@/components/score/ScoreBreakdown';
import InterpretationSection from '@/components/score/InterpretationSection';
import RiskAlert from '@/components/score/RiskAlert';
import AdjustmentGuidance from '@/components/score/AdjustmentGuidance';
import AdjustmentSimulator from '@/components/score/AdjustmentSimulator';
import StrategicActionButton from '@/components/strategy/StrategicActionButton';
import PlanBadge from '@/components/clients/PlanBadge';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { getClientById } = useClients();
  const { plans } = useClientPlans();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClient() {
      if (!id) return;
      try {
        const data = await getClientById(id);
        setClient(data);
      } catch (error) {
        console.error('Error loading client:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadClient();
  }, [id, getClientById]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="ghost" className="mt-4" asChild>
          <Link to="/clients">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const priceRange = getExpectedPriceRange(client.complexity_level);
  const currentFee = Number(client.current_fee);
  const formData: ClientFormData = {
    name: client.name,
    tax_regime: client.tax_regime,
    monthly_entries: client.monthly_entries,
    monthly_revenue: Number(client.monthly_revenue),
    employees_count: client.employees_count,
    monthly_hires: client.monthly_hires,
    monthly_terminations: client.monthly_terminations,
    current_fee: currentFee,
    monthly_invoices: (client as any).monthly_invoices || 0,
    has_tax_substitution: (client as any).has_tax_substitution || false,
    has_import_operations: (client as any).has_import_operations || false,
    is_ecommerce: (client as any).is_ecommerce || false,
    complex_payroll: (client as any).complex_payroll || false,
  };

  // Gerar interpretação automática
  const interpretation = generateInterpretation(
    client.complexity_score,
    client.complexity_level,
    currentFee
  );

  // Verificar se é cliente de risco
  const isRiskClient = checkRiskClient(currentFee, client.complexity_level, client.complexity_score);

  // Encontrar o plano do cliente
  const clientPlan = plans.find((p) => p.id === client.plan_id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/clients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
              {clientPlan && <PlanBadge plan={clientPlan} />}
            </div>
            <p className="text-muted-foreground">
              {TAX_REGIME_LABELS[client.tax_regime]}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to={`/clients/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar Cliente
          </Link>
        </Button>
      </div>

      {/* Risk Alert - Prioridade sobre alerta de subprecificação simples */}
      {isRiskClient && <RiskAlert />}

      {/* Underprice Alert - Apenas se não for risco (para evitar duplicação) */}
      {client.is_underpriced && !isRiskClient && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <UnderpriceAlert
            currentFee={currentFee}
            level={client.complexity_level}
          />
        </motion.div>
      )}

      {/* Score Card */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <ScoreGauge
                score={client.complexity_score}
                level={client.complexity_level}
                size="lg"
              />
              <ComplexityBadge
                level={client.complexity_level}
                size="lg"
                className="mt-4"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Análise de Precificação
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Valor Cobrado</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(currentFee)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Faixa Sugerida</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Comparison Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Posição na faixa</span>
                  <span className="font-medium">
                    {currentFee < priceRange.min
                      ? 'Abaixo da faixa'
                      : currentFee > priceRange.max
                      ? 'Acima da faixa'
                      : 'Dentro da faixa'}
                  </span>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/30 rounded-full"
                    style={{
                      width: `${Math.min(100, (currentFee / priceRange.max) * 100)}%`,
                    }}
                  />
                  <div
                    className="absolute inset-y-0 bg-primary rounded-full"
                    style={{
                      left: `${(priceRange.min / priceRange.max) * 100}%`,
                      width: `${((priceRange.max - priceRange.min) / priceRange.max) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border-2 border-background shadow"
                    style={{
                      left: `${Math.min(100, Math.max(0, (currentFee / priceRange.max) * 100))}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interpretação Automática do Resultado */}
      <InterpretationSection interpretation={interpretation} />

      {/* Simulação de Reajuste */}
      <AdjustmentSimulator
        currentFee={currentFee}
        rangeMin={priceRange.min}
        rangeMax={priceRange.max}
      />

      {/* Orientação de Ajuste - Mostrar apenas se subprecificado */}
      {(client.is_underpriced || isRiskClient) && (
        <AdjustmentGuidance />
      )}

      {/* Strategic Action Button - Transformar em Objetivo Estratégico */}
      <StrategicActionButton client={client} isRiskClient={isRiskClient} />

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Score Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Detalhamento do Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBreakdown data={formData} />
          </CardContent>
        </Card>

        {/* Client Data */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Lançamentos/mês</p>
                <p className="font-medium text-foreground">{client.monthly_entries}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Faturamento/mês</p>
                <p className="font-medium text-foreground">
                  {formatCurrency(Number(client.monthly_revenue))}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Funcionários</p>
                <p className="font-medium text-foreground">{client.employees_count}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Admissões/mês</p>
                <p className="font-medium text-foreground">{client.monthly_hires}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rescisões/mês</p>
                <p className="font-medium text-foreground">{client.monthly_terminations}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cadastrado em</p>
                <p className="font-medium text-foreground">
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
