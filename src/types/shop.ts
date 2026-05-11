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
  variant_sku?: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  luminarias: 'Luminarias',
  controladores: 'Controladores',
  kits: 'Kits',
  osire: 'Línea Osire',
  accesorios: 'Accesorios',
};

export type OrderStatus =
  | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered'
  | 'cancelled' | 'rejected';

export interface OrderItem {
  product_id: string;
  variant_sku: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  payment_method?: string;
  shipping_details: { address: string; city: string; postal_code: string };
  preference_id?: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

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

export interface ShopBenefit {
  title: string;
  description: string;
}

export interface ShopMainSpec {
  key: string;
  value: string;
  meaning: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  base_price: number;
  category: string;
  brand: string;
  images: string[];
  variants: ShopVariant[];
  specs?: { key: string; value: string }[];
  main_specs?: ShopMainSpec[];
  benefits?: ShopBenefit[];
  stock: number;
  created_at: string;
  updated_at: string;
}
