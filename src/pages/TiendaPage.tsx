import { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Footer } from '@/components/site/Footer';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FilterSidebar,
  MobileFilterTrigger,
  type SortOption,
} from '@/components/shop/FilterSidebar';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { useCategories, useProducts } from '@/hooks/useProducts';

export default function TiendaPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const { categories } = useCategories();

  const filtered = useMemo(() => {
    const base =
      categoryFilter === 'all'
        ? [...products]
        : products.filter((p) => p.category === categoryFilter);

    switch (sortBy) {
      case 'name-asc':
        base.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        break;
      case 'name-desc':
        base.sort((a, b) => b.name.localeCompare(a.name, 'es'));
        break;
      case 'price-asc':
        base.sort((a, b) => (a.base_price ?? 0) - (b.base_price ?? 0));
        break;
      case 'price-desc':
        base.sort((a, b) => (b.base_price ?? 0) - (a.base_price ?? 0));
        break;
    }
    return base;
  }, [products, categoryFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <div className="mb-10 pb-6 border-b border-neutral-200">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
              Tienda
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Iluminación premium para tu pileta
            </p>
          </div>

          {/* ── Two-column layout ─────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left rail — desktop sticky / mobile sheet */}
            <FilterSidebar
              categories={categories}
              selected={categoryFilter}
              onSelect={setCategoryFilter}
              totalCount={products.length}
              loading={isLoading}
            />

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {/* Toolbar (mobile filter trigger + sort + count) */}
              {!isError && (
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <MobileFilterTrigger
                    categories={categories}
                    selected={categoryFilter}
                    onSelect={setCategoryFilter}
                    totalCount={products.length}
                    loading={isLoading}
                  />

                  {!isLoading && (
                    <p className="text-sm text-muted-foreground">
                      {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
                    </p>
                  )}

                  <div className="ml-auto">
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as SortOption)}
                    >
                      <SelectTrigger className="w-[200px] h-9 text-sm shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">Nombre A → Z</SelectItem>
                        <SelectItem value="name-desc">Nombre Z → A</SelectItem>
                        <SelectItem value="price-asc">
                          Precio: menor a mayor
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Precio: mayor a menor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && <ProductGrid products={[]} loading skeletonCount={6} />}

              {/* Error */}
              {isError && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <AlertCircle className="h-12 w-12 text-danger/70" />
                  <div>
                    <p className="font-display font-semibold text-lg text-neutral-900">
                      No se pudieron cargar los productos
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      Verificá tu conexión e intentá de nuevo.
                    </p>
                  </div>
                  <Button onClick={() => refetch()} variant="outline">
                    Reintentar
                  </Button>
                </div>
              )}

              {/* Empty */}
              {!isLoading && !isError && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center text-neutral-500 border border-dashed border-neutral-200 rounded-lg bg-neutral-50">
                  {products.length === 0 ? (
                    <p>No hay productos disponibles aún</p>
                  ) : (
                    <>
                      <p>No hay productos en esta categoría</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCategoryFilter('all')}
                      >
                        Ver todos
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Grid */}
              {!isLoading && !isError && filtered.length > 0 && (
                <ProductGrid products={filtered} />
              )}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
