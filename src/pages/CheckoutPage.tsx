import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Package,
  FileText,
  ChevronDown,
  Clock,
  Tag,
  X,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/store/cart';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, type CartItem } from '@/types/shop';
import { apiPost, apiGet } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { calcShipping, PROVINCES } from '@/lib/shipping';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CheckoutResult {
  order?: { id?: string };
  init_point?: string;
  sandbox_init_point?: string;
}

type Payment  = 'mercadopago' | 'transferencia';
type Delivery = 'envio' | 'retirar';

const TRANSFER_DISCOUNT = 0.035; // 3.5%

const schema = z.object({
  customer_name:    z.string().trim().min(3, 'Ingresá tu nombre completo').max(200),
  customer_email:   z.string().trim().email('Email inválido').max(255),
  customer_phone:   z.string().trim().min(8, 'Teléfono incompleto').max(30),
  dni_cuit:         z.string().trim().min(7, 'Ingresá tu DNI o CUIT').max(30),
  shipping_address:  z.string().trim().max(300).optional().or(z.literal('')),
  shipping_province: z.string().trim().max(100).optional().or(z.literal('')),
  shipping_city:     z.string().trim().max(100).optional().or(z.literal('')),
  shipping_zip:      z.string().trim().max(15).optional().or(z.literal('')),
  notes:            z.string().trim().max(1000).optional().or(z.literal('')),
  razon_social:     z.string().trim().max(200).optional().or(z.literal('')),
  cuit_factura:     z.string().trim().max(30).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

const BLANK: FormValues = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  dni_cuit: '',
  shipping_address: '',
  shipping_province: '',
  shipping_city: '',
  shipping_zip: '',
  notes: '',
  razon_social: '',
  cuit_factura: '',
};


export default function CheckoutPage() {
  const { items, subtotal, clear, add } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const cartToken = searchParams.get('cart');
  const [cartLinkLoading, setCartLinkLoading] = useState(!!cartToken);
  const trackedCheckout = useRef(false);

  // Carga items desde un cart link si viene ?cart=TOKEN
  useEffect(() => {
    if (!cartToken || items.length > 0) {
      setCartLinkLoading(false);
      return;
    }
    apiGet<{ items: Array<{ product_id: string; variant_sku: string; name: string; image_url: string; unit_price: number; quantity: number; type: string }> }>(
      `/cart-links/${cartToken}`
    ).then((res) => {
      res.items.forEach((item) => {
        add({
          id: item.product_id,
          name: item.name,
          price: item.unit_price,
          image_url: item.image_url || null,
          type: item.type as 'product' | 'kit',
          variant_sku: item.variant_sku || undefined,
        }, item.quantity);
      });
    }).catch(() => {/* link expirado o inválido */}).finally(() => {
      setCartLinkLoading(false);
    });
  }, [cartToken]);

  useEffect(() => {
    if (!cartLinkLoading && items.length > 0 && !trackedCheckout.current) {
      trackedCheckout.current = true;
      trackEvent('checkout_start', { item_count: items.length });
    }
  }, [cartLinkLoading, items.length]);

  const [form, setForm] = useState<FormValues>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [payment,      setPayment]      = useState<Payment>('transferencia');
  const [delivery,     setDelivery]     = useState<Delivery>('envio');
  const [wantsFactura, setWantsFactura] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const [couponInput, setCouponInput]     = useState('');
  const [couponCode, setCouponCode]       = useState('');
  const [couponPercent, setCouponPercent] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError]     = useState('');

  const sub          = subtotal();
  const shippingQuote = delivery === 'retirar' ? null : calcShipping(form.shipping_province ?? '', 1, 'domicilio', sub);
  const shippingCost  = shippingQuote?.price ?? 0;
  const discount      = payment === 'transferencia' ? Math.round(sub * TRANSFER_DISCOUNT) : 0;
  const couponDiscount = couponPercent > 0 ? Math.round(sub * couponPercent / 100) : 0;
  const total         = sub + shippingCost - discount - couponDiscount;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await apiPost<{ code: string; discount_percent: number }>('/coupons/validate', { code: couponInput.trim() });
      setCouponCode(res.code);
      setCouponPercent(res.discount_percent);
      setCouponInput('');
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Cupón inválido');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponPercent(0);
    setCouponError('');
    setCouponInput('');
  };

  // Empty cart guard — espera a que se carguen items desde cart link antes de mostrar vacío
  if (items.length === 0 && !done && !cartLinkLoading) {
    return <EmptyCartView />;
  }

  const upd =
    (k: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si no está logueado, redirige a login y vuelve al checkout con los mismos params
    if (!isAuthenticated) {
      const returnTo = '/checkout' + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      navigate(`/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }

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
    // Validate Factura A fields when requested
    if (wantsFactura) {
      const extra: Partial<Record<keyof FormValues, string>> = {};
      if (!form.razon_social?.trim()) extra.razon_social = 'Razón social requerida';
      if (!form.cuit_factura?.trim()) extra.cuit_factura = 'CUIT requerido';
      if (Object.keys(extra).length) { setErrors(extra); return; }
    }

    // Validate shipping fields only when delivery = envio
    if (delivery === 'envio') {
      const extra: Partial<Record<keyof FormValues, string>> = {};
      if (!form.shipping_address?.trim())  extra.shipping_address  = 'Dirección requerida';
      if (!form.shipping_province?.trim()) extra.shipping_province = 'Provincia requerida';
      if (!form.shipping_city?.trim())     extra.shipping_city     = 'Ciudad requerida';
      if (!form.shipping_zip?.trim() || form.shipping_zip.trim().length < 4) extra.shipping_zip = 'Código postal inválido';
      if (Object.keys(extra).length) { setErrors(extra); return; }
    }

    setErrors({});
    setLoading(true);
    try {
      const r = await apiPost<CheckoutResult>('/checkout', {
        customer_name:    parsed.data.customer_name,
        customer_email:   parsed.data.customer_email,
        customer_phone:   parsed.data.customer_phone,
        shipping_address:  delivery === 'retirar' ? 'RETIRO EN LOCAL' : (parsed.data.shipping_address  ?? ''),
        shipping_province: delivery === 'retirar' ? '' : (parsed.data.shipping_province ?? ''),
        shipping_city:     delivery === 'retirar' ? '' : (parsed.data.shipping_city     ?? ''),
        shipping_zip:      delivery === 'retirar' ? '' : (parsed.data.shipping_zip      ?? ''),
        notes:            parsed.data.notes,
        items: items.map((i) => ({
          product_id: i.id.split('|')[0],
          variant_sku: i.variant_sku ?? '',
          quantity: i.quantity,
        })),
        dni_cuit:        parsed.data.dni_cuit,
        subtotal: sub,
        shipping_cost: shippingCost,
        discount,
        total,
        payment_method:  payment,
        delivery_method: delivery,
        coupon_code:     couponCode || undefined,
        factura_a: wantsFactura ? {
          razon_social: parsed.data.razon_social ?? '',
          cuit:         parsed.data.cuit_factura ?? '',
        } : undefined,
      });
      setResult(r);
      setDone(true);
      clear();
      toast.success('¡Pedido confirmado!');
      const mpUrl = r.init_point || r.sandbox_init_point;
      if (mpUrl && payment === 'mercadopago') {
        window.location.href = mpUrl;
      } else if (payment === 'transferencia' && r.order?.id) {
        navigate(`/transferencia/${r.order.id}`, {
          state: {
            total,
            orderId: r.order.id,
            items: items.map((i) => ({
              name:       i.name,
              variant_sku: i.variant_sku ?? '',
              quantity:   i.quantity,
              unit_price: i.price,
            })),
            shippingCost,
            discount,
          },
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
              <OrderSummary items={items} sub={sub} shippingQuote={shippingQuote} discount={discount} couponDiscount={couponDiscount} couponCode={couponCode} total={total} delivery={delivery} />
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
                    <Field
                      id="co-dni_cuit"
                      label="DNI / CUIT"
                      value={form.dni_cuit ?? ''}
                      onChange={upd('dni_cuit')}
                      error={errors.dni_cuit}
                      placeholder="Ej: 20-12345678-9"
                      inputMode="numeric"
                    />
                  </div>
                </FormSection>

                <FormSection icon={Truck} title="Método de entrega">
                  <RadioGroup
                    value={delivery}
                    onValueChange={(v) => setDelivery(v as Delivery)}
                    className="grid sm:grid-cols-2 gap-2"
                  >
                    <PayOption value="envio"   icon={<Truck   className="h-4 w-4" />} label="Envío a domicilio" current={delivery} />
                    <PayOption value="retirar" icon={<Package className="h-4 w-4" />} label="Retirar"           current={delivery} />
                  </RadioGroup>
                  {delivery === 'retirar' && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Te contactamos para coordinar el retiro.
                    </p>
                  )}
                </FormSection>

                {delivery === 'envio' && (
                  <FormSection icon={MapPin} title="Dirección de envío">
                    <Field
                      id="co-shipping_address"
                      label="Dirección"
                      value={form.shipping_address ?? ''}
                      onChange={upd('shipping_address')}
                      error={errors.shipping_address}
                      placeholder="Av. Siempre Viva 1234, depto 5B"
                      autoComplete="street-address"
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor="co-shipping_province" className="text-xs font-medium text-neutral-700">
                        Provincia <span className="text-danger">*</span>
                      </Label>
                      <Select
                        value={form.shipping_province ?? ''}
                        onValueChange={(v) => setForm((f) => ({ ...f, shipping_province: v }))}
                      >
                        <SelectTrigger
                          id="co-shipping_province"
                          className={cn(errors.shipping_province && 'border-danger focus-visible:ring-danger/30')}
                        >
                          <SelectValue placeholder="Seleccioná tu provincia" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCES.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.shipping_province && (
                        <p className="text-xs text-danger">{errors.shipping_province}</p>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-[1fr_140px] gap-4">
                      <Field
                        id="co-shipping_city"
                        label="Ciudad"
                        value={form.shipping_city ?? ''}
                        onChange={upd('shipping_city')}
                        error={errors.shipping_city}
                        autoComplete="address-level2"
                      />
                      <Field
                        id="co-shipping_zip"
                        label="Código postal"
                        value={form.shipping_zip ?? ''}
                        onChange={upd('shipping_zip')}
                        error={errors.shipping_zip}
                        autoComplete="postal-code"
                        inputMode="numeric"
                      />
                    </div>
                  </FormSection>
                )}

                <FormSection icon={CreditCard} title="Método de pago">
                  <RadioGroup
                    value={payment}
                    onValueChange={(v) => setPayment(v as Payment)}
                    className="grid sm:grid-cols-2 gap-2"
                  >
                    <PayOption value="mercadopago" icon={<CreditCard className="h-4 w-4" />} label="MercadoPago" current={payment} />
                    <PayOption value="transferencia" icon={<Wallet className="h-4 w-4" />} label="Transferencia" current={payment} />
                  </RadioGroup>
                  {payment === 'transferencia' && (
                    <p className="text-xs text-success font-medium mt-1">
                      3.5% de descuento extra al confirmar.
                    </p>
                  )}
                </FormSection>

                {/* Cupón de descuento */}
                <div className="rounded-lg border border-neutral-200 bg-white shadow-xs p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="grid place-items-center h-7 w-7 rounded-md bg-brand/10 text-brand">
                      <Tag className="h-4 w-4" />
                    </span>
                    <h2 className="font-display text-base font-semibold text-neutral-900">Cupón de descuento</h2>
                    <span className="text-xs text-neutral-400 font-normal">(opcional)</span>
                  </div>

                  {couponCode ? (
                    <div className="flex items-center justify-between bg-success/8 border border-success/20 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-success" />
                        <span className="text-sm font-semibold text-success">{couponCode}</span>
                        <span className="text-xs text-success/70">— {couponPercent}% de descuento aplicado</span>
                      </div>
                      <button type="button" onClick={removeCoupon} className="text-neutral-400 hover:text-danger transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ingresá tu código"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                        className={cn('uppercase', couponError && 'border-danger focus-visible:ring-danger/30')}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="shrink-0"
                      >
                        {couponLoading ? 'Validando...' : 'Aplicar'}
                      </Button>
                    </div>
                  )}
                  {couponError && <p className="text-xs text-danger">{couponError}</p>}
                </div>

                {/* Factura A */}
                <div className="rounded-lg border border-neutral-200 bg-white shadow-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setWantsFactura((v) => !v)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid place-items-center h-7 w-7 rounded-md bg-brand/10 text-brand">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="font-display text-base font-semibold text-neutral-900">Factura A</span>
                      <span className="text-xs text-neutral-400 font-normal">(opcional)</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 text-neutral-400 transition-transform', wantsFactura && 'rotate-180')} />
                  </button>
                  {wantsFactura && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-4 border-t border-neutral-100 pt-4">
                      <Field
                        id="co-razon_social"
                        label="Razón social"
                        value={form.razon_social ?? ''}
                        onChange={upd('razon_social')}
                        error={errors.razon_social}
                        placeholder="Nombre de la empresa o persona jurídica"
                        autoComplete="organization"
                      />
                      <Field
                        id="co-cuit_factura"
                        label="CUIT"
                        value={form.cuit_factura ?? ''}
                        onChange={upd('cuit_factura')}
                        error={errors.cuit_factura}
                        placeholder="20-12345678-9"
                        inputMode="numeric"
                      />
                    </div>
                  )}
                </div>

                <FormSection icon={StickyNote} title="Notas del pedido">
                  <div className="space-y-1.5">
                    <Label htmlFor="co-notes" className="text-xs font-medium text-neutral-700">
                      Aclaraciones <span className="text-neutral-400 font-normal">(opcional)</span>
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
                  <OrderSummary items={items} sub={sub} shippingQuote={shippingQuote} discount={discount} couponDiscount={couponDiscount} couponCode={couponCode} total={total} delivery={delivery} />
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
        {result?.order?.id && (
          <>
            <br />
            <span className="text-neutral-700 font-medium">N° de orden: {result.order.id}</span>
          </>
        )}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
        {(result?.init_point || result?.sandbox_init_point) && (
          <a
            href={result.init_point || result.sandbox_init_point}
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
  shippingQuote,
  discount,
  couponDiscount,
  couponCode,
  total,
  delivery,
}: {
  items: CartItem[];
  sub: number;
  shippingQuote: { price: number; days: string; zone: string } | null;
  discount: number;
  couponDiscount: number;
  couponCode: string;
  total: number;
  delivery: Delivery;
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
          <span className={cn('tabular-nums text-right', delivery === 'retirar' ? 'text-neutral-900' : (!shippingQuote ? 'text-neutral-400 italic' : 'text-neutral-900'))}>
            {delivery === 'retirar'
              ? 'Zona Pilar'
              : shippingQuote
                ? shippingQuote.price === 0 ? 'Gratis' : formatPrice(shippingQuote.price)
                : 'Seleccioná provincia'}
          </span>
        </div>
        {delivery === 'retirar' && (
          <p className="text-xs text-neutral-400">
            Nos contactamos para coordinar el envío.
          </p>
        )}
        {delivery === 'envio' && shippingQuote && (
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Clock className="h-3 w-3" />
            {shippingQuote.days} · Zona {shippingQuote.zone}
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-success">
            <span>Cupón {couponCode}</span>
            <span className="tabular-nums font-medium">− {formatPrice(couponDiscount)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex items-center justify-between text-success">
            <span>Descuento transferencia (3.5%)</span>
            <span className="tabular-nums font-medium">− {formatPrice(discount)}</span>
          </div>
        )}
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
