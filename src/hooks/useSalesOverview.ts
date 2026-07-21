import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { SalesBucket, SalesGranularity } from './useSalesSeries';

export interface SalesTotals {
  revenue: number;
  orders: number;
  paid_orders: number;
  aov: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

export interface ProductSales {
  product_id: string;
  name: string;
  units: number;
  revenue: number;
}

export interface SalesOverview {
  current: SalesTotals;
  previous: SalesTotals;
  series: SalesBucket[];
  by_category: CategoryRevenue[];
  top_products: ProductSales[];
}

/**
 * Métricas de venta del dashboard agregadas en el backend (totales del período,
 * período previo para las tendencias, serie para sparklines, categorías y top
 * productos). Reemplaza el cálculo en el navegador sobre una página de órdenes.
 */
export function useSalesOverview(params: { from: string; to: string; granularity: SalesGranularity }) {
  const qs = new URLSearchParams({
    from: params.from,
    to: params.to,
    granularity: params.granularity,
  });

  return useQuery({
    queryKey: ['admin', 'analytics', 'overview', params.from, params.to, params.granularity] as const,
    queryFn: () => apiGet<SalesOverview>(`/admin/analytics/overview?${qs}`),
  });
}
