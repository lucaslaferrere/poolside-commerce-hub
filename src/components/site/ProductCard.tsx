import { motion } from 'framer-motion';
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
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);

  const handleAdd = () => {
    add({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      type: 'product',
    });
    toast.success('Agregado al carrito', { description: product.name });
    open();
  };

  return (
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
            <span className="font-display font-bold text-lg text-primary">{formatPrice(Number(product.price))}</span>
            <Button size="sm" onClick={handleAdd} className="gradient-aqua text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
