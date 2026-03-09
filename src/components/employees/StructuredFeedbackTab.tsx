import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus } from 'lucide-react';
import { useCreateEmployeeFeedback, useEmployeeFeedback } from '@/hooks/useEmployees';
import type { EmployeeFeedback } from '@/types/employee';

interface StructuredFeedbackTabProps {
  employeeId: string;
}

export default function StructuredFeedbackTab({ employeeId }: StructuredFeedbackTabProps) {
  const { data: feedback = [] } = useEmployeeFeedback(employeeId);
  const createFeedback = useCreateEmployeeFeedback();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    working: '',
    improve: '',
    impact: '',
    next_step: '',
  });

  const handleSubmit = async () => {
    if (!form.working || !form.improve || !form.impact || !form.next_step) return;

    const comment = [
      `✅ O que está funcionando:\n${form.working}`,
      `⚠️ O que precisa melhorar:\n${form.improve}`,
      `📊 Impacto do comportamento:\n${form.impact}`,
      `🎯 Ajuste esperado / Próximo passo:\n${form.next_step}`,
    ].join('\n\n');

    await createFeedback.mutateAsync({
      employee_id: employeeId,
      feedback_type: 'gestor',
      rating: 3,
      comment,
      created_by: 'Gestor',
    });
    setForm({ working: '', improve: '', impact: '', next_step: '' });
    setShowForm(false);
  };

  // Parse structured feedback sections
  const parseSections = (comment: string) => {
    const sections: { icon: string; title: string; content: string }[] = [];
    const parts = comment.split('\n\n');
    for (const part of parts) {
      if (part.startsWith('✅')) sections.push({ icon: '✅', title: 'O que está funcionando', content: part.replace(/^✅.*:\n?/, '') });
      else if (part.startsWith('⚠️')) sections.push({ icon: '⚠️', title: 'O que precisa melhorar', content: part.replace(/^⚠️.*:\n?/, '') });
      else if (part.startsWith('📊')) sections.push({ icon: '📊', title: 'Impacto do comportamento', content: part.replace(/^📊.*:\n?/, '') });
      else if (part.startsWith('🎯')) sections.push({ icon: '🎯', title: 'Ajuste esperado', content: part.replace(/^🎯.*:\n?/, '') });
    }
    return sections;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Feedback Estruturado (4 Etapas)
        </h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Feedback
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <label className="text-sm font-medium flex items-center gap-1 mb-1">
                ✅ O que está funcionando
              </label>
              <Textarea
                placeholder="Descreva os comportamentos e resultados positivos..."
                value={form.working}
                onChange={e => setForm({ ...form, working: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1 mb-1">
                ⚠️ O que precisa melhorar
              </label>
              <Textarea
                placeholder="Indique os pontos de atenção ou comportamentos a ajustar..."
                value={form.improve}
                onChange={e => setForm({ ...form, improve: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1 mb-1">
                📊 Impacto do comportamento
              </label>
              <Textarea
                placeholder="Explique como isso afeta a equipe, clientes ou resultados..."
                value={form.impact}
                onChange={e => setForm({ ...form, impact: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-1 mb-1">
                🎯 Ajuste esperado / Próximo passo
              </label>
              <Textarea
                placeholder="Defina o que espera que mude e o próximo passo concreto..."
                value={form.next_step}
                onChange={e => setForm({ ...form, next_step: e.target.value })}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={createFeedback.isPending || !form.working || !form.improve || !form.impact || !form.next_step}
              className="w-full"
            >
              Registrar Feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {feedback.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">Nenhum feedback registrado</p>
      )}

      {feedback.map(f => {
        const sections = parseSections(f.comment || '');
        const isStructured = sections.length >= 3;

        return (
          <Card key={f.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {f.feedback_type === 'gestor' ? 'Gestor' : f.feedback_type === 'cliente' ? 'Cliente' : 'Auto'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(f.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {isStructured ? (
                <div className="space-y-2">
                  {sections.map((s, i) => (
                    <div key={i} className="p-2 rounded bg-muted/30">
                      <p className="text-xs font-medium mb-0.5">{s.icon} {s.title}</p>
                      <p className="text-sm">{s.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{f.comment}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
