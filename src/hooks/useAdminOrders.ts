import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPatch } from '@/lib/api';
import type { Order } from '@/types/shop';

interface AdminOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

interface UseAdminOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

export function useAdminOrders({ page = 1, limit = 20, status = '' }: UseAdminOrdersParams = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);

  return useQuery({
    queryKey: ['admin', 'orders', page, limit, status],
    queryFn: () => apiGet<AdminOrdersResponse>(`/admin/orders?${params}`),
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
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Estado actualizado');
    },
    onError: (e: Error) => toast.error('Error al actualizar estado', { description: e.message }),
  });
}
