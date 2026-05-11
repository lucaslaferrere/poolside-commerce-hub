import { useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, CreditCard, Wallet, Truck, ExternalLink } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/types/shop';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';

interface CheckoutResult {
  order_id?: string;
  mercadopago_url?: string;
}

const schema = z.object({
  customer_name: z.string().trim().min(2).max(200),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(6).max(30),
  shipping_address: z.string().trim().min(3).max(300),
  shipping_city: z.string().trim().min(2).max(100),
  shipping_zip: z.string().trim().min(3).max(15),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

// Mock zone calculation
function calcShipping(zip: string, subtotal: number): number {
  if (subtotal >= 200000) return 0; // free shipping
  if (!zip || zip.length < 4) return 0;
  const n = parseInt(zip.slice(0, 1), 10);
  if (n <= 1) return 4500; // CABA / GBA
  if (n <= 5) return 7800; // Provincia BA / Centro
  return 12500; // Resto del país
}

export function CheckoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState<FormData>({
    customer_name: '', customer_email: '', customer_phone: '',
    shipping_address: '', shipping_city: '', shipping_zip: '', notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [payment, setPayment] = useState<'mercadopago' | 'transferencia'>('mercadopago');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const sub = subtotal();

  const upd = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormData, string>> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as keyof FormData] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await apiPost<CheckoutResult>('/checkout', {
        customer_name: parsed.data.customer_name,
        customer_email: parsed.data.customer_email,
        customer_phone: parsed.data.customer_phone,
        shipping_address: parsed.data.shipping_address,
        shipping_city: parsed.data.shipping_city,
        shipping_zip: parsed.data.shipping_zip,
        notes: parsed.data.notes || undefined,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, type: i.type })),
        subtotal: sub,
        shipping_cost: shipping,
        total,
        payment_method: payment,
      });
      setCheckoutResult(result);
      setDone(true);
      clear();
      toast.success('¡Pedido confirmado!');
    } catch (err) {
      toast.error('Error al crear el pedido', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(() => { setDone(false); setCheckoutResult(null); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <DialogTitle className="font-display text-2xl">¡Pedido confirmado!</DialogTitle>
            <DialogDescription className="mt-3">
              Te enviamos un email con los detalles. Si elegiste transferencia, te contactamos a la brevedad.
            </DialogDescription>
            {checkoutResult?.mercadopago_url && (
              <Button asChild size="lg" className="mt-6 gradient-aqua text-primary-foreground">
                <a href={checkoutResult.mercadopago_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" /> Pagar con MercadoPago
                </a>
              </Button>
            )}
            <Button onClick={close} variant={checkoutResult?.mercadopago_url ? 'outline' : 'default'} className={checkoutResult?.mercadopago_url ? 'mt-3' : 'mt-6 gradient-aqua text-primary-foreground'}>
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Finalizar compra</DialogTitle>
              <DialogDescription>Completá tus datos para confirmar el pedido.</DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Nombre completo" id="customer_name" value={form.customer_name} onChange={upd('customer_name')} error={errors.customer_name} />
                <Field label="Email" id="customer_email" type="email" value={form.customer_email} onChange={upd('customer_email')} error={errors.customer_email} />
                <Field label="Teléfono" id="customer_phone" type="tel" value={form.customer_phone} onChange={upd('customer_phone')} error={errors.customer_phone} />
                <Field label="Código postal" id="shipping_zip" value={form.shipping_zip} onChange={upd('shipping_zip')} error={errors.shipping_zip} />
              </div>
              <Field label="Dirección" id="shipping_address" value={form.shipping_address} onChange={upd('shipping_address')} error={errors.shipping_address} />
              <Field label="Ciudad" id="shipping_city" value={form.shipping_city} onChange={upd('shipping_city')} error={errors.shipping_city} />

              <div className="space-y-2">
                <Label>Método de pago</Label>
                <RadioGroup value={payment} onValueChange={(v) => setPayment(v as typeof payment)} className="grid sm:grid-cols-2 gap-2">
                  <PayOption value="mercadopago" icon={<CreditCard className="h-4 w-4" />} label="MercadoPago" current={payment} />
                  <PayOption value="transferencia" icon={<Wallet className="h-4 w-4" />} label="Transferencia" current={payment} />
                </RadioGroup>
                {payment === 'transferencia' && (
                  <p className="text-xs text-primary">5% de descuento extra al confirmar.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea id="notes" rows={2} value={form.notes} onChange={upd('notes')} placeholder="Aclaraciones de entrega, horarios, etc." />
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Envío</span>
                  <a
                    href={`https://www.andreani.com/personas/enviar-un-paquete${form.shipping_zip ? `?cpDestino=${form.shipping_zip}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Calcular con Andreani <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-display font-bold text-lg">
                  <span>Total</span><span className="text-primary">{formatPrice(sub)}<span className="text-sm font-normal text-muted-foreground ml-1">+ envío</span></span>
                </div>
              </div>

              <Button type="submit" disabled={loading || items.length === 0} size="lg" className="w-full gradient-aqua text-primary-foreground">
                {loading ? 'Procesando...' : 'Confirmar pedido'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label, id, type = 'text', value, onChange, error,
}: {
  label: string; id: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} aria-invalid={!!error} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PayOption({ value, icon, label, current }: { value: string; icon: React.ReactNode; label: string; current: string }) {
  const selected = value === current;
  return (
    <Label
      htmlFor={`pay-${value}`}
      className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
      }`}
    >
      <RadioGroupItem id={`pay-${value}`} value={value} />
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Label>
  );
}
