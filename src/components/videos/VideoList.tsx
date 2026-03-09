import { useState } from 'react';
import { Search, Video as VideoIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VideoCard } from './VideoCard';
import { VIDEO_CATEGORIES } from '@/types/video';
import type { Video } from '@/types/video';

interface VideoListProps {
  videos: Video[];
  onPlay: (video: Video) => void;
  onDelete: (video: Video) => void;
  isDeleting?: boolean;
}

export function VideoList({ videos, onPlay, onDelete, isDeleting }: VideoListProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(search.toLowerCase()) ||
      video.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <VideoIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum vídeo encontrado</h3>
        <p className="text-muted-foreground">
          Adicione o primeiro vídeo na aba "Adicionar".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vídeos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {VIDEO_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum resultado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros de busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onPlay}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
