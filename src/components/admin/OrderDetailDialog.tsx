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
              <p className="text-xs text-neutral-500">
                DNI/CUIT: <span className="text-neutral-700">{order.dni_cuit || '—'}</span>
              </p>
            </div>
          </section>

          {/* Entrega */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 mb-2">Entrega</h3>
            {order.delivery_method === 'retirar' ? (
              <p className="text-neutral-700 font-medium">Retiro en local — Zona Pilar</p>
            ) : (
              <div className="space-y-0.5 text-neutral-700">
                {sd.address && <p>{sd.address}</p>}
                <p>{[sd.city, sd.province].filter(Boolean).join(', ')}{sd.postal_code ? ` (${sd.postal_code})` : ''}</p>
              </div>
            )}
            <div className="flex gap-3 mt-1.5 text-xs text-neutral-500">
              {order.payment_method && (
                <span>Pago: {order.payment_method.replace('mercadopago', 'MercadoPago')}</span>
              )}
              {order.delivery_method && (
                <span>Entrega: {order.delivery_method === 'retirar' ? 'Retiro' : 'Envío'}</span>
              )}
            </div>
          </section>

          {/* Factura A */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 mb-2">Factura A</h3>
            {order.factura_a ? (
              <div className="space-y-1 text-neutral-700">
                <p className="font-medium">{order.factura_a.razon_social}</p>
                <p className="text-xs text-neutral-500">CUIT: {order.factura_a.cuit}</p>
              </div>
            ) : (
              <p className="text-neutral-400">No</p>
            )}
          </section>

          {/* Items */}
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 mb-2">Productos</h3>
            <ul className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.name || item.variant_sku || item.product_id.slice(-8).toUpperCase()}</p>
                    {item.name && item.variant_sku && (
                      <p className="font-mono text-xs text-neutral-500 truncate">{item.variant_sku}</p>
                    )}
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

          {/* Totales */}
          <section className="border-t border-neutral-200 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal productos</span>
              <span className="tabular-nums text-neutral-700">
                {formatPrice(order.items.reduce((s, i) => s + i.unit_price * i.quantity, 0))}
              </span>
            </div>
            {order.shipping_cost != null && order.shipping_cost > 0 && (
              <div className="flex justify-between text-neutral-500">
                <span>Envío</span>
                <span className="tabular-nums text-neutral-700">{formatPrice(order.shipping_cost)}</span>
              </div>
            )}
            {order.discount != null && order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento transferencia</span>
                <span className="tabular-nums">− {formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-1 border-t border-neutral-200">
              <span>Total</span>
              <span className="tabular-nums text-base">{formatPrice(order.total)}</span>
            </div>
          </section>

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
