import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface TrafficReport {
  views_today: number;
  views_week: number;
  views_month: number;
  unique_sessions: number;
  top_pages: { url: string; count: number }[];
}

export function useTrafficStats() {
  return useQuery<TrafficReport>({
    queryKey: ['admin', 'traffic'],
    queryFn: () => apiGet<TrafficReport>('/admin/traffic'),
    staleTime: 1000 * 60 * 2,
  });
}
