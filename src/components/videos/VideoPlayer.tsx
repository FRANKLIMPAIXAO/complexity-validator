interface VideoPlayerProps {
  youtubeId: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({
  youtubeId,
  title,
  className = '',
  autoPlay = false,
}: VideoPlayerProps) {
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}${autoPlay ? '?autoplay=1' : ''}`;

  return (
    <div className={`relative rounded-lg overflow-hidden bg-black aspect-video ${className}`}>
      <iframe
        src={embedUrl}
        title={title || 'YouTube Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
