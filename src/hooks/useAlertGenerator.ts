import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useClients } from '@/hooks/useClients';
import { useEmployees, useEmployeeMetrics } from '@/hooks/useEmployees';
import { supabase } from '@/integrations/supabase/client';

// FIX: Alertas agora persistidos no banco (tabela notifications) em vez de só em memória.
// Isso evita perda de alertas no refresh e usa o canal realtime já configurado na tabela.
export const useAlertGenerator = () => {
  const { user } = useAuth();
  const { company } = useCompany();
  const { clients } = useClients();
  const { data: employees } = useEmployees();
  const { data: allMetrics } = useEmployeeMetrics();
  const hasGeneratedRef = useRef(false);

  // Persiste notificação no banco com deduplicação de 24h por tipo
  const persistNotification = useCallback(async (
    title: string,
    message: string,
    type: string,
  ) => {
    if (!user || !company?.id) return;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', type)
      .gte('created_at', oneDayAgo)
      .limit(1)
      .maybeSingle();

    if (existing) return; // Já notificado hoje, não duplicar

    await supabase.from('notifications').insert({
      user_id: user.id,
      company_id: company.id,
      title,
      message,
      type,
      is_read: false,
    });
  }, [user, company?.id]);

  const checkUnderpricedClients = useCallback(async () => {
    if (!clients || !user) return;
    const underpricedClients = clients.filter(c => c.is_underpriced);
    if (underpricedClients.length === 0) return;

    await persistNotification(
      'Clientes Subprecificados Detectados',
      `Você tem ${underpricedClients.length} cliente(s) com honorários abaixo do ideal. Revise a precificação para otimizar sua receita.`,
      'underpricing',
    );
  }, [clients, user, persistNotification]);

  const checkAtRiskEmployees = useCallback(async () => {
    if (!employees || !allMetrics || !user) return;

    const latestMetricsMap = new Map<string, typeof allMetrics[0]>();
    allMetrics.forEach(m => {
      const existing = latestMetricsMap.get(m.employee_id);
      if (!existing ||
          m.period_year > existing.period_year ||
          (m.period_year === existing.period_year && m.period_month > existing.period_month)) {
        latestMetricsMap.set(m.employee_id, m);
      }
    });

    const riskCount = employees.filter(e =>
      latestMetricsMap.get(e.id)?.performance_level === 'risco_operacional'
    ).length;
    const attentionCount = employees.filter(e =>
      latestMetricsMap.get(e.id)?.performance_level === 'atencao'
    ).length;

    if (riskCount === 0 && attentionCount === 0) return;

    const parts: string[] = [];
    if (riskCount > 0) parts.push(`${riskCount} colaborador(es) em risco operacional`);
    if (attentionCount > 0) parts.push(`${attentionCount} colaborador(es) precisam de atenção`);

    await persistNotification(
      'Colaboradores Requerem Atenção',
      parts.join('. ') + '.',
      'employee_risk',
    );
  }, [employees, allMetrics, user, persistNotification]);

  // Executa uma vez quando os dados carregam, com debounce de 3s
  useEffect(() => {
    if (!user || hasGeneratedRef.current) return;
    if ((clients?.length ?? 0) === 0 && (employees?.length ?? 0) === 0) return;

    const timer = setTimeout(() => {
      hasGeneratedRef.current = true;
      checkUnderpricedClients();
      checkAtRiskEmployees();
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, clients, employees, checkUnderpricedClients, checkAtRiskEmployees]);

  return { checkUnderpricedClients, checkAtRiskEmployees };
};
