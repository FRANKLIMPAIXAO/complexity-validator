import { useState } from 'react';
import { Youtube, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useVideos } from '@/hooks/useVideos';
import {
  VIDEO_CATEGORIES,
  type VideoCategory,
  extractYouTubeId,
  isValidYouTubeUrl,
  getYouTubeThumbnail,
} from '@/types/video';
import { toast } from 'sonner';

interface VideoUploaderProps {
  onSuccess?: () => void;
}

export function VideoUploader({ onSuccess }: VideoUploaderProps) {
  const { addVideo } = useVideos();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VideoCategory>('treinamento');

  const youtubeId = extractYouTubeId(youtubeUrl);
  const isValidUrl = youtubeUrl.length > 0 && isValidYouTubeUrl(youtubeUrl);
  const hasUrlInput = youtubeUrl.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidUrl) {
      toast.error('Insira uma URL válida do YouTube.');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Digite um título para o vídeo.');
      return;
    }

    await addVideo.mutateAsync({
      youtubeUrl,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
    });

    // Reset form
    setYoutubeUrl('');
    setTitle('');
    setDescription('');
    setCategory('treinamento');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="youtube-url">URL do YouTube *</Label>
        <div className="relative">
          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="youtube-url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="pl-10 pr-10"
            disabled={addVideo.isPending}
          />
          {hasUrlInput && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValidUrl ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Cole a URL de um vídeo do YouTube (youtube.com ou youtu.be)
        </p>
      </div>

      {youtubeId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <img
                src={getYouTubeThumbnail(youtubeId, 'mq')}
                alt="Thumbnail do vídeo"
                className="w-40 h-24 object-cover rounded-md bg-muted"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span>Preview do YouTube</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {youtubeId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do vídeo"
            disabled={addVideo.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição opcional do vídeo"
            rows={3}
            disabled={addVideo.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as VideoCategory)}
            disabled={addVideo.isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={addVideo.isPending || !isValidUrl || !title.trim()}
      >
        {addVideo.isPending ? 'Adicionando...' : 'Adicionar Vídeo'}
      </Button>
    </form>
  );
}
