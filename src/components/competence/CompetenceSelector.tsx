import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompetence } from '@/contexts/CompetenceContext';
import { MONTH_NAMES } from '@/types/company';
import { cn } from '@/lib/utils';

interface CompetenceSelectorProps {
  className?: string;
}

export function CompetenceSelector({ className }: CompetenceSelectorProps) {
  const { competences, currentCompetence, selectCompetence, loading } = useCompetence();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const handleCreateCompetence = async () => {
    await selectCompetence(newYear, newMonth);
    setIsDialogOpen(false);
  };

  const formatCompetence = (year: number, month: number) => {
    return `${MONTH_NAMES[month - 1]} ${year}`;
  };

  if (loading) {
    return (
      <Button variant="outline" disabled className={className}>
        <Calendar className="mr-2 h-4 w-4" />
        Carregando...
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn("min-w-[200px] justify-between", className)}>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              {currentCompetence 
                ? formatCompetence(currentCompetence.year, currentCompetence.month)
                : 'Selecionar Competência'
              }
            </div>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {competences.length === 0 ? (
            <DropdownMenuItem disabled>
              Nenhuma competência criada
            </DropdownMenuItem>
          ) : (
            competences.slice(0, 12).map((competence) => (
              <DropdownMenuItem
                key={competence.id}
                onClick={() => selectCompetence(competence.year, competence.month)}
                className={cn(
                  currentCompetence?.id === competence.id && "bg-primary/10 font-medium"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{formatCompetence(competence.year, competence.month)}</span>
                  {competence.status === 'closed' && (
                    <span className="text-xs text-muted-foreground ml-2">Fechada</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Competência
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Competência</DialogTitle>
            <DialogDescription>
              Selecione o mês e ano para criar uma nova competência.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês</label>
              <Select
                value={String(newMonth)}
                onValueChange={(value) => setNewMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((month, index) => (
                    <SelectItem key={index + 1} value={String(index + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select
                value={String(newYear)}
                onValueChange={(value) => setNewYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCompetence}>
              Criar Competência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
