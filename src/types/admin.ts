import type { Category } from './shop';

export type { Category };

export interface Variant {
  id?: string;
  color: string;
  size: string;
  attr3?: string;
  stock: number;
  price_adjustment: number;
}

export interface Spec {
  key: string;
  value: string;
}

export interface MainSpec {
  key: string;
  value: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  base_price: number;
  /** Promotional discount as a percentage (0–100). 0/undefined = no discount. */
  discount_percent?: number | null;
  category: Category;
  brand: string;
  images: string[];
  variants: Variant[];
  specs?: Spec[];
  main_specs?: MainSpec[];
  stock: number;
  /** undefined/null = visible (legacy docs). false = explicitly hidden from store. */
  visible?: boolean | null;
  sort_order?: number;
  /** Custom labels for the up-to-3 variant axes (e.g. ["Color", "Tamaño", "Opción"]). */
  variant_labels?: string[];
}

// Local row used only inside the form (all fields as strings for controlled inputs)
export interface VariantRow {
  _key: string;
  color: string;
  size: string;
  attr3: string;
  stock: string;
  price_adjustment: string;
}

export interface SpecRow {
  _key: string;
  key: string;
  value: string;
}

export interface MainSpecRow {
  _key: string;
  value: string;
  key: string;
}

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'luminarias', label: 'Luminarias' },
  { value: 'controladores', label: 'Controladores' },
  { value: 'kits', label: 'Kits' },
  { value: 'osire', label: 'Línea Osire' },
  { value: 'accesorios', label: 'Accesorios' },
];
