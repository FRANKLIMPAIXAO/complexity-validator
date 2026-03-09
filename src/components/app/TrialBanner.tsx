import { useAuth } from '@/contexts/AuthContext';
import { Clock, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';

export function TrialBanner() {
  const { profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const trialInfo = useMemo(() => {
    if (!profile?.trial_expires_at || profile.subscription_status !== 'trial') {
      return null;
    }

    const expiresAt = new Date(profile.trial_expires_at);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysLeft: Math.max(0, diffDays),
      isExpiringSoon: diffDays <= 2,
      isLastDay: diffDays <= 1,
    };
  }, [profile?.trial_expires_at, profile?.subscription_status]);

  // Don't show banner if not in trial or dismissed
  if (!trialInfo || dismissed) {
    return null;
  }

  const getBannerStyles = () => {
    if (trialInfo.isLastDay) {
      return 'bg-destructive/10 border-destructive/30 text-destructive';
    }
    if (trialInfo.isExpiringSoon) {
      return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400';
    }
    return 'bg-primary/10 border-primary/30 text-primary';
  };

  const getIconStyles = () => {
    if (trialInfo.isLastDay) {
      return 'text-destructive';
    }
    if (trialInfo.isExpiringSoon) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-primary';
  };

  return (
    <div className={`border-b px-4 py-2 ${getBannerStyles()}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className={`h-4 w-4 ${getIconStyles()}`} />
          <span>
            {trialInfo.daysLeft === 0
              ? 'Seu período de teste expira hoje!'
              : trialInfo.daysLeft === 1
              ? '1 dia restante no seu período de teste'
              : `${trialInfo.daysLeft} dias restantes no seu período de teste`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            Fazer Upgrade
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6" 
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
