import { useMemo } from 'react';
import { ArgentinaMap, type MapCity } from './ArgentinaMap';
import type { RealtimeSnapshot } from '@/hooks/useRealtimeStats';
import { cn } from '@/lib/utils';

const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(Math.round(n));

// Sólo para el pulso de los marcadores del mapa (SVG). El resto usa animate-ping de Tailwind.
const MAP_PULSE = `@keyframes rt-pulse{0%{transform:scale(.85);opacity:.9}70%{transform:scale(2.6);opacity:0}100%{opacity:0}}`;

const STAT_ACCENT = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500'];

export function RealtimeDashboard({ data }: { data: RealtimeSnapshot }) {
  const sesiones24h = data.sesiones_por_ubicacion.reduce((s, l) => s + l.sessions, 0);

  const stats = [
    { label: 'Visitantes ahora mismo', value: fmt(data.visitantes_activos) },
    { label: 'Visitantes última hora', value: fmt(data.visitantes_ultima_hora) },
    { label: 'Sesiones (24h)', value: fmt(sesiones24h) },
    { label: 'Pedidos hoy', value: fmt(data.compras_hoy) },
  ];

  const funnelBase = Math.max(data.carritos_activos, 1);
  const funnel = [
    { label: 'Carritos activos', value: data.carritos_activos },
    { label: 'En el pago', value: data.en_pago },
    { label: 'Compras realizadas', value: data.compras_hoy },
  ].map((f) => ({
    ...f,
    pct: Math.min(100, (f.value / funnelBase) * 100),
    pctLabel: `${Math.round((f.value / funnelBase) * 100)}%`,
  }));

  const locList = data.sesiones_por_ubicacion.slice(0, 6);
  const locMax = locList.reduce((m, l) => Math.max(m, l.sessions), 1);

  const nuevos = data.nuevos_vs_recurrentes.nuevos;
  const recurrentes = data.nuevos_vs_recurrentes.recurrentes;
  const total = nuevos + recurrentes;
  const pctNuevos = total > 0 ? Math.round((nuevos / total) * 100) : 0;
  const donutDash = `${(pctNuevos / 100) * 327} 327`;

  const mapCities: MapCity[] = useMemo(() => {
    const withCoords = data.sesiones_por_ubicacion.filter((l) => l.lat !== 0 && l.lng !== 0);
    const topValue = withCoords.reduce((m, l) => Math.max(m, l.sessions), 0);
    return withCoords.map((l) => ({
      name: l.city || l.province || l.country,
      coords: [l.lng, l.lat] as [number, number],
      value: l.sessions,
      main: l.sessions === topValue && topValue > 0,
    }));
  }, [data.sesiones_por_ubicacion]);

  const topLoc = data.sesiones_por_ubicacion[0];

  return (
    <div className="space-y-4">
      <style>{MAP_PULSE}</style>

      <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        En vivo · actualizado hace instantes
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className={cn('h-1 w-full', STAT_ACCENT[i])} />
            <div className="p-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">{s.label}</p>
              <p className="font-display text-[28px] font-semibold text-neutral-900 mt-2.5 tabular-nums leading-none">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Embudo */}
          <section className="rounded-lg border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-neutral-900">Comportamiento de clientes</h2>
              <span className="text-xs text-neutral-500">En vivo</span>
            </div>
            <div className="space-y-3.5">
              {funnel.map((f) => (
                <div key={f.label} className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-sm font-medium text-neutral-700">{f.label}</div>
                  <div className="flex-1 h-9 rounded-md bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-md bg-sky-500 flex items-center justify-end pr-3 min-w-[54px] transition-all"
                      style={{ width: f.pct + '%' }}
                    >
                      <span className="font-display text-sm font-semibold text-white tabular-nums">{fmt(f.value)}</span>
                    </div>
                  </div>
                  <div className="w-11 text-right font-display text-sm font-semibold text-neutral-500">{f.pctLabel}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Ubicaciones + donut */}
          <div className="grid grid-cols-1 sm:grid-cols-[1.35fr_1fr] gap-4">
            <section className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="font-display text-base font-semibold text-neutral-900">Sesiones por ubicación</h2>
              <div className="mt-4 space-y-3">
                {locList.length === 0 && <p className="text-sm text-neutral-500">Sin sesiones registradas.</p>}
                {locList.map((l) => (
                  <div key={`${l.province}-${l.city}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-sm text-neutral-500">
                        <span className="font-semibold text-neutral-900">{l.province || l.country}</span>
                        {l.city ? ` · ${l.city}` : ''}
                      </div>
                      <div className="font-display text-sm font-semibold text-neutral-900 tabular-nums">{fmt(l.sessions)}</div>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: (l.sessions / locMax) * 100 + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="font-display text-base font-semibold text-neutral-900">Nuevos vs habituales</h2>
              <div className="flex items-center gap-5 mt-4">
                <div className="relative w-[118px] h-[118px] shrink-0">
                  <svg viewBox="0 0 120 120" className="w-[118px] h-[118px] -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#0ea5e9" strokeWidth="16" strokeLinecap="round" strokeDasharray={donutDash} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-display text-2xl font-semibold text-neutral-900 leading-none">{pctNuevos}%</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">nuevos</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-sm bg-sky-500" />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">Nuevos</div>
                      <div className="text-xs text-neutral-500">{fmt(nuevos)} sesiones</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-sm bg-sky-200" />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">Habituales</div>
                      <div className="text-xs text-neutral-500">{fmt(recurrentes)} sesiones</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Mapa */}
        <section className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white p-5 min-h-[520px]">
          <div className="relative z-10 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-neutral-900">Sesiones en Argentina</h2>
            <span className="font-display text-sm font-semibold text-sky-600">{fmt(sesiones24h)} activas</span>
          </div>
          <div className="absolute inset-0 z-0 flex items-center justify-center px-5 pt-11 pb-6">
            <ArgentinaMap theme="light" cities={mapCities} />
          </div>
          {topLoc && (
            <div className="absolute left-5 bottom-5 z-10 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white/80 px-4 py-2.5 backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-sky-500/15" />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Mayor actividad</div>
                <div className="text-sm font-semibold text-neutral-900">
                  {(topLoc.province || topLoc.city || topLoc.country)} · {fmt(topLoc.sessions)} sesiones
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
