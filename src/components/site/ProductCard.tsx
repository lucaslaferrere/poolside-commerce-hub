import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCart } from '@/store/cart';
import { CATEGORY_LABELS, formatPrice, type Product } from '@/types/shop';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProductDetailModal } from './ProductDetailModal';

interface Props {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
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
      variant_sku: product.variant_sku,
    });
    triggerSplash({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    toast.success('Agregado al carrito', { description: product.name });
    setTimeout(() => open(), 650);
  };

  return (
    <>
    <ProductDetailModal product={product} open={modalOpen} onClose={() => setModalOpen(false)} />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="group h-full overflow-hidden border-border/60 hover:shadow-aqua hover:-translate-y-1 transition-all duration-300">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-muted-foreground text-xs">Sin imagen</div>
          )}
          <Badge
            className={cn(
              'absolute top-3 left-3 capitalize',
              product.category === 'osire' ? 'gradient-gold text-gold-foreground border-0' : 'bg-secondary text-secondary-foreground border-0'
            )}
          >
            {CATEGORY_LABELS[product.category]}
          </Badge>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/60 grid place-items-center">
              <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Sin stock
              </span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-0 text-[10px]">
              Últimas {product.stock}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-display font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          {product.short_description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2rem]">
              {product.short_description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div>
              <span className="font-display font-bold text-lg text-primary">{formatPrice(Number(product.price))}</span>
              <button
                onClick={() => setModalOpen(true)}
                className="block text-[11px] text-muted-foreground hover:text-secondary underline-offset-2 hover:underline transition-colors"
              >
                Ver detalles
              </button>
            </div>
            <Button
              size="sm"
              onClick={(e) => handleAdd(e)}
              disabled={product.stock === 0}
              className="gradient-aqua text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
