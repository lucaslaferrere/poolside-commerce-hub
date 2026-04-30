import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { Footer } from '@/components/site/Footer';
import { ProductCard } from '@/components/shop/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, type Category } from '@/types/shop';
import type { ShopProduct } from '@/types/shop';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export default function TiendaPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['shop', 'products'],
    queryFn: async () => {
      // Handle both plain-array and paginated-envelope responses
      const raw = await apiGet<unknown>('/products', { limit: '100' });
      if (Array.isArray(raw)) return raw as ShopProduct[];
      const envelope = raw as { products?: ShopProduct[] };
      return envelope?.products ?? [];
    },
  });

  const products = data ?? [];

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const filtered = useMemo(() => {
    let list = categoryFilter === 'all' ? [...products] : products.filter((p) => p.category === categoryFilter);
    switch (sortBy) {
      case 'name-asc':  list.sort((a, b) => a.name.localeCompare(b.name, 'es')); break;
      case 'name-desc': list.sort((a, b) => b.name.localeCompare(a.name, 'es')); break;
      case 'price-asc':  list.sort((a, b) => a.base_price - b.base_price); break;
      case 'price-desc': list.sort((a, b) => b.base_price - a.base_price); break;
    }
    return list;
  }, [products, categoryFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary">Tienda</h1>
            <p className="text-muted-foreground mt-1">Todos nuestros productos</p>
          </div>

          {/* Filter / sort toolbar — only when there's data */}
          {!isLoading && !isError && products.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center">
              {/* Category pills */}
              <div className="flex gap-2 flex-wrap flex-1">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full border transition-all font-medium',
                    categoryFilter === 'all'
                      ? 'gradient-aqua text-primary-foreground border-transparent'
                      : 'border-border text-muted-foreground hover:border-secondary hover:text-secondary',
                  )}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-all font-medium capitalize',
                      categoryFilter === cat
                        ? 'gradient-aqua text-primary-foreground border-transparent'
                        : 'border-border text-muted-foreground hover:border-secondary hover:text-secondary',
                    )}
                  >
                    {(CATEGORY_LABELS as Record<string, string>)[cat] ?? cat}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[200px] h-9 text-sm shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nombre A → Z</SelectItem>
                  <SelectItem value="name-desc">Nombre Z → A</SelectItem>
                  <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Loading skeleton ─────────────────────────────────────────────── */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/60 overflow-hidden bg-card">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-1/3 mt-2" />
                    <Skeleton className="h-8 w-full mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Error ────────────────────────────────────────────────────────── */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive/60" />
              <div>
                <p className="font-display font-semibold text-lg text-primary">
                  No se pudieron cargar los productos
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Verificá tu conexión e intentá de nuevo.
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                Reintentar
              </Button>
            </div>
          )}

          {/* ── Empty ────────────────────────────────────────────────────────── */}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center text-muted-foreground">
              {products.length === 0 ? (
                <p>No hay productos disponibles aún</p>
              ) : (
                <>
                  <p>No hay productos en esta categoría</p>
                  <Button variant="outline" size="sm" onClick={() => setCategoryFilter('all')}>
                    Ver todos
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── Product grid ─────────────────────────────────────────────────── */}
          {!isLoading && !isError && filtered.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
