export type Category = 'luminarias' | 'controladores' | 'kits' | 'osire' | 'accesorios';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  image_url: string | null;
  short_description: string | null;
  description: string | null;
  featured: boolean;
  stock: number;
}

export interface Kit {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  pool_size: string | null;
  product_ids: string[] | null;
  featured: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  type: 'product' | 'kit';
}

export const CATEGORY_LABELS: Record<Category, string> = {
  luminarias: 'Luminarias',
  controladores: 'Controladores',
  kits: 'Kits',
  osire: 'Línea Osire',
  accesorios: 'Accesorios',
};

// NaN-safe: coerces null/undefined/non-finite values to 0 to avoid "$ NaN" in the UI.
export const formatPrice = (n: number | null | undefined): string => {
  const value = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
};

// ── Public-API product (GET /products and GET /products/:id) ─────────────────

export interface ShopVariant {
  sku?: string;
  color: string;
  size: string;
  stock: number;
  price_adjustment: number;
}

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  brand: string;
  images: string[];
  variants: ShopVariant[];
  stock: number;
  created_at: string;
  updated_at: string;
}
