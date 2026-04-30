import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { ShopProduct } from '@/types/shop';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const raw = await apiGet<unknown>('/products');
      if (Array.isArray(raw)) return raw as ShopProduct[];
      const envelope = raw as { products?: ShopProduct[] };
      return envelope?.products ?? [];
    },
  });
}
