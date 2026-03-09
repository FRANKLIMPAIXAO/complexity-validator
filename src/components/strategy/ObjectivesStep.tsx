import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit2,
  ArrowRight,
  DollarSign,
  ShoppingCart,
  Megaphone,
  Settings,
  Users,
  Cpu,
  Shield,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from '@/hooks/useStrategy';
import { PILLAR_LABELS, type StrategicPillar, type StrategicObjective } from '@/types/strategy';

interface ObjectivesStepProps {
  onNext: () => void;
}

const pillarIcons: Record<StrategicPillar, React.ElementType> = {
  financeiro: DollarSign,
  comercial: ShoppingCart,
  marketing: Megaphone,
  operacoes: Settings,
  pessoas: Users,
  tecnologia: Cpu,
  compliance: Shield,
};

const pillarColors: Record<StrategicPillar, string> = {
  financeiro: 'bg-green-500/10 text-green-500 border-green-500/20',
  comercial: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  marketing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  operacoes: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  pessoas: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  tecnologia: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  compliance: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function ObjectivesStep({ onNext }: ObjectivesStepProps) {
  const { data: objectives = [], isLoading } = useObjectives();
  const createObjective = useCreateObjective();
  const updateObjective = useUpdateObjective();
  const deleteObjective = useDeleteObjective();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<StrategicObjective | null>(null);
  const [formData, setFormData] = useState({
    pillar: '' as StrategicPillar,
    objective: '',
    justification: '',
    expected_impact: '',
  });

  const objectivesByPillar = objectives.reduce((acc, obj) => {
    if (!acc[obj.pillar]) acc[obj.pillar] = [];
    acc[obj.pillar].push(obj);
    return acc;
  }, {} as Record<StrategicPillar, StrategicObjective[]>);

  const handleSubmit = () => {
    if (!formData.pillar || !formData.objective) return;

    // Check max 5 per pillar
    const currentCount = objectivesByPillar[formData.pillar]?.length || 0;
    if (!editingObjective && currentCount >= 5) {
      return;
    }

    if (editingObjective) {
      updateObjective.mutate({ id: editingObjective.id, ...formData });
    } else {
      createObjective.mutate(formData);
    }
    
    setIsDialogOpen(false);
    setEditingObjective(null);
    setFormData({ pillar: '' as StrategicPillar, objective: '', justification: '', expected_impact: '' });
  };

  const handleEdit = (obj: StrategicObjective) => {
    setEditingObjective(obj);
    setFormData({
      pillar: obj.pillar,
      objective: obj.objective,
      justification: obj.justification || '',
      expected_impact: obj.expected_impact || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteObjective.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Objetivos Estratégicos</h3>
          <p className="text-sm text-muted-foreground">
            Máximo de 5 objetivos por pilar. Objetivo é direção, não número.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingObjective(null);
              setFormData({ pillar: '' as StrategicPillar, objective: '', justification: '', expected_impact: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Objetivo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingObjective ? 'Editar Objetivo' : 'Novo Objetivo Estratégico'}</DialogTitle>
              <DialogDescription>
                Defina um objetivo claro e sua justificativa estratégica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pilar Estratégico</Label>
                <Select
                  value={formData.pillar}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, pillar: v as StrategicPillar }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pilar" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PILLAR_LABELS) as StrategicPillar[]).map((pillar) => {
                      const Icon = pillarIcons[pillar];
                      const count = objectivesByPillar[pillar]?.length || 0;
                      return (
                        <SelectItem key={pillar} value={pillar} disabled={count >= 5 && !editingObjective}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {PILLAR_LABELS[pillar]}
                            {count > 0 && <span className="text-xs text-muted-foreground">({count}/5)</span>}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Objetivo Estratégico</Label>
                <Input
                  value={formData.objective}
                  onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
                  placeholder="Ex: Aumentar a recorrência de receita"
                />
              </div>

              <div className="space-y-2">
                <Label>Justificativa</Label>
                <Textarea
                  value={formData.justification}
                  onChange={(e) => setFormData((prev) => ({ ...prev, justification: e.target.value }))}
                  placeholder="Por que este objetivo é importante?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Impacto Esperado</Label>
                <Textarea
                  value={formData.expected_impact}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expected_impact: e.target.value }))}
                  placeholder="Qual resultado você espera alcançar?"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.pillar || !formData.objective}>
                  <Check className="h-4 w-4 mr-2" />
                  {editingObjective ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Objectives by Pillar */}
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(PILLAR_LABELS) as StrategicPillar[]).map((pillar) => {
          const Icon = pillarIcons[pillar];
          const pillarObjectives = objectivesByPillar[pillar] || [];
          
          return (
            <Card key={pillar} className={pillarObjectives.length > 0 ? '' : 'opacity-60'}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg border ${pillarColors[pillar]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {PILLAR_LABELS[pillar]}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pillarObjectives.length}/5
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pillarObjectives.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum objetivo definido
                  </p>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {pillarObjectives.map((obj) => (
                        <motion.div
                          key={obj.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-3 bg-muted/50 rounded-lg group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{obj.objective}</p>
                              {obj.justification && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {obj.justification}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEdit(obj)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDelete(obj.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onNext}>
          Próximo: Metas
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
