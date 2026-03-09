import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import ClientForm from '@/components/clients/ClientForm';
import { Client, ClientFormData } from '@/types/database';

export default function ClientEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClientById, updateClient, isUpdating } = useClients();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClient() {
      if (!id) return;
      try {
        const data = await getClientById(id);
        setClient(data);
      } catch (error) {
        console.error('Error loading client:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadClient();
  }, [id, getClientById]);

  const handleSubmit = async (data: ClientFormData) => {
    if (!id) return;
    await updateClient({ id, formData: data });
    navigate(`/clients/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="ghost" className="mt-4" asChild>
          <Link to="/clients">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const initialData: ClientFormData = {
    name: client.name,
    tax_regime: client.tax_regime,
    monthly_entries: client.monthly_entries,
    monthly_revenue: Number(client.monthly_revenue),
    employees_count: client.employees_count,
    monthly_hires: client.monthly_hires,
    monthly_terminations: client.monthly_terminations,
    current_fee: Number(client.current_fee),
    monthly_invoices: (client as any).monthly_invoices || 0,
    has_tax_substitution: (client as any).has_tax_substitution || false,
    has_import_operations: (client as any).has_import_operations || false,
    is_ecommerce: (client as any).is_ecommerce || false,
    complex_payroll: (client as any).complex_payroll || false,
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/clients/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Cliente</h1>
          <p className="text-muted-foreground">{client.name}</p>
        </div>
      </div>

      {/* Form */}
      <ClientForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
        submitLabel="Salvar Alterações"
      />
    </div>
  );
}
