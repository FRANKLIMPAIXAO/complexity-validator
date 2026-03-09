import { useState } from 'react';
import { FileDown, FileText, Users, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useClients } from '@/hooks/useClients';
import { useEmployees, useEmployeeMetrics } from '@/hooks/useEmployees';
import { generateClientReport, generateEmployeeReport, generateCompleteReport } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

interface ExportPDFButtonProps {
  type?: 'clients' | 'employees' | 'all';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportPDFButton({ type = 'all', variant = 'outline', size = 'default' }: ExportPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { clients } = useClients();
  const { data: employees = [] } = useEmployees();
  const { data: metrics = [] } = useEmployeeMetrics();

  const handleExportClients = async () => {
    if (clients.length === 0) {
      toast.error('Nenhum cliente cadastrado para exportar');
      return;
    }

    setIsGenerating(true);
    try {
      generateClientReport(clients);
      toast.success('Relatório de clientes exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportEmployees = async () => {
    if (employees.length === 0) {
      toast.error('Nenhum colaborador cadastrado para exportar');
      return;
    }

    setIsGenerating(true);
    try {
      generateEmployeeReport(employees, metrics);
      toast.success('Relatório de colaboradores exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportComplete = async () => {
    if (clients.length === 0 && employees.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    setIsGenerating(true);
    try {
      generateCompleteReport(clients, employees, metrics);
      toast.success('Relatório completo exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  // Single export button for specific type
  if (type === 'clients') {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleExportClients}
        disabled={isGenerating || clients.length === 0}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4 mr-2" />
        )}
        Exportar PDF
      </Button>
    );
  }

  if (type === 'employees') {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleExportEmployees}
        disabled={isGenerating || employees.length === 0}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4 mr-2" />
        )}
        Exportar PDF
      </Button>
    );
  }

  // Dropdown with all options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          Exportar PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Escolha o relatório</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportClients} disabled={clients.length === 0}>
          <Building2 className="h-4 w-4 mr-2" />
          Relatório de Clientes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportEmployees} disabled={employees.length === 0}>
          <Users className="h-4 w-4 mr-2" />
          Relatório de Colaboradores
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportComplete} disabled={clients.length === 0 && employees.length === 0}>
          <FileText className="h-4 w-4 mr-2" />
          Relatório Completo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
