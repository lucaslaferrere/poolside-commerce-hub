import { useState, useMemo, useCallback } from 'react';
import { Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminPageHeader } from './AdminLayout';
import { KitTable } from '@/components/admin/KitTable';
import { KitFormModal } from '@/components/admin/KitFormModal';
import { KitBulkPriceDialog } from '@/components/admin/KitBulkPriceDialog';
import { useAdminKits, useAdminKitMutations } from '@/hooks/useAdminKits';
import type { Kit } from '@/types/shop';

export default function AdminKitsPage() {
  const { data: rawKits = [], isLoading } = useAdminKits();
  const { create, update, remove, toggleVisibility, reorderKits } = useAdminKitMutations();

  const kits = useMemo(() => {
    return [...rawKits].sort((a, b) => {
      const oa = a.sort_order ?? 0;
      const ob = b.sort_order ?? 0;
      if (oa > 0 && ob > 0) return oa - ob;
      if (oa > 0) return -1;
      if (ob > 0) return 1;
      return 0;
    });
  }, [rawKits]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Kit | null>(null);
  const [deleting, setDeleting] = useState<Kit | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (kit: Kit) => { setEditing(kit); setFormOpen(true); };

  const handleSubmit = async (form: FormData, id?: string) => {
    if (id) {
      await update.mutateAsync({ id, form });
    } else {
      await create.mutateAsync(form);
    }
    setFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await remove.mutateAsync(deleting.id);
    setDeleting(null);
  };

  const isSubmitting = create.isPending || update.isPending;

  const handleReorder = useCallback(
    (reordered: Kit[]) => {
      reorderKits.mutate(reordered.map((k, i) => ({ id: k.id, sort_order: i + 1 })));
    },
    [reorderKits],
  );

  return (
    <>
      <AdminPageHeader
        title="Kits"
        description={`${kits.length} kit${kits.length !== 1 ? 's' : ''} cargado${kits.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              Actualizar precios
            </Button>
            <Button onClick={openCreate} className="bg-brand text-brand-foreground hover:bg-brand-hover gap-2">
              <Plus className="h-4 w-4" />
              Nuevo kit
            </Button>
          </div>
        }
      />

      <KitTable
        kits={kits}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={setDeleting}
        onToggleVisibility={(k) =>
          toggleVisibility.mutate({ id: k.id, visible: k.visible === false })
        }
        onReorder={handleReorder}
        selectedIds={selectedIds}
        onToggleSelect={(id: string) =>
          setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
        }
      />

      <KitFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        kit={editing}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <KitBulkPriceDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        selectedKits={rawKits
          .filter((k) => selectedIds.includes(k.id))
          .map((k) => ({ id: k.id, name: k.name, price: k.price }))}
        onApplied={() => setSelectedIds([])}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-danger" />
              Eliminar kit
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminás <strong>{deleting?.name}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={remove.isPending}
              className="bg-danger text-white hover:bg-danger/90"
            >
              {remove.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
