import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface AnalyticsReport {
  period: string;
  cart_adds: number;
  checkout_starts: number;
  product_views: number;
  paid_orders: number;
  conversion_rate: number;
  by_day: { _id: string; count: number }[];
  top_products: { id: string; name: string; views: number; cart_adds: number }[];
}

export function useAnalytics(period: '7d' | '30d') {
  return useQuery<AnalyticsReport>({
    queryKey: ['admin', 'analytics', period],
    queryFn: () => apiGet<AnalyticsReport>(`/admin/analytics?period=${period}`),
    staleTime: 1000 * 60 * 2,
  });
}
