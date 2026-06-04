import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet } from '@/lib/api';
import { formatPrice } from '@/types/shop';
import type { Order, OrderStatus } from '@/types/shop';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending:    { label: 'Pendiente de pago', icon: Clock,         className: 'text-neutral-500 bg-neutral-100' },
  paid:       { label: 'Pago confirmado',   icon: CheckCircle2,  className: 'text-blue-600 bg-blue-50' },
  processing: { label: 'En preparación',    icon: Package,       className: 'text-amber-600 bg-amber-50' },
  shipped:    { label: 'En camino',          icon: Truck,         className: 'text-violet-600 bg-violet-50' },
  delivered:  { label: 'Entregado',          icon: CheckCircle2,  className: 'text-emerald-600 bg-emerald-50' },
  cancelled:  { label: 'Cancelado',          icon: XCircle,       className: 'text-red-500 bg-red-50' },
  rejected:   { label: 'Rechazado',          icon: XCircle,       className: 'text-red-500 bg-red-50' },
};

function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'me'],
    queryFn: () => apiGet<{ orders: Order[]; total: number }>('/orders/me'),
  });
}

export default function OrdersPage() {
  const { data, isLoading, isError } = useMyOrders();
  const orders = data?.orders ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl pt-24 pb-12">

        <h1 className="font-display text-3xl font-bold mb-6">Mis Pedidos</h1>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-5 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
            No se pudieron cargar los pedidos. Intentá recargar la página.
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-muted/30">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">Todavía no tenés pedidos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cuando realices una compra, aparecerá aquí.
            </p>
            <Button asChild className="mt-6 gradient-aqua text-primary-foreground">
              <Link to="/#tienda">Explorar productos</Link>
            </Button>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <div key={order.id} className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100">
                    <div>
                      <p className="text-xs text-neutral-400 font-mono">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('es-AR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', cfg.className)}>
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-700">
                          <span className="text-neutral-400 mr-1">×{item.quantity}</span>
                          {item.variant_sku || `Producto ${item.product_id.slice(-6).toUpperCase()}`}
                        </span>
                        <span className="tabular-nums text-neutral-600">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-3 bg-neutral-50 border-t border-neutral-100">
                    <span className="text-xs text-neutral-500 capitalize">
                      {order.payment_method === 'mercadopago' ? 'MercadoPago' : 'Transferencia'}
                    </span>
                    <span className="font-semibold tabular-nums">{formatPrice(order.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
