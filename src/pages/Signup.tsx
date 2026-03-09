import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/landing/Logo';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { strongPasswordSchema } from '@/lib/passwordValidation';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  companyName: z.string().min(2, 'Nome do escritório deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError('');

    const { error } = await signUp(data.email, data.password, data.fullName, data.companyName);

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este e-mail já está cadastrado');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
      setIsLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const trialBenefits = [
    "Acesso completo por 15 dias",
    "Sem cartão de crédito",
    "Cancele quando quiser",
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Logo />
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Clock className="h-3 w-3 mr-1" />
            15 Dias Grátis
          </Badge>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>
              Comece seu período de teste gratuito
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Trial Benefits */}
            <div className="mb-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="space-y-1">
                {trialBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="João Silva"
                  className="bg-background"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nome do Escritório</Label>
                <Input
                  id="companyName"
                  {...register('companyName')}
                  placeholder="Silva Contabilidade"
                  className="bg-background"
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  className="bg-background"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="bg-background"
                />
                <PasswordStrengthIndicator password={watch('password') || ''} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="bg-background"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Começar Trial Grátis'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
