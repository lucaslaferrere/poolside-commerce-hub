import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Droplet,
  ShoppingCart,
  AlertCircle,
  Truck,
  Shield,
  Zap,
} from 'lucide-react';
import { Footer } from '@/components/site/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { QuantitySelector } from '@/components/shop/QuantitySelector';
import {
  TechnicalAccordion,
  type AccordionSection,
} from '@/components/shop/TechnicalAccordion';
import { useProductById } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { useCart } from '@/store/cart';
import { formatPrice, CATEGORY_LABELS } from '@/types/shop';
import type { ShopVariant } from '@/types/shop';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const add = useCart((s) => s.add);
  const triggerSplash = useCart((s) => s.triggerSplash);
  const openCart = useCart((s) => s.open);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const { data: product, isLoading, isError } = useProductById(id);

  const colors = useMemo(
    () => [...new Set((product?.variants ?? []).map((v) => v.color).filter(Boolean))],
    [product],
  );

  const sizes = useMemo(() => {
    const pool = selectedColor
      ? (product?.variants ?? []).filter((v) => v.color === selectedColor)
      : (product?.variants ?? []);
    return [...new Set(pool.map((v) => v.size).filter(Boolean))];
  }, [product, selectedColor]);

  const hasColorPicker = colors.length > 0;
  const hasSizePicker = sizes.length > 0;

  const selectedVariant = useMemo<ShopVariant | null>(() => {
    if (!product?.variants?.length) return null;
    if (hasColorPicker && !selectedColor) return null;
    if (hasSizePicker && !selectedSize) return null;
    return (
      product.variants.find(
        (v) =>
          (!hasColorPicker || v.color === selectedColor) &&
          (!hasSizePicker || v.size === selectedSize),
      ) ?? null
    );
  }, [product, hasColorPicker, hasSizePicker, selectedColor, selectedSize]);

  const effectiveStock = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant) return selectedVariant.stock;
    const variants = product.variants ?? [];
    if (!variants.length) return product.stock ?? 0;
    if (selectedColor) {
      return variants.filter((v) => v.color === selectedColor).reduce((s, v) => s + v.stock, 0);
    }
    return product.stock ?? variants.reduce((s, v) => s + v.stock, 0);
  }, [product, selectedVariant, selectedColor]);

  const effectivePrice = useMemo(
    () => (product?.base_price ?? 0) + (selectedVariant?.price_adjustment ?? 0),
    [product, selectedVariant],
  );

  useEffect(() => {
    if (effectiveStock > 0) setQty((q) => Math.min(q, effectiveStock));
  }, [effectiveStock]);

  const inStock = effectiveStock > 0;
  const maxQty = Math.max(1, Math.min(effectiveStock, 99));

  const handleAddToCart = () => {
    if (!product || !inStock) return;
    const cartId = selectedVariant
      ? `${product.id}|${selectedVariant.color}|${selectedVariant.size}`
      : product.id;
    const variantLabel = selectedVariant
      ? ` — ${[selectedVariant.color, selectedVariant.size].filter(Boolean).join(' / ')}`
      : '';
    add(
      {
        id: cartId,
        name: `${product.name}${variantLabel}`,
        price: effectivePrice,
        image_url: product.images[0] ?? null,
        type: 'product',
        variant_sku: selectedVariant?.sku ?? product.variants?.[0]?.sku ?? '',
      },
      qty,
    );
    triggerSplash();
    toast.success('Producto agregado al carrito', { description: product.name });
    setTimeout(() => openCart(), 650);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-16">
          <div className="border-b bg-slate-50/60">
            <div className="container py-3.5">
              <Skeleton className="h-4 w-52" />
            </div>
          </div>
          <div className="container py-8 lg:py-12 pb-32 md:pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-x-14 items-start">
              <div className="lg:col-span-3 space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-20 rounded-xl shrink-0" />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 space-y-5">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-7 w-full" />
                <div className="py-5 border-y border-slate-100 space-y-2">
                  <Skeleton className="h-12 w-44" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-5 w-40" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-20 rounded-full" />
                  ))}
                </div>
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center py-20 pt-36">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/8 grid place-items-center mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive/50" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-primary">
                Producto no encontrado
              </h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                No se pudo cargar la información. Revisá la URL o volvé a la tienda.
              </p>
            </div>
            <Button
              onClick={() => navigate('/tienda')}
              variant="outline"
              className="gap-2 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a la tienda
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryLabel =
    (CATEGORY_LABELS as Record<string, string>)[product.category] ?? product.category;

  const specRows = (product.specs ?? []).map((s) => ({ label: s.key, value: s.value }));

  const accordionSections: AccordionSection[] = [
    ...(product.description
      ? [
          {
            id: 'description',
            title: 'Descripción',
            content: <p>{product.description}</p>,
          } satisfies AccordionSection,
        ]
      : []),
    {
      id: 'specs',
      title: 'Ficha técnica',
      rows: specRows,
    },
    {
      id: 'shipping',
      title: 'Envío y devoluciones',
      content: (
        <>
          <p>
            Realizamos envíos a todo el país. El costo y tiempo de entrega se
            calcula en el checkout según tu ubicación.
          </p>
          <p>
            Si el producto presenta defectos de fabricación, podés realizar el
            cambio dentro de los 30 días corridos de recibido.
          </p>
        </>
      ),
    },
  ];

  // ── Product page ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16">
        {/* ── Breadcrumb strip ────────────────────────────────────────────── */}
        <div className="border-b bg-slate-50/70">
          <div className="container py-3 flex items-center justify-between gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to="/"
                      className="text-muted-foreground hover:text-secondary transition-colors text-xs"
                    >
                      Inicio
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to="/tienda"
                      className="text-muted-foreground hover:text-secondary transition-colors text-xs"
                    >
                      Tienda
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-medium text-foreground/80 max-w-[180px] truncate">
                    {product.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Link
              to="/tienda"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary transition-colors shrink-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Seguir comprando
            </Link>
          </div>
        </div>

        {/* ── Main grid ───────────────────────────────────────────────────── */}
        <section className="container py-8 lg:py-12 pb-32 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-x-14 items-start">

            {/* ── LEFT: image gallery (3/5) ────────────────────────────── */}
            <div className="lg:col-span-3 space-y-4">
              {/* Main image */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
                {(product.images?.length ?? 0) > 0 ? (
                  <img
                    key={activeImage}
                    src={product.images[activeImage]}
                    alt={product.name}
                    className="h-full w-full object-cover animate-fade-in"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-slate-200">
                    <Droplet className="h-28 w-28" strokeWidth={0.75} />
                    <span className="font-display text-2xl font-bold tracking-[0.25em] uppercase text-slate-300">
                      {product.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 3)}
                    </span>
                  </div>
                )}
                {/* Vignette for depth */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_40px_rgba(0,0,0,0.04)]" />
              </div>

              {/* Thumbnails */}
              {(product.images?.length ?? 0) > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images!.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      aria-label={`Ver imagen ${i + 1}`}
                      className={cn(
                        'shrink-0 h-[72px] w-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
                        activeImage === i
                          ? 'border-secondary shadow-aqua scale-[1.04]'
                          : 'border-slate-200 opacity-55 hover:opacity-100 hover:border-slate-300',
                      )}
                    >
                      <img
                        src={src}
                        alt={`${product.name} — vista ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: product info (2/5) — sticky on desktop ────────── */}
            <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start space-y-6">

              {/* Category + brand */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="rounded-full px-4 py-1 text-xs font-semibold capitalize bg-secondary text-white border-0 hover:bg-secondary transition-none">
                  {categoryLabel}
                </Badge>
                {product.brand && (
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    {product.brand}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-[1.85rem] lg:text-4xl font-bold text-primary leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Price block */}
              <div className="py-5 border-y border-slate-100/80 space-y-1.5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-display text-4xl lg:text-5xl font-bold text-[#1a1a2e] tabular-nums leading-none">
                    {formatPrice(effectivePrice)}
                  </span>
                  {selectedVariant && selectedVariant.price_adjustment !== 0 && (
                    <span className="text-sm text-muted-foreground font-medium">
                      ({selectedVariant.price_adjustment > 0 ? '+' : ''}
                      {formatPrice(selectedVariant.price_adjustment)} variante)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/60 tracking-wide">
                  Precio en pesos argentinos · Consultá financiación disponible
                </p>
              </div>

              {/* Stock indicator */}
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full shrink-0 transition-colors',
                    inStock
                      ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]'
                      : 'bg-red-400 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]',
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    inStock ? 'text-emerald-600' : 'text-red-500',
                  )}
                >
                  {inStock
                    ? `En stock · ${effectiveStock} unidades disponibles`
                    : 'Sin stock — consultá disponibilidad'}
                </span>
              </div>

              {/* ── Variant selectors ──────────────────────────────────── */}
              {(hasColorPicker || hasSizePicker) && (
                <div className="space-y-4 pt-1">
                  {/* Colors */}
                  {hasColorPicker && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Color
                        {selectedColor && (
                          <span className="normal-case tracking-normal font-normal text-foreground ml-2">
                            {selectedColor}
                          </span>
                        )}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {colors.map((color) => {
                          const colorStock = (product.variants ?? [])
                            .filter((v) => v.color === color)
                            .reduce((s, v) => s + v.stock, 0);
                          const isSelected = selectedColor === color;
                          return (
                            <button
                              key={color}
                              onClick={() => {
                                setSelectedColor(isSelected ? null : color);
                                setSelectedSize(null);
                              }}
                              disabled={colorStock === 0}
                              className={cn(
                                'px-4 py-2 text-sm rounded-full border-2 font-medium capitalize transition-all duration-150',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1',
                                isSelected
                                  ? 'border-secondary bg-secondary text-white shadow-[0_4px_12px_hsl(187_73%_46%/0.35)]'
                                  : 'border-slate-400 text-slate-800 bg-white hover:border-secondary hover:text-secondary',
                                colorStock === 0 && 'opacity-35 cursor-not-allowed line-through',
                              )}
                            >
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {hasSizePicker && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Talle
                        {selectedSize && (
                          <span className="normal-case tracking-normal font-normal text-foreground ml-2">
                            {selectedSize}
                          </span>
                        )}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {sizes.map((size) => {
                          const variant = (product.variants ?? []).find(
                            (v) =>
                              (!selectedColor || v.color === selectedColor) && v.size === size,
                          );
                          const hasStock = (variant?.stock ?? 0) > 0;
                          const isSelected = selectedSize === size;
                          return (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(isSelected ? null : size)}
                              disabled={!hasStock}
                              className={cn(
                                'px-4 py-2 text-sm rounded-lg border-2 font-medium transition-all duration-150',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1',
                                isSelected
                                  ? 'border-secondary bg-secondary text-white shadow-[0_4px_12px_hsl(187_73%_46%/0.35)]'
                                  : 'border-slate-400 text-slate-800 bg-white hover:border-secondary hover:text-secondary',
                                !hasStock && 'opacity-35 cursor-not-allowed line-through',
                              )}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Quantity + CTA ─────────────────────────────────────── */}
              <div className="space-y-3">
                {inStock && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <QuantitySelector
                      value={qty}
                      onChange={setQty}
                      min={1}
                      max={maxQty}
                      label="Cantidad"
                    />
                    <span className="text-[11px] text-slate-400">(máx. {maxQty})</span>
                  </div>
                )}

                {/* CTA — visible on md+ (mobile version is sticky bar below) */}
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={cn(
                    'hidden md:flex w-full h-14 gap-3 rounded-xl',
                    'font-display font-semibold text-[15px] tracking-tight',
                    'gradient-aqua text-primary-foreground',
                    'transition-all duration-150 active:scale-[0.985]',
                    'shadow-aqua hover:shadow-[0_12px_40px_-8px_hsl(187_73%_46%/0.55)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100',
                  )}
                >
                  <ShoppingCart className="h-5 w-5 shrink-0" />
                  {inStock
                    ? `Agregar al carrito · ${formatPrice(effectivePrice * qty)}`
                    : 'Sin stock'}
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-300">
                {(
                  [
                    { Icon: Truck, label: 'Envío a todo el país' },
                    { Icon: Shield, label: 'Garantía 12 meses' },
                    { Icon: Zap, label: 'Soporte técnico' },
                  ] as const
                ).map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <div className="h-9 w-9 rounded-full bg-[#1a1a2e] grid place-items-center shadow-sm">
                      <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                    </div>
                    <p className="text-[10.5px] text-slate-700 font-semibold leading-snug">{label}</p>
                  </div>
                ))}
              </div>

              {/* ── Ficha técnica + envíos ───────────────────────────── */}
              <TechnicalAccordion
                defaultOpen={product.description ? 'description' : 'specs'}
                sections={accordionSections}
              />
            </div>
            {/* end right col */}
          </div>
        </section>

        <Footer />
      </div>

      {/* ── Mobile sticky CTA bar (md:hidden) ─────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-6px_24px_rgba(0,0,0,0.07)]">
        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={!inStock}
          className={cn(
            'w-full h-14 gap-3 rounded-xl',
            'font-display font-semibold text-base tracking-tight',
            'gradient-aqua text-primary-foreground',
            'transition-all duration-150 active:scale-[0.985]',
            'shadow-aqua',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100',
          )}
        >
          <ShoppingCart className="h-5 w-5 shrink-0" />
          {inStock ? 'Agregar al carrito' : 'Sin stock'}
        </Button>
      </div>
    </div>
  );
}
