import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice } from '@/types/shop';
import type { Order } from '@/types/shop';
import { StatusBadge } from './OrdersTable';

interface Props {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailDialog({ order, onClose }: Props) {
  if (!order) return null;

  const sd = order.shipping_details;

  return (
    <Dialog open={!!order} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            Pedido <span className="font-mono text-xs text-neutral-500">#{order.id.slice(-8).toUpperCase()}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* Estado + fecha */}
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <span className="text-xs text-neutral-500">
              {new Date(order.created_at).toLocaleString('es-AR')}
            </span>
          </div>

          {/* Cliente */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 mb-2">Cliente</h3>
            <div className="space-y-1 text-neutral-700">
              <p className="font-medium">{order.customer_name}</p>
              <p>{order.customer_email}</p>
              <p>{order.customer_phone}</p>
            </div>
          </section>

          {/* Envío */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 mb-2">Envío</h3>
            <p className="text-neutral-700">{sd.address}, {sd.city} ({sd.postal_code})</p>
            {order.payment_method && (
              <p className="text-xs text-neutral-500 mt-1 capitalize">Pago: {order.payment_method}</p>
            )}
          </section>

          {/* Items */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 mb-2">Productos</h3>
            <ul className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-neutral-500 truncate">
                      {item.variant_sku || item.product_id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-neutral-500">× {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium tabular-nums">{formatPrice(item.unit_price)}</p>
                    <p className="text-xs text-neutral-400 tabular-nums">{formatPrice(item.unit_price * item.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-neutral-200 pt-3 font-semibold">
            <span>Total</span>
            <span className="tabular-nums text-base">{formatPrice(order.total)}</span>
          </div>

          {/* Notas */}
          {order.notes && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 mb-1">Notas</h3>
              <p className="text-neutral-600 text-xs">{order.notes}</p>
            </section>
          )}

          {/* IDs técnicos */}
          {(order.preference_id || order.payment_id) && (
            <section className="border-t border-neutral-100 pt-3 space-y-1">
              {order.preference_id && (
                <p className="text-[11px] text-neutral-400 font-mono">Preferencia MP: {order.preference_id}</p>
              )}
              {order.payment_id && (
                <p className="text-[11px] text-neutral-400 font-mono">Pago MP: {order.payment_id}</p>
              )}
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
