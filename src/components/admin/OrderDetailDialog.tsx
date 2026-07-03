import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Truck, FileText, Package, CreditCard, Calendar } from 'lucide-react';
import { formatPrice } from '@/types/shop';
import type { Order, OrderStatus } from '@/types/shop';
import { cn } from '@/lib/utils';
import { apiPostForm, apiPost } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Props {
  order: Order | null;
  onClose: () => void;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; badgeClass: string }> = {
  pending:    { label: 'Pendiente de pago', badgeClass: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200' },
  paid:       { label: 'Pago confirmado',   badgeClass: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200' },
  processing: { label: 'En preparación',    badgeClass: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200' },
  shipped:    { label: 'En camino',          badgeClass: 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200' },
  delivered:  { label: 'Entregado',          badgeClass: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200' },
  cancelled:  { label: 'Cancelado',          badgeClass: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200' },
  rejected:   { label: 'Rechazado',          badgeClass: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200' },
};

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" aria-hidden="true" />
      <h3 className="text-xs font-semibold uppercase tracking-wider">{children}</h3>
    </div>
  );
}

export function OrderDetailDialog({ order, onClose }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [invoiceSentAt, setInvoiceSentAt] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  // Sincronizar el estado local con el pedido actual (evita estado stale entre pedidos).
  useEffect(() => {
    setInvoiceSentAt(order?.invoice_sent_at);
  }, [order?.id, order?.invoice_sent_at]);

  const uploadInvoice = async (file: File) => {
    if (!order) return;
    if (file.type !== 'application/pdf') { toast.error('El archivo debe ser un PDF'); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error('El archivo supera los 8 MB'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiPostForm<{ invoice_sent_at: string }>(`/admin/orders/${order.id}/invoice`, form);
      setInvoiceSentAt(res.invoice_sent_at);
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Factura enviada al cliente');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo enviar la factura');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const resendInvoice = async () => {
    if (!order) return;
    setUploading(true);
    try {
      const res = await apiPost<{ invoice_sent_at: string }>(`/admin/orders/${order.id}/invoice/resend`, {});
      setInvoiceSentAt(res.invoice_sent_at);
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Factura reenviada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo reenviar');
    } finally {
      setUploading(false);
    }
  };

  if (!order) return null;

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
    <Dialog open={!!order} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
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
                  {new Date(order.created_at).toLocaleString('es-AR')}
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
                  <p className="text-sm text-muted-foreground">DNI/CUIT: {order.dni_cuit || '—'}</p>
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
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    {paymentLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 text-xs text-foreground ring-1 ring-inset ring-border">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    {deliveryLabel}
                  </span>
                </div>
                {order.tracking_number && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tracking: <span className="font-mono text-foreground">{order.tracking_number}</span>
                  </p>
                )}
              </section>

              {/* Factura A */}
              {order.factura_a ? (
                <section className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 sm:col-span-2">
                  <SectionTitle icon={FileText}>Factura A</SectionTitle>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <p className="font-medium text-foreground">{order.factura_a.razon_social}</p>
                    <p className="text-sm text-muted-foreground">CUIT: {order.factura_a.cuit}</p>
                  </div>
                </section>
              ) : null}

              {/* Factura (PDF) */}
              <section className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 sm:col-span-2">
                <SectionTitle icon={FileText}>Factura</SectionTitle>
                {invoiceSentAt ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-emerald-600 font-medium">
                      Factura enviada el {new Date(invoiceSentAt).toLocaleString('es-AR')}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={resendInvoice}
                        disabled={uploading}
                        className="text-xs rounded-md border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50"
                      >
                        Reenviar
                      </button>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="text-xs rounded-md border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50"
                      >
                        Subir otra
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Todavía no se envió factura para este pedido.</p>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="text-xs rounded-md bg-primary text-white px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
                    >
                      {uploading ? 'Enviando...' : 'Enviar factura al cliente'}
                    </button>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadInvoice(f); }}
                />
              </section>

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
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.name || item.variant_sku || item.product_id.slice(-8).toUpperCase()}
                        </p>
                        {item.name && item.variant_sku && (
                          <p className="font-mono text-xs text-muted-foreground truncate">{item.variant_sku}</p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-foreground">{formatPrice(item.unit_price * item.quantity)}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.unit_price)} c/u</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* IDs técnicos */}
            {(order.preference_id || order.payment_id) && (
              <div className="mt-4 space-y-1 rounded-lg border border-border bg-muted/20 px-4 py-3">
                {order.preference_id && (
                  <p className="text-[11px] text-muted-foreground font-mono">Preferencia MP: {order.preference_id}</p>
                )}
                {order.payment_id && (
                  <p className="text-[11px] text-muted-foreground font-mono">Pago MP: {order.payment_id}</p>
                )}
              </div>
            )}
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
            {order.coupon_discount != null && order.coupon_discount > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-emerald-600">
                  Cupón {order.coupon_code && <span className="font-mono font-semibold">{order.coupon_code}</span>}
                </span>
                <span className="text-sm font-medium text-emerald-600">− {formatPrice(order.coupon_discount)}</span>
              </div>
            )}
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(order.total)}</span>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
