import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentType, DOCUMENT_TYPE_LABELS } from '@/types/company';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

export function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const { uploadDocument, uploading } = useDocuments();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('folha_pagamento');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadDocument(selectedFile, documentType);
    if (result) {
      setSelectedFile(null);
      onUploadComplete?.();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-10 w-10 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Select
                  value={documentType}
                  onValueChange={(value) => setDocumentType(value as DocumentType)}
                  disabled={uploading}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar Documento
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">Arraste um arquivo PDF aqui</p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Selecionar Arquivo
                </label>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
