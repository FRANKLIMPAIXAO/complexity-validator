-- Remove file-related columns (no longer needed)
ALTER TABLE public.videos 
  DROP COLUMN IF EXISTS file_name,
  DROP COLUMN IF EXISTS file_path,
  DROP COLUMN IF EXISTS file_size,
  DROP COLUMN IF EXISTS mime_type;

-- Add YouTube URL column
ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS youtube_url TEXT NOT NULL DEFAULT '';

-- Add YouTube ID column (extracted from URL for embeds)
ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS youtube_id VARCHAR(20);