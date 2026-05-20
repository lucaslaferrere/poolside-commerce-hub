import { useQuery } from '@tanstack/react-query';

const UMAMI_URL = (import.meta.env.VITE_UMAMI_URL as string) ?? '';
const WEBSITE_ID = (import.meta.env.VITE_UMAMI_WEBSITE_ID as string) ?? '';
const TOKEN = (import.meta.env.VITE_UMAMI_TOKEN as string) ?? '';

export interface UmamiStats {
  pageviews: { value: number; change: number };
  uniques: { value: number; change: number };
  bounces: { value: number; change: number };
  totaltime: { value: number; change: number };
}

function periodMs(period: '7d' | '30d'): number {
  return period === '7d' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
}

async function fetchUmamiStats(period: '7d' | '30d'): Promise<UmamiStats> {
  if (!UMAMI_URL || !WEBSITE_ID || !TOKEN) {
    throw new Error('Umami no configurado');
  }
  const endAt = Date.now();
  const startAt = endAt - periodMs(period);
  const url = `${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${startAt}&endAt=${endAt}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Umami API error: ${res.status}`);
  return res.json() as Promise<UmamiStats>;
}

export function useUmamiStats(period: '7d' | '30d') {
  const enabled = Boolean(UMAMI_URL && WEBSITE_ID && TOKEN);
  return useQuery<UmamiStats>({
    queryKey: ['umami', 'stats', period],
    queryFn: () => fetchUmamiStats(period),
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export const umamiConfigured = Boolean(UMAMI_URL && WEBSITE_ID && TOKEN);
