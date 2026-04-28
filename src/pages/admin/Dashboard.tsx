import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Package, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import type { AdminProduct } from '@/types/admin';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { products, isLoading, error, create, update, remove } = useAdminProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData: FormData, id?: string) => {
    try {
      if (id) {
        await update.mutateAsync({ id, form: formData });
      } else {
        await create.mutateAsync(formData);
      }
      setFormOpen(false);
    } catch {
      // Error already toasted by the mutation's onError — keep modal open
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
    } finally {
      setDeleting(null);
    }
  };

  const isSubmitting = create.isPending || update.isPending;

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8">

        {/* ── Breadcrumb ── */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl gradient-aqua text-primary-foreground shadow-aqua shrink-0">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight">Inventario de productos</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user?.email}
                <Badge className="ml-2 capitalize" variant="default">admin</Badge>
              </p>
            </div>
          </div>

          <Button
            onClick={openCreate}
            className="gradient-aqua text-primary-foreground shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        </div>

        {/* ── Quick stats ── */}
        {!isLoading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Productos</span>
                </div>
                <p className="font-display text-2xl font-bold">{products.length}</p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Stock total</span>
                </div>
                <p className="font-display text-2xl font-bold">{totalStock}</p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Sin stock</span>
                </div>
                <p className={`font-display text-2xl font-bold ${outOfStock > 0 ? 'text-destructive' : ''}`}>
                  {outOfStock}
                </p>
              </div>
            </div>
            <Separator className="mb-6" />
          </>
        )}

        {/* ── Loading retry hint ── */}
        {error && (
          <div className="flex items-center justify-between p-4 mb-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <p className="text-sm text-destructive font-medium">
              No se pudo conectar con el backend. Revisá que el servidor esté corriendo.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reintentar
            </Button>
          </div>
        )}

        {/* ── Product table ── */}
        <ProductTable
          products={products}
          isLoading={isLoading}
          error={error}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
      </div>

      {/* ── Modals ── */}
      <ProductFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={!!deleting}
        productName={deleting?.name ?? ''}
        loading={remove.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
