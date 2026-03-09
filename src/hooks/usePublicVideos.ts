import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Video } from "@/types/video";

export function usePublicVideos() {
  return useQuery({
    queryKey: ['public-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Video[];
    },
  });
}
