import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/database';
import { formatCurrency } from '@/lib/scoreCalculator';
import ComplexityBadge from '@/components/score/ComplexityBadge';
import { cn } from '@/lib/utils';

interface UnderpriceListProps {
  clients: Client[];
  className?: string;
}

export default function UnderpriceList({ clients, className }: UnderpriceListProps) {
  const underpricedClients = clients.filter((c) => c.is_underpriced).slice(0, 5);

  if (underpricedClients.length === 0) {
    return (
      <Card className={cn('bg-card border-border', className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alertas de Subprecificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum cliente com alerta de subprecificação.</p>
            <p className="text-sm mt-1">Continue cadastrando clientes para análise.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Alertas de Subprecificação ({underpricedClients.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {underpricedClients.map((client) => (
          <Link
            key={client.id}
            to={`/clients/${client.id}`}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="space-y-1">
              <p className="font-medium text-foreground">{client.name}</p>
              <div className="flex items-center gap-2 text-sm">
                <ComplexityBadge level={client.complexity_level} size="sm" />
                <span className="text-muted-foreground">
                  Cobrando: {formatCurrency(client.current_fee)}
                </span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}

        {clients.filter((c) => c.is_underpriced).length > 5 && (
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/clients?filter=underpriced">
              Ver todos os alertas
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
