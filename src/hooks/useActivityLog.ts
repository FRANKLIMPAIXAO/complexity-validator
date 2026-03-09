import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';

export interface ActivityLog {
  id: string;
  company_id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  description: string | null;
  created_at: string;
}

export function useActivityLogs(limit = 10) {
  const { user } = useAuth();
  const { company } = useCompany();

  return useQuery({
    queryKey: ['activity-logs', company?.id, limit],
    queryFn: async () => {
      if (!user?.id || !company?.id) return [];

      const { data, error } = await supabase
        .from('activity_logs' as any)
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as ActivityLog[];
    },
    enabled: !!user?.id && !!company?.id,
  });
}

export function useLogActivity() {
  const { user } = useAuth();
  const { company } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: {
      action_type: string;
      entity_type: string;
      entity_id?: string;
      entity_name?: string;
      description?: string;
    }) => {
      if (!user?.id || !company?.id) return;

      const { error } = await supabase
        .from('activity_logs' as any)
        .insert({
          company_id: company.id,
          user_id: user.id,
          action_type: log.action_type,
          entity_type: log.entity_type,
          entity_id: log.entity_id || null,
          entity_name: log.entity_name || null,
          description: log.description || null,
        } as any);

      if (error) console.error('Error logging activity:', error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
  });
}
