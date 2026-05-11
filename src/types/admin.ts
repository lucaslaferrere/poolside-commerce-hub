import type { Category } from './shop';

export type { Category };

export interface Variant {
  id?: string;
  color: string;
  size: string;
  stock: number;
  price_adjustment: number;
}

export interface Spec {
  key: string;
  value: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: Category;
  brand: string;
  images: string[];
  variants: Variant[];
  specs?: Spec[];
  stock: number;
}

// Local row used only inside the form (all fields as strings for controlled inputs)
export interface VariantRow {
  _key: string;
  color: string;
  size: string;
  stock: string;
  price_adjustment: string;
}

export interface SpecRow {
  _key: string;
  key: string;
  value: string;
}

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'luminarias', label: 'Luminarias' },
  { value: 'controladores', label: 'Controladores' },
  { value: 'kits', label: 'Kits' },
  { value: 'osire', label: 'Línea Osire' },
  { value: 'accesorios', label: 'Accesorios' },
];
