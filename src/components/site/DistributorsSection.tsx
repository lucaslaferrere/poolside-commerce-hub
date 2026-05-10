import { useState } from 'react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Handshake,
  Send,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Truck,
  Tag,
} from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const schema = z.object({
  full_name: z.string().trim().min(2, 'Nombre muy corto').max(200),
  company:   z.string().trim().min(2, 'Empresa requerida').max(200),
  city:      z.string().trim().min(2, 'Ciudad requerida').max(100),
  phone:     z.string().trim().min(6, 'Teléfono inválido').max(30),
  email:     z.string().trim().email('Email inválido').max(255),
  message:   z.string().trim().max(2000).optional().or(z.literal('')),
});

type Form = z.infer<typeof schema>;

const BENEFITS: { icon: typeof Tag; title: string; desc: string }[] = [
  { icon: Tag,           title: 'Hasta 35% de descuento',  desc: 'En toda la línea de productos.' },
  { icon: GraduationCap, title: 'Capacitaciones técnicas', desc: 'Workshops y certificaciones LED.' },
  { icon: Sparkles,      title: 'Material POP',            desc: 'Catálogos, displays y muestras incluidas.' },
  { icon: Truck,         title: 'Entregas prioritarias',   desc: 'Despachos 24/48 hs a todo el país.' },
];

export function DistributorsSection() {
  const [form, setForm] = useState<Form>({
    full_name: '', company: '', city: '', phone: '', email: '', message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const upd =
    (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof Form, string>> = {};
      parsed.error.issues.forEach((iss) => {
        const key = iss.path[0] as keyof Form;
        errs[key] = iss.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await apiPost('/distributor-leads', {
        full_name: parsed.data.full_name,
        company:   parsed.data.company,
        city:      parsed.data.city,
        phone:     parsed.data.phone,
        email:     parsed.data.email,
        message:   parsed.data.message || undefined,
      });
      setSuccess(true);
      toast.success('¡Recibido!', { description: 'Te contactamos en menos de 24 hs.' });
      setForm({ full_name: '', company: '', city: '', phone: '', email: '', message: '' });
    } catch (err) {
      toast.error('No pudimos enviar el formulario', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="distribuidores"
      className="distributors relative overflow-hidden py-20 md:py-28 bg-neutral-50"
    >
      {/* Unified ambient background — pool-light radials + dot pattern */}
      <div className="distributors__dots absolute inset-0" aria-hidden="true" />
      <div className="distributors__glow-tr absolute" aria-hidden="true" />
      <div className="distributors__glow-bl absolute" aria-hidden="true" />

      <div className="relative container max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          className="distributors__panel relative overflow-hidden rounded-2xl"
        >
          <div className="grid lg:grid-cols-[5fr_6fr]">
            {/* ── Copy column ─────────────────────────────────────────── */}
            <div className="p-8 md:p-10 lg:p-12 lg:pr-10 lg:border-r lg:border-neutral-200/60">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-brand/15 bg-brand/5 text-[11px] font-medium uppercase tracking-[0.16em] text-brand">
                <Handshake className="h-3 w-3" />
                Programa B2B
              </div>

              <h2 className="font-display text-3xl md:text-4xl font-semibold leading-[1.1] tracking-tight text-neutral-900 mt-5">
                ¿Sos instalador
                <br className="hidden sm:block" />{' '}
                o tenés tienda?
              </h2>

              <p className="mt-4 text-neutral-600 text-base leading-relaxed max-w-md">
                Sumate a nuestra red de distribuidores y obtené precios mayoristas,
                soporte técnico y entregas prioritarias.
              </p>

              <ul className="mt-8 space-y-4">
                {BENEFITS.map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex gap-3">
                    <span className="grid place-items-center h-8 w-8 shrink-0 rounded-md bg-brand/10 text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 leading-snug">{title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Form column ─────────────────────────────────────────── */}
            <div className="p-8 md:p-10 lg:p-12 lg:pl-10 bg-white/20">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <span className="grid place-items-center h-14 w-14 rounded-full bg-success/10 text-success">
                    <CheckCircle2 className="h-7 w-7" />
                  </span>
                  <h3 className="font-display text-xl font-semibold text-neutral-900 mt-4">
                    ¡Gracias!
                  </h3>
                  <p className="text-sm text-neutral-500 mt-2 max-w-xs">
                    Recibimos tus datos. Te contactamos en menos de 24 hs.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-sm font-medium text-brand hover:text-brand-hover transition-colors"
                  >
                    Enviar otra solicitud
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-3.5">
                  <div className="mb-5">
                    <h3 className="font-display text-lg font-semibold text-neutral-900">
                      Solicitar acceso
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Te respondemos en menos de 24 hs.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <FloatingField
                      id="full_name" label="Nombre completo"
                      value={form.full_name} onChange={upd('full_name')}
                      error={errors.full_name}
                    />
                    <FloatingField
                      id="company" label="Empresa"
                      value={form.company} onChange={upd('company')}
                      error={errors.company}
                    />
                    <FloatingField
                      id="city" label="Ciudad"
                      value={form.city} onChange={upd('city')}
                      error={errors.city}
                    />
                    <FloatingField
                      id="phone" type="tel" label="Teléfono"
                      value={form.phone} onChange={upd('phone')}
                      error={errors.phone}
                    />
                  </div>

                  <FloatingField
                    id="email" type="email" label="Email"
                    value={form.email} onChange={upd('email')}
                    error={errors.email}
                  />

                  <FloatingField
                    id="message" label="Contanos sobre tu negocio (opcional)"
                    value={form.message ?? ''} onChange={upd('message')}
                    error={errors.message} as="textarea"
                  />

                  <button type="submit" disabled={loading} className="distributors__cta">
                    <Send className="h-4 w-4" />
                    {loading ? 'Enviando…' : 'Enviar solicitud'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{styles}</style>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Floating-label field — CSS-only using `:placeholder-shown`. Same
   component handles <input> and <textarea> via `as="textarea"`.
   ──────────────────────────────────────────────────────────────────────── */

interface FloatingFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  error?: string;
  as?: 'input' | 'textarea';
}

function FloatingField({
  id, label, value, onChange, type = 'text', error, as = 'input',
}: FloatingFieldProps) {
  const fieldCls = cn(
    'peer w-full px-3.5 pt-5 pb-1.5 text-sm text-neutral-900 placeholder-transparent',
    'bg-white/70 border border-neutral-200 rounded-lg outline-none',
    'transition-all duration-200',
    'hover:border-neutral-300',
    'focus:bg-white focus:border-brand focus:shadow-[0_0_0_3px_hsl(var(--brand)/0.18)]',
    error &&
      'border-danger focus:border-danger focus:shadow-[0_0_0_3px_hsl(var(--danger)/0.18)]',
  );

  const labelCls = cn(
    'absolute left-3.5 text-neutral-500 text-sm pointer-events-none origin-left',
    'transition-all duration-200',
    // resting (placeholder visible = empty)
    'top-3.5',
    'peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-neutral-500',
    // floating (focused OR filled)
    'peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-brand',
    'peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:text-neutral-700',
    error &&
      'peer-focus:text-danger peer-[:not(:placeholder-shown)]:text-danger',
  );

  return (
    <div className="relative">
      {as === 'textarea' ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={cn(fieldCls, 'resize-none pt-6 leading-relaxed')}
          aria-invalid={!!error}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder=" "
          className={fieldCls}
          aria-invalid={!!error}
          autoComplete={autoCompleteFor(id)}
        />
      )}
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {error && (
        <p className="text-xs text-danger mt-1 ml-1">{error}</p>
      )}
    </div>
  );
}

function autoCompleteFor(id: string): string | undefined {
  switch (id) {
    case 'full_name': return 'name';
    case 'email':     return 'email';
    case 'phone':     return 'tel';
    case 'city':      return 'address-level2';
    case 'company':   return 'organization';
    default:          return undefined;
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Scoped styles — glass panel, ambient background, CTA glow.
   ──────────────────────────────────────────────────────────────────────── */
const styles = `
.distributors__dots {
  background-image: radial-gradient(circle at 1px 1px, rgba(2, 8, 23, 0.06) 1px, transparent 0);
  background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, #000 30%, transparent 100%);
          mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, #000 30%, transparent 100%);
  pointer-events: none;
}

.distributors__glow-tr {
  top: -180px;
  right: -180px;
  width: 560px;
  height: 560px;
  background: radial-gradient(circle, hsl(var(--brand) / 0.18), transparent 60%);
  filter: blur(40px);
  pointer-events: none;
}

.distributors__glow-bl {
  bottom: -240px;
  left: -240px;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, hsl(var(--brand) / 0.10), transparent 60%);
  filter: blur(50px);
  pointer-events: none;
}

/* The single glass panel — soft white wash + saturated backdrop blur,
   hairline border, layered shadow for depth, top highlight for the
   "light reflecting off glass" cue. */
.distributors__panel {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(22px) saturate(140%);
  -webkit-backdrop-filter: blur(22px) saturate(140%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(15, 23, 42, 0.04),
    0 30px 60px -20px rgba(15, 23, 42, 0.18),
    0 12px 24px -12px rgba(15, 23, 42, 0.10);
}
.distributors__panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), transparent 22%);
  mix-blend-mode: overlay;
}

/* CTA — flat brand fill, polished hover with branded glow + lift */
.distributors__cta {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.875rem;
  margin-top: 0.75rem;
  padding: 0 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #FFFFFF;
  background: hsl(var(--brand));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 1px 2px rgba(0, 0, 0, 0.18);
  transition:
    background 200ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 220ms cubic-bezier(0.2, 0, 0, 1),
    transform  200ms cubic-bezier(0.2, 0, 0, 1),
    filter     200ms cubic-bezier(0.2, 0, 0, 1);
}
.distributors__cta:hover:not(:disabled) {
  background: hsl(var(--brand-hover));
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 8px 24px hsl(var(--brand) / 0.40),
    0 0 36px  hsl(var(--brand) / 0.20);
}
.distributors__cta:active:not(:disabled) {
  background: hsl(var(--brand-active));
  transform: translateY(0);
  filter: brightness(0.98);
}
.distributors__cta:focus-visible {
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 0 0 3px hsl(var(--brand) / 0.30),
    0 6px 18px hsl(var(--brand) / 0.25);
}
.distributors__cta:disabled {
  opacity: 0.62;
  cursor: not-allowed;
}
`;
