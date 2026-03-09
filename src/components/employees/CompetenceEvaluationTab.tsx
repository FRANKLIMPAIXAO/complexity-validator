import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Brain, Plus } from 'lucide-react';
import { useCompetenceEvaluations, useCreateCompetenceEvaluation, EmployeeCompetenceEvaluation } from '@/hooks/useEmployeeEvaluations';

interface CompetenceEvaluationTabProps {
  employeeId: string;
}

const EVALUATOR_TYPES = [
  { value: 'gestor', label: 'Gestor' },
  { value: 'autoavaliacao', label: 'Autoavaliação' },
  { value: 'par', label: 'Par (Colega)' },
  { value: 'subordinado', label: 'Subordinado' },
  { value: 'cliente', label: 'Cliente' },
];

const COMPETENCE_LABELS: Record<string, string> = {
  responsabilidade: 'Responsabilidade',
  comunicacao: 'Comunicação',
  organizacao: 'Organização',
  proatividade: 'Proatividade',
  trabalho_equipe: 'Trabalho em Equipe',
  lideranca: 'Liderança',
};

export default function CompetenceEvaluationTab({ employeeId }: CompetenceEvaluationTabProps) {
  const { data: evaluations = [] } = useCompetenceEvaluations(employeeId);
  const createEvaluation = useCreateCompetenceEvaluation();
  const [showForm, setShowForm] = useState(false);

  const now = new Date();
  const [form, setForm] = useState({
    evaluator_type: 'gestor',
    period_month: now.getMonth() + 1,
    period_year: now.getFullYear(),
    conhecimento_score: 3,
    habilidade_score: 3,
    atitude_score: 3,
    responsabilidade: 3,
    comunicacao: 3,
    organizacao: 3,
    proatividade: 3,
    trabalho_equipe: 3,
    lideranca: 3,
    comments: '',
  });

  const handleSubmit = async () => {
    await createEvaluation.mutateAsync({
      employee_id: employeeId,
      ...form,
      comments: form.comments || undefined,
    });
    setShowForm(false);
  };

  const getRadarData = (ev: EmployeeCompetenceEvaluation) => [
    { subject: 'Responsabilidade', value: ev.responsabilidade },
    { subject: 'Comunicação', value: ev.comunicacao },
    { subject: 'Organização', value: ev.organizacao },
    { subject: 'Proatividade', value: ev.proatividade },
    { subject: 'Trabalho em Equipe', value: ev.trabalho_equipe },
    { subject: 'Liderança', value: ev.lideranca },
  ];

  const latestEval = evaluations[0];
  const chaAvg = latestEval
    ? ((latestEval.conhecimento_score + latestEval.habilidade_score + latestEval.atitude_score) / 3).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Avaliação de Competências
        </h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Avaliação
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Select value={form.evaluator_type} onValueChange={v => setForm({ ...form, evaluator_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVALUATOR_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(form.period_month)} onValueChange={v => setForm({ ...form, period_month: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {new Date(2024, i).toLocaleString('pt-BR', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(form.period_year)} onValueChange={v => setForm({ ...form, period_year: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CHA */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">CHA (Conhecimento, Habilidade, Atitude)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'conhecimento_score' as const, label: 'Conhecimento' },
                  { key: 'habilidade_score' as const, label: 'Habilidade' },
                  { key: 'atitude_score' as const, label: 'Atitude' },
                ].map(item => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-bold">{form[item.key]}/5</span>
                    </div>
                    <Slider
                      value={[form[item.key]]}
                      onValueChange={([v]) => setForm({ ...form, [item.key]: v })}
                      min={1} max={5} step={1}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Competências */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Competências Comportamentais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.keys(COMPETENCE_LABELS) as (keyof typeof COMPETENCE_LABELS)[]).map(key => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{COMPETENCE_LABELS[key]}</span>
                      <span className="font-bold">{form[key as keyof typeof form] as number}/5</span>
                    </div>
                    <Slider
                      value={[form[key as keyof typeof form] as number]}
                      onValueChange={([v]) => setForm({ ...form, [key]: v })}
                      min={1} max={5} step={1}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Textarea
              placeholder="Comentários adicionais..."
              value={form.comments}
              onChange={e => setForm({ ...form, comments: e.target.value })}
            />

            <Button onClick={handleSubmit} disabled={createEvaluation.isPending} className="w-full">
              Registrar Avaliação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Latest evaluation radar chart */}
      {latestEval && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Última Avaliação ({latestEval.period_month}/{latestEval.period_year})</CardTitle>
              <Badge variant="outline">
                {EVALUATOR_TYPES.find(t => t.value === latestEval.evaluator_type)?.label || latestEval.evaluator_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={getRadarData(latestEval)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9 }} />
                    <Radar name="Competências" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">CHA - Média</p>
                  <p className="text-2xl font-bold">{chaAvg}<span className="text-sm text-muted-foreground">/5</span></p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-lg font-bold">{latestEval.conhecimento_score}</p>
                    <p className="text-[10px] text-muted-foreground">Conhecimento</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-lg font-bold">{latestEval.habilidade_score}</p>
                    <p className="text-[10px] text-muted-foreground">Habilidade</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-lg font-bold">{latestEval.atitude_score}</p>
                    <p className="text-[10px] text-muted-foreground">Atitude</p>
                  </div>
                </div>
                {latestEval.comments && (
                  <p className="text-xs text-muted-foreground italic">{latestEval.comments}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {evaluations.length > 1 && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Histórico</h4>
          {evaluations.slice(1).map(ev => (
            <Card key={ev.id} className="mb-2 opacity-75">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{ev.period_month}/{ev.period_year}</span>
                  <Badge variant="outline" className="text-xs">
                    {EVALUATOR_TYPES.find(t => t.value === ev.evaluator_type)?.label}
                  </Badge>
                  <span className="text-muted-foreground">
                    CHA: {((ev.conhecimento_score + ev.habilidade_score + ev.atitude_score) / 3).toFixed(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {evaluations.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">Nenhuma avaliação de competências registrada</p>
      )}
    </div>
  );
}
