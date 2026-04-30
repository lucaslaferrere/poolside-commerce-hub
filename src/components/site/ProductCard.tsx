import { Link } from 'react-router-dom';
import { ShoppingCart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { formatPrice, CATEGORY_LABELS } from '@/types/shop';
import type { ShopProduct } from '@/types/shop';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  product: ShopProduct;
}

export function ProductCard({ product }: Props) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const triggerSplash = useCart((s) => s.triggerSplash);

  const imageUrl = product.images?.[0] ?? null;
  const inStock = product.stock > 0;
  const categoryLabel =
    (CATEGORY_LABELS as Record<string, string>)[product.category] ?? product.category;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image_url: imageUrl,
      type: 'product',
    });
    triggerSplash();
    toast.success('Agregado al carrito', { description: product.name });
    setTimeout(() => open(), 650);
  };

  return (
    <Link to={`/tienda/${product.id}`} className="group block h-full">
      <div className="h-full flex flex-col rounded-xl border border-slate-200/80 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-slate-300 text-xs select-none">
              Sin imagen
            </div>
          )}

          {/* Category pill */}
          <span className="absolute top-2.5 left-2.5 bg-secondary/10 text-secondary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-secondary/25 capitalize">
            {categoryLabel}
          </span>

          {/* Hover add button overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3">
            <Button
              onClick={handleAdd}
              disabled={!inStock}
              className={cn(
                'w-full h-9 text-xs gradient-aqua text-primary-foreground hover:opacity-90 shadow-lg disabled:opacity-50',
              )}
              size="sm"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              {inStock ? 'Agregar al carrito' : 'Sin stock'}
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-3.5 gap-1.5">
          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] text-slate-800">
            {product.name}
          </h3>

          {/* Envío gratis badge */}
          <div className="flex items-center gap-1 text-emerald-600">
            <Truck className="h-3 w-3 shrink-0" />
            <span className="text-[11px] font-medium">Envío gratis</span>
          </div>

          <div className="mt-auto pt-1">
            <span className="font-display font-bold text-xl text-slate-900 tabular-nums block">
              {formatPrice(product.base_price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
