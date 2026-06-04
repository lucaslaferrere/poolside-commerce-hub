import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, BadgeCheck, Wrench } from 'lucide-react';

/**
 * Warranty trust banner — high-contrast deep-navy break before the FAQ.
 * Uses the brand's Azul Profundo surface with a soft brand-blue glow.
 */
export function WarrantySection() {
  return (
    <section
      id="garantia-banner"
      className="relative overflow-hidden py-20 md:py-24 bg-[hsl(var(--surface-dark))] text-white"
    >
      {/* Ambient brand glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,hsl(var(--brand)/0.22),transparent_60%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,hsl(var(--brand)/0.14),transparent_60%)] blur-3xl"
      />
      {/* Engineering grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_30%,transparent_90%)]"
      />

      <div className="relative container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          className="grid gap-10 md:grid-cols-[auto,1fr,auto] md:items-center md:gap-12"
        >
          {/* Icon */}
          <div className="flex justify-center md:justify-start">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-[hsl(var(--brand-on-dark))] ring-1 ring-white/10 backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8" strokeWidth={1.75} />
            </span>
          </div>

          {/* Copy */}
          <div className="text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--brand-on-dark))]">
              Garantía Pooled
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-white mt-2 leading-tight">
              Calidad respaldada,
              <br className="hidden md:block" />
              instalación tranquila.
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed max-w-xl mx-auto md:mx-0">
              Todas nuestras luminarias LED y kits cuentan con garantía oficial,
              componentes certificados IP68 y soporte técnico directo. Comprá con
              la confianza de un producto pensado para durar.
            </p>

            <ul className="mt-6 flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 text-sm text-white/60">
              <li className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-[hsl(var(--brand-on-dark))]" />
                Garantía oficial
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-on-dark))]" />
                Certificación IP68
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-[hsl(var(--brand-on-dark))]" />
                Soporte técnico
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex justify-center md:justify-end">
            <Link
              to="/garantia"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold tracking-wide text-[hsl(var(--brand))] shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-200 ease-out hover:bg-[hsl(var(--brand-50))] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-dark))]"
            >
              Conocé nuestra garantía
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
