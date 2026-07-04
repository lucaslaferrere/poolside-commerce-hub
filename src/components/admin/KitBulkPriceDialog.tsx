import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiPatch } from '@/lib/api';
import { toast } from 'sonner';

type Mode = 'all' | 'manual';

export interface SelectedKit { id: string; name: string; price: number }

interface Props {
  open: boolean;
  onClose: () => void;
  selectedKits: SelectedKit[];
  onApplied: () => void;
}

export function KitBulkPriceDialog({ open, onClose, selectedKits, onApplied }: Props) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>('all');
  const [percentStr, setPercentStr] = useState('');
  const [confirming, setConfirming] = useState(false);

  const percent = parseFloat(percentStr);
  const percentValid = Number.isFinite(percent) && percent !== 0 && percent >= -90 && percent <= 1000;

  const reset = () => { setMode('all'); setPercentStr(''); setConfirming(false); };

  const apply = useMutation({
    mutationFn: () => {
      const body: { percent: number; kit_ids?: string[] } = { percent };
      if (mode === 'manual') body.kit_ids = selectedKits.map((k) => k.id);
      return apiPatch<{ updated: number }>('/admin/kits/bulk-price', body);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin', 'kits'] });
      qc.invalidateQueries({ queryKey: ['kits'] });
      toast.success(`${res.updated} kit(s) actualizado(s)`);
      onApplied();
      reset();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canApply = percentValid && (mode === 'all' || (mode === 'manual' && selectedKits.length > 0));
  const targetLabel = mode === 'all' ? 'todos los kits' : `${selectedKits.length} kit(s) seleccionado(s)`;
  const signo = percent > 0 ? `+${percent}` : `${percent}`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar precios de kits</DialogTitle>
        </DialogHeader>

        {!confirming ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Aplicar a</Label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'manual'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    disabled={m === 'manual' && selectedKits.length === 0}
                    className={
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ' +
                      (mode === m ? 'border-primary bg-primary text-white' : 'border-border hover:bg-muted')
                    }
                  >
                    {m === 'all' ? 'Todos' : `Seleccionados (${selectedKits.length})`}
                  </button>
                ))}
              </div>
            </div>

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
                {selectedKits.map((k) => {
                  const nuevo = Math.round(k.price * (1 + percent / 100));
                  return (
                    <li key={k.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="truncate">{k.name}</span>
                      <span className="tabular-nums text-muted-foreground shrink-0">
                        ${k.price} → <strong className="text-foreground">${nuevo}</strong>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">
              El cambio afecta el precio del kit (y el precio tachado si tiene), redondeado a peso entero, y no se puede deshacer.
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
