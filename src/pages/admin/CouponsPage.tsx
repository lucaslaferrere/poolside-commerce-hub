import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil, Check, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  expires_at?: string;
  created_at: string;
}

const BLANK = { code: '', discount_percent: '', active: true, expires_at: '' };

export default function CouponsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Coupon | null>(null);
  const [form, setForm]         = useState(BLANK);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => apiGet<{ coupons: Coupon[] }>('/admin/coupons').then((r) => r.coupons ?? []),
  });

  const create = useMutation({
    mutationFn: (body: object) => apiPost('/admin/coupons', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); reset(); toast.success('Cupón creado'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) => apiPut(`/admin/coupons/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); reset(); toast.success('Cupón actualizado'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/coupons/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('Cupón eliminado'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const reset = () => { setForm(BLANK); setEditing(null); setShowForm(false); };

  const startEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discount_percent: String(c.discount_percent),
      active: c.active,
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const submit = () => {
    const pct = parseFloat(form.discount_percent as string);
    if (!form.code.trim()) { toast.error('El código es requerido'); return; }
    if (isNaN(pct) || pct <= 0 || pct > 100) { toast.error('El descuento debe ser entre 1 y 100'); return; }

    const body = {
      code: form.code.trim().toUpperCase(),
      discount_percent: pct,
      active: form.active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    if (editing) {
      update.mutate({ id: editing.id, body });
    } else {
      create.mutate(body);
    }
  };

  const coupons = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Cupones de descuento</h1>
          <p className="text-sm text-muted-foreground mt-1">Creá y gestioná códigos de descuento para tus clientes.</p>
        </div>
        <Button onClick={() => { reset(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo cupón
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-white p-6 space-y-4">
          <h2 className="font-semibold text-base">{editing ? 'Editar cupón' : 'Nuevo cupón'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Código</Label>
              <Input
                placeholder="Ej: VERANO10"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descuento (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                placeholder="Ej: 10"
                value={form.discount_percent}
                onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Vencimiento (opcional)</Label>
              <Input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Estado</Label>
              <div className="flex gap-2 pt-1">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, active: val }))}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                      form.active === val
                        ? 'border-primary bg-primary text-white'
                        : 'border-border text-muted-foreground hover:border-primary/50',
                    )}
                  >
                    {val ? 'Activo' : 'Inactivo'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={submit} disabled={create.isPending || update.isPending} className="gap-2">
              <Check className="h-4 w-4" />
              {editing ? 'Guardar cambios' : 'Crear cupón'}
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <X className="h-4 w-4" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay cupones creados todavía.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Descuento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vencimiento</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{c.code}</td>
                  <td className="px-4 py-3 font-semibold">{c.discount_percent}%</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.active ? 'default' : 'secondary'} className={cn(c.active ? 'bg-emerald-500' : '')}>
                      {c.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(c)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`¿Eliminar el cupón "${c.code}"?`)) remove.mutate(c.id); }}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
