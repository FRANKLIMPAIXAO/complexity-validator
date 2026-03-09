import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BetaSignup {
  id: string;
  name: string;
  email: string;
  company: string;
  clients_count: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  notes: string | null;
}

export function useBetaSignups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all beta signups
  const { data: signups = [], isLoading, refetch } = useQuery({
    queryKey: ['beta-signups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beta_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BetaSignup[];
    },
  });

  // Submit new beta signup (from landing page)
  const submitSignup = useMutation({
    mutationFn: async (signupData: {
      name: string;
      email: string;
      company: string;
      clients_count: string;
    }) => {
      console.log('Submitting beta signup:', signupData);
      
      const { data, error } = await supabase
        .from('beta_signups')
        .insert([signupData])
        .select()
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23505') {
          throw new Error('Este e-mail já está inscrito no beta.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      console.log('Beta signup success:', data);
      queryClient.invalidateQueries({ queryKey: ['beta-signups'] });
    },
    onError: (error) => {
      console.error('Beta signup mutation error:', error);
    },
  });

  // Check if email is approved for signup
  const checkEmailApproval = async (email: string): Promise<{
    isApproved: boolean;
    isPending: boolean;
    isRejected: boolean;
    notFound: boolean;
  }> => {
    const { data, error } = await supabase
      .from('beta_signups')
      .select('status')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { isApproved: false, isPending: false, isRejected: false, notFound: true };
    }

    return {
      isApproved: data.status === 'approved',
      isPending: data.status === 'pending',
      isRejected: data.status === 'rejected',
      notFound: false,
    };
  };

  // Approve signup
  const approveSignup = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('beta_signups')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          notes: notes || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-signups'] });
      toast({
        title: 'Inscrição aprovada',
        description: 'O usuário agora pode criar sua conta.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao aprovar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Reject signup
  const rejectSignup = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from('beta_signups')
        .update({
          status: 'rejected',
          notes: notes || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-signups'] });
      toast({
        title: 'Inscrição rejeitada',
        description: 'O acesso foi negado.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao rejeitar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Update notes
  const updateNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('beta_signups')
        .update({ notes })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-signups'] });
    },
  });

  return {
    signups,
    isLoading,
    refetch,
    submitSignup,
    checkEmailApproval,
    approveSignup,
    rejectSignup,
    updateNotes,
  };
}

export function useIsAdmin() {
  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });

      if (error) return false;
      return data || false;
    },
  });

  return { isAdmin, isLoading };
}
