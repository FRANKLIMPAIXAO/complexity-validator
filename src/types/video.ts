export interface Video {
  id: string;
  company_id: string;
  uploaded_by: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_id: string | null;
  duration_seconds: number | null;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type VideoCategory = 
  | 'treinamento'
  | 'tutorial'
  | 'reuniao'
  | 'apresentacao'
  | 'outros';

export const VIDEO_CATEGORIES: { value: VideoCategory; label: string }[] = [
  { value: 'treinamento', label: 'Treinamento' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'apresentacao', label: 'Apresentação' },
  { value: 'outros', label: 'Outros' },
];

// Helper function to extract YouTube ID from URL
export function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Helper function to validate YouTube URL
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

// Get YouTube thumbnail URL
export function getYouTubeThumbnail(youtubeId: string, quality: 'default' | 'mq' | 'hq' | 'maxres' = 'mq'): string {
  const qualityMap = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}.jpg`;
}
