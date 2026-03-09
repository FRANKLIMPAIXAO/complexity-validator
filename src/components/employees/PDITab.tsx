import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useEmployeePDI, useCreateEmployeePDI, useUpdateEmployeePDI, useDeleteEmployeePDI } from '@/hooks/useEmployeeEvaluations';

interface PDITabProps {
  employeeId: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-muted text-muted-foreground' },
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-500 text-white' },
  concluido: { label: 'Concluído', color: 'bg-green-500 text-white' },
};

export default function PDITab({ employeeId }: PDITabProps) {
  const { data: pdis = [] } = useEmployeePDI(employeeId);
  const createPDI = useCreateEmployeePDI();
  const updatePDI = useUpdateEmployeePDI();
  const deletePDI = useDeleteEmployeePDI();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    ponto_forte: '',
    ponto_melhoria: '',
    acao_pratica: '',
    deadline: '',
    responsavel: '',
  });

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    await createPDI.mutateAsync({
      employee_id: employeeId,
      title: form.title,
      ponto_forte: form.ponto_forte || undefined,
      ponto_melhoria: form.ponto_melhoria || undefined,
      acao_pratica: form.acao_pratica || undefined,
      deadline: form.deadline || undefined,
      responsavel: form.responsavel || undefined,
      status: 'pendente',
    });
    setForm({ title: '', ponto_forte: '', ponto_melhoria: '', acao_pratica: '', deadline: '', responsavel: '' });
    setShowForm(false);
  };

  const active = pdis.filter(p => p.status !== 'concluido');
  const completed = pdis.filter(p => p.status === 'concluido');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Plano de Desenvolvimento Individual (PDI)
        </h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Novo PDI
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Título do PDI" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="🌟 Ponto Forte: descreva o que o colaborador faz bem..." value={form.ponto_forte} onChange={e => setForm({ ...form, ponto_forte: e.target.value })} />
            <Textarea placeholder="📈 Ponto de Melhoria: o que precisa desenvolver..." value={form.ponto_melhoria} onChange={e => setForm({ ...form, ponto_melhoria: e.target.value })} />
            <Textarea placeholder="🎯 Ação Prática: o que será feito concretamente..." value={form.acao_pratica} onChange={e => setForm({ ...form, acao_pratica: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              <Input placeholder="Responsável" value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} />
            </div>
            <Button onClick={handleSubmit} disabled={createPDI.isPending || !form.title.trim()} className="w-full">
              Criar PDI
            </Button>
          </CardContent>
        </Card>
      )}

      {active.length === 0 && completed.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">Nenhum PDI cadastrado</p>
      )}

      {active.map(pdi => {
        const st = STATUS_MAP[pdi.status] || STATUS_MAP.pendente;
        return (
          <Card key={pdi.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{pdi.title}</h4>
                    <Badge className={st.color}>{st.label}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Select value={pdi.status} onValueChange={v => updatePDI.mutate({ id: pdi.id, status: v })}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deletePDI.mutate(pdi.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {pdi.ponto_forte && (
                  <div className="p-2 rounded bg-green-500/10">
                    <span className="font-medium text-green-600">🌟 Ponto Forte:</span> {pdi.ponto_forte}
                  </div>
                )}
                {pdi.ponto_melhoria && (
                  <div className="p-2 rounded bg-amber-500/10">
                    <span className="font-medium text-amber-600">📈 Ponto de Melhoria:</span> {pdi.ponto_melhoria}
                  </div>
                )}
                {pdi.acao_pratica && (
                  <div className="p-2 rounded bg-blue-500/10">
                    <span className="font-medium text-blue-600">🎯 Ação Prática:</span> {pdi.acao_pratica}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {pdi.deadline && <span>Prazo: {new Date(pdi.deadline).toLocaleDateString('pt-BR')}</span>}
                {pdi.responsavel && <span>Responsável: {pdi.responsavel}</span>}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {completed.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Concluídos</h4>
          {completed.map(pdi => (
            <Card key={pdi.id} className="mb-2 opacity-60">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{pdi.title}</span>
                  <Badge className="bg-green-500 text-white">Concluído</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
