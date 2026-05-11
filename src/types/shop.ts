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
  variant_sku?: string;
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
  variant_sku?: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  luminarias: 'Luminarias',
  controladores: 'Controladores',
  kits: 'Kits',
  osire: 'Línea Osire',
  accesorios: 'Accesorios',
};

export const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
