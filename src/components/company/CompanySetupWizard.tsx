import React, { useState } from 'react';
import { Building2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

export function CompanySetupWizard() {
  const { createCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    tax_regime: 'simples' as 'simples' | 'presumido' | 'real',
    responsible_name: '',
    responsible_email: '',
  });

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.razao_social || !formData.cnpj) {
      toast.error('Razão Social e CNPJ são obrigatórios');
      return;
    }

    setLoading(true);
    const { error } = await createCompany({
      ...formData,
      cnpj: formData.cnpj.replace(/\D/g, ''),
    });

    if (error) {
      toast.error('Erro ao criar empresa: ' + error.message);
    } else {
      toast.success('Empresa criada com sucesso!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configure sua Empresa</CardTitle>
          <CardDescription>
            Preencha os dados da sua empresa para começar a usar o CORTEXCONT
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="razao_social">Razão Social *</Label>
              <Input
                id="razao_social"
                value={formData.razao_social}
                onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                placeholder="Empresa Contábil LTDA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                placeholder="Contabilidade XYZ"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_regime">Regime Tributário</Label>
                <Select
                  value={formData.tax_regime}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tax_regime: value as 'simples' | 'presumido' | 'real' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simples">Simples Nacional</SelectItem>
                    <SelectItem value="presumido">Lucro Presumido</SelectItem>
                    <SelectItem value="real">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_name">Responsável</Label>
              <Input
                id="responsible_name"
                value={formData.responsible_name}
                onChange={(e) => setFormData(prev => ({ ...prev, responsible_name: e.target.value }))}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_email">E-mail do Responsável</Label>
              <Input
                id="responsible_email"
                type="email"
                value={formData.responsible_email}
                onChange={(e) => setFormData(prev => ({ ...prev, responsible_email: e.target.value }))}
                placeholder="responsavel@empresa.com"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Criar Empresa
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
