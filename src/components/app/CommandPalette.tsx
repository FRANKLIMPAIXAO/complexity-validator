import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import {
  LayoutDashboard, Users, UserCheck, Trophy, Compass, BarChart3,
  FileText, Video, Settings, Plus, Search,
} from 'lucide-react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { clients } = useClients();
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const pages = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Clientes', icon: Users, href: '/clients' },
    { name: 'Colaboradores', icon: UserCheck, href: '/employees' },
    { name: 'Documentos', icon: FileText, href: '/documents' },
    { name: 'Vídeos', icon: Video, href: '/videos' },
    { name: 'Ranking', icon: Trophy, href: '/ranking' },
    { name: 'Benchmark', icon: BarChart3, href: '/benchmark' },
    { name: 'Estratégia', icon: Compass, href: '/strategy' },
    { name: 'Configurações', icon: Settings, href: '/settings' },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar clientes, colaboradores, páginas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Ações Rápidas">
          <CommandItem onSelect={() => go('/clients/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </CommandItem>
          <CommandItem onSelect={() => go('/employees')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Páginas">
          {pages.map((page) => (
            <CommandItem key={page.href} onSelect={() => go(page.href)}>
              <page.icon className="mr-2 h-4 w-4" />
              {page.name}
            </CommandItem>
          ))}
        </CommandGroup>

        {clients.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Clientes">
              {clients.slice(0, 10).map((client) => (
                <CommandItem key={client.id} onSelect={() => go(`/clients/${client.id}`)}>
                  <Users className="mr-2 h-4 w-4" />
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {employees.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Colaboradores">
              {employees.slice(0, 10).map((emp) => (
                <CommandItem key={emp.id} onSelect={() => go('/employees')}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  {emp.name} — {emp.role}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
