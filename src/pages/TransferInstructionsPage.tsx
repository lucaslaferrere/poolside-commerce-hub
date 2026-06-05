import { useParams, useLocation, Link } from 'react-router-dom';
import { Copy, CheckCircle2, MessageCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/types/shop';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { toast } from 'sonner';

const BANK = {
  name:      'Banco Galicia',
  cbu:       '0070217320000006632504',
  cuenta:    '0006632-5 217-0',
  cuit:      '30-71597598-6',
  alias:     'DLS.GALICIA',
  razon:     'Desarrollos Lumínicos Subacuáticos SRL',
};

interface LocationState {
  total?: number;
  orderId?: string;
  items?: { name?: string; variant_sku: string; quantity: number; unit_price: number }[];
  shippingCost?: number;
  discount?: number;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copiado`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0 gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
        <p className="font-mono text-sm text-neutral-900 mt-0.5">{value}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        title={`Copiar ${label}`}
      >
        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function TransferInstructionsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { state } = useLocation();
  const s = (state as LocationState) ?? {};

  const subtotal = (s.items ?? []).reduce((acc, i) => acc + i.unit_price * i.quantity, 0);
  const total    = s.total ?? subtotal;
  const discount = s.discount ?? 0;
  const shippingCost = s.shippingCost ?? 0;

  const whatsappMsg = `Hola Pooled! Acabo de realizar una transferencia por el pedido #${(orderId ?? '').slice(-8).toUpperCase()} por ${formatPrice(total)}. Adjunto el comprobante.`;

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-16">
      <div className="container max-w-5xl px-6">
        <Link
          to="/tienda"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la tienda
        </Link>

        <header className="mb-8 pb-6 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-900">
              ¡Pedido confirmado!
            </h1>
          </div>
          {orderId && (
            <p className="text-sm text-neutral-500 ml-12">
              N° de orden: <span className="font-mono text-neutral-700">#{orderId.slice(-8).toUpperCase()}</span>
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">

          {/* ── Instrucciones ── */}
          <div className="space-y-6">
            <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-xs">
              <h2 className="font-display text-lg font-semibold text-neutral-900 mb-1">
                Datos para la transferencia
              </h2>
              <p className="text-sm text-neutral-500 mb-5">
                Transferí <strong className="text-neutral-900">{formatPrice(total)}</strong> a la siguiente cuenta y envianos el comprobante por WhatsApp.
              </p>

              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">Banco</p>
                <p className="font-display text-xl font-bold text-neutral-900">{BANK.name}</p>
              </div>

              <CopyField label="CBU"          value={BANK.cbu} />
              <CopyField label="Alias"        value={BANK.alias} />
              <CopyField label="N° de cuenta" value={BANK.cuenta} />
              <CopyField label="CUIT"         value={BANK.cuit} />

              <div className="pt-3 border-t border-neutral-100 mt-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Razón social</p>
                <p className="text-sm text-neutral-700 mt-0.5">{BANK.razon}</p>
              </div>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm text-amber-800">
                Una vez realizada la transferencia, <strong>envianos el comprobante por WhatsApp</strong> para acreditar tu pago y procesar el envío.
              </p>
              <a
                href={buildWhatsAppLink(whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-md bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar comprobante por WhatsApp
              </a>
            </section>
          </div>

          {/* ── Resumen ── */}
          <aside>
            <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs sticky top-24">
              <h2 className="font-display text-base font-semibold text-neutral-900 mb-4">
                Resumen del pedido
              </h2>

              {s.items && s.items.length > 0 && (
                <ul className="space-y-3 mb-5 max-h-[260px] overflow-y-auto">
                  {s.items.map((item, i) => (
                    <li key={i} className="flex justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.name || item.variant_sku}</p>
                        <p className="text-xs text-neutral-500">× {item.quantity}</p>
                      </div>
                      <p className="tabular-nums text-neutral-900 shrink-0">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t border-neutral-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-neutral-700">{formatPrice(subtotal)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-neutral-500">
                    <span>Envío</span>
                    <span className="tabular-nums text-neutral-700">{formatPrice(shippingCost)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Descuento transferencia (3.5%)</span>
                    <span className="tabular-nums">− {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display font-bold text-base pt-2 border-t border-neutral-200">
                  <span>Total a transferir</span>
                  <span className="tabular-nums text-brand">{formatPrice(total)}</span>
                </div>
              </div>
            </section>
          </aside>

        </div>
      </div>
    </main>
  );
}
