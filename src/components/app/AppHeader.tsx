import { Menu, User, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface AppHeaderProps {
  onMenuClick: () => void;
}

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { profile, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 text-muted-foreground"
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            }}
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Buscar...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <NotificationBell />
          
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {profile?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground">
              {profile?.company_name || user?.email}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
