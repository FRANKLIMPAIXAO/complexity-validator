import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, KeyRound, LogOut, Mail, Sparkles } from 'lucide-react';
import Logo from '@/components/landing/Logo';

export default function TrialExpired() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Logo />
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Clock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Período de Teste Expirado</CardTitle>
            <CardDescription>
              Seu período de teste gratuito de 7 dias terminou.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Você aproveitou ao máximo o período de teste?
              </p>
              <p className="text-sm font-medium">
                Continue usando o CORTEXCONT e transforme a gestão do seu escritório.
              </p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" size="lg" onClick={() => navigate('/pricing')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Assinar Agora
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:contato@cortexcont.app">
                  <Mail className="h-4 w-4 mr-2" />
                  Falar com Comercial
                </a>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link to="/forgot-password">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Esqueci minha senha
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair da Conta
              </Button>
            </div>

            {profile?.email && (
              <p className="text-center text-xs text-muted-foreground">
                Logado como: {profile.email}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
