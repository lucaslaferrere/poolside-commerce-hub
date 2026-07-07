import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiGet, apiPost } from '@/lib/api';
import { formatPrice } from '@/types/shop';
import { toast } from 'sonner';
import type { AdminCart } from './CartDetailDialog';
import type { EmailTemplate } from './EmailTemplatesDialog';

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  expires_at?: string;
}

const NO_COUPON = 'none';

export function SendCouponDialog({ cart, onClose }: { cart: AdminCart | null; onClose: () => void }) {
  const [templateId, setTemplateId] = useState('');
  const [couponId, setCouponId] = useState(NO_COUPON);

  useEffect(() => {
    setTemplateId('');
    setCouponId(NO_COUPON);
  }, [cart?.user_id]);

  const { data: templates } = useQuery({
    queryKey: ['admin', 'email-templates'],
    queryFn: () => apiGet<{ templates: EmailTemplate[] }>('/admin/email-templates').then((r) => r.templates ?? []),
  });
  const { data: coupons } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => apiGet<{ coupons: Coupon[] }>('/admin/coupons').then((r) => r.coupons ?? []),
  });

  const selectedTemplate = (templates ?? []).find((t) => t.id === templateId);
  const selectedCoupon = couponId === NO_COUPON ? undefined : (coupons ?? []).find((c) => c.id === couponId);

  const preview = useMemo(() => {
    if (!selectedTemplate || !cart) return '';
    const productos = cart.items.map((i) => `- ${i.name || i.variant_sku} x${i.quantity}`).join('\n');
    let text = selectedTemplate.body
      .replaceAll('{{productos}}', productos)
      .replaceAll('{{total}}', formatPrice(cart.total));
    if (selectedCoupon) {
      const vencimiento = selectedCoupon.expires_at
        ? new Date(selectedCoupon.expires_at).toLocaleDateString('es-AR')
        : 'sin vencimiento';
      text += `\n\n🎟️ Cupón ${selectedCoupon.code} — ${selectedCoupon.discount_percent}% de descuento · vence ${vencimiento}`;
    }
    return text;
  }, [selectedTemplate, cart, selectedCoupon]);

  const send = useMutation({
    mutationFn: () =>
      apiPost(`/admin/carts/${cart!.user_id}/send-coupon`, {
        template_id: templateId,
        coupon_id: couponId === NO_COUPON ? '' : couponId,
      }),
    onSuccess: () => { toast.success('Email enviado'); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeCoupons = (coupons ?? []).filter((c) => c.active);

  return (
    <Dialog open={!!cart} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar email a {cart?.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Plantilla</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger><SelectValue placeholder="Elegí una plantilla" /></SelectTrigger>
              <SelectContent>
                {(templates ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cupón (opcional)</Label>
            <Select value={couponId} onValueChange={setCouponId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_COUPON}>Sin cupón</SelectItem>
                {activeCoupons.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.code} — {c.discount_percent}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Vista previa</Label>
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground max-h-64 overflow-y-auto">
              {preview || 'Elegí una plantilla para ver el mensaje.'}
            </pre>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => send.mutate()} disabled={!templateId || send.isPending}>
            {send.isPending ? 'Enviando...' : 'Enviar email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
