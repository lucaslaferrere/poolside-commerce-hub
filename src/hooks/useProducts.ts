import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { CATEGORY_LABELS, type Category } from '@/types/shop';
import type { ShopProduct } from '@/types/shop';

export interface CategoryOption {
  id: string;
  label: string;
  count: number;
}

const KNOWN_CATEGORIES: Category[] = [
  'luminarias',
  'controladores',
  'kits',
  'osire',
  'accesorios',
];

async function fetchProducts(): Promise<ShopProduct[]> {
  const raw = await apiGet<unknown>('/products', { limit: '100' });
  if (Array.isArray(raw)) return raw as ShopProduct[];
  const envelope = raw as { products?: ShopProduct[] };
  return envelope?.products ?? [];
}

export function useProducts() {
  return useQuery({
    queryKey: ['shop', 'products'],
    queryFn: fetchProducts,
  });
}

export function useProductById(id: string | undefined) {
  return useQuery({
    queryKey: ['shop', 'product', id],
    queryFn: () => apiGet<ShopProduct>(`/products/${id}`),
    enabled: !!id,
  });
}

// Returns the canonical brand category set, augmented with live counts from the
// products endpoint. Categories from the API that aren't in the canonical list
// are appended at the end so the sidebar never hides existing data.
export function useCategories() {
  const { data: products = [], isLoading, isError, refetch } = useProducts();

  const categories = useMemo<CategoryOption[]>(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = p.category;
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const fromKnown: CategoryOption[] = KNOWN_CATEGORIES.map((id) => ({
      id,
      label: CATEGORY_LABELS[id],
      count: counts.get(id) ?? 0,
    }));

    const extras: CategoryOption[] = [];
    for (const [id, count] of counts.entries()) {
      if (!KNOWN_CATEGORIES.includes(id as Category)) {
        extras.push({ id, label: id, count });
      }
    }
    extras.sort((a, b) => a.label.localeCompare(b.label, 'es'));

    return [...fromKnown, ...extras];
  }, [products]);

  return { categories, isLoading, isError, refetch };
}
