import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice } from '@/types/shop';

export interface AdminCartItem {
  product_id: string;
  variant_sku: string;
  name?: string;
  quantity: number;
  unit_price?: number;
  item_type?: string;
}

export interface AdminCart {
  user_id: string;
  email: string;
  items: AdminCartItem[];
  item_count: number;
  total: number;
  updated_at: string;
  last_reminder_sent_at: string | null;
}

export function CartDetailDialog({ cart, onClose }: { cart: AdminCart | null; onClose: () => void }) {
  if (!cart) return null;
  return (
    <Dialog open={!!cart} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Carrito de {cart.email}</DialogTitle>
        </DialogHeader>
        <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {cart.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                  {item.quantity}
                </span>
                <span className="truncate text-sm font-medium">
                  {item.name || item.variant_sku || item.product_id.slice(-8)}
                </span>
              </div>
              <span className="text-sm font-semibold shrink-0">
                {formatPrice((item.unit_price ?? 0) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-bold">{formatPrice(cart.total)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
