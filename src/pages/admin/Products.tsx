import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { BulkPriceDialog } from '@/components/admin/BulkPriceDialog';
import {
  useAllAdminProducts,
  useAdminProductMutations,
} from '@/hooks/useAdminProducts';
import { AdminPageHeader } from './AdminLayout';
import { TablePagination } from '@/components/admin/TablePagination';
import { CATEGORY_OPTIONS, type AdminProduct } from '@/types/admin';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

const ALL_CATEGORIES = 'all';

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSize>(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAllAdminProducts();

  const { create, update, remove, toggleVisibility, reorderPage } = useAdminProductMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [page]);

  // Any active search/filter changes the result set — go back to page 1 so the
  // user always sees the first matches rather than an out-of-range page.
  useEffect(() => {
    setPage(1);
  }, [search, category, limit]);

  const allItems = useMemo(() => data ?? [], [data]);

  const filtersActive = search.trim() !== '' || category !== ALL_CATEGORIES;

  // Filter by category and free-text (name + brand, case-insensitive).
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((p) => {
      if (category !== ALL_CATEGORIES && p.category !== category) return false;
      if (q && !`${p.name} ${p.brand}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allItems, search, category]);

  // Sort: sort_order > 0 first (ascending), then 0s in backend order.
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const oa = a.sort_order ?? 0;
      const ob = b.sort_order ?? 0;
      if (oa > 0 && ob > 0) return oa - ob;
      if (oa > 0) return -1;
      if (ob > 0) return 1;
      return 0;
    });
  }, [filteredItems]);

  const total = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Client-side pagination over the filtered/sorted result.
  const pageItems = useMemo(
    () => sortedItems.slice((page - 1) * limit, page * limit),
    [sortedItems, page, limit],
  );

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
      if (pageItems.length === 1 && page > 1) setPage((p) => p - 1);
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              Actualizar precios
            </Button>
            <Button onClick={openCreate} className="bg-brand text-brand-foreground hover:bg-brand-hover">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          </div>
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

      {/* Search + category filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o marca..."
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
            {CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ProductTable
        products={pageItems}
        isLoading={isLoading}
        error={isError ? (error as Error) : null}
        onEdit={openEdit}
        onDelete={setDeleting}
        onToggleVisibility={(p) =>
          toggleVisibility.mutate({ id: p.id, visible: p.visible === false })
        }
        onReorder={!filtersActive && page === 1 ? handleReorder : undefined}
        selectedIds={selectedIds}
        onToggleSelect={(id: string) =>
          setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
        }
      />

      {/* Empty state when filters match nothing */}
      {!isError && !isLoading && total === 0 && filtersActive && (
        <p className="mt-4 text-center text-sm text-neutral-500">
          No hay productos que coincidan con la búsqueda.
        </p>
      )}

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

      <BulkPriceDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        selectedProducts={allItems
          .filter((p) => selectedIds.includes(p.id))
          .map((p) => ({ id: p.id, name: p.name, base_price: p.base_price }))}
        onApplied={() => setSelectedIds([])}
      />
    </>
  );
}
