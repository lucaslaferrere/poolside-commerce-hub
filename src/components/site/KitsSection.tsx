import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Plus,
  Package,
  Tag,
  Truck,
  ShieldCheck,
  Wrench,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { Kit } from '@/types/shop';
import { formatPrice } from '@/types/shop';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';
import { useKits } from '@/hooks/useKits';
import { useProducts } from '@/hooks/useProducts';
import { resolveImageUrl } from '@/lib/api';

const BENEFITS = [
  { icon: Tag,         label: 'Hasta -10%',       sub: 'por combo' },
  { icon: Truck,       label: 'Envíos',            sub: 'a todo el país' },
  { icon: ShieldCheck, label: 'Garantía oficial',  sub: 'hasta 3 años' },
  { icon: Wrench,      label: 'Asesoría técnica',  sub: 'incluida' },
];

const POOL_SIZE_LABEL: Record<string, string> = {
  chica: 'Chica',
  mediana: 'Mediana',
  grande: 'Grande',
};

const GENERIC_ITEMS: Record<string, string[]> = {
  chica:   ['1 luminaria LED RGB', 'Control inalámbrico', 'Cable y accesorios'],
  mediana: ['2 luminarias LED RGB', 'Control inalámbrico', 'Cable y conexiones'],
  grande:  ['4 luminarias LED RGB', 'Transformador',       'Cable y accesorios'],
};

interface LineMeta {
  title: string;
  badge: string;
  description: string;
  badgeClass: string;
}

const LINE_META: Record<string, LineMeta> = {
  osire: {
    title: 'Línea OSIRE',
    badge: 'Premium',
    description: 'Máxima potencia para proyectos de alta exigencia.',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  profesional: {
    title: 'Línea Profesional',
    badge: 'Profesional',
    description: 'Alto rendimiento para piscinas residenciales, con opciones de mayor potencia o formato compacto según el proyecto.',
    badgeClass: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  poolight: {
    title: 'Línea Esencial',
    badge: 'Esencial',
    description: 'Instalación simple para renovar o sumar luz.',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

const LINE_ORDER = ['osire', 'profesional', 'poolight'];

/** Infers the line from the kit name when the `line` field hasn't been set yet. */
function inferLine(kit: Kit): string {
  const n = kit.name.toLowerCase();
  if (n.includes('osire')) return 'osire';
  if (n.includes('horus') || n.includes('nazar')) return 'profesional';
  if (n.includes('poolight')) return 'poolight';
  return '';
}

function KitCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
      <Skeleton className="aspect-[5/4] w-full bg-slate-100" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-2/3 bg-slate-100" />
        <Skeleton className="h-3.5 w-full bg-slate-100" />
        <Skeleton className="h-3.5 w-1/2 bg-slate-100" />
        <Skeleton className="h-8 w-full bg-slate-100 mt-3" />
      </div>
    </div>
  );
}

interface KitCardProps {
  kit: Kit;
  onAdd: (k: Kit) => void;
  productNameById: Map<string, string>;
}

function KitCard({ kit: k, onAdd, productNameById }: KitCardProps) {
  const original = k.original_price ? Number(k.original_price) : 0;
  const price = Number(k.price);
  const discount = original > 0 ? Math.round(((original - price) / original) * 100) : 0;
  const sizeLabel = k.pool_size ? POOL_SIZE_LABEL[k.pool_size] ?? k.pool_size : null;

  let items: string[];
  let extra = 0;
  if (k.product_ids?.length) {
    const named = k.product_ids
      .map((id) => productNameById.get(id))
      .filter((n): n is string => Boolean(n));
    const unique = [...new Set(named)];
    if (unique.length) {
      items = unique.slice(0, 3);
      extra = Math.max(0, unique.length - 3);
    } else {
      items = k.pool_size ? GENERIC_ITEMS[k.pool_size] ?? [] : ['Luminaria LED', 'Control inalámbrico', 'Accesorios'];
    }
  } else {
    items = k.pool_size ? GENERIC_ITEMS[k.pool_size] ?? [] : ['Luminaria LED', 'Control inalámbrico', 'Accesorios'];
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/15 transition-all duration-300 ease-out">
      <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
        {k.image_url ? (
          <img
            src={resolveImageUrl(k.image_url)}
            alt={k.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-slate-400 text-xs">
            Sin imagen
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {sizeLabel && (
          <Badge className="absolute top-3 left-3 gap-1 border-0 bg-white/95 text-primary font-medium shadow-sm backdrop-blur-sm">
            <Package className="h-3 w-3" />
            Piscina {sizeLabel}
          </Badge>
        )}
        {discount > 0 && (
          <Badge className="absolute top-3 right-3 border-0 bg-primary text-primary-foreground font-bold shadow-sm">
            -{discount}%
          </Badge>
        )}
        {k.featured && (
          <Badge className="absolute bottom-3 left-3 border-0 bg-white/95 text-slate-700 text-[10px] font-semibold uppercase tracking-wide shadow-sm">
            <Sparkles className="h-3 w-3 mr-1 text-primary" />
            Más elegido
          </Badge>
        )}
        <Badge className="absolute bottom-3 right-3 border-0 bg-emerald-500 text-white text-[10px] font-semibold shadow-sm gap-1">
          <Truck className="h-3 w-3" />
          Envío gratis
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col p-5 gap-4">
        <div className="space-y-1.5">
          <h3 className="font-display font-semibold text-lg leading-tight text-slate-900 line-clamp-2">
            {k.name}
          </h3>
          {k.description && (
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{k.description}</p>
          )}
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Incluye</p>
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-700">
                <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
            {extra > 0 && (
              <li className="text-[11px] text-slate-500 pl-5">+ {extra} item{extra > 1 ? 's' : ''} más</li>
            )}
          </ul>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              {original > 0 && (
                <span className="text-xs text-slate-400 line-through">{formatPrice(original)}</span>
              )}
              <span className="font-display font-bold text-2xl text-primary leading-none">{formatPrice(price)}</span>
            </div>
            {discount > 0 && (
              <span className="text-[11px] font-semibold text-primary bg-primary/8 rounded-full px-2 py-1">
                Ahorrás {formatPrice(original - price)}
              </span>
            )}
          </div>
          <Button
            onClick={() => onAdd(k)}
            className="w-full bg-primary text-primary-foreground hover:bg-[hsl(var(--brand-hover))] active:bg-[hsl(var(--brand-active))]"
          >
            <Plus className="h-4 w-4" />
            Agregar al carrito
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface KitCarouselProps {
  kits: Kit[];
  onAdd: (k: Kit) => void;
  productNameById: Map<string, string>;
}

function KitCarousel({ kits, onAdd, productNameById }: KitCarouselProps) {
  return (
    <div className="relative">
      <Carousel opts={{ align: 'start', loop: false, dragFree: true }} className="w-full">
        <CarouselContent className="-ml-4">
          {kits.map((k) => (
            <CarouselItem
              key={k.id}
              className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
            >
              <KitCard kit={k} onAdd={onAdd} productNameById={productNameById} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex h-10 w-10 left-0 -translate-x-1/2 bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.14)] disabled:opacity-0 disabled:pointer-events-none transition-all" />
        <CarouselNext    className="hidden md:flex h-10 w-10 right-0 translate-x-1/2  bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.14)] disabled:opacity-0 disabled:pointer-events-none transition-all" />
      </Carousel>
    </div>
  );
}

function sortBySortOrder(arr: Kit[]): Kit[] {
  return [...arr].sort((a, b) => {
    const oa = a.sort_order ?? 0;
    const ob = b.sort_order ?? 0;
    if (oa > 0 && ob > 0) return oa - ob;
    if (oa > 0) return -1;
    if (ob > 0) return 1;
    return Number(b.featured) - Number(a.featured);
  });
}

export function KitsSection() {
  const { data, isLoading } = useKits();
  const kits = useMemo(() => sortBySortOrder(Array.isArray(data) ? data : []), [data]);
  const { data: productsData } = useProducts();
  const products = productsData ?? [];
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const triggerSplash = useCart((s) => s.triggerSplash);

  const productNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.id, p.name);
    return map;
  }, [products]);

  const handleAdd = (k: Kit) => {
    add({ id: k.id, name: k.name, price: Number(k.price), image_url: resolveImageUrl(k.image_url) || null, type: 'kit' });
    triggerSplash();
    toast.success('Kit agregado', { description: k.name });
    setTimeout(() => open(), 650);
  };

  // Group kits by line (uses kit.line field, falls back to name-based inference)
  const groups = useMemo(() => {
    const byLine = new Map<string, Kit[]>();
    for (const k of kits) {
      const line = k.line || inferLine(k) || '';
      if (!byLine.has(line)) byLine.set(line, []);
      byLine.get(line)!.push(k);
    }
    for (const [line, arr] of byLine) {
      byLine.set(line, sortBySortOrder(arr));
    }

    const result: { line: string; kits: Kit[] }[] = [];
    for (const line of LINE_ORDER) {
      if (byLine.has(line) && byLine.get(line)!.length > 0) {
        result.push({ line, kits: byLine.get(line)! });
        byLine.delete(line);
      }
    }
    // any remaining named lines
    for (const [line, arr] of byLine) {
      if (line && arr.length > 0) result.push({ line, kits: arr });
    }
    return result;
  }, [kits]);

  // Kits that couldn't be assigned to any line (no field and name doesn't match)
  const unlinedKits = useMemo(
    () => sortBySortOrder(kits.filter((k) => !k.line && !inferLine(k))),
    [kits],
  );

  const hasLineData = groups.length > 0;

  return (
    <section
      id="kits"
      className="kits-section relative overflow-hidden py-20 md:py-24 bg-[linear-gradient(180deg,#E9EFF5_0%,#F1F5F9_60%,#E9EFF5_100%)]"
    >
      {/* Light cone decorations */}
      <div aria-hidden="true" className="kits-beam kits-beam--1 pointer-events-none absolute" />
      <div aria-hidden="true" className="kits-beam kits-beam--2 pointer-events-none absolute" />
      <div aria-hidden="true" className="kits-beam kits-beam--3 pointer-events-none absolute" />
      <span aria-hidden="true" className="kits-source pointer-events-none absolute left-[16%] top-0" />
      <span aria-hidden="true" className="kits-source pointer-events-none absolute left-1/2 top-0 -translate-x-1/2" />
      <span aria-hidden="true" className="kits-source pointer-events-none absolute right-[16%] top-0" />
      <style>{`
        .kits-beam {
          top: 0; height: 90%; width: 320px;
          background: linear-gradient(180deg, rgba(180,228,255,0.55) 0%, rgba(11,32,60,0.10) 35%, transparent 75%);
          mix-blend-mode: screen; filter: blur(8px);
        }
        .kits-beam--1 { left: 6%;  clip-path: polygon(40% 0%, 60% 0%, 95% 100%, 5% 100%); transform: rotate(-3deg); }
        .kits-beam--2 { left: 50%; transform: translateX(-50%) rotate(2deg); clip-path: polygon(45% 0%, 55% 0%, 80% 100%, 20% 100%); }
        .kits-beam--3 { right: 6%; clip-path: polygon(40% 0%, 60% 0%, 95% 100%, 5% 100%); transform: rotate(4deg); }
        .kits-source {
          width: 10px; height: 10px; border-radius: 9999px;
          background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(11,32,60,0.55) 40%, transparent 75%);
          box-shadow: 0 0 22px hsl(var(--brand) / 0.55), 0 0 6px rgba(255,255,255,0.9);
        }
        .kits-section::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(15,23,42,0.10), transparent);
        }
      `}</style>

      <div className="relative container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Combos</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 text-balance">Kits prearmados</h2>
          <p className="text-muted-foreground mt-3 text-balance">
            Todo lo que necesitás en un solo paquete — instalación más rápida y mejor precio que comprando suelto.
          </p>
        </div>

        {/* Benefits strip */}
        <div className="mx-auto max-w-5xl mb-14 rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm shadow-sm">
          <ul className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/70">
            {BENEFITS.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-center gap-3 px-5 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/10">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-10">
            {[0, 1].map((i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-5">
                  <Skeleton className="h-6 w-28 bg-slate-200 rounded-full" />
                  <Skeleton className="h-7 w-40 bg-slate-200" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, j) => <KitCardSkeleton key={j} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && kits.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/8 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <p className="font-display text-lg font-semibold text-slate-900 mt-4">Próximamente nuevos combos</p>
            <p className="text-sm text-slate-500 mt-1">Estamos preparando paquetes para cada tamaño de piscina.</p>
          </div>
        )}

        {/* ── Grouped by line ───────────────────────────────────────────── */}
        {!isLoading && hasLineData && (
          <div className="space-y-14">
            {groups.map(({ line, kits: lineKits }) => {
              const meta = LINE_META[line];
              return (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                    <div>
                      {meta && (
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.badgeClass} mb-2`}>
                          {meta.badge}
                        </span>
                      )}
                      <h3 className="font-display text-2xl font-bold text-slate-900">
                        {meta ? meta.title : line}
                      </h3>
                      {meta?.description && (
                        <p className="text-sm text-slate-500 mt-1 max-w-lg">{meta.description}</p>
                      )}
                    </div>
                    <Link
                      to={`/tienda?line=${encodeURIComponent(line)}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 whitespace-nowrap shrink-0 transition-colors"
                    >
                      Ver todos
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <KitCarousel kits={lineKits} onAdd={handleAdd} productNameById={productNameById} />
                </motion.div>
              );
            })}

            {/* Kits without a line at the bottom */}
            {unlinedKits.length > 0 && (
              <div>
                <div className="flex items-end justify-between gap-3 mb-6">
                  <h3 className="font-display text-2xl font-bold text-slate-900">Otros kits</h3>
                  <Link to="/tienda?line=all" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 whitespace-nowrap transition-colors">
                    Ver todos <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <KitCarousel kits={unlinedKits} onAdd={handleAdd} productNameById={productNameById} />
              </div>
            )}
          </div>
        )}

        {/* ── Fallback: no line data yet — single carousel ─────────────── */}
        {!isLoading && !hasLineData && kits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <KitCarousel kits={kits} onAdd={handleAdd} productNameById={productNameById} />
          </motion.div>
        )}

        {/* Guide CTA */}
        <div className="mt-14 mx-auto max-w-3xl">
          <a
            href="#guia"
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm px-6 py-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 ease-out"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/10">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display font-semibold text-slate-900 leading-tight">¿No sabés cuál elegir?</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Respondé unas preguntas y te recomendamos el kit ideal para tu piscina.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary whitespace-nowrap">
              Probá la guía
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
