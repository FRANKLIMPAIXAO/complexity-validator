import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import ClientForm from '@/components/clients/ClientForm';
import { ClientFormData } from '@/types/database';

export default function ClientNew() {
  const navigate = useNavigate();
  const { createClient, isCreating } = useClients();

  const handleSubmit = async (data: ClientFormData) => {
    const client = await createClient(data);
    navigate(`/clients/${client.id}`);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/clients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Cliente</h1>
          <p className="text-muted-foreground">
            Cadastre um novo cliente para análise
          </p>
        </div>
      </div>

      {/* Form */}
      <ClientForm
        onSubmit={handleSubmit}
        isLoading={isCreating}
        submitLabel="Cadastrar Cliente"
      />
    </div>
  );
}
