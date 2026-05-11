import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCart } from '@/store/cart';
import { CATEGORY_LABELS, formatPrice, type Product } from '@/types/shop';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const navigate = useNavigate();
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const triggerSplash = useCart((s) => s.triggerSplash);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    add({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      type: 'product',
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
      <Card className="group h-full overflow-hidden bg-card border border-neutral-200 rounded-lg shadow-xs hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-base ease-standard">
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-slow ease-standard"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-neutral-400 text-xs">Sin imagen</div>
          )}
          <Badge
            className={cn(
              'absolute top-3 left-3 capitalize border-0 font-medium tracking-wide',
              product.category === 'osire'
                ? 'bg-neutral-900 text-neutral-0'
                : 'bg-neutral-0/90 text-neutral-700 backdrop-blur-sm'
            )}
          >
            {CATEGORY_LABELS[product.category]}
          </Badge>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-neutral-0/70 backdrop-blur-sm grid place-items-center">
              <span className="bg-neutral-900 text-neutral-0 text-xs font-medium px-3 py-1 rounded-full">
                Sin stock
              </span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <Badge className="absolute top-3 right-3 bg-warning text-warning-foreground border-0 text-[10px] font-medium">
              Últimas {product.stock}
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 min-h-[2.5rem] text-neutral-900">
            {product.name}
          </h3>
          {product.short_description && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2 min-h-[2rem]">
              {product.short_description}
            </p>
          )}
          <div className="mt-4 flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-display font-semibold text-xl text-brand">{formatPrice(Number(product.price))}</span>
              <button
                onClick={() => navigate(`/tienda/${product.id}`)}
                className="text-[11px] text-neutral-500 hover:text-brand underline-offset-2 hover:underline transition-colors duration-fast"
              >
                Ver detalles
              </button>
            </div>
            <Button
              size="sm"
              onClick={(e) => handleAdd(e)}
              disabled={product.stock === 0}
              className="bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed shadow-none"
            >
              <Plus className="h-4 w-4" />
              {product.stock === 0 ? 'Sin stock' : 'Agregar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );

}
