import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, PackageX } from 'lucide-react';
import { useCart } from '@/store/cart';
import { CATEGORY_LABELS, formatPrice, type Product } from '@/types/shop';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, open, onClose }: Props) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const triggerSplash = useCart((s) => s.triggerSplash);

  if (!product) return null;

  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    add({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url, type: 'product', variant_sku: product.variant_sku });
    triggerSplash({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    toast.success('Agregado al carrito', { description: product.name });
    onClose();
    setTimeout(() => openCart(), 650);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-muted-foreground text-sm">
                Sin imagen
              </div>
            )}
            <Badge
              className={cn(
                'absolute top-3 left-3 capitalize',
                product.category === 'osire'
                  ? 'gradient-gold text-gold-foreground border-0'
                  : 'bg-secondary text-secondary-foreground border-0'
              )}
            >
              {CATEGORY_LABELS[product.category]}
            </Badge>
            {lowStock && (
              <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-0 text-[10px]">
                Últimas {product.stock}
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <h2 className="font-display font-bold text-2xl leading-tight">{product.name}</h2>

              {product.short_description && (
                <p className="text-sm text-muted-foreground">{product.short_description}</p>
              )}

              {product.description && (
                <p className="text-sm text-foreground/80 leading-relaxed">{product.description}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-3xl text-primary">
                  {formatPrice(Number(product.price))}
                </span>
                {outOfStock && (
                  <span className="flex items-center gap-1 text-destructive text-xs font-medium">
                    <PackageX className="h-3.5 w-3.5" /> Sin stock
                  </span>
                )}
              </div>

              <Button
                size="lg"
                className="w-full gradient-aqua text-primary-foreground hover:opacity-90 disabled:opacity-50"
                disabled={outOfStock}
                onClick={handleAdd}
              >
                <Plus className="h-4 w-4" />
                {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
