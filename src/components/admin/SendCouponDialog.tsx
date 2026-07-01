import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiGet, apiPost } from '@/lib/api';
import { formatPrice } from '@/types/shop';
import { toast } from 'sonner';
import type { AdminCart } from './CartDetailDialog';

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  expires_at?: string;
}

export function SendCouponDialog({ cart, onClose }: { cart: AdminCart | null; onClose: () => void }) {
  const [couponId, setCouponId] = useState('');

  const { data: coupons } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => apiGet<{ coupons: Coupon[] }>('/admin/coupons').then((r) => r.coupons ?? []),
  });
  const { data: template } = useQuery({
    queryKey: ['admin', 'abandoned-template'],
    queryFn: () => apiGet<{ body: string }>('/admin/settings/abandoned-cart-email').then((r) => r.body),
  });

  const selected = (coupons ?? []).find((c) => c.id === couponId);

  const preview = useMemo(() => {
    if (!template || !cart) return '';
    const productos = cart.items
      .map((i) => `- ${i.name || i.variant_sku} x${i.quantity}`)
      .join('\n');
    const vencimiento = selected?.expires_at
      ? new Date(selected.expires_at).toLocaleDateString('es-AR')
      : 'sin vencimiento';
    return template
      .replaceAll('{{codigo}}', selected?.code ?? '{{codigo}}')
      .replaceAll('{{descuento}}', selected ? `${selected.discount_percent}%` : '{{descuento}}')
      .replaceAll('{{vencimiento}}', vencimiento)
      .replaceAll('{{productos}}', productos)
      .replaceAll('{{total}}', formatPrice(cart.total));
  }, [template, cart, selected]);

  const send = useMutation({
    mutationFn: () => apiPost(`/admin/carts/${cart!.user_id}/send-coupon`, { coupon_id: couponId }),
    onSuccess: () => { toast.success('Email enviado'); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeCoupons = (coupons ?? []).filter((c) => c.active);

  return (
    <Dialog open={!!cart} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar cupón a {cart?.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Cupón</Label>
            <Select value={couponId} onValueChange={setCouponId}>
              <SelectTrigger><SelectValue placeholder="Elegí un cupón" /></SelectTrigger>
              <SelectContent>
                {activeCoupons.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} — {c.discount_percent}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Vista previa</Label>
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground max-h-64 overflow-y-auto">
              {preview || 'Elegí un cupón para ver el mensaje.'}
            </pre>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => send.mutate()} disabled={!couponId || send.isPending}>
            {send.isPending ? 'Enviando...' : 'Enviar email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
