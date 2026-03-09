import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, UserPlus, FileEdit, TrendingUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useActivityLogs } from '@/hooks/useActivityLog';
import { Skeleton } from '@/components/ui/skeleton';

const activityIcons: Record<string, any> = {
  client: UserPlus,
  employee: TrendingUp,
  strategy: Clock,
  goal: FileEdit,
  kpi: FileEdit,
};

const activityColors: Record<string, string> = {
  client: 'text-blue-500 bg-blue-500/10',
  employee: 'text-green-500 bg-green-500/10',
  strategy: 'text-orange-500 bg-orange-500/10',
  goal: 'text-purple-500 bg-purple-500/10',
  kpi: 'text-purple-500 bg-purple-500/10',
};

const actionLabels: Record<string, string> = {
  criacao: 'criou',
  edicao: 'editou',
  exclusao: 'removeu',
};

interface RecentActivityProps {
  className?: string;
}

export default function RecentActivity({ className }: RecentActivityProps) {
  const { data: activities = [], isLoading } = useActivityLogs(10);

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma atividade recente.</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.entity_type] || Clock;
            const colorClass = activityColors[activity.entity_type] || 'text-muted-foreground bg-muted';
            const actionLabel = actionLabels[activity.action_type] || activity.action_type;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className={cn('p-2 rounded-lg', colorClass)}>
                  {activity.action_type === 'exclusao' ? (
                    <Trash2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    {actionLabel} {activity.entity_name || 'item'}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
