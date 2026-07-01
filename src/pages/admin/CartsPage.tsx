import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiGet } from '@/lib/api';
import { formatPrice } from '@/types/shop';
import { CartDetailDialog, type AdminCart } from '@/components/admin/CartDetailDialog';

export default function CartsPage() {
  const [viewing, setViewing] = useState<AdminCart | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'carts'],
    queryFn: () => apiGet<{ carts: AdminCart[] }>('/admin/carts').then((r) => r.carts ?? []),
  });

  const carts = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Carritos</h1>
          <p className="text-sm text-muted-foreground mt-1">Carritos de clientes que todavía no compraron.</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : carts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay carritos activos.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ítems</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actualizado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {carts.map((cart) => (
                <tr key={cart.user_id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{cart.email || cart.user_id.slice(-8)}</td>
                  <td className="px-4 py-3">{cart.item_count}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(cart.total)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {cart.updated_at ? new Date(cart.updated_at).toLocaleString('es-AR') : '—'}
                    {cart.last_reminder_sent_at && (
                      <div className="text-emerald-600">Recordatorio enviado</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewing(cart)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CartDetailDialog cart={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
