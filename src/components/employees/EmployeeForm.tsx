import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateEmployee } from '@/hooks/useEmployees';

interface EmployeeFormProps {
  onSuccess: () => void;
}

export default function EmployeeForm({ onSuccess }: EmployeeFormProps) {
  const createEmployee = useCreateEmployee();
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'Assistente',
    department: 'Operações',
    hire_date: new Date().toISOString().split('T')[0],
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createEmployee.mutateAsync({
        ...formData,
        is_active: true,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nome do colaborador"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Cargo</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assistente">Assistente</SelectItem>
              <SelectItem value="Analista">Analista</SelectItem>
              <SelectItem value="Contador">Contador</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="Coordenador">Coordenador</SelectItem>
              <SelectItem value="Gerente">Gerente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Departamento</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Operações">Operações</SelectItem>
              <SelectItem value="Fiscal">Fiscal</SelectItem>
              <SelectItem value="Contábil">Contábil</SelectItem>
              <SelectItem value="Pessoal">Pessoal</SelectItem>
              <SelectItem value="Societário">Societário</SelectItem>
              <SelectItem value="Administrativo">Administrativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hire_date">Data de Admissão *</Label>
          <Input
            id="hire_date"
            type="date"
            value={formData.hire_date}
            onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={createEmployee.isPending}>
          {createEmployee.isPending ? 'Salvando...' : 'Cadastrar Colaborador'}
        </Button>
      </div>
    </form>
  );
}
