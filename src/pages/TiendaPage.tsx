import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Plus, Package, Sparkles } from 'lucide-react';
import { Footer } from '@/components/site/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useKits } from '@/hooks/useKits';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';
import { formatPrice } from '@/types/shop';
import type { Kit } from '@/types/shop';
import { resolveImageUrl } from '@/lib/api';

function KitStoreCard({ kit }: { kit: Kit }) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const triggerSplash = useCart((s) => s.triggerSplash);
  const price = Number(kit.price);
  const original = kit.original_price ? Number(kit.original_price) : 0;
  const discount = original > 0 ? Math.round(((original - price) / original) * 100) : 0;
  const imageUrl = resolveImageUrl(kit.image_url);

  const handleAdd = () => {
    add({ id: kit.id, name: kit.name, price, image_url: imageUrl || null, type: 'kit' });
    triggerSplash();
    toast.success('Kit agregado', { description: kit.name });
    setTimeout(() => open(), 650);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-lg bg-neutral-50 border border-neutral-200 shadow-xs hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <img src={imageUrl} alt={kit.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-neutral-300">
            <Package className="h-14 w-14" />
          </div>
        )}
        <Badge className="absolute top-3 left-3 border-0 bg-neutral-0/90 text-neutral-700 backdrop-blur-sm text-[11px] font-medium">
          Kit
        </Badge>
        {discount > 0 && (
          <Badge className="absolute top-3 right-3 border-0 bg-red-500 text-white text-[11px] font-bold">
            -{discount}% OFF
          </Badge>
        )}
        {kit.featured && (
          <Badge className="absolute bottom-3 left-3 border-0 bg-white/90 text-slate-700 text-[10px] font-semibold">
            <Sparkles className="h-3 w-3 mr-1 text-primary" />Más elegido
          </Badge>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5 gap-2">
        <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] text-neutral-900">
          {kit.name}
        </h3>
        {kit.description && (
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{kit.description}</p>
        )}
        <div className="mt-auto pt-3 space-y-3">
          <div>
            {original > 0 && (
              <span className="text-xs text-gray-400 line-through block">{formatPrice(original)}</span>
            )}
            <span className="font-display font-semibold text-lg text-brand">{formatPrice(price)}</span>
          </div>
          <Button onClick={handleAdd} size="sm" className="w-full h-9 text-xs font-medium bg-brand text-brand-foreground hover:bg-brand-hover">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Agregar al carrito
          </Button>
        </div>
      </div>
    </div>
  );
}

const KIT_POOL_SIZES = [
  { value: 'all',     label: 'Todos los tamaños' },
  { value: 'chica',   label: 'Chica' },
  { value: 'mediana', label: 'Mediana' },
  { value: 'grande',  label: 'Grande' },
];

const KIT_LINES = [
  { value: 'all',         label: 'Todas las líneas' },
  { value: 'osire',       label: 'OSIRE' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'poolight',    label: 'Poolight' },
];

export default function TiendaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [kitSizeFilter, setKitSizeFilter] = useState<string>('all');
  const [kitLineFilter, setKitLineFilter] = useState<string>(() => searchParams.get('line') ?? 'all');

  // When landing with ?line=xxx, switch to kits tab
  useEffect(() => {
    const line = searchParams.get('line');
    if (line) {
      setCategoryFilter('kits');
      setKitLineFilter(line);
    }
  }, []);

  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const { data: kitsData } = useKits();
  const allKits = useMemo(() => {
    const raw = Array.isArray(kitsData) ? kitsData : [];
    return [...raw].sort((a, b) => {
      const oa = a.sort_order ?? 0;
      const ob = b.sort_order ?? 0;
      if (oa > 0 && ob > 0) return oa - ob;
      if (oa > 0) return -1;
      if (ob > 0) return 1;
      return 0;
    });
  }, [kitsData]);

  const kits = useMemo(() => {
    return allKits.filter((k) => {
      if (kitSizeFilter !== 'all' && k.pool_size !== kitSizeFilter) return false;
      if (kitLineFilter !== 'all' && k.line !== kitLineFilter) return false;
      return true;
    });
  }, [allKits, kitSizeFilter, kitLineFilter]);
  const { categories } = useCategories();

  // Inject real kit count into the 'kits' category slot
  const augmentedCategories = useMemo(
    () => categories.map((c) => (c.id === 'kits' ? { ...c, count: allKits.length } : c)),
    [categories, allKits],
  );

  const handleCategorySelect = (id: string) => {
    setCategoryFilter(id);
    setBrandFilter('all');
  };

  const filtered = useMemo(() => {
    let base =
      categoryFilter === 'all'
        ? [...products]
        : products.filter((p) => p.category === categoryFilter);

    if (categoryFilter === 'luminarias' && brandFilter !== 'all') {
      base = base.filter((p) => p.brand?.toUpperCase().includes(brandFilter.toUpperCase()));
    }

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
              Iluminación premium para tu piscina
            </p>
          </div>

          {/* ── Two-column layout ─────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left rail — desktop sticky / mobile sheet */}
            <FilterSidebar
              categories={augmentedCategories}
              selected={categoryFilter}
              onSelect={handleCategorySelect}
              totalCount={products.length + allKits.length}
              loading={isLoading}
              brandFilter={brandFilter}
              onBrandSelect={setBrandFilter}
            />

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {/* Toolbar (mobile filter trigger + sort + count) */}
              {!isError && (
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <MobileFilterTrigger
                    categories={augmentedCategories}
                    selected={categoryFilter}
                    onSelect={handleCategorySelect}
                    totalCount={products.length + allKits.length}
                    loading={isLoading}
                    brandFilter={brandFilter}
                    onBrandSelect={setBrandFilter}
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

              {/* Empty — only show for non-kit categories; kits handle their own empty state */}
              {!isLoading && !isError && categoryFilter !== 'kits' && filtered.length === 0 && !(categoryFilter === 'all' && allKits.length > 0) && (
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

              {/* Grid — products */}
              {!isLoading && !isError && categoryFilter !== 'kits' && filtered.length > 0 && (
                <ProductGrid products={filtered} />
              )}

              {/* Kit filters + grid (shown when filter is 'kits' or 'all') */}
              {!isLoading && !isError && (categoryFilter === 'kits' || categoryFilter === 'all') && (
                <div className={categoryFilter === 'all' && filtered.length > 0 ? 'mt-10' : ''}>
                  {categoryFilter === 'all' && (
                    <h2 className="font-display font-semibold text-base text-neutral-700 mb-4 pb-2 border-b border-neutral-200">
                      Kits de instalación completos
                    </h2>
                  )}

                  {/* Filter chips */}
                  <div className="flex flex-wrap gap-3 mb-5">
                    {/* Pool size */}
                    <div className="flex flex-wrap gap-1.5">
                      {KIT_POOL_SIZES.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setKitSizeFilter(opt.value)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                            kitSizeFilter === opt.value
                              ? 'bg-brand text-brand-foreground border-brand'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <div className="w-px h-6 bg-neutral-200 self-center hidden sm:block" />
                    {/* Line */}
                    <div className="flex flex-wrap gap-1.5">
                      {KIT_LINES.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setKitLineFilter(opt.value)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                            kitLineFilter === opt.value
                              ? 'bg-brand text-brand-foreground border-brand'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {kits.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {kits.map((kit) => <KitStoreCard key={kit.id} kit={kit} />)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center text-neutral-500 border border-dashed border-neutral-200 rounded-lg bg-neutral-50">
                      <p className="text-sm">No hay kits con los filtros seleccionados</p>
                      <button
                        type="button"
                        onClick={() => { setKitSizeFilter('all'); setKitLineFilter('all'); }}
                        className="text-xs text-brand hover:underline font-medium"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
