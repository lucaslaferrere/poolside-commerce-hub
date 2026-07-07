import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiDelete, apiPostForm, apiPutForm, apiPatch } from '@/lib/api';
import type { AdminProduct } from '@/types/admin';

const QK_ROOT = ['admin', 'products'] as const;

export interface PaginatedAdminProducts {
  items: AdminProduct[];
  total: number;
  page: number;
  limit: number;
}

const enrich = (p: AdminProduct): AdminProduct => ({
  ...p,
  stock: p.stock ?? (p.variants?.reduce((s, v) => s + v.stock, 0) ?? 0),
});

/**
 * Fetch a single page of admin products.
 *
 * Sends `page` and `limit` query params so the backend can paginate at the
 * source. If the response is a `{ items, total, page, limit }` envelope we
 * consume it directly; if the server still returns a raw array (no pagination
 * support yet) we slice client-side as a graceful fallback. This lets the UI
 * adopt server-side pagination ahead of the backend.
 */
async function fetchAdminProductsPage(page: number, limit: number): Promise<PaginatedAdminProducts> {
  const raw = await apiGet<unknown>('/admin/products', {
    page: String(page),
    limit: String(limit),
  });

  // Envelope shape (preferred — server-side pagination)
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'items' in (raw as object)) {
    const env = raw as { items: AdminProduct[]; total?: number; page?: number; limit?: number };
    const items = (env.items ?? []).map(enrich);
    return {
      items,
      total: env.total ?? items.length,
      page: env.page ?? page,
      limit: env.limit ?? limit,
    };
  }

  // Raw array — fallback to client slicing
  const all = Array.isArray(raw) ? (raw as AdminProduct[]) : [];
  const start = (page - 1) * limit;
  return {
    items: all.slice(start, start + limit).map(enrich),
    total: all.length,
    page,
    limit,
  };
}

export function useAdminProductsPage(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: [...QK_ROOT, 'page', params.page, params.limit] as const,
    queryFn: () => fetchAdminProductsPage(params.page, params.limit),
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch the full admin catalog in a single call so the table can search,
 * filter, sort and paginate entirely client-side (the catalog is small and
 * the backend already returns a raw array). Searching this way covers the
 * whole catalog, not just the visible page.
 */
async function fetchAllAdminProducts(): Promise<AdminProduct[]> {
  const raw = await apiGet<unknown>('/admin/products', { limit: '1000' });
  const list: AdminProduct[] = Array.isArray(raw)
    ? (raw as AdminProduct[])
    : ((raw as { items?: AdminProduct[] })?.items ?? []);
  return list.map(enrich);
}

export function useAllAdminProducts() {
  return useQuery({
    queryKey: [...QK_ROOT, 'all'] as const,
    queryFn: fetchAllAdminProducts,
    placeholderData: keepPreviousData,
  });
}

/**
 * Pulls the full product set for dashboard aggregates. A single call with a
 * generous limit, decoupled from the paginated table query so KPIs stay
 * accurate regardless of which page the user is on.
 */
export function useAdminInsights() {
  return useQuery({
    queryKey: [...QK_ROOT, 'insights'] as const,
    queryFn: async () => {
      const raw = await apiGet<unknown>('/admin/products', { limit: '1000' });
      const list: AdminProduct[] = Array.isArray(raw)
        ? (raw as AdminProduct[])
        : ((raw as { items?: AdminProduct[] })?.items ?? []);
      return list.map(enrich);
    },
  });
}

export function useAdminProductMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: QK_ROOT });

  // create / update intentionally omit `onError` toasts here — the modal owns
  // submission feedback (inline alert with the backend's specific message).
  // We still toast on success so the user sees confirmation after the modal
  // closes.
  const create = useMutation({
    mutationFn: (form: FormData) => apiPostForm<AdminProduct>('/admin/products', form),
    onSuccess: () => { invalidate(); toast.success('Producto creado'); },
  });

  const update = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormData }) =>
      apiPutForm<AdminProduct>(`/admin/products/${id}`, form),
    onSuccess: () => { invalidate(); toast.success('Producto actualizado'); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/products/${id}`),
    onSuccess: () => { invalidate(); toast.success('Producto eliminado'); },
    onError: (e: Error) => toast.error('Error al eliminar el producto', { description: e.message }),
  });

  const toggleVisibility = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      apiPatch<AdminProduct>(`/admin/products/${id}/visibility`, { visible }),
    onSuccess: (_, { visible }) => {
      invalidate();
      toast.success(visible ? 'Producto visible en tienda' : 'Producto oculto en tienda');
    },
    onError: (e: Error) => toast.error('Error al cambiar visibilidad', { description: e.message }),
  });

  const reorderPage = useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      Promise.all(
        items.map((item) =>
          apiPatch<AdminProduct>(`/admin/products/${item.id}/sort-order`, { sort_order: item.sort_order }),
        ),
      ),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ['shop', 'products'] });
    },
    onError: (e: Error) => toast.error('Error al reordenar productos', { description: e.message }),
  });

  return { create, update, remove, toggleVisibility, reorderPage };
}
