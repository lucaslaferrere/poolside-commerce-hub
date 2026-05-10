import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  DollarSign,
  Layers,
  Package,
  PackageCheck,
  PackageX,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminInsights } from '@/hooks/useAdminProducts';
import { formatPrice } from '@/types/shop';
import { AdminPageHeader } from './AdminLayout';
import { cn } from '@/lib/utils';

const LOW_STOCK_THRESHOLD = 5;
const OVERSTOCK_THRESHOLD = 50;

interface Kpi {
  key: string;
  label: string;
  value: string;
  hint?: string;
  icon: typeof Package;
  tone?: 'default' | 'warn' | 'danger' | 'success' | 'brand';
}

export default function AdminDashboard() {
  const { data: products = [], isLoading, isError, refetch } = useAdminInsights();

  const kpis = useMemo<Kpi[]>(() => {
    const total = products.length;
    const totalUnits = products.reduce((s, p) => s + (p.stock ?? 0), 0);
    const outOfStock = products.filter((p) => (p.stock ?? 0) <= 0).length;
    const lowStock = products.filter((p) => {
      const s = p.stock ?? 0;
      return s > 0 && s <= LOW_STOCK_THRESHOLD;
    }).length;
    const overStock = products.filter((p) => (p.stock ?? 0) >= OVERSTOCK_THRESHOLD).length;
    const inventoryValue = products.reduce(
      (s, p) => s + (Number(p.base_price) || 0) * (p.stock ?? 0),
      0,
    );
    const activeCategories = new Set(products.map((p) => p.category).filter(Boolean)).size;

    return [
      {
        key: 'low',
        label: 'Stock bajo',
        value: String(lowStock),
        hint: `≤ ${LOW_STOCK_THRESHOLD} unidades`,
        icon: AlertTriangle,
        tone: lowStock > 0 ? 'warn' : 'default',
      },
      {
        key: 'out',
        label: 'Sin stock',
        value: String(outOfStock),
        hint: 'productos agotados',
        icon: PackageX,
        tone: outOfStock > 0 ? 'danger' : 'default',
      },
      {
        key: 'over',
        label: 'Sobrestock',
        value: String(overStock),
        hint: `≥ ${OVERSTOCK_THRESHOLD} unidades`,
        icon: PackageCheck,
        tone: 'default',
      },
      {
        key: 'units',
        label: 'Inventario total',
        value: totalUnits.toLocaleString('es-AR'),
        hint: 'unidades en stock',
        icon: Boxes,
        tone: 'brand',
      },
      {
        key: 'value',
        label: 'Valor del inventario',
        value: formatPrice(inventoryValue),
        hint: 'precio × stock',
        icon: DollarSign,
        tone: 'default',
      },
      {
        key: 'total',
        label: 'Productos totales',
        value: String(total),
        hint: 'SKUs activos',
        icon: Package,
        tone: 'default',
      },
      {
        key: 'cats',
        label: 'Categorías activas',
        value: String(activeCategories),
        hint: 'con al menos 1 SKU',
        icon: Layers,
        tone: 'default',
      },
    ];
  }, [products]);

  const lowStockSample = useMemo(
    () =>
      products
        .filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
        .slice(0, 5),
    [products],
  );

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Resumen del estado actual del inventario."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/products">
              Ir a productos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      {isError && (
        <div className="flex items-center justify-between p-4 mb-6 rounded-lg border border-danger/30 bg-danger/5">
          <p className="text-sm text-danger font-medium">
            No se pudo conectar con el backend.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi) => <KpiCard key={kpi.key} {...kpi} />)}
      </div>

      {/* Low stock spotlight */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            Atención prioritaria
          </h2>
          <Link
            to="/admin/products"
            className="text-xs text-brand hover:text-brand-hover font-medium inline-flex items-center gap-1"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : lowStockSample.length === 0 ? (
            <div className="p-10 text-center text-sm text-neutral-500">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
              Ningún producto con stock bajo. Buen trabajo.
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
                    <p className="text-xs text-neutral-500 truncate">{p.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-warning tabular-nums shrink-0">
                    {p.stock} u.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function KpiCard({ label, value, hint, icon: Icon, tone = 'default' }: Kpi) {
  const iconBg = {
    default: 'bg-neutral-100 text-neutral-700',
    warn:    'bg-warning/10 text-warning',
    danger:  'bg-danger/10 text-danger',
    success: 'bg-success/10 text-success',
    brand:   'bg-brand/10 text-brand',
  }[tone];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow duration-base ease-standard">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            {label}
          </p>
          <p className="font-display text-3xl font-semibold text-neutral-900 mt-2 tabular-nums leading-none">
            {value}
          </p>
          {hint && <p className="text-xs text-neutral-500 mt-2">{hint}</p>}
        </div>
        <span className={cn('grid place-items-center h-10 w-10 rounded-md shrink-0', iconBg)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-24 mt-3" />
      <Skeleton className="h-3 w-28 mt-3" />
    </div>
  );
}
