import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
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
  const mutation = useUpdateOrderStatus();

  const handleConfirm = async () => {
    if (!order) return;
    await mutation.mutateAsync({ id: order.id, status });
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar estado del pedido</DialogTitle>
        </DialogHeader>
        <div className="py-2">
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
