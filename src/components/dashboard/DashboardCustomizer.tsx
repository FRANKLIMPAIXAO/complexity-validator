import { useState } from 'react';
import { Settings2, GripVertical, Eye, EyeOff, RotateCcw, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WidgetConfig } from '@/hooks/useDashboardLayout';
import { cn } from '@/lib/utils';

interface SortableWidgetItemProps {
  widget: WidgetConfig;
  onToggle: (id: string) => void;
}

function SortableWidgetItem({ widget, onToggle }: SortableWidgetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sizeLabels = {
    small: 'P',
    medium: 'M',
    large: 'G',
  };

  const sizeColors = {
    small: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-purple-500/20 text-purple-400',
    large: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-transparent transition-colors',
        isDragging && 'opacity-50 border-primary',
        !widget.enabled && 'opacity-60'
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">
            {widget.title}
          </span>
          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', sizeColors[widget.size])}>
            {sizeLabels[widget.size]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{widget.description}</p>
      </div>

      <Switch
        checked={widget.enabled}
        onCheckedChange={() => onToggle(widget.id)}
        aria-label={`${widget.enabled ? 'Ocultar' : 'Exibir'} ${widget.title}`}
      />
    </div>
  );
}

interface DashboardCustomizerProps {
  widgets: WidgetConfig[];
  onToggle: (id: string) => void;
  onReorder: (newOrder: string[]) => void;
  onReset: () => void;
}

export function DashboardCustomizer({
  widgets,
  onToggle,
  onReorder,
  onReset,
}: DashboardCustomizerProps) {
  const [open, setOpen] = useState(false);
  const [localWidgets, setLocalWidgets] = useState(widgets);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localWidgets.findIndex((w) => w.id === active.id);
      const newIndex = localWidgets.findIndex((w) => w.id === over.id);
      
      const newWidgets = arrayMove(localWidgets, oldIndex, newIndex);
      setLocalWidgets(newWidgets);
      onReorder(newWidgets.map((w) => w.id));
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLocalWidgets(widgets);
    }
    setOpen(isOpen);
  };

  const enabledCount = widgets.filter((w) => w.enabled).length;
  const totalCount = widgets.length;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Personalizar
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Personalizar Dashboard
          </SheetTitle>
          <SheetDescription>
            Arraste para reorganizar e use os switches para mostrar/ocultar widgets.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{enabledCount}</span> de {totalCount} widgets visíveis
            </div>
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 text-xs">
              <RotateCcw className="h-3 w-3" />
              Restaurar
            </Button>
          </div>

          <Separator className="mb-4" />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localWidgets.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {localWidgets.map((widget) => (
                  <SortableWidgetItem
                    key={widget.id}
                    widget={widget}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <SheetFooter className="mt-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 text-[10px]">P</Badge>
              <span>Pequeno - Cards de estatística</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 text-[10px]">M</Badge>
              <span>Médio - Gráficos e listas</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-500/20 text-orange-400 text-[10px]">G</Badge>
              <span>Grande - Informações detalhadas</span>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
