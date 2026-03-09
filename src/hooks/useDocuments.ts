import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompetence } from '@/contexts/CompetenceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import type { Document, DocumentType } from '@/types/company';
import { toast } from 'sonner';

export function useDocuments() {
  const queryClient = useQueryClient();
  const { company } = useCompany();
  const { currentCompetence } = useCompetence();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!company?.id || !currentCompetence?.id) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', company.id)
        .eq('competence_id', currentCompetence.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data as Document[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  }, [company?.id, currentCompetence?.id]);

  const uploadDocument = async (
    file: File,
    documentType: DocumentType
  ): Promise<Document | null> => {
    if (!company?.id || !currentCompetence?.id || !user?.id) {
      toast.error('Erro: informações de contexto não disponíveis');
      return null;
    }

    setUploading(true);
    try {
      // 1. Upload file to storage
      const filePath = `${company.id}/${currentCompetence.id}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          company_id: company.id,
          competence_id: currentCompetence.id,
          uploaded_by: user.id,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type || 'application/pdf',
          status: 'uploaded',
        })
        .select()
        .single();

      if (docError) throw docError;

      const newDoc = docData as Document;
      setDocuments(prev => [newDoc, ...prev]);
      toast.success('Documento enviado com sucesso');

      // 3. Trigger extraction (async, don't wait)
      triggerExtraction(newDoc.id);

      return newDoc;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Erro ao enviar documento');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const triggerExtraction = async (documentId: string) => {
    try {
      // Update status to processing
      await supabase
        .from('documents')
        .update({ status: 'processing' })
        .eq('id', documentId);

      // Call the extraction edge function
      const { data, error } = await supabase.functions.invoke('extract-document-data', {
        body: { documentId },
      });

      if (error) {
        console.error('Extraction error:', error);
        await supabase
          .from('documents')
          .update({ 
            status: 'error',
            extraction_error: error.message 
          })
          .eq('id', documentId);
      } else if (data?.client) {
        // Show feedback when client is created/updated
        const actionLabel = data.client.action === 'created' ? 'criado' : 'atualizado';
        toast.success(`Cliente ${actionLabel} automaticamente a partir do documento!`, {
          action: {
            label: 'Ver cliente',
            onClick: () => window.location.href = `/clients/${data.client.id}`,
          },
        });
        // Invalidate clients cache to refresh the list
        queryClient.invalidateQueries({ queryKey: ['clients'] });
      }

      // Refresh documents
      fetchDocuments();
    } catch (error) {
      console.error('Error triggering extraction:', error);
    }
  };

  const validateDocument = async (documentId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'validated',
          validated_by: user.id,
          validated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, status: 'validated' as const, validated_by: user.id, validated_at: new Date().toISOString() }
            : doc
        )
      );

      toast.success('Documento validado');
    } catch (error) {
      console.error('Error validating document:', error);
      toast.error('Erro ao validar documento');
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('company-documents')
        .remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Documento excluído');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const getDocumentUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from('company-documents')
        .createSignedUrl(filePath, 3600); // 1 hour

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  };

  return {
    documents,
    loading,
    uploading,
    fetchDocuments,
    uploadDocument,
    validateDocument,
    deleteDocument,
    getDocumentUrl,
    triggerExtraction,
  };
}
