import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPatch } from '@/lib/api';
import type { Order } from '@/types/shop';

const QK = ['admin', 'orders'] as const;

interface AdminOrdersResponse {
  orders: Order[];
  total: number;
}

export function useAdminOrders() {
  return useQuery({
    queryKey: QK,
    queryFn: () => apiGet<AdminOrdersResponse>('/admin/orders'),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, trackingNumber }: { id: string; status: string; trackingNumber?: string }) =>
      apiPatch<{ message: string }>(`/admin/orders/${id}/status`, {
        status,
        ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success('Estado actualizado');
    },
    onError: (e: Error) => toast.error('Error al actualizar estado', { description: e.message }),
  });
}
