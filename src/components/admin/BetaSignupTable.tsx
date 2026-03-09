import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, MessageSquare, Clock, CheckCircle, XCircle, Building2, Users, Mail } from 'lucide-react';
import { BetaSignup, useBetaSignups } from '@/hooks/useBetaSignups';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BetaSignupTableProps {
  signups: BetaSignup[];
  isLoading: boolean;
}

export default function BetaSignupTable({ signups, isLoading }: BetaSignupTableProps) {
  const { approveSignup, rejectSignup, updateNotes } = useBetaSignups();
  const [selectedSignup, setSelectedSignup] = useState<BetaSignup | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'notes' | null>(null);

  const pendingSignups = signups.filter(s => s.status === 'pending');
  const approvedSignups = signups.filter(s => s.status === 'approved');
  const rejectedSignups = signups.filter(s => s.status === 'rejected');

  const handleAction = (signup: BetaSignup, action: 'approve' | 'reject' | 'notes') => {
    setSelectedSignup(signup);
    setNotes(signup.notes || '');
    setActionType(action);
    setNotesDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedSignup || !actionType) return;

    if (actionType === 'approve') {
      await approveSignup.mutateAsync({ id: selectedSignup.id, notes });
    } else if (actionType === 'reject') {
      await rejectSignup.mutateAsync({ id: selectedSignup.id, notes });
    } else if (actionType === 'notes') {
      await updateNotes.mutateAsync({ id: selectedSignup.id, notes });
    }

    setNotesDialogOpen(false);
    setSelectedSignup(null);
    setActionType(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return null;
    }
  };

  const SignupRow = ({ signup, showActions = true }: { signup: BetaSignup; showActions?: boolean }) => (
    <TableRow key={signup.id}>
      <TableCell>
        <div className="font-medium">{signup.name}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {signup.email}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Building2 className="h-3 w-3 text-muted-foreground" />
          {signup.company}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          {signup.clients_count}
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(signup.status)}</TableCell>
      <TableCell>
        {format(new Date(signup.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
      </TableCell>
      <TableCell>
        {signup.approved_at && format(new Date(signup.approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {showActions && signup.status === 'pending' && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-green-600 hover:bg-green-500/10"
                onClick={() => handleAction(signup, 'approve')}
                disabled={approveSignup.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-600 hover:bg-red-500/10"
                onClick={() => handleAction(signup, 'reject')}
                disabled={rejectSignup.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => handleAction(signup, 'notes')}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingSignups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedSignups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejeitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedSignups.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pendentes ({pendingSignups.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Aprovados ({approvedSignups.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejeitados ({rejectedSignups.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                Todos ({signups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / E-mail</TableHead>
                    <TableHead>Escritório</TableHead>
                    <TableHead>Clientes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inscrito em</TableHead>
                    <TableHead>Aprovado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSignups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhuma inscrição pendente
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingSignups.map((signup) => <SignupRow key={signup.id} signup={signup} />)
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="approved">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / E-mail</TableHead>
                    <TableHead>Escritório</TableHead>
                    <TableHead>Clientes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inscrito em</TableHead>
                    <TableHead>Aprovado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedSignups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhuma inscrição aprovada
                      </TableCell>
                    </TableRow>
                  ) : (
                    approvedSignups.map((signup) => <SignupRow key={signup.id} signup={signup} showActions={false} />)
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="rejected">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / E-mail</TableHead>
                    <TableHead>Escritório</TableHead>
                    <TableHead>Clientes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inscrito em</TableHead>
                    <TableHead>Aprovado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedSignups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhuma inscrição rejeitada
                      </TableCell>
                    </TableRow>
                  ) : (
                    rejectedSignups.map((signup) => <SignupRow key={signup.id} signup={signup} showActions={false} />)
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / E-mail</TableHead>
                    <TableHead>Escritório</TableHead>
                    <TableHead>Clientes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inscrito em</TableHead>
                    <TableHead>Aprovado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhuma inscrição encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    signups.map((signup) => <SignupRow key={signup.id} signup={signup} />)
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Aprovar Inscrição'}
              {actionType === 'reject' && 'Rejeitar Inscrição'}
              {actionType === 'notes' && 'Editar Notas'}
            </DialogTitle>
            <DialogDescription>
              {selectedSignup && (
                <span className="font-medium">{selectedSignup.name} - {selectedSignup.email}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre esta inscrição..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              disabled={approveSignup.isPending || rejectSignup.isPending || updateNotes.isPending}
              className={
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''
              }
            >
              {actionType === 'approve' && 'Aprovar'}
              {actionType === 'reject' && 'Rejeitar'}
              {actionType === 'notes' && 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
