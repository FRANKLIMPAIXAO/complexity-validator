import { useMemo } from 'react';
import { Profile } from '@/types/database';

export interface TrialStatus {
  isInTrial: boolean;
  isTrialExpired: boolean;
  isActive: boolean;
  daysLeft: number;
  canAccessApp: boolean;
}

export function useTrialStatus(profile: Profile | null): TrialStatus {
  return useMemo(() => {
    // Default state for no profile
    if (!profile) {
      return {
        isInTrial: false,
        isTrialExpired: false,
        isActive: false,
        daysLeft: 0,
        canAccessApp: false,
      };
    }

    const { subscription_status, trial_expires_at } = profile;

    // Active subscription - full access
    if (subscription_status === 'active') {
      return {
        isInTrial: false,
        isTrialExpired: false,
        isActive: true,
        daysLeft: 0,
        canAccessApp: true,
      };
    }

    // Expired or cancelled - no access
    if (subscription_status === 'expired' || subscription_status === 'cancelled') {
      return {
        isInTrial: false,
        isTrialExpired: true,
        isActive: false,
        daysLeft: 0,
        canAccessApp: false,
      };
    }

    // Trial status - check expiration
    if (subscription_status === 'trial' && trial_expires_at) {
      const expiresAt = new Date(trial_expires_at);
      const now = new Date();
      const diffTime = expiresAt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return {
          isInTrial: false,
          isTrialExpired: true,
          isActive: false,
          daysLeft: 0,
          canAccessApp: false,
        };
      }

      return {
        isInTrial: true,
        isTrialExpired: false,
        isActive: false,
        daysLeft: diffDays,
        canAccessApp: true,
      };
    }

    // Fallback - allow access (for legacy users without status)
    return {
      isInTrial: false,
      isTrialExpired: false,
      isActive: true,
      daysLeft: 0,
      canAccessApp: true,
    };
  }, [profile]);
}
