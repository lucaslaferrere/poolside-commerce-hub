import { useState } from 'react';
import { RefreshCw, ShoppingBag, TrendingUp, Truck, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { OrderDetailDialog } from '@/components/admin/OrderDetailDialog';
import { OrderStatusDialog } from '@/components/admin/OrderStatusDialog';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { AdminPageHeader } from './AdminLayout';
import { formatPrice } from '@/types/shop';
import type { Order } from '@/types/shop';
import { cn } from '@/lib/utils';

export default function AdminOrdersPage() {
  const { data, isLoading, isError, refetch, isFetching } = useAdminOrders();

  const [viewing, setViewing] = useState<Order | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);
  const [search, setSearch] = useState('');

  const orders = data?.orders ?? [];

  const filtered = search.trim() === '' ? orders : orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.id.slice(-8).toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      (o.customer_phone ?? '').includes(q) ||
      (o.tracking_number ?? '').toLowerCase().includes(q)
    );
  });

  const stats = {
    total: orders.length,
    paid: orders.filter((o) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)).length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    revenue: orders
      .filter((o) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status))
      .reduce((s, o) => s + o.total, 0),
  };

  return (
    <>
      <AdminPageHeader
        title="Pedidos"
        description="Todos los pedidos recibidos."
        actions={
          <Button
            variant="outline" size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1', isFetching && 'animate-spin')} />
            Actualizar
          </Button>
        }
      />

      {isError && (
        <div className="flex items-center justify-between p-4 mb-6 rounded-lg border border-danger/30 bg-danger/5">
          <p className="text-sm text-danger font-medium">No se pudo cargar los pedidos.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pedidos totales" value={String(stats.total)} icon={ShoppingBag} />
        <StatCard label="Confirmados" value={String(stats.paid)} icon={TrendingUp} tone="brand" />
        <StatCard label="En tránsito" value={String(stats.shipped)} icon={Truck} tone="warn" />
        <StatCard label="Ingresos" value={formatPrice(stats.revenue)} icon={TrendingUp} tone="success" />
      </div>

      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        <Input
          placeholder="Buscar por N° pedido, nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <OrdersTable
        orders={filtered}
        isLoading={isLoading}
        onView={setViewing}
        onChangeStatus={setEditing}
      />

      <OrderDetailDialog order={viewing} onClose={() => setViewing(null)} />
      <OrderStatusDialog order={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function StatCard({
  label, value, icon: Icon, tone = 'default',
}: {
  label: string; value: string; icon: typeof ShoppingBag;
  tone?: 'default' | 'brand' | 'warn' | 'success';
}) {
  const iconBg = {
    default: 'bg-neutral-100 text-neutral-600',
    brand:   'bg-brand/10 text-brand',
    warn:    'bg-amber-100 text-amber-600',
    success: 'bg-emerald-100 text-emerald-600',
  }[tone];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">{label}</p>
          <p className="font-display text-2xl font-semibold text-neutral-900 mt-2 tabular-nums leading-none">{value}</p>
        </div>
        <span className={cn('grid place-items-center h-9 w-9 rounded-md shrink-0', iconBg)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
