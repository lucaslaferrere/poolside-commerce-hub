import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { Product, Category } from '@/types/shop';

interface BackendVariant {
  sku: string;
  stock: number;
  price_adjustment: number;
}

interface BackendProduct {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category: Category;
  brand: string;
  images: string[];
  variants: BackendVariant[];
}

interface ProductsResponse {
  products: BackendProduct[];
  limit: number;
}

function mapProduct(p: BackendProduct): Product {
  const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  return {
    id: p.id,
    name: p.name,
    slug: p.id,
    category: p.category,
    price: p.base_price,
    image_url: p.images?.[0] ?? null,
    short_description: null,
    description: p.description,
    featured: false,
    stock: totalStock,
    variant_sku: p.variants?.[0]?.sku,
  };
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiGet<ProductsResponse>('/products'),
    select: (data) => (data?.products ?? []).map(mapProduct),
  });
}
