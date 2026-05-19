import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, MessageCircle, Sparkles } from 'lucide-react';
import { formatPrice } from '@/types/shop';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';
import { buildWhatsAppLink, BUSINESS_NAME } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { useKits } from '@/hooks/useKits';
import { useProducts } from '@/hooks/useProducts';
import { resolveImageUrl } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 'size' | 'material' | 'uso' | 'form' | 'grande_done' | 'kit_result' | 'no_kit';
type PoolSize = 'chica' | 'mediana' | 'grande';
type PoolMaterial = 'fibra' | 'hormigon' | 'revestida';
type PoolUso = 'residencial' | 'servicio';

interface GrandeForm {
  para_que: string;
  para_que_otro: string;
  zona: string;
  estado: string;
  largo: string;
  ancho: string;
  profundidad: string;
  color: string;
  sectores: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const SIZE_OPTIONS = [
  { value: 'chica' as PoolSize,   label: 'Chica',   desc: 'Hasta 30 m³' },
  { value: 'mediana' as PoolSize, label: 'Mediana', desc: '30 – 60 m³' },
  { value: 'grande' as PoolSize,  label: 'Grande',  desc: 'Más de 60 m³' },
];

const MATERIAL_OPTIONS = [
  { value: 'fibra' as PoolMaterial,     label: 'Fibra de vidrio', desc: 'Piscina prefabricada' },
  { value: 'hormigon' as PoolMaterial,  label: 'Hormigón',       desc: 'Cemento o estructura' },
  { value: 'revestida' as PoolMaterial, label: 'Revestida',      desc: 'Liner / Vinilo / Membrana' },
];

const MATERIAL_LABEL: Record<PoolMaterial, string> = {
  fibra: 'Fibra de vidrio',
  hormigon: 'Hormigón',
  revestida: 'Revestida (Liner/Vinilo)',
};

const USO_OPTIONS = [
  { value: 'residencial', label: 'Residencial', desc: 'Casa de familia' },
  { value: 'servicio',    label: 'Servicio',    desc: 'Club, Hotel, Alquiler' },
];

const PARA_QUE_OPTIONS = [
  { value: 'residencial', label: 'Residencial',  desc: 'Casa de familia' },
  { value: 'comercial',   label: 'Club / Hotel', desc: 'Comercial o deportivo' },
  { value: 'otro',        label: 'Otro',         desc: 'Contanos tu caso' },
];

const ESTADO_OPTIONS = [
  { value: 'proyecto', label: 'En proyecto',    desc: 'La obra todavía no empezó' },
  { value: 'obra',     label: 'En obra',        desc: 'Piscina en construcción' },
  { value: 'hecha',    label: 'Ya construida',  desc: 'Quiero agregar o cambiar las luces' },
];

const COLOR_OPTIONS = [
  { value: 'blanco', label: 'Blanco',     desc: 'Luz blanca cálida o fría' },
  { value: 'rgbw',   label: 'RGBW', desc: 'Colores y efectos de luz' },
];

const STAGE_PROGRESS: Record<Stage, number> = {
  size:        12,
  material:    40,
  uso:         68,
  form:        68,
  grande_done: 100,
  kit_result:  100,
  no_kit:      100,
};

// ─── Option button grid ───────────────────────────────────────────────────────

function OptionGrid({
  options,
  selected,
  onSelect,
  cols = 3,
  compact = false,
}: {
  options: { value: string; label: string; desc: string }[];
  selected?: string;
  onSelect: (v: string) => void;
  cols?: 2 | 3;
  compact?: boolean;
}) {
  return (
    <div className={cn('grid gap-3', cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={cn(
            'rounded-xl border-2 text-left transition-all',
            compact ? 'p-3.5' : 'p-5',
            selected === opt.value
              ? 'border-primary bg-primary/10 shadow-sm'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
          )}
        >
          <div className={cn('font-display font-bold', compact ? 'text-sm' : 'text-base')}>
            {opt.label}
          </div>
          <div className={cn('text-muted-foreground mt-0.5', compact ? 'text-[11px]' : 'text-xs')}>
            {opt.desc}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BuyingWizard() {
  const [stage, setStage] = useState<Stage>('size');
  const [poolSize, setPoolSize] = useState<PoolSize | null>(null);
  const [poolMaterial, setPoolMaterial] = useState<PoolMaterial | null>(null);
  const [poolUso, setPoolUso] = useState<PoolUso | null>(null);
  const [grandeForm, setGrandeForm] = useState<GrandeForm>({
    para_que: '',
    para_que_otro: '',
    zona: '',
    estado: '',
    largo: '',
    ancho: '',
    profundidad: '',
    color: '',
    sectores: '',
  });

  const { data } = useKits();
  const kits = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const { data: productsData } = useProducts();
  const products = useMemo(() => productsData ?? [], [productsData]);

  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const triggerSplash = useCart((s) => s.triggerSplash);

  const productNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.id, p.name);
    return map;
  }, [products]);

  const recommendedKit = useMemo(() => {
    if (!poolSize || poolSize === 'grande') return null;
    return kits.find((k) => {
      if (k.pool_size !== poolSize) return false;
      if (k.materials?.length && poolMaterial && !k.materials.includes(poolMaterial)) return false;
      if (k.uso && k.uso !== 'ambos' && poolUso && k.uso !== poolUso) return false;
      return true;
    }) ?? null;
  }, [kits, poolSize, poolMaterial, poolUso]);

  const kitItems = useMemo(() => {
    if (!recommendedKit?.product_ids?.length) return [];
    const named = recommendedKit.product_ids
      .map((id) => productNameById.get(id))
      .filter((n): n is string => Boolean(n));
    return named;
  }, [recommendedKit, productNameById]);

  const progress = STAGE_PROGRESS[stage];

  // ── Navigation ───────────────────────────────────────────────────────────────

  // All sizes go through material first; divergence happens after material.
  const selectSize = (size: PoolSize) => {
    setPoolSize(size);
    setStage('material');
  };

  const selectMaterial = (mat: PoolMaterial) => {
    setPoolMaterial(mat);
    // Grande → detailed form; Chica/Mediana → uso question
    setStage(poolSize === 'grande' ? 'form' : 'uso');
  };

  const selectUso = (uso: PoolUso) => {
    setPoolUso(uso);
    const kit = kits.find((k) => {
      if (k.pool_size !== poolSize) return false;
      if (k.materials?.length && poolMaterial && !k.materials.includes(poolMaterial)) return false;
      if (k.uso && k.uso !== 'ambos' && k.uso !== uso) return false;
      return true;
    }) ?? null;
    setStage(kit ? 'kit_result' : 'no_kit');
  };

  const goBack = () => {
    if (stage === 'material')   { setPoolMaterial(null); setStage('size'); }
    if (stage === 'uso')        { setPoolUso(null); setStage('material'); }
    if (stage === 'form')       { setStage('material'); }
    if (stage === 'kit_result') { setPoolUso(null); setStage('uso'); }
    if (stage === 'no_kit')     { setPoolUso(null); setStage('uso'); }
  };

  const reset = () => {
    setStage('size');
    setPoolSize(null);
    setPoolMaterial(null);
    setPoolUso(null);
    setGrandeForm({ para_que: '', para_que_otro: '', zona: '', estado: '', largo: '', ancho: '', profundidad: '', color: '', sectores: '' });
  };

  const setField = (field: keyof GrandeForm, value: string) =>
    setGrandeForm((prev) => ({ ...prev, [field]: value }));

  // ── WhatsApp messages ─────────────────────────────────────────────────────────

  const buildGrandeMessage = () => {
    const paraQueLabel = grandeForm.para_que === 'otro' && grandeForm.para_que_otro.trim()
      ? `Otro: ${grandeForm.para_que_otro.trim()}`
      : (PARA_QUE_OPTIONS.find(o => o.value === grandeForm.para_que)?.label ?? grandeForm.para_que);
    const estadoLabel  = ESTADO_OPTIONS.find(o => o.value === grandeForm.estado)?.label ?? grandeForm.estado;
    const colorLabel   = COLOR_OPTIONS.find(o => o.value === grandeForm.color)?.label ?? grandeForm.color;
    const matLabel     = poolMaterial ? MATERIAL_LABEL[poolMaterial] : '';
    const medidas = `${grandeForm.largo}m × ${grandeForm.ancho}m × ${grandeForm.profundidad}m prof.`;
    return (
      `Hola ${BUSINESS_NAME}! Completé la guía de iluminación:\n` +
      `• *Tamaño*: Grande (más de 60 m³)\n` +
      `• *Material*: ${matLabel}\n` +
      `• *Uso*: ${paraQueLabel}\n` +
      `• *Estado*: ${estadoLabel}\n` +
      `• *Medidas*: ${medidas}\n` +
      `• *Zona*: ${grandeForm.zona}\n` +
      `• *Color preferido*: ${colorLabel}\n` +
      (grandeForm.sectores.trim() ? `• *Sectores*: ${grandeForm.sectores.trim()}\n` : '') +
      `¿Me pueden dar un presupuesto personalizado?`
    );
  };

  const buildNoKitMessage = () => {
    const sizeLabel = SIZE_OPTIONS.find(o => o.value === poolSize)?.label ?? '';
    const matLabel  = poolMaterial ? MATERIAL_LABEL[poolMaterial] : '';
    const usoLabel  = USO_OPTIONS.find(o => o.value === poolUso)?.label ?? '';
    return (
      `Hola ${BUSINESS_NAME}! Hice la guía:\n` +
      `• *Tamaño*: ${sizeLabel}\n` +
      `• *Material*: ${matLabel}\n` +
      `• *Uso*: ${usoLabel}\n` +
      `No encontré un kit estándar. ¿Pueden armarme una solución a medida?`
    );
  };

  const buildKitConsultMessage = () => {
    const sizeLabel = SIZE_OPTIONS.find(o => o.value === poolSize)?.label ?? '';
    const matLabel  = poolMaterial ? MATERIAL_LABEL[poolMaterial] : '';
    const usoLabel  = USO_OPTIONS.find(o => o.value === poolUso)?.label ?? '';
    return (
      `Hola ${BUSINESS_NAME}! Hice la guía y me recomendaron el "${recommendedKit?.name}".\n` +
      `• *Tamaño*: ${sizeLabel} · *Material*: ${matLabel} · *Uso*: ${usoLabel}\n` +
      `Quiero más información.`
    );
  };

  // ── Actions ───────────────────────────────────────────────────────────────────

  const formValid =
    !!grandeForm.para_que &&
    (grandeForm.para_que !== 'otro' || grandeForm.para_que_otro.trim().length > 0) &&
    grandeForm.zona.trim().length > 0 &&
    !!grandeForm.estado &&
    grandeForm.largo.trim().length > 0 &&
    grandeForm.ancho.trim().length > 0 &&
    grandeForm.profundidad.trim().length > 0 &&
    !!grandeForm.color;

  const openGrandeWhatsApp = () => {
    window.open(buildWhatsAppLink(buildGrandeMessage()), '_blank', 'noopener,noreferrer');
    setStage('grande_done');
  };

  const addKit = () => {
    if (!recommendedKit) return;
    add({
      id: recommendedKit.id,
      name: recommendedKit.name,
      price: Number(recommendedKit.price),
      image_url: recommendedKit.image_url,
      type: 'kit',
    });
    triggerSplash();
    toast.success('Kit agregado al carrito', { description: recommendedKit.name });
    setTimeout(() => openCart(), 650);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <section
      id="guia"
      className="wizard-section relative overflow-hidden py-20 md:py-24 bg-[hsl(var(--surface-dark))] text-white"
    >
      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,hsl(215_60%_30%/0.5),transparent_60%)] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-32 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,hsl(215_60%_30%/0.35),transparent_60%)] blur-3xl" />

      {/* Water ripples */}
      <div aria-hidden="true" className="wizard-ripples pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="wizard-ripple" style={{ animationDelay: '0s' }} />
        <span className="wizard-ripple" style={{ animationDelay: '2s' }} />
        <span className="wizard-ripple" style={{ animationDelay: '4s' }} />
        <span className="wizard-ripple" style={{ animationDelay: '6s' }} />
      </div>
      <style>{`
        .wizard-ripple {
          position: absolute; left: 0; top: 0;
          width: 0; height: 0;
          border: 1.5px solid hsl(var(--brand-on-dark) / 0.35);
          border-radius: 9999px;
          transform: translate(-50%, -50%);
          animation: wizard-ripple-expand 8s ease-out infinite;
        }
        @keyframes wizard-ripple-expand {
          0%   { width: 0;      height: 0;      opacity: 0;    border-width: 2px; }
          10%  { opacity: 0.55; }
          100% { width: 1400px; height: 1400px; opacity: 0;    border-width: 0.5px; }
        }
        @media (prefers-reduced-motion: reduce) { .wizard-ripple { animation: none; } }
      `}</style>

      <div className="relative container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--brand-on-dark))]">
            Asistente
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 text-balance text-white">
            ¿Qué necesitás para tu piscina?
          </h2>
          <p className="text-white/70 mt-3 text-balance">
            Respondé algunas preguntas y te orientamos hacia la mejor solución.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto p-6 md:p-10 shadow-deep">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full gradient-aqua rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── SIZE ─────────────────────────────────────────────────────────── */}
            {stage === 'size' && (
              <motion.div
                key="size"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
                  ¿De qué tamaño es tu piscina?
                </h3>
                <OptionGrid options={SIZE_OPTIONS} onSelect={(v) => selectSize(v as PoolSize)} />
              </motion.div>
            )}

            {/* ── MATERIAL (grande path) ────────────────────────────────────────── */}
            {stage === 'material' && (
              <motion.div
                key="material"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
                  ¿De qué material es la piscina?
                </h3>
                <OptionGrid
                  options={MATERIAL_OPTIONS}
                  selected={poolMaterial ?? undefined}
                  onSelect={(v) => selectMaterial(v as PoolMaterial)}
                />
                <Button variant="ghost" onClick={goBack} className="mt-6 text-sm">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
              </motion.div>
            )}

            {/* ── USO (chica/mediana path) ─────────────────────────────────────── */}
            {stage === 'uso' && (
              <motion.div
                key="uso"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
                  ¿Cuál es el uso de la piscina?
                </h3>
                <OptionGrid
                  options={USO_OPTIONS}
                  selected={poolUso ?? undefined}
                  onSelect={(v) => selectUso(v as PoolUso)}
                  cols={2}
                />
                <Button variant="ghost" onClick={goBack} className="mt-6 text-sm">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
              </motion.div>
            )}

            {/* ── FORM (grande path) ────────────────────────────────────────────── */}
            {stage === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-1">
                  Contanos un poco más
                </h3>
                <p className="text-center text-muted-foreground text-sm mb-7">
                  Así podemos armarte el presupuesto ideal para tu piscina grande.
                </p>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold mb-2.5">¿Para qué es la piscina?</p>
                    <OptionGrid
                      options={PARA_QUE_OPTIONS}
                      selected={grandeForm.para_que}
                      onSelect={(v) => setField('para_que', v)}
                      compact
                    />
                    {grandeForm.para_que === 'otro' && (
                      <input
                        type="text"
                        placeholder="Contanos para qué necesitás la iluminación..."
                        value={grandeForm.para_que_otro}
                        onChange={(e) => setField('para_que_otro', e.target.value)}
                        className="mt-3 w-full rounded-xl border-2 border-border bg-muted/40 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        autoFocus
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2.5">
                      Zona / Ubicación
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Buenos Aires, Córdoba, Mendoza..."
                      value={grandeForm.zona}
                      onChange={(e) => setField('zona', e.target.value)}
                      className="w-full rounded-xl border-2 border-border bg-muted/40 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2.5">¿En qué estado está la piscina?</p>
                    <OptionGrid
                      options={ESTADO_OPTIONS}
                      selected={grandeForm.estado}
                      onSelect={(v) => setField('estado', v)}
                      compact
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2.5">
                      Medidas de la piscina <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { field: 'largo',      label: 'Largo (m)',       placeholder: 'Ej: 8' },
                          { field: 'ancho',      label: 'Ancho (m)',       placeholder: 'Ej: 4' },
                          { field: 'profundidad', label: 'Profundidad (m)', placeholder: 'Ej: 1.5' },
                        ] as const
                      ).map(({ field, label, placeholder }) => (
                        <div key={field}>
                          <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder={placeholder}
                            value={grandeForm[field]}
                            onChange={(e) => setField(field, e.target.value)}
                            className="w-full rounded-xl border-2 border-border bg-muted/40 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2.5">Color de preferencia</p>
                    <OptionGrid
                      options={COLOR_OPTIONS}
                      selected={grandeForm.color}
                      onSelect={(v) => setField('color', v)}
                      cols={2}
                      compact
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2.5">
                      Diseño y sectores específicos{' '}
                      <span className="text-muted-foreground font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: hidromasajes, playa húmeda, escalones..."
                      value={grandeForm.sectores}
                      onChange={(e) => setField('sectores', e.target.value)}
                      className="w-full rounded-xl border-2 border-border bg-muted/40 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Button variant="ghost" onClick={goBack} className="text-sm shrink-0">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Anterior
                  </Button>
                  <Button
                    size="lg"
                    disabled={!formValid}
                    className="flex-1 gradient-aqua text-primary-foreground"
                    onClick={openGrandeWhatsApp}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Consultar por WhatsApp
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── GRANDE DONE ───────────────────────────────────────────────────── */}
            {stage === 'grande_done' && (
              <motion.div
                key="grande_done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-4 py-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <MessageCircle className="h-3 w-3" /> Consulta lista
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold">
                  ¡Te esperamos en WhatsApp!
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  Si el chat no abrió automáticamente, usá el botón de abajo.
                </p>
                <Button
                  size="lg"
                  className="gradient-aqua text-primary-foreground"
                  onClick={() =>
                    window.open(buildWhatsAppLink(buildGrandeMessage()), '_blank', 'noopener,noreferrer')
                  }
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Abrir WhatsApp
                </Button>
                <div>
                  <Button variant="ghost" onClick={reset} className="text-xs mt-2">
                    Volver a empezar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── KIT RESULT (chica / mediana) ──────────────────────────────────── */}
            {stage === 'kit_result' && recommendedKit && (
              <motion.div
                key="kit_result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                  <Sparkles className="h-3 w-3" /> Recomendación lista
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-1">
                  {recommendedKit.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Recomendado para piscinas {SIZE_OPTIONS.find(o => o.value === poolSize)?.label.toLowerCase()}.
                </p>
                {recommendedKit.description && (
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm">
                    {recommendedKit.description}
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-6 items-center max-w-2xl mx-auto bg-muted/40 rounded-xl p-5 mb-8">
                  {recommendedKit.image_url && (
                    <img
                      src={resolveImageUrl(recommendedKit.image_url)}
                      alt={recommendedKit.name}
                      loading="lazy"
                      className="rounded-lg aspect-square object-cover w-full"
                    />
                  )}
                  <div className="text-left space-y-3">
                    <div>
                      {recommendedKit.original_price && (
                        <span className="text-sm text-muted-foreground line-through mr-2">
                          {formatPrice(Number(recommendedKit.original_price))}
                        </span>
                      )}
                      <span className="font-display font-bold text-3xl text-primary block">
                        {formatPrice(Number(recommendedKit.price))}
                      </span>
                    </div>
                    {kitItems.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {kitItems.slice(0, 4).map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={addKit} className="gradient-aqua text-primary-foreground">
                    Agregar al carrito
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a
                      href={buildWhatsAppLink(buildKitConsultMessage())}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" /> Consultar
                    </a>
                  </Button>
                </div>

                <div className="mt-5 flex justify-center gap-4">
                  <Button variant="ghost" onClick={goBack} className="text-xs">
                    <ArrowLeft className="h-3 w-3 mr-1" /> Atrás
                  </Button>
                  <Button variant="ghost" onClick={reset} className="text-xs">
                    Volver a empezar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── NO KIT (sin match en catálogo) ────────────────────────────────── */}
            {stage === 'no_kit' && (
              <motion.div
                key="no_kit"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-4 py-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  <MessageCircle className="h-3 w-3" /> Solución personalizada
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold">
                  Te ayudamos a elegir
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  No tenemos un kit estándar para ese tamaño, pero podemos armarte una solución a medida.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="gradient-aqua text-primary-foreground"
                >
                  <a
                    href={buildWhatsAppLink(buildNoKitMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> Consultar por WhatsApp
                  </a>
                </Button>
                <div className="flex justify-center gap-4">
                  <Button variant="ghost" onClick={goBack} className="text-xs">
                    <ArrowLeft className="h-3 w-3 mr-1" /> Atrás
                  </Button>
                  <Button variant="ghost" onClick={reset} className="text-xs">
                    Volver a empezar
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
}
