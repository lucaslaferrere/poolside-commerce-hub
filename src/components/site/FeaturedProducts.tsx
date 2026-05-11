import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/useProducts';

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden">
      <Skeleton className="aspect-square w-full bg-slate-100" />
      <div className="p-3.5 space-y-2">
        <Skeleton className="h-3.5 w-full bg-slate-100" />
        <Skeleton className="h-3.5 w-2/3 bg-slate-100" />
        <Skeleton className="h-3 w-1/2 bg-slate-100 mt-1" />
        <Skeleton className="h-6 w-1/3 bg-slate-100 mt-2" />
      </div>
    </div>
  );
}

export function FeaturedProducts() {
  const { data, isLoading } = useProducts();
  const products = data ?? [];

  return (
    <section id="tienda" className="py-16 md:py-24 bg-white">
      <div className="container">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              Catálogo
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mt-1 text-slate-900">
              Productos destacados
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm max-w-md">
              Lo mejor en luminarias, controladores y accesorios para que tu piscina brille.
            </p>
          </div>
          <Link
            to="/tienda"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors whitespace-nowrap"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Carousel */}
        {!isLoading && products.length > 0 && (
          <div className="relative">
            <Carousel
              opts={{ align: 'start', loop: false, dragFree: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-3">
                {products.map((p) => (
                  <CarouselItem
                    key={p.id}
                    className="pl-3 basis-[83%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <ProductCard product={p} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="hidden md:flex h-10 w-10 left-0 -translate-x-1/2 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.14)] disabled:opacity-0 disabled:pointer-events-none transition-all" />
              <CarouselNext className="hidden md:flex h-10 w-10 right-0 translate-x-1/2 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.14)] disabled:opacity-0 disabled:pointer-events-none transition-all" />
            </Carousel>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            No hay productos disponibles aún.
          </p>
        )}
      </div>
    </section>
  );
}
