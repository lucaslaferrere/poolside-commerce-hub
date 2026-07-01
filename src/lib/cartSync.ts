import { apiPut, apiDelete } from '@/lib/api';
import type { CartItem } from '@/types/shop';

// Convierte los items del store al formato del backend (CartItem de Go).
function toServerItems(items: CartItem[]) {
  // El id del item en el store tiene formato `productHex|variant...` — product_id es el hex antes del primer '|'.
  return items.map((i) => ({
    product_id: i.id.split('|')[0],
    variant_sku: i.variant_sku ?? '',
    name: i.name,
    quantity: i.quantity,
    unit_price: i.price,
    item_type: i.type,
  }));
}

function isLoggedIn(): boolean {
  return !!localStorage.getItem('auth_token');
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Sube el carrito al backend con debounce. Solo si hay sesión.
export function syncCartToServer(items: CartItem[]) {
  if (!isLoggedIn()) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    apiPut('/cart', { items: toServerItems(items) }).catch(() => {
      // silencioso: la sync no debe romper la UX
    });
  }, 2000);
}

// Sube el carrito inmediatamente (ej: al iniciar sesión).
export function pushCartNow(items: CartItem[]) {
  if (!isLoggedIn()) return;
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
  apiPut('/cart', { items: toServerItems(items) }).catch(() => {});
}

export function clearServerCart() {
  if (!isLoggedIn()) return;
  apiDelete('/cart').catch(() => {});
}
