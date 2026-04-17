import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/shop';
import { ProductCard } from './ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setProducts(data as unknown as Product[]);
        setLoading(false);
      });
  }, []);

  return (
    <section id="tienda" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Catálogo</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 text-balance">Productos destacados</h2>
          <p className="text-muted-foreground mt-3 text-balance">
            Lo mejor en luminarias, controladores y accesorios para que tu pileta brille.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: 'start', loop: false }} className="w-full">
            <CarouselContent className="-ml-3">
              {products.map((p, i) => (
                <CarouselItem key={p.id} className="pl-3 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCard product={p} index={i} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
