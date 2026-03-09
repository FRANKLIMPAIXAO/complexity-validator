import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentValidation } from '@/components/documents/DocumentValidation';
import { CompetenceSelector } from '@/components/competence/CompetenceSelector';
import { RequireOperacional } from '@/components/access/RoleGuard';
import { useDocuments } from '@/hooks/useDocuments';
import { useCompetence } from '@/contexts/CompetenceContext';
import type { Document } from '@/types/company';

export default function Documents() {
  const { documents, loading, fetchDocuments } = useDocuments();
  const { currentCompetence } = useCompetence();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (currentCompetence) {
      fetchDocuments();
    }
  }, [currentCompetence, fetchDocuments]);

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">
            Upload e gestão de documentos por competência
          </p>
        </div>
        <CompetenceSelector />
      </div>

      {!currentCompetence ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Selecione ou crie uma competência para gerenciar documentos
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Documentos</TabsTrigger>
            <RequireOperacional>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </RequireOperacional>
            {selectedDocument && (
              <TabsTrigger value="validation">Validação</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos da Competência
                </CardTitle>
                <CardDescription>
                  Lista de documentos enviados para esta competência
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Carregando documentos...
                  </div>
                ) : (
                  <DocumentList 
                    documents={documents} 
                    onViewDocument={handleViewDocument}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <RequireOperacional>
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Documento</CardTitle>
                  <CardDescription>
                    Faça upload de documentos PDF para extração automática de dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUploader onUploadComplete={fetchDocuments} />
                </CardContent>
              </Card>
            </TabsContent>
          </RequireOperacional>

          {selectedDocument && (
            <TabsContent value="validation">
              <DocumentValidation
                document={selectedDocument}
                onClose={() => setSelectedDocument(null)}
                onValidated={() => {
                  setSelectedDocument(null);
                  fetchDocuments();
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
