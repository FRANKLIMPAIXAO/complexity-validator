import { useState } from "react";
import { usePublicVideos } from "@/hooks/usePublicVideos";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const VideosSection = () => {
  const { data: videos, isLoading } = usePublicVideos();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <section id="videos" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Conteúdos em Vídeo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Aprenda com nossos materiais exclusivos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-video rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section id="videos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Video className="h-4 w-4" />
            Conteúdo Exclusivo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Conteúdos em Vídeo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aprenda com nossos materiais exclusivos sobre gestão contábil
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-border"
              onClick={() => setSelectedVideoId(video.youtube_id)}
            >
              <div className="relative aspect-video">
                <img
                  src={`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-7 w-7 text-primary-foreground ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                )}
                {video.category && (
                  <span className="inline-block mt-3 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {video.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedVideoId} onOpenChange={() => setSelectedVideoId(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="aspect-video">
            {selectedVideoId && (
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default VideosSection;
