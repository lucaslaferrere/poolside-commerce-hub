import { Pencil, Trash2, Package, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPrice } from '@/types/shop';
import type { AdminProduct } from '@/types/admin';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/api';

interface Props {
  products: AdminProduct[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
  onToggleVisibility: (product: AdminProduct) => void;
}

export function ProductTable({ products, isLoading, error, onEdit, onDelete, onToggleVisibility }: Props) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border rounded-xl bg-destructive/5 text-center">
        <p className="font-medium text-destructive">Error al cargar productos</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[56px] pl-4">Img</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">Categoría</TableHead>
            <TableHead className="text-right hidden md:table-cell">Precio</TableHead>
            <TableHead className="text-right w-[72px]">Stock</TableHead>
            <TableHead className="w-[112px] text-center pr-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="pl-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-7 w-14 mx-auto" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-20 text-center text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Sin productos todavía</p>
                <p className="text-xs mt-1">Hacé clic en "Nuevo producto" para agregar el primero.</p>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            products.map((p) => {
              const stockLevel =
                p.stock <= 0
                  ? 'text-destructive'
                  : p.stock <= 5
                  ? 'text-amber-600'
                  : 'text-foreground';

              const isHidden = p.visible === false;
              return (
                <TableRow key={p.id} className={cn('group', isHidden && 'opacity-50')}>
                  <TableCell className="pl-4">
                    {p.images?.[0] ? (
                      <img
                        src={resolveImageUrl(p.images[0])}
                        alt={p.name}
                        loading="lazy"
                        className="h-10 w-10 rounded-md object-cover bg-muted"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted grid place-items-center">
                        <Package className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <p className="font-medium leading-tight line-clamp-1">{p.name}</p>
                    {p.brand && (
                      <p className="text-xs text-muted-foreground mt-0.5">{p.brand}</p>
                    )}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className="capitalize text-xs font-normal">
                      {p.category}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right tabular-nums hidden md:table-cell">
                    {formatPrice(Number(p.base_price))}
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    <span className={cn('font-medium text-sm', stockLevel)}>{p.stock}</span>
                  </TableCell>

                  <TableCell className="pr-4">
                    <div className="flex items-center justify-center gap-0.5">
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
                        onClick={() => onToggleVisibility(p)}
                        aria-label={isHidden ? `Mostrar ${p.name}` : `Ocultar ${p.name}`}
                      >
                        {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEdit(p)}
                        aria-label={`Editar ${p.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(p)}
                        aria-label={`Eliminar ${p.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}
