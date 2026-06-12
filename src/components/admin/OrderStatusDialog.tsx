import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Truck } from 'lucide-react';
import { useUpdateOrderStatus } from '@/hooks/useAdminOrders';
import type { Order, OrderStatus } from '@/types/shop';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',    label: 'Pendiente' },
  { value: 'paid',       label: 'Pagado' },
  { value: 'processing', label: 'En proceso' },
  { value: 'shipped',    label: 'Enviado' },
  { value: 'delivered',  label: 'Entregado' },
  { value: 'cancelled',  label: 'Cancelado' },
  { value: 'rejected',   label: 'Rechazado' },
];

interface Props {
  order: Order | null;
  onClose: () => void;
}

export function OrderStatusDialog({ order, onClose }: Props) {
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? 'pending');
  const [tracking, setTracking] = useState(order?.tracking_number ?? '');
  const [trackingError, setTrackingError] = useState('');
  const mutation = useUpdateOrderStatus();

  const needsTracking = status === 'shipped';

  const handleConfirm = async () => {
    if (!order) return;
    if (needsTracking && !tracking.trim()) {
      setTrackingError('Ingresá el número de seguimiento');
      return;
    }
    await mutation.mutateAsync({
      id: order.id,
      status,
      trackingNumber: needsTracking ? tracking.trim() : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar estado del pedido</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {needsTracking && (
            <div className="space-y-1.5">
              <Label htmlFor="tracking" className="flex items-center gap-1.5 text-xs font-medium">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                Número de seguimiento
              </Label>
              <Input
                id="tracking"
                placeholder="Ej: 360000123456789"
                value={tracking}
                onChange={(e) => { setTracking(e.target.value); setTrackingError(''); }}
                aria-invalid={!!trackingError}
              />
              {trackingError && <p className="text-xs text-destructive">{trackingError}</p>}
              <p className="text-xs text-muted-foreground">
                Se enviará un email al cliente con este número.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
