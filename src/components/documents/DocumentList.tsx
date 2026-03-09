import React from 'react';
import { FileText, Download, Trash2, CheckCircle, Clock, AlertCircle, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDocuments } from '@/hooks/useDocuments';
import { useCompany } from '@/contexts/CompanyContext';
import { RequireAdmin, RequireGestor } from '@/components/access/RoleGuard';
import { 
  Document, 
  DOCUMENT_TYPE_LABELS, 
  DOCUMENT_STATUS_LABELS,
  DocumentStatus 
} from '@/types/company';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentListProps {
  documents: Document[];
  onViewDocument?: (document: Document) => void;
}

export function DocumentList({ documents, onViewDocument }: DocumentListProps) {
  const { deleteDocument, getDocumentUrl, validateDocument } = useDocuments();
  const { hasRole } = useCompany();

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'extracted':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: DocumentStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'validated':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'extracted':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleDownload = async (document: Document) => {
    const url = await getDocumentUrl(document.file_path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum documento enviado nesta competência</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Documento</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tamanho</TableHead>
          <TableHead>Enviado em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium truncate max-w-[200px]">
                  {doc.file_name}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {DOCUMENT_TYPE_LABELS[doc.document_type]}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(doc.status)} className="gap-1">
                {getStatusIcon(doc.status)}
                {DOCUMENT_STATUS_LABELS[doc.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatFileSize(doc.file_size)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {doc.status === 'extracted' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDocument?.(doc)}
                    title="Ver dados extraídos"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc)}
                  title="Baixar documento"
                >
                  <Download className="h-4 w-4" />
                </Button>

                <RequireGestor>
                  {doc.status === 'extracted' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => validateDocument(doc.id)}
                      title="Validar documento"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                </RequireGestor>

                <RequireAdmin>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Excluir documento">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O documento será permanentemente excluído.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteDocument(doc.id, doc.file_path)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </RequireAdmin>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
