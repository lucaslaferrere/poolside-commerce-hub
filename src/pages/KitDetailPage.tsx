import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ChevronLeft,
  Check,
  Package,
  Sparkles,
  Tag,
  Truck,
  Shield,
  Wrench,
  ShoppingCart,
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
import { useKitById } from '@/hooks/useKits';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/types/shop';
import { resolveImageUrl } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import { useMemo, useEffect } from 'react';

const POOL_SIZE_LABEL: Record<string, string> = {
  chica: 'Chica',
  mediana: 'Mediana',
  grande: 'Grande',
};

const LINE_META: Record<string, { label: string; badgeClass: string }> = {
  osire:       { label: 'Premium',      badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  profesional: { label: 'Profesional',  badgeClass: 'bg-sky-100 text-sky-700 border-sky-200' },
  poolight:    { label: 'Esencial',     badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const ADAPTADOR_ID = '6a033ba83005b0f5d1857695'; // Adaptador de pared
const TUERCA_ID    = '6a033b883005b0f5d1857694'; // Tuerca con sello de goma

const GENERIC_ITEMS: Record<string, string[]> = {
  chica:   ['1 luminaria LED RGB', 'Control inalámbrico', 'Cable y accesorios'],
  mediana: ['2 luminarias LED RGB', 'Control inalámbrico', 'Cable y conexiones'],
  grande:  ['4 luminarias LED RGB', 'Transformador', 'Cable y accesorios'],
};

export default function KitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: kit, isLoading, isError } = useKitById(id);
  const { data: productsData } = useProducts();

  const add = useCart((s) => s.add);
  const triggerSplash = useCart((s) => s.triggerSplash);
  const openCart = useCart((s) => s.open);

  const productNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of productsData ?? []) map.set(p.id, p.name);
    return map;
  }, [productsData]);

  const adaptador = useMemo(() => (productsData ?? []).find((p) => p.id === ADAPTADOR_ID), [productsData]);
  const tuerca    = useMemo(() => (productsData ?? []).find((p) => p.id === TUERCA_ID),    [productsData]);

  const addAccessory = (product: typeof adaptador) => {
    if (!product) return;
    add({
      id: product.id,
      name: product.name,
      price: Number(product.base_price),
      image_url: resolveImageUrl(product.images?.[0]) || null,
    });
    triggerSplash();
    toast.success('Agregado al carrito', { description: product.name });
    setTimeout(() => openCart(), 650);
  };

  const items = useMemo(() => {
    if (!kit) return [];
    if (kit.product_ids?.length) {
      const named = kit.product_ids
        .map((pid) => productNameById.get(pid))
        .filter((n): n is string => Boolean(n));
      const unique = [...new Set(named)];
      if (unique.length) return unique;
    }
    return kit.pool_size ? (GENERIC_ITEMS[kit.pool_size] ?? []) : ['Luminaria LED', 'Control inalámbrico', 'Accesorios'];
  }, [kit, productNameById]);

  useEffect(() => {
    if (kit) trackEvent('product_view', { product_id: kit.id, product_name: kit.name });
  }, [kit?.id]);

  const handleAddToCart = () => {
    if (!kit) return;
    add({
      id: kit.id,
      name: kit.name,
      price: Number(kit.price),
      image_url: resolveImageUrl(kit.image_url) || null,
      type: 'kit',
    });
    triggerSplash();
    toast.success('Kit agregado al carrito', { description: kit.name });
    setTimeout(() => openCart(), 650);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-16">
          <div className="border-b bg-slate-50/60">
            <div className="container py-3.5">
              <Skeleton className="h-4 w-52" />
            </div>
          </div>
          <div className="container py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              <div className="space-y-5">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-14 w-full rounded-xl mt-6" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !kit) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center py-20 pt-36">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/8 grid place-items-center mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive/50" />
            </div>
            <h2 className="font-display font-bold text-xl text-primary">Kit no encontrado</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
              No se pudo cargar la información. Volvé al inicio.
            </p>
            <Button onClick={() => navigate('/')} variant="outline" className="gap-2 rounded-full">
              <ChevronLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const original = kit.original_price ? Number(kit.original_price) : 0;
  const price = Number(kit.price);
  const discount = original > 0 ? Math.round(((original - price) / original) * 100) : 0;
  const sizeLabel = kit.pool_size ? (POOL_SIZE_LABEL[kit.pool_size] ?? kit.pool_size) : null;
  const lineMeta = kit.line ? LINE_META[kit.line] : null;
  const imageUrl = resolveImageUrl(kit.image_url);

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16">

        {/* Breadcrumb */}
        <div className="border-b bg-slate-50/70">
          <div className="container py-3 flex items-center justify-between gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-xs">
                      Inicio
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <a href="/#kits" className="text-muted-foreground hover:text-primary transition-colors text-xs">
                      Kits
                    </a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-medium text-foreground/80 max-w-[200px] truncate">
                    {kit.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Link to="/#kits" className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0">
              <ChevronLeft className="h-3.5 w-3.5" />
              Ver todos los kits
            </Link>
          </div>
        </div>

        {/* Main grid */}
        <section className="container py-8 lg:py-12 pb-32 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
              {imageUrl ? (
                <img src={imageUrl} alt={kit.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-slate-300">
                  <Package className="h-20 w-20" strokeWidth={0.75} />
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-4 right-4 border-0 bg-primary text-primary-foreground font-bold text-sm shadow-md">
                  -{discount}% OFF
                </Badge>
              )}
              {kit.featured && (
                <Badge className="absolute top-4 left-4 border-0 bg-white/95 text-slate-700 text-xs font-semibold shadow-sm">
                  <Sparkles className="h-3 w-3 mr-1 text-primary" />
                  Más elegido
                </Badge>
              )}
            </div>

            {/* Info */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-6">

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {lineMeta && (
                  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${lineMeta.badgeClass}`}>
                    {lineMeta.label}
                  </span>
                )}
                {sizeLabel && (
                  <Badge className="gap-1 border-0 bg-primary/8 text-primary font-medium">
                    <Package className="h-3 w-3" />
                    Piscina {sizeLabel}
                  </Badge>
                )}
              </div>

              {/* Title + description */}
              <div>
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary leading-tight">
                  {kit.name}
                </h1>
                {kit.description && (
                  <p className="text-slate-500 mt-3 leading-relaxed">{kit.description}</p>
                )}
              </div>

              {/* Price */}
              <div className="py-5 border-y border-slate-100 space-y-1.5">
                {original > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg text-gray-400 line-through tabular-nums">{formatPrice(original)}</span>
                    {discount > 0 && (
                      <span className="text-xs font-bold text-primary bg-primary/8 rounded-full px-2 py-0.5 ring-1 ring-primary/15">
                        Ahorrás {formatPrice(original - price)}
                      </span>
                    )}
                  </div>
                )}
                <span className="font-display text-4xl font-bold text-primary tabular-nums leading-none block">
                  {formatPrice(price)}
                </span>
                <p className="text-[11px] text-muted-foreground/60 tracking-wide">
                  Precio en pesos argentinos · Consultá financiación disponible
                </p>
              </div>

              {/* Included items */}
              {items.length > 0 && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">Incluye</p>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compatibilidad según tipo de piscina */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700 flex items-center gap-1.5">
                  ⚠️ Verificá tu tipo de piscina
                </p>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">🏗️</span>
                    <span>
                      <strong>Hormigón en construcción:</strong> No necesitás nada extra — la virola para empotrar ya viene incluida.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">🔧</span>
                    <span>
                      <strong>Hormigón ya construida (o recambio):</strong> Sumá el{' '}
                      {adaptador ? (
                        <button
                          onClick={() => addAccessory(adaptador)}
                          className="inline-flex items-center gap-1 text-primary font-semibold underline underline-offset-2 cursor-pointer hover:text-primary/70"
                        >
                          adaptador de pared →
                        </button>
                      ) : (
                        <span className="text-primary font-semibold">adaptador de pared</span>
                      )}{' '}
                      para instalar sin romper la pared.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">🌊</span>
                    <span>
                      <strong>Fibra de vidrio (PRFV):</strong> Agregá la{' '}
                      {tuerca ? (
                        <button
                          onClick={() => addAccessory(tuerca)}
                          className="inline-flex items-center gap-1 text-primary font-semibold underline underline-offset-2 cursor-pointer hover:text-primary/70"
                        >
                          tuerca con sello de goma →
                        </button>
                      ) : (
                        <span className="text-primary font-semibold">tuerca con sello de goma</span>
                      )}{' '}
                      obligatoria para garantizar la estanqueidad.
                    </span>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="hidden md:flex w-full h-14 gap-3 rounded-xl font-display font-semibold text-[15px] gradient-aqua text-primary-foreground shadow-aqua hover:shadow-[0_12px_40px_-8px_hsl(187_73%_46%/0.55)] transition-all"
              >
                <ShoppingCart className="h-5 w-5 shrink-0" />
                Agregar al carrito · {formatPrice(price)}
              </Button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                {([
                  { icon: Tag,         label: 'Hasta -10% combo' },
                  { icon: Truck,       label: 'Envío a todo el país' },
                  { icon: Shield,      label: 'Garantía oficial' },
                ] as const).map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <div className="h-9 w-9 rounded-full bg-[#1a1a2e] grid place-items-center shadow-sm">
                      <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                    </div>
                    <p className="text-[10.5px] text-slate-700 font-semibold leading-snug">{label}</p>
                  </div>
                ))}
              </div>

              {/* Asesoría */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <Wrench className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Asesoría técnica incluida.</span>{' '}
                  Ante cualquier duda de instalación, te ayudamos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-6px_24px_rgba(0,0,0,0.07)]">
        <Button
          size="lg"
          onClick={handleAddToCart}
          className="w-full h-14 gap-3 rounded-xl font-display font-semibold text-base gradient-aqua text-primary-foreground shadow-aqua"
        >
          <ShoppingCart className="h-5 w-5 shrink-0" />
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
