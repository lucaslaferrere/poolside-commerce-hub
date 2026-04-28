import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { Kit } from '@/types/shop';

export function useKits(featured?: boolean) {
  return useQuery({
    queryKey: ['kits', { featured }],
    queryFn: () =>
      apiGet<Kit[]>(
        '/kits',
        featured !== undefined ? { featured: String(featured) } : undefined,
      ),
    select: (data) => Array.isArray(data) ? data : [],
  });
}
