import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Video, VideoCategory } from '@/types/video';
import { extractYouTubeId } from '@/types/video';

export function useVideos() {
  const { company } = useCompany();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: videos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['videos', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Video[];
    },
    enabled: !!company?.id,
  });

  const addVideo = useMutation({
    mutationFn: async ({
      youtubeUrl,
      title,
      description,
      category,
    }: {
      youtubeUrl: string;
      title: string;
      description?: string;
      category: VideoCategory;
    }) => {
      if (!company?.id || !user?.id) {
        throw new Error('Empresa ou usuário não encontrado');
      }

      const youtubeId = extractYouTubeId(youtubeUrl);
      
      if (!youtubeId) {
        throw new Error('URL do YouTube inválida');
      }

      const { error: dbError } = await supabase.from('videos').insert({
        company_id: company.id,
        uploaded_by: user.id,
        title,
        description: description || null,
        youtube_url: youtubeUrl,
        youtube_id: youtubeId,
        category,
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', company?.id] });
      toast.success('Vídeo adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar vídeo: ${error.message}`);
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (video: Video) => {
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', company?.id] });
      toast.success('Vídeo excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir vídeo: ${error.message}`);
    },
  });

  return {
    videos,
    isLoading,
    error,
    addVideo,
    deleteVideo,
  };
}
