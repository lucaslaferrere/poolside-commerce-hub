import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Clock, Package, Truck, CheckCircle2, XCircle,
  User, FileText, CreditCard, Calendar,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { apiGet } from '@/lib/api';
import { formatPrice } from '@/types/shop';
import type { Order, OrderStatus } from '@/types/shop';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Clock; badgeClass: string }> = {
  pending:    { label: 'Pendiente de pago', icon: Clock,        badgeClass: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200' },
  paid:       { label: 'Pago confirmado',   icon: CheckCircle2, badgeClass: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200' },
  processing: { label: 'En preparación',    icon: Package,      badgeClass: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200' },
  shipped:    { label: 'En camino',          icon: Truck,        badgeClass: 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200' },
  delivered:  { label: 'Entregado',          icon: CheckCircle2, badgeClass: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200' },
  cancelled:  { label: 'Cancelado',          icon: XCircle,      badgeClass: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200' },
  rejected:   { label: 'Rechazado',          icon: XCircle,      badgeClass: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200' },
};

function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'me'],
    queryFn: () => apiGet<{ orders: Order[]; total: number }>('/orders/me'),
  });
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" aria-hidden="true" />
      <h3 className="text-xs font-semibold uppercase tracking-wider">{children}</h3>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const sd = order.shipping_details;
  const subtotal = order.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  const paymentLabel =
    order.payment_method === 'mercadopago' ? 'MercadoPago' :
    order.payment_method === 'transferencia' ? 'Transferencia bancaria' :
    order.payment_method ?? '—';

  const addressLine = order.delivery_method === 'retirar' ? 'Retiro en local' : sd?.address ?? '—';
  const cityLine =
    order.delivery_method === 'retirar'
      ? 'Zona Pilar'
      : [sd?.city, sd?.province].filter(Boolean).join(', ') + (sd?.postal_code ? ` (${sd.postal_code})` : '');

  const deliveryLabel = order.delivery_method === 'retirar' ? 'Retiro' : 'Envío';

  return (
    <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Pedido</h2>
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
              #{order.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Badge className={cn('rounded-full border-0 px-2.5 py-0.5 text-xs font-medium', cfg.badgeClass)}>
              {cfg.label}
            </Badge>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {new Date(order.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Cliente */}
          <section className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4">
            <SectionTitle icon={User}>Cliente</SectionTitle>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-foreground">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
              {order.dni_cuit && (
                <p className="text-sm text-muted-foreground">DNI/CUIT: {order.dni_cuit}</p>
              )}
            </div>
          </section>

          {/* Entrega */}
          <section className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4">
            <SectionTitle icon={Truck}>Entrega</SectionTitle>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-foreground">{addressLine}</p>
              {cityLine && <p className="text-sm text-muted-foreground">{cityLine}</p>}
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 text-xs text-foreground ring-1 ring-inset ring-border">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                {paymentLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 text-xs text-foreground ring-1 ring-inset ring-border">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                {deliveryLabel}
              </span>
            </div>
            {order.tracking_number && (
              <p className="mt-1 text-xs text-muted-foreground">
                N° de seguimiento: <span className="font-mono text-foreground">{order.tracking_number}</span>
              </p>
            )}
          </section>

          {/* Factura A */}
          {order.factura_a && (
            <section className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 sm:col-span-2">
              <SectionTitle icon={FileText}>Factura A</SectionTitle>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <p className="font-medium text-foreground">{order.factura_a.razon_social}</p>
                <p className="text-sm text-muted-foreground">CUIT: {order.factura_a.cuit}</p>
              </div>
            </section>
          )}

          {/* Notas */}
          {order.notes && (
            <section className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 sm:col-span-2">
              <SectionTitle icon={FileText}>Notas</SectionTitle>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </section>
          )}
        </div>

        {/* Productos */}
        <div className="mt-5 flex flex-col gap-3">
          <SectionTitle icon={Package}>Productos</SectionTitle>
          <ul className="overflow-hidden rounded-xl border border-border">
            {order.items.map((item, i) => (
              <li
                key={i}
                className={cn(
                  'flex items-center justify-between gap-4 px-4 py-3.5',
                  i !== 0 && 'border-t border-border',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground">
                    {item.quantity}
                  </span>
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name || item.variant_sku || `Producto ${item.product_id.slice(-6).toUpperCase()}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-foreground">{formatPrice(item.unit_price * item.quantity)}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(item.unit_price)} c/u</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer / Totales */}
      <div className="border-t border-border bg-muted/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal productos</span>
          <span className="text-sm font-medium text-foreground">{formatPrice(subtotal)}</span>
        </div>
        {order.shipping_cost != null && order.shipping_cost > 0 && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">Envío</span>
            <span className="text-sm font-medium text-foreground">{formatPrice(order.shipping_cost)}</span>
          </div>
        )}
        {order.discount != null && order.discount > 0 && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-emerald-600">Descuento transferencia</span>
            <span className="text-sm font-medium text-emerald-600">− {formatPrice(order.discount)}</span>
          </div>
        )}
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <>
      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100">
          <div>
            <p className="text-xs text-neutral-400 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {new Date(order.created_at).toLocaleDateString('es-AR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', cfg.badgeClass)}>
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
          </span>
        </div>

        {/* Items preview */}
        <div className="px-5 py-4 space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-neutral-700">
                <span className="text-neutral-400 mr-1">×{item.quantity}</span>
                {item.name || item.variant_sku || `Producto ${item.product_id.slice(-6).toUpperCase()}`}
              </span>
              <span className="tabular-nums text-neutral-600">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-neutral-50 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Ver detalle
          </button>
          <span className="font-semibold tabular-nums">{formatPrice(order.total)}</span>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
          <OrderDetailModal order={order} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
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
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
