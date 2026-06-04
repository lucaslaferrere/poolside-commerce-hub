import { Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/types/shop';
import type { Order, OrderStatus } from '@/types/shop';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending:    { label: 'Pendiente',   className: 'bg-neutral-100 text-neutral-600' },
  paid:       { label: 'Pagado',      className: 'bg-blue-100 text-blue-700' },
  processing: { label: 'En proceso',  className: 'bg-amber-100 text-amber-700' },
  shipped:    { label: 'Enviado',     className: 'bg-violet-100 text-violet-700' },
  delivered:  { label: 'Entregado',   className: 'bg-emerald-100 text-emerald-700' },
  cancelled:  { label: 'Cancelado',   className: 'bg-red-100 text-red-600' },
  rejected:   { label: 'Rechazado',   className: 'bg-red-100 text-red-600' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold', cfg.className)}>
      {cfg.label}
    </span>
  );
}

interface Props {
  orders: Order[];
  isLoading: boolean;
  onView: (order: Order) => void;
  onChangeStatus: (order: Order) => void;
}

export function OrdersTable({ orders, isLoading, onView, onChangeStatus }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-500">
        No hay pedidos todavía.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Fecha</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Cliente</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Items</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Total</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Estado</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Pago</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-xs">
                  {new Date(order.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3 min-w-0">
                  <p className="font-medium text-neutral-900 truncate max-w-[160px]">{order.customer_name}</p>
                  <p className="text-xs text-neutral-500 truncate max-w-[160px]">{order.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-neutral-500 tabular-nums">
                  {order.items.reduce((s, i) => s + i.quantity, 0)}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap">
                  {formatPrice(order.total)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500 capitalize whitespace-nowrap">
                  {order.payment_method || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-neutral-400 hover:text-brand"
                      onClick={() => onView(order)}
                      aria-label="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-neutral-400 hover:text-brand"
                      onClick={() => onChangeStatus(order)}
                      aria-label="Cambiar estado"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
