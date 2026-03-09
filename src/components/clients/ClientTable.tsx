import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Client, TAX_REGIME_LABELS } from '@/types/database';
import { formatCurrency } from '@/lib/scoreCalculator';
import ComplexityBadge from '@/components/score/ComplexityBadge';
import PlanBadge from '@/components/clients/PlanBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ClientPlan } from '@/types/clientPlan';

interface ClientTableProps {
  clients: Client[];
  plans: ClientPlan[];
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function ClientTable({ clients, plans, onDelete, isDeleting }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum cliente cadastrado ainda.</p>
        <p className="text-sm mt-1">Clique em "Novo Cliente" para começar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Plano</TableHead>
            <TableHead className="hidden lg:table-cell">Regime</TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="hidden sm:table-cell">Nível</TableHead>
            <TableHead className="hidden xl:table-cell">Valor Cobrado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const clientPlan = plans.find(p => p.id === (client as any).plan_id);
            return (
              <TableRow key={client.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{client.name}</span>
                    {client.is_underpriced && (
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Cliente potencialmente subprecificado
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <PlanBadge plan={clientPlan} size="sm" />
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {TAX_REGIME_LABELS[client.tax_regime]}
                </TableCell>
                <TableCell>
                  <span className="font-mono font-medium">{client.complexity_score}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <ComplexityBadge level={client.complexity_level} size="sm" />
                </TableCell>
                <TableCell className="hidden xl:table-cell text-muted-foreground">
                  {formatCurrency(client.current_fee)}
                </TableCell>
                <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/clients/${client.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/clients/${client.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Cliente</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o cliente "{client.name}"?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(client.id)}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
