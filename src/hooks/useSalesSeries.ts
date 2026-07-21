import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface SalesBucket {
  /** "2026-07" con granularidad mes, "2026-07-15" con granularidad día. */
  period: string;
  revenue: number;
  orders: number;
}

export type SalesGranularity = 'month' | 'day';

/**
 * Evolución de ventas agregada en el backend (no trae órdenes al navegador).
 * from/to en formato YYYY-MM-DD.
 */
export function useSalesSeries(params: { from: string; to: string; granularity: SalesGranularity }) {
  const qs = new URLSearchParams({
    from: params.from,
    to: params.to,
    granularity: params.granularity,
  });

  return useQuery({
    queryKey: ['admin', 'analytics', 'sales', params.from, params.to, params.granularity] as const,
    queryFn: () =>
      apiGet<{ series: SalesBucket[]; granularity: string }>(`/admin/analytics/sales?${qs}`).then(
        (r) => r.series ?? [],
      ),
  });
}
