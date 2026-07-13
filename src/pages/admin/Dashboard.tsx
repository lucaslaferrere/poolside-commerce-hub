import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Calendar,
  ChevronDown,
  Activity,
  CreditCard,
  DollarSign,
  Eye,
  Globe,
  MousePointerClick,
  Users,
  LineChart as LineChartIcon,
  Package,
  PieChart as PieChartIcon,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminInsights } from '@/hooks/useAdminProducts';
import { useKits } from '@/hooks/useKits';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useAnalytics, type AnalyticsPeriod } from '@/hooks/useAnalytics';
import { useTrafficStats } from '@/hooks/useTrafficStats';
import { formatPrice } from '@/types/shop';
import type { Order, OrderStatus } from '@/types/shop';
import { AdminPageHeader } from './AdminLayout';
import { cn } from '@/lib/utils';

const LOW_STOCK_THRESHOLD = 5;
const REVENUE_STATUSES: OrderStatus[] = ['paid', 'processing', 'shipped', 'delivered'];

/* ────────────────────────────────────────────────────────────────────────
   Date range
   ──────────────────────────────────────────────────────────────────────── */

type RangeKey = '7d' | '30d' | 'mtd' | 'ytd';

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '7d',  label: 'Últimos 7 días'   },
  { key: '30d', label: 'Últimos 30 días'  },
  { key: 'mtd', label: 'Este mes'         },
  { key: 'ytd', label: 'Año a la fecha'   },
];

// "Actividad del sitio" range toggle (backend-backed analytics).
const ANALYTICS_PERIODS: { key: AnalyticsPeriod; label: string; hint: string }[] = [
  { key: '1d',  label: 'Día',     hint: 'Hoy' },
  { key: '7d',  label: '7 días',  hint: 'Últimos 7 días' },
  { key: '30d', label: '30 días', hint: 'Últimos 30 días' },
  { key: '1y',  label: 'Año',     hint: 'Año a la fecha' },
];

function getRangeBounds(range: RangeKey, now = new Date()): { start: Date; end: Date; prevStart: Date; prevEnd: Date; granularity: 'day' | 'month' } {
  const end = new Date(now);
  let start: Date;
  let granularity: 'day' | 'month' = 'day';

  if (range === '7d') {
    start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (range === '30d') {
    start = new Date(end);
    start.setDate(end.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'mtd') {
    start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0);
  } else {
    start = new Date(end.getFullYear(), 0, 1, 0, 0, 0);
    granularity = 'month';
  }

  const spanMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - spanMs);

  return { start, end, prevStart, prevEnd, granularity };
}

/* ────────────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const [range, setRange] = useState<RangeKey>('30d');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>('7d');
  const { data: products = [], isLoading: loadingProducts, isError: errProducts, refetch: refetchProducts } = useAdminInsights();
  const { data: ordersData, isLoading: loadingOrders } = useAdminOrders();
  const { data: analyticsData, isLoading: loadingAnalytics } = useAnalytics(analyticsPeriod);
  const { data: trafficData, isLoading: loadingTraffic } = useTrafficStats();
  const { data: kitsData = [] } = useKits();
  const orders = ordersData?.orders ?? [];

  const bounds = useMemo(() => getRangeBounds(range), [range]);
  const rangeLabel = RANGE_OPTIONS.find((r) => r.key === range)?.label ?? '';
  const analyticsHint = ANALYTICS_PERIODS.find((p) => p.key === analyticsPeriod)?.hint ?? '';

  /* ── Aggregates ──────────────────────────────────────────────────────── */

  const productById = useMemo(() => {
    const map = new Map<string, { name: string; category: string }>();
    for (const p of products) {
      map.set(p.id, { name: p.name, category: p.category });
    }
    return map;
  }, [products]);

  const inRange = useMemo(
    () => orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= bounds.start && d <= bounds.end;
    }),
    [orders, bounds],
  );

  const inPrev = useMemo(
    () => orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= bounds.prevStart && d <= bounds.prevEnd;
    }),
    [orders, bounds],
  );

  const paidNow  = inRange.filter((o) => REVENUE_STATUSES.includes(o.status));
  const paidPrev = inPrev.filter((o) => REVENUE_STATUSES.includes(o.status));

  const revenue      = paidNow.reduce((s, o) => s + o.total, 0);
  const revenuePrev  = paidPrev.reduce((s, o) => s + o.total, 0);
  const trendRevenue = pct(revenue, revenuePrev);

  const ordersCount      = inRange.length;
  const ordersCountPrev  = inPrev.length;
  const trendOrders      = pct(ordersCount, ordersCountPrev);

  const aov      = paidNow.length > 0 ? revenue / paidNow.length : 0;
  const aovPrev  = paidPrev.length > 0 ? revenuePrev / paidPrev.length : 0;
  const trendAov = pct(aov, aovPrev);

  const lowStock = products.filter((p) => {
    const s = p.stock ?? 0;
    return s > 0 && s <= LOW_STOCK_THRESHOLD;
  }).length;

  const inventoryValue = products.reduce(
    (s, p) => s + (Number(p.base_price) || 0) * (p.stock ?? 0),
    0,
  );

  /* ── Time series ─────────────────────────────────────────────────────── */

  const timeSeries = useMemo(() => {
    type Bucket = { key: string; label: string; revenue: number; orders: number; aov: number };
    const buckets = new Map<string, Bucket>();
    const formatBucket = (d: Date) =>
      bounds.granularity === 'month'
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        : d.toISOString().slice(0, 10);

    const cursor = new Date(bounds.start);
    while (cursor <= bounds.end) {
      const k = formatBucket(cursor);
      buckets.set(k, {
        key: k,
        label: bounds.granularity === 'month' ? monthShort(k) : dayShort(k),
        revenue: 0,
        orders: 0,
        aov: 0,
      });
      if (bounds.granularity === 'month') cursor.setMonth(cursor.getMonth() + 1);
      else cursor.setDate(cursor.getDate() + 1);
    }

    // Total orders count (any status that's not cancelled/rejected counts toward "new orders")
    for (const o of inRange) {
      const k = formatBucket(new Date(o.created_at));
      const bucket = buckets.get(k);
      if (bucket) bucket.orders += 1;
    }
    // Revenue only from paid statuses
    for (const o of paidNow) {
      const k = formatBucket(new Date(o.created_at));
      const bucket = buckets.get(k);
      if (bucket) bucket.revenue += o.total;
    }
    // Per-bucket AOV
    for (const b of buckets.values()) {
      b.aov = b.orders > 0 ? b.revenue / b.orders : 0;
    }

    return Array.from(buckets.values());
  }, [inRange, paidNow, bounds]);

  const salesSeries = timeSeries.map((b) => ({ key: b.key, label: b.label, total: b.revenue }));

  /* ── Category breakdown ─────────────────────────────────────────────── */

  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();
    for (const o of paidNow) {
      for (const it of (o.items ?? [])) {
        const meta = productById.get(it.product_id);
        const cat = meta?.category ?? 'otros';
        const value = it.unit_price * it.quantity;
        totals.set(cat, (totals.get(cat) ?? 0) + value);
      }
    }
    return Array.from(totals.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [paidNow, productById]);

  const categoryTotal = categoryData.reduce((s, c) => s + c.value, 0);

  /* ── Top sellers ─────────────────────────────────────────────────────── */

  const topProducts = useMemo(() => {
    const totals = new Map<string, { name: string; units: number; revenue: number }>();
    for (const o of paidNow) {
      for (const it of (o.items ?? [])) {
        const meta = productById.get(it.product_id);
        const name = meta?.name ?? `Producto ${it.product_id.slice(0, 6)}`;
        const prev = totals.get(it.product_id) ?? { name, units: 0, revenue: 0 };
        prev.units   += it.quantity;
        prev.revenue += it.unit_price * it.quantity;
        totals.set(it.product_id, prev);
      }
    }
    return Array.from(totals.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [paidNow, productById]);

  /* ── Recent orders + low stock list ──────────────────────────────────── */

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6),
    [orders],
  );

  const lowStockSample = useMemo(
    () =>
      products
        .filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
        .slice(0, 5),
    [products],
  );

  /* ── Render ─────────────────────────────────────────────────────────── */

  const isLoading = loadingProducts || loadingOrders;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Resumen del estado actual del negocio."
        actions={
          <>
            <DateRangePicker value={range} onChange={setRange} />
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/products">
                Ir a productos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </>
        }
      />

      {errProducts && (
        <div className="flex items-center justify-between p-4 mb-6 rounded-lg border border-danger/30 bg-danger/5">
          <p className="text-sm text-danger font-medium">
            No se pudo conectar con el backend.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetchProducts()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              label="Ingresos totales"
              value={formatPrice(revenue)}
              hint="vs período previo"
              trend={trendRevenue}
              icon={DollarSign}
              color={METRIC_COLORS.revenue}
              sparkline={timeSeries.map((b) => ({ label: b.label, v: b.revenue }))}
            />
            <KpiCard
              label="Pedidos nuevos"
              value={ordersCount.toLocaleString('es-AR')}
              hint={`${paidNow.length} confirmados`}
              trend={trendOrders}
              icon={ShoppingBag}
              color={METRIC_COLORS.orders}
              sparkline={timeSeries.map((b) => ({ label: b.label, v: b.orders }))}
            />
            <KpiCard
              label="Ticket promedio"
              value={formatPrice(aov)}
              hint={`${paidNow.length || 0} órdenes pagas`}
              trend={trendAov}
              icon={Receipt}
              color={METRIC_COLORS.aov}
              sparkline={timeSeries.map((b) => ({ label: b.label, v: b.aov }))}
            />
            <KpiCard
              label="Stock bajo"
              value={String(lowStock)}
              hint={`≤ ${LOW_STOCK_THRESHOLD} unidades`}
              icon={AlertTriangle}
              color={METRIC_COLORS.stock}
              pulse={lowStock > 0}
            />
            <KpiCard
              label="Valor del inventario"
              value={formatPrice(inventoryValue)}
              hint="precio × stock"
              icon={Boxes}
              color={METRIC_COLORS.inventory}
            />
          </>
        )}
      </div>

      {/* Analytics — Actividad */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-neutral-900">Actividad del sitio</h2>
          <div className="flex gap-1">
            {ANALYTICS_PERIODS.map((p) => (
              <Button
                key={p.key}
                size="sm"
                variant={analyticsPeriod === p.key ? 'default' : 'outline'}
                className="h-7 text-xs px-3"
                onClick={() => setAnalyticsPeriod(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingAnalytics ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard
                label="Carritos iniciados"
                value={String(analyticsData?.cart_adds ?? 0)}
                hint={analyticsHint}
                icon={ShoppingCart}
                color={METRIC_COLORS.orders}
              />
              <KpiCard
                label="Checkouts iniciados"
                value={String(analyticsData?.checkout_starts ?? 0)}
                hint={analyticsHint}
                icon={CreditCard}
                color={METRIC_COLORS.aov}
              />
              <KpiCard
                label="Tasa de conversión"
                value={`${(((analyticsData?.conversion_rate) ?? 0) * 100).toFixed(1)}%`}
                hint="Órdenes pagas / checkouts"
                icon={TrendingUp}
                color={METRIC_COLORS.revenue}
              />
              <KpiCard
                label="Vistas de producto"
                value={String(analyticsData?.product_views ?? 0)}
                hint={analyticsHint}
                icon={Eye}
                color={METRIC_COLORS.stock}
              />
            </>
          )}
        </div>

        {/* Top productos */}
        {!loadingAnalytics && analyticsData && analyticsData.top_products.length > 0 && (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <header className="px-5 py-3 border-b border-neutral-200 bg-neutral-50/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Top productos — vistas &amp; carritos
              </h3>
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500 bg-neutral-50/40">
                  <th className="px-5 py-2.5">Producto</th>
                  <th className="px-5 py-2.5 text-right">Vistas</th>
                  <th className="px-5 py-2.5 text-right">En carrito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {analyticsData.top_products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-neutral-800 truncate max-w-[220px]">
                      {p.name || productById.get(p.id)?.name || 'Producto'}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-neutral-700">{p.views}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-neutral-700">{p.cart_adds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tráfico web */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-neutral-400" />
          <h2 className="font-display text-base font-semibold text-neutral-900">Tráfico web</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingTraffic ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard
                label="Visitas hoy"
                value={String(trafficData?.views_today ?? 0)}
                hint="Desde las 00:00 hs"
                icon={Activity}
                color={METRIC_COLORS.revenue}
              />
              <KpiCard
                label="Visitas (7 días)"
                value={String(trafficData?.views_week ?? 0)}
                hint="Últimos 7 días"
                icon={MousePointerClick}
                color={METRIC_COLORS.orders}
              />
              <KpiCard
                label="Visitas (30 días)"
                value={String(trafficData?.views_month ?? 0)}
                hint="Últimos 30 días"
                icon={Eye}
                color={METRIC_COLORS.aov}
              />
              <KpiCard
                label="Visitantes únicos"
                value={String(trafficData?.unique_sessions ?? 0)}
                hint="Últimos 30 días"
                icon={Users}
                color={METRIC_COLORS.stock}
              />
            </>
          )}
        </div>

        {!loadingTraffic && trafficData && trafficData.top_pages.length > 0 && (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <header className="px-5 py-3 border-b border-neutral-200 bg-neutral-50/60">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Páginas más visitadas — últimos 30 días
              </h3>
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500 bg-neutral-50/40">
                  <th className="px-5 py-2.5">Página</th>
                  <th className="px-5 py-2.5 text-right">Visitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {trafficData.top_pages.map((p) => (
                  <tr key={p.url} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3 text-neutral-700">
                      <span className="font-medium">{resolvePageLabel(p.url, products, kitsData)}</span>
                      <span className="ml-2 font-mono text-[11px] text-neutral-400">{p.url}</span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-neutral-700">{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ChartCard
          className="lg:col-span-2"
          title="Evolución de ventas"
          subtitle={rangeLabel}
          icon={LineChartIcon}
          iconClass="bg-emerald-50 text-emerald-600 ring-emerald-200"
        >
          {salesSeries.every((d) => d.total === 0) ? (
            <ChartEmpty label="Sin ventas en este período" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesSeries} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={METRIC_COLORS.revenue.hex} stopOpacity={0.30} />
                    <stop offset="100%" stopColor={METRIC_COLORS.revenue.hex} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => compactNumber(Number(v))}
                  width={56}
                />
                <Tooltip
                  cursor={{ stroke: METRIC_COLORS.revenue.hex, strokeOpacity: 0.15, strokeWidth: 24 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.10)',
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatPrice(v), 'Ingresos']}
                  labelClassName="font-medium text-neutral-700"
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={METRIC_COLORS.revenue.hex}
                  strokeWidth={2.25}
                  fill="url(#salesFill)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: METRIC_COLORS.revenue.hex }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Ventas por categoría"
          subtitle={rangeLabel}
          icon={PieChartIcon}
          iconClass="bg-violet-50 text-violet-600 ring-violet-200"
        >
          {categoryData.length === 0 ? (
            <ChartEmpty label="Sin datos de categorías" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-[180px,1fr] items-center gap-4">
              <div className="relative h-[200px] w-full">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={2}
                      stroke="#ffffff"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={DONUT_PALETTE[i % DONUT_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 12,
                      }}
                      formatter={(v: number, name) => [formatPrice(v), capitalize(String(name))]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Donut center */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Total</p>
                  <p className="font-display text-base font-semibold text-neutral-900 tabular-nums leading-tight mt-0.5">
                    {formatPrice(categoryTotal)}
                  </p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {categoryData.map((c, i) => {
                  const share = categoryTotal > 0 ? (c.value / categoryTotal) * 100 : 0;
                  return (
                    <li key={c.category} className="flex items-center gap-3 text-sm">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: DONUT_PALETTE[i % DONUT_PALETTE.length] }}
                      />
                      <span className="flex-1 capitalize text-neutral-700 truncate">{c.category}</span>
                      <span className="tabular-nums text-neutral-900 font-medium">
                        {share.toFixed(0)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Top 5 productos"
          subtitle="Más vendidos"
          icon={BarChart3}
          iconClass="bg-sky-50 text-sky-600 ring-sky-200"
        >
          {topProducts.length === 0 ? (
            <ChartEmpty label="Sin productos vendidos" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                barSize={18}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tickFormatter={(v: string) => (v.length > 18 ? v.slice(0, 17) + '…' : v)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(11,32,60,0.05)' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                  formatter={(v: number, _name, item) => [
                    `${v} u. · ${formatPrice((item?.payload?.revenue) ?? 0)}`,
                    'Vendido',
                  ]}
                />
                <Bar dataKey="units" radius={[0, 6, 6, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={VIBRANT_PALETTE[i % VIBRANT_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Bottom split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        {/* Recent Orders */}
        <section className="lg:col-span-3 rounded-lg border border-neutral-200 bg-white overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <div>
              <h2 className="font-display text-base font-semibold text-neutral-900">
                Últimos pedidos
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">Últimos 6 ingresos</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs text-brand hover:text-brand-hover font-medium inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </header>

          {loadingOrders ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-10 text-center text-sm text-neutral-500">
              <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
              Todavía no hay pedidos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50/60">
                  <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    <th className="px-5 py-3">Pedido</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-neutral-700">
                        #{o.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-5 py-3 max-w-[160px]">
                        <p className="font-medium text-neutral-900 truncate">{o.customer_name}</p>
                        <p className="text-xs text-neutral-500 truncate">{o.customer_email}</p>
                      </td>
                      <td className="px-5 py-3 text-neutral-700 whitespace-nowrap">
                        {shortDate(o.created_at)}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-neutral-900 tabular-nums whitespace-nowrap">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Priority Attention */}
        <section className="lg:col-span-2 rounded-lg border border-neutral-200 bg-white overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <div>
              <h2 className="font-display text-base font-semibold text-neutral-900">
                Atención prioritaria
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">Stock por debajo del umbral</p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs text-brand hover:text-brand-hover font-medium inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </header>

          {loadingProducts ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : lowStockSample.length === 0 ? (
            <div className="p-10 text-center text-sm text-neutral-500">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
              Sin alertas — todo en orden.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {lowStockSample.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{p.name}</p>
                    <p className="text-xs text-neutral-500 truncate capitalize">{p.category}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 tabular-nums shrink-0">
                    <AlertTriangle className="h-3 w-3" />
                    {p.stock} u.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────────────────────────────────── */

function DateRangePicker({ value, onChange }: { value: RangeKey; onChange: (v: RangeKey) => void }) {
  const current = RANGE_OPTIONS.find((r) => r.key === value)?.label ?? '';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 font-normal">
          <Calendar className="h-3.5 w-3.5 text-neutral-500" />
          <span>{current}</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {RANGE_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.key}
            onSelect={() => onChange(opt.key)}
            className={cn(
              'cursor-pointer text-sm',
              value === opt.key && 'bg-brand/8 text-brand font-medium',
            )}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MetricColor {
  hex: string;
  accent: string;   // top accent bar class (bg-*)
  iconBg: string;   // icon container classes
  glow: string;     // soft glow for the card
}

const METRIC_COLORS = {
  revenue:   { hex: '#10b981', accent: 'bg-emerald-500', iconBg: 'bg-emerald-50 text-emerald-600 ring-emerald-200', glow: 'before:bg-emerald-500/5' },
  orders:    { hex: '#0ea5e9', accent: 'bg-sky-500',     iconBg: 'bg-sky-50 text-sky-600 ring-sky-200',             glow: 'before:bg-sky-500/5'     },
  aov:       { hex: '#8b5cf6', accent: 'bg-violet-500',  iconBg: 'bg-violet-50 text-violet-600 ring-violet-200',    glow: 'before:bg-violet-500/5'  },
  stock:     { hex: '#f59e0b', accent: 'bg-amber-500',   iconBg: 'bg-amber-50 text-amber-600 ring-amber-200',       glow: 'before:bg-amber-500/5'   },
  inventory: { hex: '#6366f1', accent: 'bg-indigo-500',  iconBg: 'bg-indigo-50 text-indigo-600 ring-indigo-200',    glow: 'before:bg-indigo-500/5'  },
} satisfies Record<string, MetricColor>;

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Package;
  color: MetricColor;
  trend?: number | null;
  sparkline?: { label: string; v: number }[];
  pulse?: boolean;
}

function KpiCard({ label, value, hint, icon: Icon, color, trend, sparkline, pulse }: KpiCardProps) {
  const hasTrend = typeof trend === 'number' && Number.isFinite(trend);
  const positive = hasTrend && trend! >= 0;
  const sparkId = `sl-${color.hex.slice(1)}`;
  const hasSpark = Array.isArray(sparkline) && sparkline.some((d) => d.v > 0);

  return (
    <div className="group relative rounded-lg border border-neutral-200 bg-white overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out">
      {/* Top color accent */}
      <div className={cn('h-1 w-full', color.accent)} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            {label}
          </p>
          <span className={cn(
            'relative grid place-items-center h-9 w-9 rounded-md shrink-0 ring-1',
            color.iconBg,
          )}>
            <Icon className="h-4 w-4" />
            {pulse && (
              <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inset-0 rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              </span>
            )}
          </span>
        </div>
        <p className="font-display text-[28px] font-semibold text-neutral-900 mt-2.5 tabular-nums leading-none">
          {value}
        </p>
        <div className="flex items-center gap-2 mt-2.5 min-h-[18px]">
          {hasTrend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums rounded-full px-1.5 py-0.5',
                positive
                  ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200'
                  : 'text-red-700 bg-red-50 ring-1 ring-red-200',
              )}
            >
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? '+' : ''}{trend!.toFixed(1)}%
            </span>
          )}
          {hint && <span className="text-xs text-neutral-500">{hint}</span>}
        </div>

        {/* Sparkline */}
        {hasSpark && (
          <div className="mt-3 -mx-1 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                <defs>
                  <linearGradient id={sparkId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={color.hex} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color.hex} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={color.hex}
                  strokeWidth={1.75}
                  fill={`url(#${sparkId})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
        <Skeleton className="h-7 w-24 mt-3" />
        <Skeleton className="h-3 w-20 mt-3" />
        <Skeleton className="h-10 w-full mt-3" />
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: typeof Package;
  iconClass?: string;
  className?: string;
  children: React.ReactNode;
}

function ChartCard({ title, subtitle, icon: Icon, iconClass, className, children }: ChartCardProps) {
  return (
    <section className={cn('rounded-lg border border-neutral-200 bg-white p-5 sm:p-6', className)}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <span className={cn('grid place-items-center h-9 w-9 rounded-md shrink-0 ring-1', iconClass)}>
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-neutral-900 leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="h-[200px] grid place-items-center text-center text-sm text-neutral-500">
      <div>
        <ArrowUpRight className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
        {label}
      </div>
    </div>
  );
}

const STATUS_META: Record<OrderStatus, { label: string; classes: string }> = {
  pending:    { label: 'Pendiente',  classes: 'bg-amber-50 text-amber-700 ring-amber-200' },
  paid:       { label: 'Pagado',     classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  processing: { label: 'Procesando', classes: 'bg-sky-50 text-sky-700 ring-sky-200' },
  shipped:    { label: 'Enviado',    classes: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  delivered:  { label: 'Entregado',  classes: 'bg-emerald-100 text-emerald-800 ring-emerald-300' },
  cancelled:  { label: 'Cancelado',  classes: 'bg-neutral-100 text-neutral-700 ring-neutral-200' },
  rejected:   { label: 'Rechazado',  classes: 'bg-red-50 text-red-700 ring-red-200' },
};

function StatusPill({ status }: { status: Order['status'] }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 whitespace-nowrap',
        meta.classes,
      )}
    >
      {meta.label}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────── */

const PAGE_LABELS: Record<string, string> = {
  '/': 'Inicio',
  '/tienda': 'Tienda',
  '/garantia': 'Garantía',
  '/profile': 'Mi perfil',
  '/orders': 'Mis pedidos',
  '/checkout': 'Checkout',
};

function resolvePageLabel(url: string, products: { id: string; name: string }[], kits: { id: string; name: string }[] = []): string {
  if (PAGE_LABELS[url]) return PAGE_LABELS[url];
  const productMatch = url.match(/^\/tienda\/([a-f0-9]{24})$/);
  if (productMatch) {
    const product = products.find((p) => p.id === productMatch[1]);
    return product ? product.name : 'Producto';
  }
  const kitMatch = url.match(/^\/kits\/([a-f0-9]{24})$/);
  if (kitMatch) {
    const kit = kits.find((k) => k.id === kitMatch[1]);
    return kit ? `Kit: ${kit.name}` : 'Kit';
  }
  return url;
}

function pct(curr: number, prev: number): number | null {
  if (!prev || !Number.isFinite(prev)) return null;
  return ((curr - prev) / prev) * 100;
}

function compactNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

function dayShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function monthShort(key: string): string {
  const [year, month] = key.split('-');
  const idx = Number(month) - 1;
  return `${MONTHS_SHORT[idx] ?? ''} ${year.slice(2)}`;
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

/* Vibrant palette — Tailwind 500 swatches, chosen for clean dashboard contrast */
const VIBRANT_PALETTE = [
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#6366f1', // indigo
];

/* Donut palette — uses the same vibrant set so categories read at a glance */
const DONUT_PALETTE = VIBRANT_PALETTE;
