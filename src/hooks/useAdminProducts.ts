import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiDelete, apiPostForm, apiPutForm } from '@/lib/api';
import type { AdminProduct } from '@/types/admin';

const QK = ['admin', 'products'] as const;

export function useAdminProducts() {
  const qc = useQueryClient();

  const productsQuery = useQuery({
    queryKey: QK,
    queryFn: () => apiGet<AdminProduct[]>('/admin/products'),
    select: (data) => {
      const arr = Array.isArray(data) ? data : [];
      return arr.map((p) => ({
        ...p,
        stock: p.stock ?? (p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0),
      }));
    },
  });

  const create = useMutation({
    mutationFn: (form: FormData) => apiPostForm<AdminProduct>('/admin/products', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success('Producto creado');
    },
    onError: (e: Error) => toast.error('Error al crear el producto', { description: e.message }),
  });

  const update = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormData }) =>
      apiPutForm<AdminProduct>(`/admin/products/${id}`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success('Producto actualizado');
    },
    onError: (e: Error) => toast.error('Error al actualizar el producto', { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success('Producto eliminado');
    },
    onError: (e: Error) => toast.error('Error al eliminar el producto', { description: e.message }),
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    create,
    update,
    remove,
  };
}
