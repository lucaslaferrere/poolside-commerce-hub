import { useEffect, useState, useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { apiGet } from '@/lib/api';

const BASE = import.meta.env.VITE_API_URL as string;

// Espejo del RealtimeSnapshot del backend (GET /admin/realtime/snapshot).
export interface LocationStat {
  country: string;
  province: string;
  city: string;
  lat: number;
  lng: number;
  sessions: number;
}

export interface RealtimeSnapshot {
  visitantes_activos: number;
  visitantes_ultima_hora: number;
  carritos_activos: number;
  en_pago: number;
  compras_hoy: number;
  sesiones_por_ubicacion: LocationStat[];
  nuevos_vs_recurrentes: { nuevos: number; recurrentes: number };
}

interface StreamMessage {
  type: 'event' | 'sale';
  event_type?: string;
  session_id?: string;
  total?: number;
  city?: string;
  province?: string;
}

/**
 * useRealtimeStats: estado inicial vía snapshot + actualizaciones incrementales
 * por SSE. Usa fetchEventSource (no EventSource nativo) para poder mandar el
 * header Authorization del admin. Si la conexión se corta, reintenta y
 * refetchea el snapshot como fallback/resync.
 */
export function useRealtimeStats() {
  const [data, setData] = useState<RealtimeSnapshot | null>(null);
  const [connected, setConnected] = useState(false);

  const refetchSnapshot = useCallback(async () => {
    try {
      const snap = await apiGet<RealtimeSnapshot>('/admin/realtime/snapshot');
      // El backend puede mandar null si un slice viene vacío: lo normalizamos a [].
      setData({ ...snap, sesiones_por_ubicacion: snap.sesiones_por_ubicacion ?? [] });
    } catch {
      /* conservamos el último estado conocido */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    refetchSnapshot();

    const token = localStorage.getItem('auth_token');
    fetchEventSource(`${BASE}/admin/realtime/stream`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: ctrl.signal,
      openWhenHidden: true,
      onopen: async (res) => {
        if (res.ok) {
          if (!cancelled) setConnected(true);
          return;
        }
        // 401/403 u otro error de apertura: fatal, no reintentar.
        throw new Error(`SSE abrió con status ${res.status}`);
      },
      onmessage: (ev) => {
        if (!ev.data) return;
        let msg: StreamMessage;
        try {
          msg = JSON.parse(ev.data) as StreamMessage;
        } catch {
          return;
        }
        setData((prev) => {
          if (!prev) return prev;
          if (msg.type === 'sale') {
            return { ...prev, compras_hoy: prev.compras_hoy + 1 };
          }
          if (msg.type === 'event') {
            if (msg.event_type === 'cart_add') {
              return { ...prev, carritos_activos: prev.carritos_activos + 1 };
            }
            if (msg.event_type === 'checkout_start') {
              return { ...prev, en_pago: prev.en_pago + 1 };
            }
          }
          return prev;
        });
      },
      onerror: () => {
        if (!cancelled) setConnected(false);
        // Fallback/resync: recalibra el estado completo mientras reintenta.
        refetchSnapshot();
        return 3000; // reintentar la conexión cada 3s
      },
    }).catch(() => {
      /* abort() o error fatal: no hacemos nada más */
    });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [refetchSnapshot]);

  return { data, connected };
}
