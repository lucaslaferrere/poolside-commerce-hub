import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPostForm, apiPutForm, apiDelete, apiPatch } from '@/lib/api';
import type { Kit } from '@/types/shop';

const QK = ['admin', 'kits'] as const;

export function useAdminKits() {
  return useQuery({
    queryKey: QK,
    queryFn: () => apiGet<Kit[]>('/admin/kits', { limit: '200' }),
    select: (data) => Array.isArray(data) ? data : [],
  });
}

export function useAdminKitMutations() {
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: QK });

  const create = useMutation({
    mutationFn: (form: FormData) => apiPostForm<Kit>('/admin/kits', form),
    onSuccess: () => { invalidate(); toast.success('Kit creado'); },
    onError: (e: Error) => toast.error('Error al crear kit', { description: e.message }),
  });

  const update = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormData }) =>
      apiPutForm<Kit>(`/admin/kits/${id}`, form),
    onSuccess: () => { invalidate(); toast.success('Kit actualizado'); },
    onError: (e: Error) => toast.error('Error al actualizar kit', { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/kits/${id}`),
    onSuccess: () => { invalidate(); toast.success('Kit eliminado'); },
    onError: (e: Error) => toast.error('Error al eliminar kit', { description: e.message }),
  });

  const toggleVisibility = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      apiPatch<Kit>(`/admin/kits/${id}/visibility`, { visible }),
    onSuccess: (_, { visible }) => {
      invalidate();
      toast.success(visible ? 'Kit visible en tienda' : 'Kit oculto en tienda');
    },
    onError: (e: Error) => toast.error('Error al cambiar visibilidad', { description: e.message }),
  });

  const reorderKits = useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      Promise.all(
        items.map((item) =>
          apiPatch<Kit>(`/admin/kits/${item.id}/sort-order`, { sort_order: item.sort_order }),
        ),
      ),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ['kits'] });
    },
    onError: (e: Error) => toast.error('Error al reordenar kits', { description: e.message }),
  });

  return { create, update, remove, toggleVisibility, reorderKits };
}
