import { useState } from 'react';
import { Play, Trash2, Clock, MoreVertical, Youtube } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { VIDEO_CATEGORIES, getYouTubeThumbnail } from '@/types/video';
import type { Video } from '@/types/video';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  onDelete: (video: Video) => void;
  isDeleting?: boolean;
}

export function VideoCard({ video, onPlay, onDelete, isDeleting }: VideoCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const categoryLabel = VIDEO_CATEGORIES.find(c => c.value === video.category)?.label || video.category;
  const thumbnailUrl = video.youtube_id ? getYouTubeThumbnail(video.youtube_id, 'mq') : null;

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <div 
          className="relative aspect-video bg-muted cursor-pointer"
          onClick={() => onPlay(video)}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary-foreground ml-1" />
            </div>
          </div>

          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-red-500/90 text-white border-0">
              <Youtube className="h-3 w-3 mr-1" />
              YouTube
            </Badge>
          </div>

          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {categoryLabel}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate" title={video.title}>
                {video.title}
              </h3>
              {video.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {video.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPlay(video)}>
                  <Play className="h-4 w-4 mr-2" />
                  Reproduzir
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(video.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vídeo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O vídeo "{video.title}" será 
              permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(video);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
