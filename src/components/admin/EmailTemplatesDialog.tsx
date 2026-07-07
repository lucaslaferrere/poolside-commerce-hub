import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export interface EmailTemplate {
  id: string;
  name: string;
  body: string;
  created_at: string;
}

const VARIABLES = ['{{productos}}', '{{total}}'];

export function EmailTemplatesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [body, setBody] = useState('');

  const { data: templates } = useQuery({
    queryKey: ['admin', 'email-templates'],
    queryFn: () => apiGet<{ templates: EmailTemplate[] }>('/admin/email-templates').then((r) => r.templates ?? []),
    enabled: open,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'email-templates'] });

  const create = useMutation({
    mutationFn: () => apiPost('/admin/email-templates', { name, body }),
    onSuccess: () => { invalidate(); setName(''); setBody(''); toast.success('Plantilla creada'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/email-templates/${id}`),
    onSuccess: () => { invalidate(); toast.success('Plantilla eliminada'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const insertVar = (v: string) => setBody((b) => b + ' ' + v);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Plantillas del email de recuperación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Plantillas guardadas</Label>
            {(templates ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">Todavía no hay plantillas.</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {(templates ?? []).map((t) => (
                  <li key={t.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium">{t.name}</span>
                    <button
                      type="button"
                      onClick={() => remove.mutate(t.id)}
                      disabled={remove.isPending}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <Label className="text-xs">Nueva plantilla</Label>
            <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
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
            <Textarea rows={8} placeholder="Mensaje" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={() => create.mutate()} disabled={!name || !body || create.isPending}>
            {create.isPending ? 'Creando...' : 'Crear plantilla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
