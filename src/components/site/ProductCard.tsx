import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Flame } from 'lucide-react';
import { useCart } from '@/store/cart';
import { applyDiscount, formatPrice, hasDiscount } from '@/types/shop';
import type { ShopProduct } from '@/types/shop';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/api';

interface Props {
  product: ShopProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const triggerSplash = useCart((s) => s.triggerSplash);

  const onSale = hasDiscount(product.discount_percent);
  const finalPrice = applyDiscount(product.base_price, product.discount_percent);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    add({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image_url: resolveImageUrl(product.images?.[0]) || null,
      type: 'product',
      variant_sku: product.variants?.[0]?.sku ?? '',
    });
    triggerSplash({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    toast.success('Agregado al carrito', { description: product.name });
    setTimeout(() => open(), 650);
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/tienda/${product.id}`} className="block h-full">
      <Card className="group h-full flex flex-col overflow-hidden bg-card border border-neutral-200 rounded-lg shadow-xs hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-base ease-standard cursor-pointer">
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          {product.images?.[0] ? (
            <img
              src={resolveImageUrl(product.images[0])}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-slow ease-standard"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-neutral-400 text-xs">Sin imagen</div>
          )}
          <Badge
            className="absolute top-3 left-3 capitalize border-0 font-medium tracking-wide bg-neutral-0/90 text-neutral-700 backdrop-blur-sm"
          >
            {product.category}
          </Badge>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-neutral-0/70 backdrop-blur-sm grid place-items-center">
              <span className="bg-neutral-900 text-neutral-0 text-xs font-medium px-3 py-1 rounded-full">
                Sin stock
              </span>
            </div>
          )}
          {/* Discount badge wins over "Últimas N" */}
          {onSale ? (
            <Badge className="absolute top-3 right-3 border-0 bg-red-500 text-white text-[11px] font-bold tracking-wide shadow-md gap-1">
              <Flame className="h-3 w-3" />
              -{Math.round(product.discount_percent!)}% OFF
            </Badge>
          ) : product.stock > 0 && product.stock <= 3 ? (
            <Badge className="absolute top-3 right-3 bg-warning text-warning-foreground border-0 text-[10px] font-medium">
              Últimas {product.stock}
            </Badge>
          ) : null}
        </div>
        <CardContent className="p-5 flex flex-col flex-1">
          <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 min-h-[2.5rem] text-neutral-900">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 min-h-[2rem]">
            {product.description ?? ''}
          </p>
          <div className="mt-4 flex items-end justify-between gap-2 mt-auto">
            <div className="flex flex-col">
              {onSale ? (
                <>
                  <span className="text-[11px] text-gray-400 line-through tabular-nums leading-none">
                    {formatPrice(product.base_price)}
                  </span>
                  <span className="font-display font-bold text-xl text-red-600 tabular-nums leading-tight">
                    {formatPrice(finalPrice)}
                  </span>
                </>
              ) : (
                <span className="font-display font-semibold text-xl text-brand">{formatPrice(product.base_price)}</span>
              )}
            </div>
            <Button
              size="sm"
              onClick={(e) => { e.preventDefault(); handleAdd(e); }}
              disabled={(product.stock ?? 0) === 0}
              className="bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed shadow-none"
            >
              <Plus className="h-4 w-4" />
              {product.stock === 0 ? 'Sin stock' : 'Agregar'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </Link>
    </motion.div>
    </>
  );

}
