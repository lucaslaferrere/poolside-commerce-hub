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
    <section
      id="tienda"
      className="relative overflow-hidden py-20 md:py-24 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_55%,#F4F8FB_100%)]"
    >
      {/* Aqua sun glow — top-right (morning light on the pool deck) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(0,163,214,0.16),transparent_65%)] blur-3xl"
      />
      {/* Counter-glow — bottom-left (cool reflection) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(46,107,255,0.08),transparent_60%)] blur-3xl"
      />
      {/* Caustic shimmer band — thin horizontal water-light streaks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[18%] h-32 opacity-60 [background-image:repeating-linear-gradient(90deg,transparent_0px,transparent_38px,rgba(0,163,214,0.05)_38px,rgba(0,163,214,0.05)_40px)] [mask-image:radial-gradient(ellipse_70%_100%_at_50%_50%,#000,transparent_75%)]"
      />
      {/* Bottom horizon hairline */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="relative container">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
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
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
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
