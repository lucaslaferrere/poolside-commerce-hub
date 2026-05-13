import { Link } from 'react-router-dom';
import { ShoppingCart, Droplet, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { applyDiscount, formatPrice, hasDiscount, CATEGORY_LABELS } from '@/types/shop';
import type { ShopProduct } from '@/types/shop';
import { resolveImageUrl } from '@/lib/api';

interface Props {
  product: ShopProduct;
}

export function ProductCard({ product }: Props) {
  const add = useCart((s) => s.add);
  const triggerSplash = useCart((s) => s.triggerSplash);
  const openCart = useCart((s) => s.open);

  const inStock = product.stock > 0;
  const imageUrl = resolveImageUrl(product.images?.[0]) || null;
  const categoryLabel = (CATEGORY_LABELS as Record<string, string>)[product.category] ?? product.category;

  const onSale = hasDiscount(product.discount_percent);
  const finalPrice = applyDiscount(product.base_price, product.discount_percent);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image_url: imageUrl,
      type: 'product',
      variant_sku: product.variants?.[0]?.sku ?? '',
    });
    triggerSplash();
    toast.success('Producto agregado al carrito', { description: product.name });
    setTimeout(() => openCart(), 650);
  };

  return (
    <Link to={`/tienda/${product.id}`} className="group block h-full">
      <div
        className={cn(
          'h-full flex flex-col overflow-hidden rounded-lg',
          'bg-neutral-50 border border-neutral-200',
          'shadow-xs hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5',
          'transition-all duration-base ease-standard',
        )}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-neutral-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-slow ease-standard group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-neutral-300">
              <Droplet className="h-14 w-14" />
            </div>
          )}
          <Badge className="absolute top-3 left-3 capitalize border-0 bg-neutral-0/90 text-neutral-700 backdrop-blur-sm text-[11px] font-medium tracking-wide shadow-xs">
            {categoryLabel}
          </Badge>

          {/* Discount badge — takes the spotlight when present */}
          {onSale ? (
            <Badge
              className="absolute top-3 right-3 border-0 bg-red-500 text-white text-[11px] font-bold tracking-wide shadow-md gap-1"
            >
              <Flame className="h-3 w-3" />
              -{Math.round(product.discount_percent!)}% OFF
            </Badge>
          ) : (
            <Badge
              className={cn(
                'absolute top-3 right-3 border-0 text-[11px] font-medium tracking-wide',
                inStock
                  ? 'bg-success text-success-foreground'
                  : 'bg-neutral-900 text-neutral-0',
              )}
            >
              {inStock ? 'En stock' : 'Sin stock'}
            </Badge>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5 gap-2">
          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] text-neutral-900">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-neutral-500 line-clamp-2 min-h-[2rem] leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="mt-auto pt-3 space-y-3">
            {onSale ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display font-bold text-lg text-red-600 tabular-nums leading-none">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-xs text-gray-400 line-through tabular-nums">
                  {formatPrice(product.base_price)}
                </span>
              </div>
            ) : (
              <span className="font-display font-semibold text-lg text-brand block">
                {formatPrice(product.base_price)}
              </span>
            )}
            <Button
              onClick={handleAddToCart}
              disabled={!inStock}
              size="sm"
              className={cn(
                'w-full h-9 text-xs font-medium tracking-wide shadow-none',
                'bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active',
                'disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed',
              )}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              {inStock ? 'Agregar al carrito' : 'Sin stock'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
