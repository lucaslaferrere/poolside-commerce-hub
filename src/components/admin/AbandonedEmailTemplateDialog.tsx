import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPut } from '@/lib/api';
import { toast } from 'sonner';

const VARIABLES = ['{{codigo}}', '{{descuento}}', '{{vencimiento}}', '{{productos}}', '{{total}}'];

export function AbandonedEmailTemplateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [body, setBody] = useState('');
  const [defaultBody, setDefaultBody] = useState('');

  const { data } = useQuery({
    queryKey: ['admin', 'abandoned-template-full'],
    queryFn: () => apiGet<{ body: string; default_body: string }>('/admin/settings/abandoned-cart-email'),
    enabled: open,
  });

  useEffect(() => {
    if (data) { setBody(data.body); setDefaultBody(data.default_body); }
  }, [data]);

  const save = useMutation({
    mutationFn: () => apiPut('/admin/settings/abandoned-cart-email', { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'abandoned-template'] });
      qc.invalidateQueries({ queryKey: ['admin', 'abandoned-template-full'] });
      toast.success('Plantilla guardada');
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const insertVar = (v: string) => setBody((b) => b + ' ' + v);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Plantilla del email de recuperación</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {VARIABLES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVar(v)}
                className="rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs hover:bg-muted"
              >
                {v}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mensaje</Label>
            <Textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <button
            type="button"
            onClick={() => setBody(defaultBody)}
            className="text-xs text-muted-foreground underline"
          >
            Restaurar mensaje por defecto
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
