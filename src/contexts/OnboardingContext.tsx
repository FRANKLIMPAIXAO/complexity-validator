import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingContextType {
  showOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !profile) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        setIsLoading(false);
        return;
      }

      if (data && !data.onboarding_completed) {
        setShowOnboarding(true);
      }

      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, [user, profile]);

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setShowOnboarding(false);
      toast.success('Bem-vindo ao CORTEXCONT! Explore as funcionalidades.');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setShowOnboarding(false);
    }
  };

  const skipOnboarding = async () => {
    if (!user) {
      setShowOnboarding(false);
      return;
    }

    try {
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      setShowOnboarding(false);
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      setShowOnboarding(false);
    }
  };

  const resetOnboarding = async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: false,
          onboarding_completed_at: null,
        })
        .eq('id', user.id);

      // Atualiza estado compartilhado - aparece instantaneamente
      setShowOnboarding(true);
      toast.success('Tour reiniciado! Veja novamente as funcionalidades.');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        showOnboarding,
        isLoading,
        completeOnboarding,
        skipOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
