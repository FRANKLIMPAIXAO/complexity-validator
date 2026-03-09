import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface WidgetConfig {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
  order: number;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  lastUpdated: string;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'total-clients',
    title: 'Total de Clientes',
    description: 'Quantidade de clientes cadastrados',
    enabled: true,
    size: 'small',
    order: 0,
  },
  {
    id: 'underpriced-alerts',
    title: 'Alertas de Subprecificação',
    description: 'Clientes com preço abaixo do recomendado',
    enabled: true,
    size: 'small',
    order: 1,
  },
  {
    id: 'avg-complexity',
    title: 'Score Médio',
    description: 'Complexidade média dos clientes',
    enabled: true,
    size: 'small',
    order: 2,
  },
  {
    id: 'employee-count',
    title: 'Total de Colaboradores',
    description: 'Quantidade de colaboradores ativos',
    enabled: true,
    size: 'small',
    order: 3,
  },
  {
    id: 'high-performers',
    title: 'Alto Desempenho',
    description: 'Colaboradores com alto desempenho',
    enabled: true,
    size: 'small',
    order: 4,
  },
  {
    id: 'at-risk',
    title: 'Risco Operacional',
    description: 'Colaboradores em risco operacional',
    enabled: true,
    size: 'small',
    order: 5,
  },
  {
    id: 'complexity-distribution',
    title: 'Distribuição por Complexidade',
    description: 'Gráfico de distribuição de clientes por complexidade',
    enabled: true,
    size: 'medium',
    order: 6,
  },
  {
    id: 'plan-distribution',
    title: 'Distribuição por Plano',
    description: 'Gráfico de distribuição de clientes por plano',
    enabled: true,
    size: 'medium',
    order: 7,
  },
  {
    id: 'underprice-list',
    title: 'Lista de Subprecificação',
    description: 'Clientes com alerta de subprecificação',
    enabled: true,
    size: 'medium',
    order: 8,
  },
  {
    id: 'performance-overview',
    title: 'Visão Geral de Performance',
    description: 'Resumo da performance da equipe',
    enabled: true,
    size: 'medium',
    order: 9,
  },
  {
    id: 'recent-activity',
    title: 'Atividade Recente',
    description: 'Últimas ações no sistema',
    enabled: false,
    size: 'medium',
    order: 10,
  },
  {
    id: 'monthly-revenue',
    title: 'Faturamento Mensal',
    description: 'Total de honorários dos clientes',
    enabled: true,
    size: 'small',
    order: 11,
  },
  {
    id: 'quick-info',
    title: 'Sobre o Score',
    description: 'Explicação sobre o score de complexidade',
    enabled: true,
    size: 'large',
    order: 12,
  },
];

const STORAGE_KEY = 'cortexcont-dashboard-layout';

export function useDashboardLayout() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isLoading, setIsLoading] = useState(true);

  // Load layout from localStorage
  useEffect(() => {
    if (user) {
      const storageKey = `${STORAGE_KEY}-${user.id}`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        try {
          const layout: DashboardLayout = JSON.parse(saved);
          // Merge with defaults to handle new widgets
          const mergedWidgets = DEFAULT_WIDGETS.map((defaultWidget) => {
            const savedWidget = layout.widgets.find((w) => w.id === defaultWidget.id);
            return savedWidget 
              ? { ...defaultWidget, ...savedWidget }
              : defaultWidget;
          });
          setWidgets(mergedWidgets.sort((a, b) => a.order - b.order));
        } catch (e) {
          console.error('Error parsing dashboard layout:', e);
          setWidgets(DEFAULT_WIDGETS);
        }
      }
    }
    setIsLoading(false);
  }, [user]);

  // Save layout to localStorage
  const saveLayout = (newWidgets: WidgetConfig[]) => {
    if (user) {
      const storageKey = `${STORAGE_KEY}-${user.id}`;
      const layout: DashboardLayout = {
        widgets: newWidgets,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(layout));
    }
    setWidgets(newWidgets);
  };

  const toggleWidget = (widgetId: string) => {
    const newWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    saveLayout(newWidgets);
  };

  const reorderWidgets = (startIndex: number, endIndex: number) => {
    const result = Array.from(widgets);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update order values
    const reordered = result.map((widget, index) => ({
      ...widget,
      order: index,
    }));
    
    saveLayout(reordered);
  };

  const updateWidgetOrder = (newOrder: string[]) => {
    const reordered = newOrder.map((id, index) => {
      const widget = widgets.find((w) => w.id === id);
      return widget ? { ...widget, order: index } : null;
    }).filter(Boolean) as WidgetConfig[];
    
    saveLayout(reordered);
  };

  const resetLayout = () => {
    saveLayout(DEFAULT_WIDGETS);
  };

  const enabledWidgets = widgets.filter((w) => w.enabled).sort((a, b) => a.order - b.order);
  const smallWidgets = enabledWidgets.filter((w) => w.size === 'small');
  const mediumWidgets = enabledWidgets.filter((w) => w.size === 'medium');
  const largeWidgets = enabledWidgets.filter((w) => w.size === 'large');

  return {
    widgets,
    enabledWidgets,
    smallWidgets,
    mediumWidgets,
    largeWidgets,
    isLoading,
    toggleWidget,
    reorderWidgets,
    updateWidgetOrder,
    resetLayout,
  };
}
