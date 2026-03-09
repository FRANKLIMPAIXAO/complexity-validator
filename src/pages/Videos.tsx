import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video as VideoIcon, Youtube, Loader2, ShieldAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VideoUploader } from '@/components/videos/VideoUploader';
import { VideoList } from '@/components/videos/VideoList';
import { VideoPlayer } from '@/components/videos/VideoPlayer';
import { useVideos } from '@/hooks/useVideos';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Video } from '@/types/video';

export default function Videos() {
  const { videos, isLoading, deleteVideo } = useVideos();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('biblioteca');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
      setCheckingRole(false);
    };

    checkAdminRole();
  }, [user]);

  const handlePlay = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleDelete = (video: Video) => {
    deleteVideo.mutate(video);
  };

  const handleUploadSuccess = () => {
    setActiveTab('biblioteca');
  };

  if (checkingRole) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-4">
          Esta página é exclusiva para administradores.
        </p>
        <p className="text-sm text-muted-foreground">
          Os vídeos estão disponíveis na{' '}
          <button 
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            página inicial
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <VideoIcon className="h-6 w-6" />
          Gerenciar Vídeos
        </h1>
        <p className="text-muted-foreground mt-1">
          Adicione e gerencie os vídeos públicos da plataforma
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="biblioteca" className="flex items-center gap-2">
            <VideoIcon className="h-4 w-4" />
            Biblioteca
            {videos.length > 0 && (
              <span className="ml-1 bg-muted px-2 py-0.5 rounded-full text-xs">
                {videos.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="adicionar" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            Adicionar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="biblioteca" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <VideoList
              videos={videos}
              onPlay={handlePlay}
              onDelete={handleDelete}
              isDeleting={deleteVideo.isPending}
            />
          )}
        </TabsContent>

        <TabsContent value="adicionar" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <VideoUploader onSuccess={handleUploadSuccess} />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo?.youtube_id && (
            <div className="p-6 pt-4">
              <VideoPlayer
                youtubeId={selectedVideo.youtube_id}
                title={selectedVideo.title}
                autoPlay
              />
              {selectedVideo.description && (
                <p className="text-muted-foreground mt-4">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
