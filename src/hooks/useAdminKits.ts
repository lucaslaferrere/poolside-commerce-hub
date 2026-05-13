import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPostForm, apiPutForm, apiDelete } from '@/lib/api';
import type { Kit } from '@/types/shop';

const QK = ['admin', 'kits'] as const;

export function useAdminKits() {
  return useQuery({
    queryKey: QK,
    queryFn: () => apiGet<Kit[]>('/admin/kits'),
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

  return { create, update, remove };
}
