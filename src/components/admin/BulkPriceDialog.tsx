import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiPatch } from '@/lib/api';
import { toast } from 'sonner';

type Mode = 'all' | 'category' | 'manual';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'luminarias', label: 'Luminarias' },
  { value: 'controladores', label: 'Controladores' },
  { value: 'kits', label: 'Kits' },
  { value: 'osire', label: 'OSIRE' },
  { value: 'accesorios', label: 'Accesorios' },
];

export interface SelectedProduct { id: string; name: string; base_price: number }

interface Props {
  open: boolean;
  onClose: () => void;
  selectedProducts: SelectedProduct[];
  onApplied: () => void;
}

export function BulkPriceDialog({ open, onClose, selectedProducts, onApplied }: Props) {
  const qc = useQueryClient();
  const selectedIds = selectedProducts.map((p) => p.id);
  const [mode, setMode] = useState<Mode>('all');
  const [category, setCategory] = useState('');
  const [percentStr, setPercentStr] = useState('');
  const [confirming, setConfirming] = useState(false);

  const percent = parseFloat(percentStr);
  const percentValid = Number.isFinite(percent) && percent !== 0 && percent >= -90 && percent <= 1000;

  const reset = () => { setMode('all'); setCategory(''); setPercentStr(''); setConfirming(false); };

  const apply = useMutation({
    mutationFn: () => {
      const body: { percent: number; product_ids?: string[]; category?: string } = { percent };
      if (mode === 'manual') body.product_ids = selectedIds;
      else if (mode === 'category') body.category = category;
      return apiPatch<{ updated: number }>('/admin/products/bulk-price', body);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success(`${res.updated} producto(s) actualizado(s)`);
      onApplied();
      reset();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canApply =
    percentValid &&
    (mode === 'all' ||
      (mode === 'category' && category !== '') ||
      (mode === 'manual' && selectedIds.length > 0));

  const targetLabel =
    mode === 'all' ? 'todos los productos' :
    mode === 'category' ? `la categoría ${CATEGORIES.find((c) => c.value === category)?.label ?? category}` :
    `${selectedIds.length} producto(s) seleccionado(s)`;

  const signo = percent > 0 ? `+${percent}` : `${percent}`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar precios</DialogTitle>
        </DialogHeader>

        {!confirming ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Aplicar a</Label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'category', 'manual'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    disabled={m === 'manual' && selectedIds.length === 0}
                    className={
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ' +
                      (mode === m ? 'border-primary bg-primary text-white' : 'border-border hover:bg-muted')
                    }
                  >
                    {m === 'all' ? 'Todos' : m === 'category' ? 'Por tipo' : `Seleccionados (${selectedIds.length})`}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'category' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Elegí una categoría" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Porcentaje (usá negativo para descuento)</Label>
              <Input
                type="number"
                placeholder="Ej: 15 o -10"
                value={percentStr}
                onChange={(e) => setPercentStr(e.target.value)}
              />
              {percentStr !== '' && !percentValid && (
                <p className="text-xs text-danger">Ingresá un porcentaje distinto de 0, entre -90 y 1000.</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancelar</Button>
              <Button onClick={() => setConfirming(true)} disabled={!canApply}>Continuar</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Vas a aplicar <strong>{signo}%</strong> al precio de <strong>{targetLabel}</strong>.
            </p>
            {mode === 'manual' && (
              <ul className="max-h-48 overflow-y-auto rounded-md border border-border divide-y divide-border text-xs">
                {selectedProducts.map((p) => {
                  const nuevo = Math.round(p.base_price * (1 + percent / 100));
                  return (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="truncate">{p.name}</span>
                      <span className="tabular-nums text-muted-foreground shrink-0">
                        ${p.base_price} → <strong className="text-foreground">${nuevo}</strong>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">
              El cambio afecta el precio base de cada producto (redondeado a peso entero) y no se puede deshacer.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirming(false)} disabled={apply.isPending}>Volver</Button>
              <Button onClick={() => apply.mutate()} disabled={apply.isPending}>
                {apply.isPending ? 'Aplicando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
