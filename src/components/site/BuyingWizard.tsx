import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { formatPrice } from '@/types/shop';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';
import { buildWhatsAppLink, BUSINESS_NAME } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { useKits } from '@/hooks/useKits';
import { apiPost } from '@/lib/api';

type Answers = {
  pool_size?: 'chica' | 'mediana' | 'grande';
  pool_type?: 'fibra' | 'hormigon' | 'revestida';
  usage_type?: 'residencial' | 'comercial';
  control_type?: 'manual' | 'remoto' | 'app';
};

const STEPS = [
  {
    key: 'pool_size' as const,
    title: '¿De qué tamaño es tu pileta?',
    options: [
      { value: 'chica', label: 'Chica', desc: 'Hasta 30 m³' },
      { value: 'mediana', label: 'Mediana', desc: '30 - 60 m³' },
      { value: 'grande', label: 'Grande', desc: 'Más de 60 m³' },
    ],
  },
  {
    key: 'pool_type' as const,
    title: '¿De qué material es?',
    options: [
      { value: 'fibra', label: 'Fibra', desc: 'Pileta de fibra de vidrio' },
      { value: 'hormigon', label: 'Hormigón', desc: 'Pileta de hormigón / cemento' },
      { value: 'revestida', label: 'Revestida', desc: 'Vinilo, liner o membrana' },
    ],
  },
  {
    key: 'usage_type' as const,
    title: '¿Cuál es el uso principal?',
    options: [
      { value: 'residencial', label: 'Residencial', desc: 'Casa de familia' },
      { value: 'comercial', label: 'Comercial', desc: 'Hotel, club, alquiler' },
    ],
  },
  {
    key: 'control_type' as const,
    title: '¿Cómo querés controlarla?',
    options: [
      { value: 'manual', label: 'Manual', desc: 'Encendido por llave' },
      { value: 'remoto', label: 'Control remoto', desc: 'RF inalámbrico' },
      { value: 'app', label: 'App / Smart', desc: 'Desde el celular' },
    ],
  },
];

export function BuyingWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const { data } = useKits();
  const kits = Array.isArray(data) ? data : [];
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const triggerSplash = useCart((s) => s.triggerSplash);

  const current = STEPS[step];
  const progress = ((step + (done ? 1 : 0)) / STEPS.length) * 100;

  const recommended = (() => {
    if (!answers.pool_size || kits.length === 0) return null;
    return kits.find((k) => k.pool_size === answers.pool_size) || kits[0];
  })();

  const select = (value: string) => {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
      // Fire-and-forget analytics — errors are intentionally ignored
      apiPost('/wizard-recommendations', {
        pool_size: next.pool_size,
        pool_type: next.pool_type,
        usage_type: next.usage_type,
        control_type: next.control_type,
        recommended_kit_id: recommended?.id,
      }).catch(() => {});
    }
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
  };

  const addKit = () => {
    if (!recommended) return;
    add({
      id: recommended.id,
      name: recommended.name,
      price: Number(recommended.price),
      image_url: recommended.image_url,
      type: 'kit',
    });
    triggerSplash();
    toast.success('Kit agregado al carrito', { description: recommended.name });
    setTimeout(() => openCart(), 650);
  };

  return (
    <section id="guia" className="py-16 md:py-24 gradient-light">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Asistente</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 text-balance">
            ¿Qué necesitás para tu pileta?
          </h2>
          <p className="text-muted-foreground mt-3 text-balance">
            Respondé 4 preguntas simples y te recomendamos el kit perfecto.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto p-6 md:p-10 shadow-deep">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Paso {Math.min(step + 1, STEPS.length)} de {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full gradient-aqua" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
                  {current.title}
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {current.options.map((opt) => {
                    const selected = answers[current.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => select(opt.value)}
                        className={cn(
                          'p-5 rounded-xl border-2 text-left transition-all',
                          selected
                            ? 'border-secondary bg-secondary/10 shadow-aqua'
                            : 'border-border hover:border-secondary/50 hover:bg-muted/50'
                        )}
                      >
                        <div className="font-display font-bold text-lg">{opt.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {step > 0 && (
                  <Button variant="ghost" onClick={() => setStep(step - 1)} className="mt-6">
                    <ArrowLeft className="h-4 w-4" /> Anterior
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold mb-3">
                  <Sparkles className="h-3 w-3" /> Recomendación lista
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                  Tu kit ideal: {recommended?.name}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{recommended?.description}</p>

                {recommended && (
                  <div className="grid sm:grid-cols-2 gap-6 items-center max-w-2xl mx-auto bg-muted/40 rounded-xl p-5">
                    {recommended.image_url && (
                      <img src={recommended.image_url} alt={recommended.name} loading="lazy" className="rounded-lg aspect-square object-cover w-full" />
                    )}
                    <div className="text-left space-y-3">
                      <div>
                        {recommended.original_price && (
                          <span className="text-sm text-muted-foreground line-through mr-2">
                            {formatPrice(Number(recommended.original_price))}
                          </span>
                        )}
                        <span className="font-display font-bold text-3xl text-primary block">
                          {formatPrice(Number(recommended.price))}
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Envío a todo el país</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Garantía oficial</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Asesoría incluida</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={addKit} className="gradient-aqua text-primary-foreground">
                    Agregar kit al carrito <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a
                      href={buildWhatsAppLink(`Hola ${BUSINESS_NAME}! Hice la guía y me recomendaron el "${recommended?.name}". Quiero más info.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" /> Consultar
                    </a>
                  </Button>
                </div>

                <Button variant="ghost" onClick={reset} className="mt-4 text-xs">
                  Volver a empezar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
}
