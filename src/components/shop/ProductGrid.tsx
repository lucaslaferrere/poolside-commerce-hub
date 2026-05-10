import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/shop/ProductCard';
import { cn } from '@/lib/utils';
import type { ShopProduct } from '@/types/shop';

interface ProductGridProps {
  products: ShopProduct[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
}

export function ProductGrid({
  products,
  loading,
  skeletonCount = 6,
  className,
}: ProductGridProps) {
  const gridCls = cn(
    'grid gap-5',
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    className,
  );

  if (loading) {
    return (
      <div className={gridCls}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50"
          >
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-5 w-1/3 mt-2" />
              <Skeleton className="h-8 w-full mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={gridCls}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
