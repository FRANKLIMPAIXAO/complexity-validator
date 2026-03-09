import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { TrialBanner } from './TrialBanner';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AlertMonitor } from '@/components/notifications/AlertMonitor';
import CommandPalette from './CommandPalette';

function AppLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Trial Banner */}
      <TrialBanner />
      
      <div className="flex-1 flex">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Onboarding Wizard */}
      <OnboardingWizard
        open={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />

      {/* Alert Monitor - runs in background */}
      <AlertMonitor />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}

export default function AppLayout() {
  return (
    <NotificationProvider>
      <OnboardingProvider>
        <AppLayoutContent />
      </OnboardingProvider>
    </NotificationProvider>
  );
}
