import { Pencil, Trash2, Package, Eye, EyeOff, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/types/shop';
import type { Kit } from '@/types/shop';
import { resolveImageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

interface RowProps {
  kit: Kit;
  onEdit: (kit: Kit) => void;
  onDelete: (kit: Kit) => void;
  onToggleVisibility: (kit: Kit) => void;
}

function SortableKitRow({ kit, onEdit, onDelete, onToggleVisibility }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: kit.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isHidden = kit.visible === false;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'hover:bg-neutral-50/60 transition-colors group',
        isHidden && 'opacity-50',
        isDragging && 'z-50 shadow-lg bg-white',
      )}
    >
      <td className="pl-2 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded text-neutral-300 hover:text-neutral-500 transition-colors touch-none"
          aria-label="Arrastrar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        {kit.image_url ? (
          <img
            src={resolveImageUrl(kit.image_url)}
            alt={kit.name}
            className="h-10 w-10 rounded-lg object-cover border border-neutral-200"
          />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Package className="h-4 w-4 text-neutral-400" />
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-neutral-900">{kit.name}</p>
        {kit.pool_size && (
          <p className="text-xs text-neutral-400 mt-0.5">Piscina {kit.pool_size}</p>
        )}
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <p className="font-semibold tabular-nums">{formatPrice(Number(kit.price))}</p>
        {kit.original_price && (
          <p className="text-xs text-neutral-400 line-through tabular-nums">
            {formatPrice(Number(kit.original_price))}
          </p>
        )}
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-neutral-500">
          {kit.product_ids?.length ?? 0} producto{(kit.product_ids?.length ?? 0) !== 1 ? 's' : ''}
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        {kit.featured ? (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">Destacado</Badge>
        ) : (
          <span className="text-neutral-400 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={isHidden ? 'Oculto en tienda — clic para mostrar' : 'Visible en tienda — clic para ocultar'}
            className={cn(
              'h-8 w-8 transition-colors',
              isHidden
                ? 'text-neutral-400 hover:text-neutral-600'
                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50',
            )}
            onClick={() => onToggleVisibility(kit)}
          >
            {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-400 hover:text-brand hover:bg-brand/10"
            onClick={() => onEdit(kit)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-400 hover:text-danger hover:bg-danger/10"
            onClick={() => onDelete(kit)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

interface Props {
  kits: Kit[];
  isLoading: boolean;
  onEdit: (kit: Kit) => void;
  onDelete: (kit: Kit) => void;
  onToggleVisibility: (kit: Kit) => void;
  onReorder: (reordered: Kit[]) => void;
}

export function KitTable({ kits, isLoading, onEdit, onDelete, onToggleVisibility, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = kits.findIndex((k) => k.id === active.id);
    const newIdx = kits.findIndex((k) => k.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onReorder(arrayMove(kits, oldIdx, newIdx));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (kits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-neutral-300 rounded-xl bg-neutral-50/40">
        <Package className="h-10 w-10 text-neutral-300 mb-3" />
        <p className="text-sm font-medium text-neutral-600">Sin kits cargados</p>
        <p className="text-xs text-neutral-400 mt-1">Creá el primero con el botón de arriba.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={kits.map((k) => k.id)} strategy={verticalListSortingStrategy}>
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="w-8 pl-2" />
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-14" />
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Productos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">Destacado</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {kits.map((kit) => (
                <SortableKitRow
                  key={kit.id}
                  kit={kit}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleVisibility={onToggleVisibility}
                />
              ))}
            </tbody>
          </table>
        </div>
      </SortableContext>
    </DndContext>
  );
}
