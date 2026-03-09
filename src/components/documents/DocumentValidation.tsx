import React, { useState } from 'react';
import { CheckCircle, X, Save, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDocuments } from '@/hooks/useDocuments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Document } from '@/types/company';

interface DocumentValidationProps {
  document: Document;
  onClose: () => void;
  onValidated: () => void;
}

interface PayrollData {
  employees_count: number;
  total_payroll: number;
  total_charges: number;
  hires_count: number;
  terminations_count: number;
}

interface PgdasData {
  period_revenue: number;
  accumulated_revenue: number;
  simples_anexo: string;
  das_value: number;
}

export function DocumentValidation({ document, onClose, onValidated }: DocumentValidationProps) {
  const { validateDocument } = useDocuments();
  const [saving, setSaving] = useState(false);

  const extractedData = document.extracted_data as Record<string, unknown>;
  
  const [payrollData, setPayrollData] = useState<PayrollData>({
    employees_count: (extractedData?.employees_count as number) || 0,
    total_payroll: (extractedData?.total_payroll as number) || 0,
    total_charges: (extractedData?.total_charges as number) || 0,
    hires_count: (extractedData?.hires_count as number) || 0,
    terminations_count: (extractedData?.terminations_count as number) || 0,
  });

  const [pgdasData, setPgdasData] = useState<PgdasData>({
    period_revenue: (extractedData?.period_revenue as number) || 0,
    accumulated_revenue: (extractedData?.accumulated_revenue as number) || 0,
    simples_anexo: (extractedData?.simples_anexo as string) || '',
    das_value: (extractedData?.das_value as number) || 0,
  });

  const isPayroll = document.document_type === 'folha_pagamento';
  const isPgdas = document.document_type === 'pgdas';

  const handleSaveAndValidate = async () => {
    setSaving(true);
    try {
      // Update extracted data
      const newData = isPayroll ? payrollData : isPgdas ? pgdasData : extractedData;
      
      await supabase
        .from('documents')
        // @ts-ignore - extracted_data accepts JSON
        .update({ extracted_data: newData })
        .eq('id', document.id);

      // Validate the document
      await validateDocument(document.id);
      
      toast.success('Documento validado com sucesso');
      onValidated();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Validação de Documento</CardTitle>
              <CardDescription>{document.file_name}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {document.extraction_confidence && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Confiança da extração:</span>
            <Badge variant={document.extraction_confidence > 80 ? 'default' : 'secondary'}>
              {document.extraction_confidence.toFixed(0)}%
            </Badge>
            {document.extraction_confidence < 80 && (
              <span className="text-sm text-yellow-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Revise os dados com atenção
              </span>
            )}
          </div>
        )}

        <Separator />

        {isPayroll && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employees_count">Quantidade de Funcionários</Label>
              <Input
                id="employees_count"
                type="number"
                value={payrollData.employees_count}
                onChange={(e) => setPayrollData(prev => ({ ...prev, employees_count: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_payroll">Total da Folha (R$)</Label>
              <Input
                id="total_payroll"
                type="number"
                step="0.01"
                value={payrollData.total_payroll}
                onChange={(e) => setPayrollData(prev => ({ ...prev, total_payroll: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(payrollData.total_payroll)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_charges">Total de Encargos (R$)</Label>
              <Input
                id="total_charges"
                type="number"
                step="0.01"
                value={payrollData.total_charges}
                onChange={(e) => setPayrollData(prev => ({ ...prev, total_charges: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(payrollData.total_charges)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hires_count">Admissões no Período</Label>
              <Input
                id="hires_count"
                type="number"
                value={payrollData.hires_count}
                onChange={(e) => setPayrollData(prev => ({ ...prev, hires_count: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terminations_count">Rescisões no Período</Label>
              <Input
                id="terminations_count"
                type="number"
                value={payrollData.terminations_count}
                onChange={(e) => setPayrollData(prev => ({ ...prev, terminations_count: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        )}

        {isPgdas && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_revenue">Receita do Período (R$)</Label>
              <Input
                id="period_revenue"
                type="number"
                step="0.01"
                value={pgdasData.period_revenue}
                onChange={(e) => setPgdasData(prev => ({ ...prev, period_revenue: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(pgdasData.period_revenue)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accumulated_revenue">Receita Acumulada 12m (R$)</Label>
              <Input
                id="accumulated_revenue"
                type="number"
                step="0.01"
                value={pgdasData.accumulated_revenue}
                onChange={(e) => setPgdasData(prev => ({ ...prev, accumulated_revenue: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(pgdasData.accumulated_revenue)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simples_anexo">Anexo do Simples</Label>
              <Input
                id="simples_anexo"
                value={pgdasData.simples_anexo}
                onChange={(e) => setPgdasData(prev => ({ ...prev, simples_anexo: e.target.value }))}
                placeholder="I, II, III, IV ou V"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="das_value">Valor do DAS (R$)</Label>
              <Input
                id="das_value"
                type="number"
                step="0.01"
                value={pgdasData.das_value}
                onChange={(e) => setPgdasData(prev => ({ ...prev, das_value: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(pgdasData.das_value)}</p>
            </div>
          </div>
        )}

        {!isPayroll && !isPgdas && (
          <div className="py-8 text-center text-muted-foreground">
            <p>Tipo de documento não suporta validação estruturada.</p>
            <p className="text-sm">Dados extraídos disponíveis para consulta.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSaveAndValidate} disabled={saving}>
          {saving ? (
            'Salvando...'
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Validar e Salvar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
