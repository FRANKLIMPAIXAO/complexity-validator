import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientFormData, TAX_REGIME_LABELS, TaxRegime } from '@/types/database';
import { useClientPlans } from '@/hooks/useClientPlans';
import PlanBadge from '@/components/clients/PlanBadge';

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tax_regime: z.enum(['mei', 'simples', 'presumido', 'real'] as const),
  monthly_entries: z.coerce.number().min(0, 'Valor deve ser positivo'),
  monthly_revenue: z.coerce.number().min(0, 'Valor deve ser positivo'),
  employees_count: z.coerce.number().min(0, 'Valor deve ser positivo'),
  monthly_hires: z.coerce.number().min(0, 'Valor deve ser positivo'),
  monthly_terminations: z.coerce.number().min(0, 'Valor deve ser positivo'),
  current_fee: z.coerce.number().min(0, 'Valor deve ser positivo'),
  plan_id: z.string().optional(),
  monthly_invoices: z.coerce.number().min(0, 'Valor deve ser positivo'),
  has_tax_substitution: z.boolean(),
  has_import_operations: z.boolean(),
  is_ecommerce: z.boolean(),
  complex_payroll: z.boolean(),
});

interface ExtendedClientFormData extends ClientFormData {
  plan_id?: string;
}

interface ClientFormProps {
  initialData?: ExtendedClientFormData;
  onSubmit: (data: ExtendedClientFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function ClientForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Salvar Cliente',
}: ClientFormProps) {
  const { plans } = useClientPlans();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExtendedClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      name: '',
      tax_regime: 'simples',
      monthly_entries: 0,
      monthly_revenue: 0,
      employees_count: 0,
      monthly_hires: 0,
      monthly_terminations: 0,
      current_fee: 0,
      plan_id: undefined,
      monthly_invoices: 0,
      has_tax_substitution: false,
      has_import_operations: false,
      is_ecommerce: false,
      complex_payroll: false,
    },
  });

  const taxRegime = watch('tax_regime');
  const planId = watch('plan_id');
  const selectedPlan = plans.find(p => p.id === planId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cliente</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Empresa ABC Ltda"
              className="bg-background"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_regime">Regime Tributário</Label>
            <Select
              value={taxRegime}
              onValueChange={(value) => setValue('tax_regime', value as TaxRegime)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecione o regime" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TAX_REGIME_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan_id">Plano</Label>
            <Select
              value={planId || ''}
              onValueChange={(value) => {
                setValue('plan_id', value || undefined);
                const plan = plans.find(p => p.id === value);
                if (plan?.default_fee != null) {
                  setValue('current_fee', plan.default_fee);
                }
              }}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecione o plano">
                  {selectedPlan ? (
                    <PlanBadge plan={selectedPlan} size="sm" />
                  ) : (
                    'Selecione o plano'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {plans.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    Nenhum plano cadastrado. Configure em Configurações → Planos.
                  </div>
                ) : (
                  plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: plan.color }}
                        />
                        {plan.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Dados Contábeis</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="monthly_entries">Lançamentos Mensais</Label>
            <Input
              id="monthly_entries"
              type="number"
              {...register('monthly_entries')}
              placeholder="Ex: 150"
              className="bg-background"
            />
            {errors.monthly_entries && (
              <p className="text-sm text-destructive">{errors.monthly_entries.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_revenue">Faturamento Mensal (R$)</Label>
            <Input
              id="monthly_revenue"
              type="number"
              step="0.01"
              {...register('monthly_revenue')}
              placeholder="Ex: 100000"
              className="bg-background"
            />
            {errors.monthly_revenue && (
              <p className="text-sm text-destructive">{errors.monthly_revenue.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_invoices">Notas Fiscais Mensais</Label>
            <Input
              id="monthly_invoices"
              type="number"
              {...register('monthly_invoices')}
              placeholder="Ex: 50"
              className="bg-background"
            />
            {errors.monthly_invoices && (
              <p className="text-sm text-destructive">{errors.monthly_invoices.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Departamento Pessoal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="employees_count">Funcionários</Label>
            <Input
              id="employees_count"
              type="number"
              {...register('employees_count')}
              placeholder="Ex: 10"
              className="bg-background"
            />
            {errors.employees_count && (
              <p className="text-sm text-destructive">{errors.employees_count.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_hires">Admissões Mensais</Label>
            <Input
              id="monthly_hires"
              type="number"
              {...register('monthly_hires')}
              placeholder="Ex: 2"
              className="bg-background"
            />
            {errors.monthly_hires && (
              <p className="text-sm text-destructive">{errors.monthly_hires.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_terminations">Rescisões Mensais</Label>
            <Input
              id="monthly_terminations"
              type="number"
              {...register('monthly_terminations')}
              placeholder="Ex: 1"
              className="bg-background"
            />
            {errors.monthly_terminations && (
              <p className="text-sm text-destructive">{errors.monthly_terminations.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Complexidade Adicional</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_tax_substitution"
              checked={watch('has_tax_substitution')}
              onCheckedChange={(checked) => setValue('has_tax_substitution', !!checked)}
            />
            <Label htmlFor="has_tax_substitution" className="cursor-pointer">
              Substituição Tributária (+8 pts)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_import_operations"
              checked={watch('has_import_operations')}
              onCheckedChange={(checked) => setValue('has_import_operations', !!checked)}
            />
            <Label htmlFor="has_import_operations" className="cursor-pointer">
              Operações de Importação (+10 pts)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_ecommerce"
              checked={watch('is_ecommerce')}
              onCheckedChange={(checked) => setValue('is_ecommerce', !!checked)}
            />
            <Label htmlFor="is_ecommerce" className="cursor-pointer">
              E-commerce (+5 pts)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="complex_payroll"
              checked={watch('complex_payroll')}
              onCheckedChange={(checked) => setValue('complex_payroll', !!checked)}
            />
            <Label htmlFor="complex_payroll" className="cursor-pointer">
              Folha de Pagamento Complexa (+5 pts)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Precificação Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="current_fee">Valor Mensal Cobrado (R$)</Label>
            <Input
              id="current_fee"
              type="number"
              step="0.01"
              {...register('current_fee')}
              placeholder="Ex: 800"
              className="bg-background"
            />
            {errors.current_fee && (
              <p className="text-sm text-destructive">{errors.current_fee.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
