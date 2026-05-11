import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Wallet,
  Truck,
  ExternalLink,
  ShoppingBag,
  User,
  MapPin,
  StickyNote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/store/cart';
import { formatPrice, type CartItem } from '@/types/shop';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CheckoutResult {
  order_id?: string;
  mercadopago_url?: string;
}

type Payment = 'mercadopago' | 'transferencia';

// All fields are required — including notes — per the brief.
const schema = z.object({
  customer_name:    z.string().trim().min(3, 'Ingresá tu nombre completo').max(200),
  customer_email:   z.string().trim().email('Email inválido').max(255),
  customer_phone:   z.string().trim().min(8, 'Teléfono incompleto').max(30),
  shipping_address: z.string().trim().min(5, 'Dirección requerida').max(300),
  shipping_city:    z.string().trim().min(2, 'Ciudad requerida').max(100),
  shipping_zip:     z.string().trim().min(4, 'Código postal inválido').max(15),
  notes:            z.string().trim().min(1, 'Escribí alguna aclaración para la entrega').max(1000),
});

type FormValues = z.infer<typeof schema>;

const BLANK: FormValues = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  shipping_address: '',
  shipping_city: '',
  shipping_zip: '',
  notes: '',
};

function calcShipping(zip: string, sub: number): number {
  if (sub >= 200000) return 0;
  if (!zip || zip.length < 4) return 0;
  const n = parseInt(zip.slice(0, 1), 10);
  if (n <= 1) return 4500;
  if (n <= 5) return 7800;
  return 12500;
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();

  const [form, setForm] = useState<FormValues>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [payment, setPayment] = useState<Payment>('mercadopago');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const sub = subtotal();
  const shipping = calcShipping(form.shipping_zip, sub);
  const total = sub + shipping;

  // Empty cart guard — only when not in success state (clear() empties items
  // after a successful submit, but we still want to show the success panel).
  if (items.length === 0 && !done) {
    return <EmptyCartView />;
  }

  const upd =
    (k: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormValues, string>> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as keyof FormValues] = i.message;
      });
      setErrors(errs);
      const first = parsed.error.issues[0]?.path[0] as string | undefined;
      if (first) document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const r = await apiPost<CheckoutResult>('/checkout', {
        customer_name:    parsed.data.customer_name,
        customer_email:   parsed.data.customer_email,
        customer_phone:   parsed.data.customer_phone,
        shipping_address: parsed.data.shipping_address,
        shipping_city:    parsed.data.shipping_city,
        shipping_zip:     parsed.data.shipping_zip,
        notes:            parsed.data.notes,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          type: i.type,
        })),
        subtotal: sub,
        shipping_cost: shipping,
        total,
        payment_method: payment,
      });
      setResult(r);
      setDone(true);
      clear();
      toast.success('¡Pedido confirmado!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Error al crear el pedido', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-16">
      <div className="container max-w-5xl px-6">
        <Link
          to="/tienda"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>

        {done ? (
          <SuccessPanel result={result} />
        ) : (
          <>
            <header className="mb-10 pb-6 border-b border-neutral-200">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
                Finalizar compra
              </h1>
              <p className="text-sm text-neutral-500 mt-2">
                Completá los datos para confirmar tu pedido. Todos los campos son obligatorios.
              </p>
            </header>

            {/* Mobile-only summary at top */}
            <div className="lg:hidden mb-8">
              <OrderSummary items={items} sub={sub} shipping={shipping} total={total} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10">
              <form onSubmit={submit} className="space-y-6" noValidate>
                <FormSection icon={User} title="Datos personales">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      id="co-customer_name"
                      label="Nombre completo"
                      value={form.customer_name}
                      onChange={upd('customer_name')}
                      error={errors.customer_name}
                      autoComplete="name"
                    />
                    <Field
                      id="co-customer_email"
                      label="Email"
                      type="email"
                      value={form.customer_email}
                      onChange={upd('customer_email')}
                      error={errors.customer_email}
                      autoComplete="email"
                    />
                  </div>
                  <Field
                    id="co-customer_phone"
                    label="Teléfono"
                    type="tel"
                    value={form.customer_phone}
                    onChange={upd('customer_phone')}
                    error={errors.customer_phone}
                    autoComplete="tel"
                    placeholder="11 1234-5678"
                  />
                </FormSection>

                <FormSection icon={MapPin} title="Dirección de envío">
                  <Field
                    id="co-shipping_address"
                    label="Dirección"
                    value={form.shipping_address}
                    onChange={upd('shipping_address')}
                    error={errors.shipping_address}
                    placeholder="Av. Siempre Viva 1234, depto 5B"
                    autoComplete="street-address"
                  />
                  <div className="grid sm:grid-cols-[1fr_140px] gap-4">
                    <Field
                      id="co-shipping_city"
                      label="Ciudad"
                      value={form.shipping_city}
                      onChange={upd('shipping_city')}
                      error={errors.shipping_city}
                      autoComplete="address-level2"
                    />
                    <Field
                      id="co-shipping_zip"
                      label="Código postal"
                      value={form.shipping_zip}
                      onChange={upd('shipping_zip')}
                      error={errors.shipping_zip}
                      autoComplete="postal-code"
                      inputMode="numeric"
                    />
                  </div>
                </FormSection>

                <FormSection icon={CreditCard} title="Método de pago">
                  <RadioGroup
                    value={payment}
                    onValueChange={(v) => setPayment(v as Payment)}
                    className="grid sm:grid-cols-2 gap-2"
                  >
                    <PayOption value="mercadopago"   icon={<CreditCard className="h-4 w-4" />} label="MercadoPago"   current={payment} />
                    <PayOption value="transferencia" icon={<Wallet     className="h-4 w-4" />} label="Transferencia" current={payment} />
                  </RadioGroup>
                  {payment === 'transferencia' && (
                    <p className="text-xs text-success font-medium mt-1">
                      5% de descuento extra al confirmar.
                    </p>
                  )}
                </FormSection>

                <FormSection icon={StickyNote} title="Notas del pedido">
                  <div className="space-y-1.5">
                    <Label htmlFor="co-notes" className="text-xs font-medium text-neutral-700">
                      Aclaraciones <span className="text-danger">*</span>
                    </Label>
                    <Textarea
                      id="co-notes"
                      rows={3}
                      value={form.notes}
                      onChange={upd('notes')}
                      placeholder="Ej: dejar en portería, llamar antes de llegar, horario preferido..."
                      aria-invalid={!!errors.notes}
                      className={cn(
                        'resize-none text-sm',
                        errors.notes && 'border-danger focus-visible:ring-danger/30',
                      )}
                    />
                    {errors.notes && <p className="text-xs text-danger">{errors.notes}</p>}
                  </div>
                </FormSection>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className={cn(
                    'w-full h-12 text-sm font-medium tracking-wide shadow-none',
                    'bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active',
                  )}
                >
                  {loading ? 'Procesando...' : `Confirmar pedido · ${formatPrice(total)}`}
                </Button>
              </form>

              {/* Desktop sticky summary */}
              <aside className="hidden lg:block">
                <div className="lg:sticky lg:top-24">
                  <OrderSummary items={items} sub={sub} shipping={shipping} total={total} />
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function EmptyCartView() {
  return (
    <main className="min-h-screen bg-neutral-50 pt-24 pb-16">
      <div className="container max-w-md px-6 text-center">
        <Link
          to="/tienda"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand mb-12 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la tienda
        </Link>
        <div className="grid place-items-center mx-auto h-16 w-16 rounded-full bg-neutral-100 text-neutral-400 mb-6">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Tu carrito está vacío
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Volvé a la tienda y agregá productos antes de finalizar la compra.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 bg-brand text-brand-foreground hover:bg-brand-hover"
        >
          <Link to="/tienda">Ir a la tienda</Link>
        </Button>
      </div>
    </main>
  );
}

function SuccessPanel({ result }: { result: CheckoutResult | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className="max-w-xl mx-auto text-center pt-8"
    >
      <span className="grid place-items-center h-16 w-16 rounded-full bg-success/10 text-success mx-auto mb-6">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-900">
        ¡Pedido confirmado!
      </h1>
      <p className="text-sm text-neutral-500 mt-3 max-w-md mx-auto leading-relaxed">
        Te enviamos un email con los detalles. Si elegiste transferencia te contactamos a la brevedad.
        {result?.order_id && (
          <>
            <br />
            <span className="text-neutral-700 font-medium">N° de orden: {result.order_id}</span>
          </>
        )}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
        {result?.mercadopago_url && (
          <a
            href={result.mercadopago_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-md text-sm font-medium tracking-wide text-white bg-brand hover:bg-brand-hover transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> Pagar con MercadoPago
          </a>
        )}
        <Button asChild variant="outline" size="lg">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </motion.div>
  );
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
        <span className="grid place-items-center h-7 w-7 rounded-md bg-brand/10 text-brand">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-display text-base font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  id: string;
  label: string;
  error?: string;
}

function Field({ id, label, error, className, ...rest }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-neutral-700">
        {label} <span className="text-danger">*</span>
      </Label>
      <Input
        id={id}
        aria-invalid={!!error}
        className={cn(error && 'border-danger focus-visible:ring-danger/30', className)}
        {...rest}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function PayOption({
  value,
  icon,
  label,
  current,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  current: string;
}) {
  const selected = value === current;
  return (
    <Label
      htmlFor={`pay-${value}`}
      className={cn(
        'flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors',
        selected
          ? 'border-brand bg-brand/5 text-neutral-900 shadow-xs'
          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700',
      )}
    >
      <RadioGroupItem id={`pay-${value}`} value={value} />
      <span className="text-brand">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Label>
  );
}

function OrderSummary({
  items,
  sub,
  shipping,
  total,
}: {
  items: CartItem[];
  sub: number;
  shipping: number;
  total: number;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs">
      <h2 className="font-display text-base font-semibold text-neutral-900 mb-4">
        Resumen de tu pedido
      </h2>
      <ul className="space-y-3 max-h-[280px] overflow-y-auto pr-1 -mr-1">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-12 w-12 rounded-md object-cover bg-neutral-100 shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-md bg-neutral-100 grid place-items-center shrink-0">
                <ShoppingBag className="h-4 w-4 text-neutral-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-900 leading-snug line-clamp-2">
                {item.name}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Cantidad: {item.quantity}</p>
            </div>
            <p className="text-xs font-semibold text-neutral-900 tabular-nums shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-5 border-t border-neutral-200 space-y-2 text-sm">
        <div className="flex items-center justify-between text-neutral-500">
          <span>Subtotal</span>
          <span className="text-neutral-900 tabular-nums">{formatPrice(sub)}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Envío
          </span>
          <span
            className={cn(
              'tabular-nums',
              shipping === 0 ? 'text-success font-semibold' : 'text-neutral-900',
            )}
          >
            {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
          </span>
        </div>
        <div className="pt-3 border-t border-neutral-200 flex items-baseline justify-between">
          <span className="font-display font-semibold text-neutral-900">Total</span>
          <span className="font-display text-lg font-semibold text-brand tabular-nums">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </section>
  );
}
