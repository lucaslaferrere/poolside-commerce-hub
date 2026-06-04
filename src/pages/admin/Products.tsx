import { useState, useMemo, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import {
  useAdminProductsPage,
  useAdminProductMutations,
} from '@/hooks/useAdminProducts';
import { AdminPageHeader } from './AdminLayout';
import { TablePagination } from '@/components/admin/TablePagination';
import type { AdminProduct } from '@/types/admin';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSize>(10);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminProductsPage({ page, limit });

  const { create, update, remove, toggleVisibility, reorderPage } = useAdminProductMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Sort current page: sort_order > 0 first (ascending), then 0s in backend order
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const oa = a.sort_order ?? 0;
      const ob = b.sort_order ?? 0;
      if (oa > 0 && ob > 0) return oa - ob;
      if (oa > 0) return -1;
      if (ob > 0) return 1;
      return 0;
    });
  }, [items]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditing(product);
    setFormOpen(true);
  };

  // Errors propagate to the modal which shows an inline alert with the
  // backend's specific message. The modal stays open on failure so the user
  // can fix the offending fields without losing context.
  const handleFormSubmit = async (formData: FormData, id?: string) => {
    if (id) await update.mutateAsync({ id, form: formData });
    else await create.mutateAsync(formData);
    setFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      // If we just emptied the current page, step back
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
    } finally {
      setDeleting(null);
    }
  };

  const handlePageSizeChange = (raw: string) => {
    const next = Number(raw) as PageSize;
    setLimit(next);
    setPage(1);
  };

  const handleReorder = useCallback(
    (reordered: AdminProduct[]) => {
      reorderPage.mutate(reordered.map((p, i) => ({ id: p.id, sort_order: i + 1 })));
    },
    [reorderPage],
  );

  return (
    <>
      <AdminPageHeader
        title="Productos"
        description="Gestioná el catálogo: alta, edición y baja de productos."
        actions={
          <Button onClick={openCreate} className="bg-brand text-brand-foreground hover:bg-brand-hover">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        }
      />

      {isError && (
        <div className="flex items-center justify-between p-4 mb-4 rounded-lg border border-danger/30 bg-danger/5">
          <p className="text-sm text-danger font-medium">
            No se pudo conectar con el backend.{' '}
            {error instanceof Error ? error.message : null}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" /> Reintentar
          </Button>
        </div>
      )}

      <ProductTable
        products={sortedItems}
        isLoading={isLoading}
        error={isError ? (error as Error) : null}
        onEdit={openEdit}
        onDelete={setDeleting}
        onToggleVisibility={(p) =>
          toggleVisibility.mutate({ id: p.id, visible: p.visible === false })
        }
        onReorder={handleReorder}
      />

      {/* Pagination footer */}
      {!isError && total > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>Filas por página</span>
            <Select value={String(limit)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[78px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-neutral-300">·</span>
            <span className="tabular-nums">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total}
            </span>
            {isFetching && (
              <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                <RefreshCw className="h-3 w-3 animate-spin" /> Actualizando
              </span>
            )}
          </div>

          <TablePagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        isSubmitting={create.isPending || update.isPending}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={!!deleting}
        productName={deleting?.name ?? ''}
        loading={remove.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
