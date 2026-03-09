import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useOfficeExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense, EXPENSE_CATEGORIES, OfficeExpenseFormData, OfficeExpense } from '@/hooks/useOfficeExpenses';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function Custos() {
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);
  const { data: expenses = [], isLoading } = useOfficeExpenses(filterMonth, filterYear);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OfficeExpense | null>(null);
  const [form, setForm] = useState<OfficeExpenseFormData>({
    category: 'Aluguel',
    value: 0,
    month: currentMonth,
    year: currentYear,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ category: 'Aluguel', value: 0, month: filterMonth, year: filterYear });
    setDialogOpen(true);
  };

  const openEdit = (expense: OfficeExpense) => {
    setEditing(expense);
    setForm({ category: expense.category, description: expense.description || '', value: expense.value, month: expense.month, year: expense.year });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await updateExpense.mutateAsync({ id: editing.id, ...form });
    } else {
      await createExpense.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  const total = expenses.reduce((s, e) => s + e.value, 0);
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Custos do Escritório</h1>
          <p className="text-muted-foreground">Gerencie as despesas operacionais</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Nova Despesa
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={String(filterMonth)} onValueChange={v => setFilterMonth(Number(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(filterYear)} onValueChange={v => setFilterYear(Number(v))}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total do período: {fmt(total)}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : expenses.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma despesa registrada neste período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.category}</TableCell>
                    <TableCell className="text-muted-foreground">{expense.description || '-'}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(expense.value)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(expense)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover despesa?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteExpense.mutate(expense.id)}>Remover</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input type="number" min={0} step={0.01} value={form.value} onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Mês</Label>
                <Select value={String(form.month)} onValueChange={v => setForm(f => ({ ...f, month: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Ano</Label>
                <Select value={String(form.year)} onValueChange={v => setForm(f => ({ ...f, year: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={createExpense.isPending || updateExpense.isPending}>
              {editing ? 'Salvar' : 'Registrar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
