import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Eye, 
  Heart, 
  Lightbulb, 
  Users,
  TrendingUp,
  TrendingDown,
  Save,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDiagnosis, useSaveDiagnosis } from '@/hooks/useStrategy';
import type { StrategicDiagnosis } from '@/types/strategy';

interface DiagnosisStepProps {
  onNext: () => void;
}

const identityFields = [
  { key: 'mission', label: 'Missão', icon: Building2, placeholder: 'Qual é o propósito fundamental da sua empresa?' },
  { key: 'vision', label: 'Visão', icon: Eye, placeholder: 'Onde você quer chegar nos próximos 3-5 anos?' },
  { key: 'core_values', label: 'Valores', icon: Heart, placeholder: 'Quais princípios guiam suas decisões?' },
  { key: 'value_proposition', label: 'Proposta de Valor', icon: Lightbulb, placeholder: 'O que diferencia você da concorrência?' },
  { key: 'target_audience', label: 'Público-Alvo', icon: Users, placeholder: 'Quem são seus clientes ideais?' },
];

const internalFields = [
  { key: 'internal_financial', label: 'Financeiro', placeholder: 'Forças e fraquezas financeiras...' },
  { key: 'internal_processes', label: 'Processos', placeholder: 'Forças e fraquezas em processos...' },
  { key: 'internal_people', label: 'Pessoas', placeholder: 'Forças e fraquezas da equipe...' },
  { key: 'internal_technology', label: 'Tecnologia', placeholder: 'Forças e fraquezas tecnológicas...' },
  { key: 'internal_commercial', label: 'Comercial', placeholder: 'Forças e fraquezas comerciais...' },
  { key: 'internal_brand', label: 'Marca', placeholder: 'Forças e fraquezas da marca...' },
];

const externalFields = [
  { key: 'external_market', label: 'Mercado', placeholder: 'Oportunidades e ameaças do mercado...' },
  { key: 'external_legislation', label: 'Legislação', placeholder: 'Oportunidades e ameaças regulatórias...' },
  { key: 'external_competition', label: 'Concorrência', placeholder: 'Oportunidades e ameaças competitivas...' },
  { key: 'external_technology', label: 'Tecnologia', placeholder: 'Oportunidades e ameaças tecnológicas...' },
  { key: 'external_economy', label: 'Economia', placeholder: 'Oportunidades e ameaças econômicas...' },
];

export default function DiagnosisStep({ onNext }: DiagnosisStepProps) {
  const { data: diagnosis, isLoading } = useDiagnosis();
  const saveDiagnosis = useSaveDiagnosis();
  
  const [formData, setFormData] = useState<Partial<StrategicDiagnosis>>({});

  useEffect(() => {
    if (diagnosis) {
      setFormData(diagnosis);
    }
  }, [diagnosis]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveDiagnosis.mutate(formData);
  };

  const generateSummary = () => {
    const parts: string[] = [];
    
    if (formData.mission) {
      parts.push(`A empresa tem como missão "${formData.mission}".`);
    }
    if (formData.vision) {
      parts.push(`Sua visão é "${formData.vision}".`);
    }
    
    // Count internal factors
    const strengths = [formData.internal_financial, formData.internal_processes, formData.internal_people, 
                       formData.internal_technology, formData.internal_commercial, formData.internal_brand]
                       .filter(Boolean).length;
    if (strengths > 0) {
      parts.push(`Foram identificados ${strengths} áreas de análise interna.`);
    }
    
    // Count external factors
    const external = [formData.external_market, formData.external_legislation, formData.external_competition,
                      formData.external_technology, formData.external_economy].filter(Boolean).length;
    if (external > 0) {
      parts.push(`O ambiente externo foi analisado em ${external} dimensões.`);
    }
    
    const summary = parts.join(' ') || 'Preencha os campos acima para gerar o resumo estratégico.';
    handleChange('strategic_summary', summary);
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
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identity">Identidade</TabsTrigger>
          <TabsTrigger value="internal">SWOT Interno</TabsTrigger>
          <TabsTrigger value="external">SWOT Externo</TabsTrigger>
        </TabsList>

        {/* Identity Tab */}
        <TabsContent value="identity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Identidade Estratégica
              </CardTitle>
              <CardDescription>
                Defina os elementos fundamentais que guiam sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {identityFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <field.icon className="h-4 w-4 text-muted-foreground" />
                    {field.label}
                  </Label>
                  <Textarea
                    value={(formData as Record<string, string>)[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={2}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internal SWOT Tab */}
        <TabsContent value="internal" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <TrendingDown className="h-5 w-5 text-red-500" />
                Diagnóstico Interno
              </CardTitle>
              <CardDescription>
                Identifique forças e fraquezas em cada área
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {internalFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Textarea
                    value={(formData as Record<string, string>)[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* External SWOT Tab */}
        <TabsContent value="external" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Diagnóstico Externo
              </CardTitle>
              <CardDescription>
                Identifique oportunidades e ameaças do ambiente
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {externalFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Textarea
                    value={(formData as Record<string, string>)[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Strategic Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Mapa Estratégico Atual
          </CardTitle>
          <CardDescription>
            Resumo do cenário estratégico da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={formData.strategic_summary || ''}
            onChange={(e) => handleChange('strategic_summary', e.target.value)}
            placeholder="Resumo do diagnóstico estratégico..."
            rows={4}
          />
          <Button variant="outline" onClick={generateSummary} size="sm">
            <Lightbulb className="h-4 w-4 mr-2" />
            Gerar Resumo Automático
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button onClick={handleSave} disabled={saveDiagnosis.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Diagnóstico
        </Button>
        <Button onClick={onNext} variant="default">
          Próximo: Objetivos
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
