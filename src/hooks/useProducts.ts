import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { Product } from '@/types/shop';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiGet<Product[]>('/products'),
    select: (data) => Array.isArray(data) ? data : [],
  });
}
