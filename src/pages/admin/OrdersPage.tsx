import { useState } from 'react';
import { RefreshCw, ShoppingBag, TrendingUp, Truck, Search, Link2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { OrderDetailDialog } from '@/components/admin/OrderDetailDialog';
import { OrderStatusDialog } from '@/components/admin/OrderStatusDialog';
import { CartLinkModal } from '@/components/admin/CartLinkModal';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { AdminPageHeader } from './AdminLayout';
import { formatPrice } from '@/types/shop';
import type { Order } from '@/types/shop';
import { cn } from '@/lib/utils';

const STATUS_TABS = [
  { value: '',            label: 'Todos' },
  { value: 'pending',     label: 'Pendiente' },
  { value: 'paid',        label: 'Pagado' },
  { value: 'processing',  label: 'En proceso' },
  { value: 'shipped',     label: 'Enviado' },
  { value: 'delivered',   label: 'Entregado' },
  { value: 'cancelled',   label: 'Cancelado' },
] as const;

const LIMIT = 20;

export default function AdminOrdersPage() {
  const [page, setPage]               = useState(1);
  const [status, setStatus]           = useState('pending');
  const [search, setSearch]           = useState('');
  const [viewing, setViewing]         = useState<Order | null>(null);
  const [editing, setEditing]         = useState<Order | null>(null);
  const [cartLinkOpen, setCartLinkOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Descarga el CSV de compradores. Va con fetch (no <a href>) porque el endpoint
  // admin requiere el header Authorization, que un link plano no puede mandar.
  const exportBuyers = async () => {
    setExporting(true);
    try {
      const base = import.meta.env.VITE_API_URL as string;
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${base}/admin/orders/export.csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compradores-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('No se pudo exportar', { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setExporting(false);
    }
  };

  const { data, isLoading, isError, refetch, isFetching } = useAdminOrders({ page, limit: LIMIT, status });

  const orders    = data?.orders ?? [];
  const total     = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

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

  const handleStatusChange = (s: string) => {
    setStatus(s);
    setPage(1);
    setSearch('');
  };

  return (
    <>
      <AdminPageHeader
        title="Pedidos"
        description="Todos los pedidos recibidos."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportBuyers} disabled={exporting}>
              <Download className={cn('h-3.5 w-3.5 mr-1', exporting && 'animate-pulse')} />
              {exporting ? 'Exportando...' : 'Exportar Excel'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCartLinkOpen(true)}>
              <Link2 className="h-3.5 w-3.5 mr-1" />
              Link de carrito
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn('h-3.5 w-3.5 mr-1', isFetching && 'animate-spin')} />
              Actualizar
            </Button>
          </div>
        }
      />

      {isError && (
        <div className="flex items-center justify-between p-4 mb-6 rounded-lg border border-danger/30 bg-danger/5">
          <p className="text-sm text-danger font-medium">No se pudo cargar los pedidos.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
        </div>
      )}

      {/* KPIs — sobre los pedidos de la página actual */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pedidos totales" value={String(total)} icon={ShoppingBag} />
        <StatCard
          label="Confirmados"
          value={String(orders.filter((o) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)).length)}
          icon={TrendingUp}
          tone="brand"
        />
        <StatCard
          label="En tránsito"
          value={String(orders.filter((o) => o.status === 'shipped').length)}
          icon={Truck}
          tone="warn"
        />
        <StatCard
          label="Ingresos (página)"
          value={formatPrice(orders.filter((o) => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)).reduce((s, o) => s + o.total, 0))}
          icon={TrendingUp}
          tone="success"
        />
      </div>

      {/* Tabs de estado */}
      <div className="flex gap-1 flex-wrap mb-4 border-b border-neutral-200 pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              status === tab.value
                ? 'bg-brand text-white'
                : 'text-neutral-600 hover:bg-neutral-100',
            )}
          >
            {tab.label}
          </button>
        ))}
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

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-neutral-500">
          {total} pedido{total !== 1 ? 's' : ''} en total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <OrderDetailDialog order={viewing} onClose={() => setViewing(null)} />
      <OrderStatusDialog order={editing} onClose={() => setEditing(null)} />
      <CartLinkModal open={cartLinkOpen} onOpenChange={setCartLinkOpen} />
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
