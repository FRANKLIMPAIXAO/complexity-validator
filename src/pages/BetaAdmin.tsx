import { Shield, RefreshCw } from 'lucide-react';
import { useBetaSignups, useIsAdmin } from '@/hooks/useBetaSignups';
import BetaSignupTable from '@/components/admin/BetaSignupTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function BetaAdmin() {
  const { signups, isLoading, refetch } = useBetaSignups();
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin();

  if (isLoadingAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os usuários e inscrições do PRAXIS
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <BetaSignupTable signups={signups} isLoading={isLoading} />
    </div>
  );
}
