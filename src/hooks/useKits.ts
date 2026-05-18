import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { Kit } from '@/types/shop';

export function useKits(featured?: boolean) {
  return useQuery({
    queryKey: ['kits', { featured }],
    queryFn: () => {
      const params: Record<string, string> = { limit: '200' };
      if (featured !== undefined) params.featured = String(featured);
      return apiGet<Kit[]>('/kits', params);
    },
    select: (data) => Array.isArray(data) ? data : [],
  });
}
