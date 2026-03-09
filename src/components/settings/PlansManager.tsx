import { useState } from 'react';
import { useClientPlans } from '@/hooks/useClientPlans';
import { ClientPlan, ClientPlanFormData, PLAN_COLOR_OPTIONS } from '@/types/clientPlan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Loader2, Layers } from 'lucide-react';
import PlanBadge from '@/components/clients/PlanBadge';

export default function PlansManager() {
  const { plans, isLoading, createPlan, updatePlan, deletePlan, isCreating, isUpdating, isDeleting } = useClientPlans();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ClientPlan | null>(null);
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<ClientPlan | null>(null);
  
  const [formData, setFormData] = useState<ClientPlanFormData>({
    name: '',
    color: '#3B82F6',
    description: '',
    is_default: false,
    default_fee: null,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
      description: '',
      is_default: false,
      default_fee: null,
    });
    setEditingPlan(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (plan: ClientPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      color: plan.color,
      description: plan.description || '',
      is_default: plan.is_default,
      default_fee: plan.default_fee,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingPlan) {
        await updatePlan({ id: editingPlan.id, formData });
      } else {
        await createPlan(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmPlan) return;
    
    try {
      await deletePlan(deleteConfirmPlan.id);
      setDeleteConfirmPlan(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Planos de Clientes
            </CardTitle>
            <CardDescription>
              Gerencie os planos disponíveis para categorizar seus clientes
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum plano cadastrado ainda.</p>
            <p className="text-sm mt-1">Crie seu primeiro plano para categorizar clientes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <PlanBadge plan={plan} size="default" />
                  {plan.default_fee != null && (
                    <span className="text-sm text-muted-foreground">
                      R$ {plan.default_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {plan.description && (
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      {plan.description}
                    </span>
                  )}
                  {plan.is_default && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Padrão
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(plan)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirmPlan(plan)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan 
                ? 'Atualize as informações do plano'
                : 'Crie um novo plano para categorizar clientes'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Premium, Gold, Básico..."
              />
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {PLAN_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color.value
                        ? 'ring-2 ring-offset-2 ring-primary scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Prévia: <PlanBadge plan={{ ...formData, id: '', company_id: '', sort_order: 0, created_at: '', updated_at: '' } as ClientPlan} size="sm" />
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva as características deste plano..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_fee">Honorário Padrão (R$) - opcional</Label>
              <Input
                id="default_fee"
                type="number"
                step="0.01"
                value={formData.default_fee ?? ''}
                onChange={(e) => setFormData({ ...formData, default_fee: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Ex: 800.00"
              />
              <p className="text-xs text-muted-foreground">
                Valor sugerido ao selecionar este plano no cadastro do cliente
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Plano Padrão</Label>
                <p className="text-sm text-muted-foreground">
                  Usado automaticamente para novos clientes
                </p>
              </div>
              <Switch
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.name.trim() || isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingPlan ? 'Salvar' : 'Criar Plano'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmPlan} onOpenChange={() => setDeleteConfirmPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Plano</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o plano "{deleteConfirmPlan?.name}"?
              Clientes associados a este plano ficarão sem plano definido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
