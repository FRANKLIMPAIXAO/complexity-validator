import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, X, Trophy, Compass, BarChart3, UserCheck, Shield, HelpCircle, Settings, FileText, Video, DollarSign, ChevronDown, ChevronRight, Calculator, PiggyBank, TrendingUp, FileBarChart, Target, Brain, AlertTriangle, BadgeDollarSign, Rocket, Lightbulb, Radar, Eye, ArrowUpDown, LayoutList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useBetaSignups';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import Logo from '@/components/landing/Logo';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Ranking', href: '/ranking', icon: Trophy },
  { name: 'Colaboradores', href: '/employees', icon: UserCheck },
  { name: 'Benchmark', href: '/benchmark', icon: BarChart3 },
  { name: 'Estratégia', href: '/strategy', icon: Compass },
];

const financeiroSubmenu = [
  { name: 'Orçamento', href: '/financeiro/orcamento', icon: PiggyBank },
  { name: 'Custos do Escritório', href: '/financeiro/custos', icon: Calculator },
  { name: 'Ponto de Equilíbrio', href: '/financeiro/equilibrio', icon: Target },
  { name: 'Simulador de Crescimento', href: '/financeiro/simulador', icon: TrendingUp },
  { name: 'Rentabilidade', href: '/financeiro/rentabilidade', icon: DollarSign },
  { name: 'Relatórios', href: '/financeiro/relatorio', icon: FileBarChart },
];

const iaEstrategicaSubmenu = [
  { name: 'Consultor Estratégico', href: '/ia-estrategica/advisor', icon: Lightbulb },
  { name: 'Análise da Carteira', href: '/ia-estrategica/carteira', icon: Brain },
  { name: 'Clientes Subprecificados', href: '/ia-estrategica/subprecificados', icon: AlertTriangle },
  { name: 'Recomendação de Honorários', href: '/ia-estrategica/honorarios', icon: BadgeDollarSign },
  { name: 'Estratégia de Crescimento', href: '/ia-estrategica/crescimento', icon: Rocket },
];

const radarSubmenu = [
  { name: 'Visão Geral', href: '/radar/visao-geral', icon: Eye },
  { name: 'Reajustes Recomendados', href: '/radar/reajustes', icon: ArrowUpDown },
  { name: 'Clientes com Prejuízo', href: '/radar/prejuizo', icon: AlertTriangle },
  { name: 'Segmentos e Oportunidades', href: '/radar/segmentos', icon: LayoutList },
];

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { resetOnboarding } = useOnboarding();
  const [financeiroOpen, setFinanceiroOpen] = useState(
    location.pathname.startsWith('/financeiro')
  );
  const [iaEstrategicaOpen, setIaEstrategicaOpen] = useState(
    location.pathname.startsWith('/ia-estrategica')
  );
  const [radarOpen, setRadarOpen] = useState(
    location.pathname.startsWith('/radar')
  );

  const adminNavigation = [
    { name: 'Gestão de Usuários', href: '/admin/beta', icon: Shield },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Financeiro Menu */}
            <div>
              <button
                onClick={() => setFinanceiroOpen(!financeiroOpen)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full',
                  location.pathname.startsWith('/financeiro')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <DollarSign className="h-5 w-5" />
                <span className="flex-1 text-left">Financeiro</span>
                {financeiroOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {financeiroOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {financeiroSubmenu.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-primary/20 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* IA Estratégica Menu */}
            <div>
              <button
                onClick={() => setIaEstrategicaOpen(!iaEstrategicaOpen)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full',
                  location.pathname.startsWith('/ia-estrategica')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Brain className="h-5 w-5" />
                <span className="flex-1 text-left">IA Estratégica</span>
                {iaEstrategicaOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {iaEstrategicaOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {iaEstrategicaSubmenu.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-primary/20 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Radar de Oportunidades Menu */}
            <div>
              <button
                onClick={() => setRadarOpen(!radarOpen)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full',
                  location.pathname.startsWith('/radar')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Radar className="h-5 w-5" />
                <span className="flex-1 text-left">Radar de Oportunidades</span>
                {radarOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {radarOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {radarSubmenu.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-primary/20 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <div className="my-4 border-t border-border" />
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Administração
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              to="/settings"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full',
                location.pathname === '/settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Settings className="h-5 w-5" />
              Configurações
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={() => {
                resetOnboarding();
                onClose();
              }}
            >
              <HelpCircle className="h-5 w-5" />
              Ver Tour
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
