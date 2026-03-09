import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useCompany } from '@/contexts/CompanyContext';
import { CompanySetupWizard } from '@/components/company/CompanySetupWizard';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading, profile } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const location = useLocation();
  const trialStatus = useTrialStatus(profile);

  // Show loading while auth or company data is loading
  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check trial status after profile is loaded
  if (profile && !trialStatus.canAccessApp) {
    return <Navigate to="/trial-expired" replace />;
  }

  // Show company setup wizard if user has no company
  if (profile && !profile.company_id && !company) {
    return <CompanySetupWizard />;
  }

  return <>{children}</>;
}
