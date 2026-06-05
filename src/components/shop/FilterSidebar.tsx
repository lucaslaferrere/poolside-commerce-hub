import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { CategoryOption } from '@/hooks/useProducts';

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

const LUMINARIA_BRANDS = [
  { id: 'OSIRE',    label: 'OSIRE' },
  { id: 'HORUS',    label: 'HORUS' },
  { id: 'NAZAR',    label: 'NAZAR' },
  { id: 'POOLIGHT', label: 'POOLIGHT' },
];

interface FilterSidebarProps {
  categories: CategoryOption[];
  selected: string;
  onSelect: (id: string) => void;
  totalCount: number;
  loading?: boolean;
  brandFilter?: string;
  onBrandSelect?: (brand: string) => void;
}

function FilterPanel({
  categories,
  selected,
  onSelect,
  totalCount,
  loading,
  brandFilter = 'all',
  onBrandSelect,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-primary/70 mb-3">
          Categorías
        </h3>

        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onSelect('all')}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                selected === 'all'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-slate-50 hover:text-primary',
              )}
            >
              <span>Todas</span>
              <span className="text-xs tabular-nums opacity-70">{totalCount}</span>
            </button>
          </li>

          {loading && categories.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="px-3 py-2">
                  <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                </li>
              ))
            : categories.map((cat) => {
                const isActive = selected === cat.id;
                const disabled = cat.count === 0;
                const isLuminarias = cat.id === 'luminarias';
                const showBrands = isActive && isLuminarias && onBrandSelect;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => !disabled && onSelect(cat.id)}
                      disabled={disabled}
                      aria-pressed={isActive}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-slate-50 hover:text-primary',
                        disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                      )}
                    >
                      <span className="capitalize flex items-center gap-1.5">
                        {cat.label}
                        {isLuminarias && (
                          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isActive && 'rotate-180')} />
                        )}
                      </span>
                      <span className="text-xs tabular-nums opacity-70">{cat.count}</span>
                    </button>

                    {/* Sub-filtro de marcas para Luminarias */}
                    {showBrands && (
                      <ul className="mt-1 ml-3 space-y-0.5 border-l-2 border-primary/20 pl-3">
                        <li>
                          <button
                            type="button"
                            onClick={() => onBrandSelect('all')}
                            className={cn(
                              'w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors',
                              brandFilter === 'all'
                                ? 'text-primary font-semibold'
                                : 'text-muted-foreground hover:text-primary',
                            )}
                          >
                            Todas
                          </button>
                        </li>
                        {LUMINARIA_BRANDS.map((b) => (
                          <li key={b.id}>
                            <button
                              type="button"
                              onClick={() => onBrandSelect(b.id)}
                              className={cn(
                                'w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors',
                                brandFilter === b.id
                                  ? 'text-primary font-semibold'
                                  : 'text-muted-foreground hover:text-primary',
                              )}
                            >
                              {b.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
        </ul>
      </div>

      {selected !== 'all' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect('all')}
          className="w-full gap-2 rounded-lg"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

// Desktop-only sticky left rail. Use <MobileFilterTrigger /> separately for
// the mobile toolbar so the page can choose its placement.
export function FilterSidebar(props: FilterSidebarProps) {
  return (
    <aside className="hidden lg:block lg:w-64 shrink-0">
      <div className="sticky top-24 rounded-xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="font-display font-bold text-base text-primary mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filtros
        </h2>
        <FilterPanel {...props} />
      </div>
    </aside>
  );
}

export function MobileFilterTrigger(props: FilterSidebarProps) {
  const [open, setOpen] = useState(false);
  const { categories, selected } = props;
  const activeLabel =
    selected === 'all'
      ? 'Todas las categorías'
      : categories.find((c) => c.id === selected)?.label ?? 'Filtros';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden gap-2 rounded-full"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] overflow-y-auto">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="font-display text-primary">Filtros</SheetTitle>
        </SheetHeader>
        <FilterPanel
          {...props}
          onSelect={(id) => {
            props.onSelect(id);
            setOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
