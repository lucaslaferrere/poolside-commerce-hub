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
  line?: string | null;
  materials?: string[] | null;
  uso?: string | null;
  product_ids: string[] | null;
  featured: boolean;
  sort_order?: number;
  visible?: boolean | null;
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Compute the discounted price from a base price and a percentage (0–100).
 * Returns the original price if discount is null/0/invalid. Clamps to 0–100.
 */
export const applyDiscount = (basePrice: number, discount: number | null | undefined): number => {
  if (!discount || !Number.isFinite(discount) || discount <= 0) return basePrice;
  const pct = Math.min(100, Math.max(0, discount));
  return basePrice * (1 - pct / 100);
};

export const hasDiscount = (discount: number | null | undefined): discount is number =>
  typeof discount === 'number' && Number.isFinite(discount) && discount > 0;

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
  /** Promotional discount as a percentage (0–100). 0/undefined = no discount. */
  discount_percent?: number | null;
  category: string;
  brand: string;
  images: string[];
  variants: ShopVariant[];
  specs?: { key: string; value: string }[];
  main_specs?: ShopMainSpec[];
  benefits?: ShopBenefit[];
  stock: number;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface ShippingDetails {
  courier_name: string;
  tracking_number: string;
  label_url: string;
  estimated_delivery: string | null;
}

export interface OrderItem {
  product_id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  shipping: ShippingDetails | null;
}
