import { useState } from 'react';
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
import { useAdminKits, useAdminKitMutations } from '@/hooks/useAdminKits';
import type { Kit } from '@/types/shop';

export default function AdminKitsPage() {
  const { data: kits = [], isLoading } = useAdminKits();
  const { create, update, remove, toggleVisibility } = useAdminKitMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Kit | null>(null);
  const [deleting, setDeleting] = useState<Kit | null>(null);

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

  return (
    <>
      <AdminPageHeader
        title="Kits"
        description={`${kits.length} kit${kits.length !== 1 ? 's' : ''} cargado${kits.length !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={openCreate} className="bg-brand text-brand-foreground hover:bg-brand-hover gap-2">
            <Plus className="h-4 w-4" />
            Nuevo kit
          </Button>
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
      />

      <KitFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        kit={editing}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
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
