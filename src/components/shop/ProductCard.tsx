import { Link } from 'react-router-dom';
import { ShoppingCart, Droplet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice, CATEGORY_LABELS, type Category } from '@/types/shop';
import type { ShopProduct } from '@/types/shop';

interface Props {
  product: ShopProduct;
}

export function ProductCard({ product }: Props) {
  const add = useCart((s) => s.add);
  const triggerSplash = useCart((s) => s.triggerSplash);
  const openCart = useCart((s) => s.open);

  const inStock = product.stock > 0;
  const imageUrl = product.images?.[0] ?? null;
  const categoryLabel = (CATEGORY_LABELS as Record<string, string>)[product.category] ?? product.category;

  const handleAddToCart = (e: React.MouseEvent) => {
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
    toast.success('Producto agregado al carrito', { description: product.name });
    setTimeout(() => openCart(), 650);
  };

  return (
    <Link to={`/tienda/${product.id}`} className="group block h-full">
      <div className="h-full flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-aqua hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-muted-foreground/30">
              <Droplet className="h-14 w-14" />
            </div>
          )}
          <Badge className="absolute top-3 left-3 capitalize bg-secondary/90 text-secondary-foreground border-0 backdrop-blur-sm text-xs">
            {categoryLabel}
          </Badge>
          <Badge
            className={cn(
              'absolute top-3 right-3 border-0 text-xs',
              inStock ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white',
            )}
          >
            {inStock ? 'En stock' : 'Sin stock'}
          </Badge>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem] leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="mt-auto pt-2 space-y-2">
            <span className="font-display font-bold text-lg text-secondary block">
              {formatPrice(product.base_price)}
            </span>
            <Button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full gradient-aqua text-primary-foreground hover:opacity-90 disabled:opacity-50 h-8 text-xs"
              size="sm"
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
