import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flame, Sparkles, Tag, Truck, ShieldCheck, X } from 'lucide-react';
import rgbImg  from '@/assets/product-rgb-light.jpg';
import kitImg  from '@/assets/product-kit.jpg';
import ledImg  from '@/assets/product-led-spot.jpg';
import ctrlImg from '@/assets/product-controller.jpg';

/**
 * High-visibility Hot Sale popup. Fires ~600ms after first paint on EVERY
 * page refresh — there is no persistence by design. State only lives in
 * memory; navigating via React Router preserves the dismissed state for the
 * session, but a hard refresh always reopens it.
 */
export function HotSaleBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const dismiss = () => setOpen(false);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center px-4 py-6 sm:py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="hotsale-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Cerrar promoción"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-default"
          />

          {/* Card — wide split layout */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl shadow-[0_30px_80px_-20px_rgba(220,38,38,0.55)] ring-1 ring-white/10 max-h-[90vh] flex flex-col"
          >
            {/* Close */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar"
              className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 backdrop-blur-md"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
              {/* ─── LEFT · copy & CTA ──────────────────────────────────── */}
              <div className="relative bg-[linear-gradient(135deg,#b91c1c_0%,#dc2626_25%,#f97316_65%,#f59e0b_100%)] px-7 py-10 sm:px-12 sm:py-14 text-white flex flex-col justify-center overflow-hidden min-h-[360px]">
                {/* Decorative glows */}
                <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-12 h-64 w-64 rounded-full bg-yellow-200/30 blur-3xl" />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,#000_30%,transparent_95%)]"
                />

                <div className="relative">
                  {/* Pill */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/40 text-[11px] font-bold uppercase tracking-[0.2em]"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      className="inline-flex"
                    >
                      <Flame className="h-3 w-3" />
                    </motion.span>
                    Por tiempo limitado
                  </motion.div>

                  {/* Headline */}
                  <motion.h2
                    id="hotsale-title"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.5 }}
                    className="font-display font-black tracking-tight mt-5 leading-[0.92]"
                  >
                    <span className="block text-[3.5rem] sm:text-[4.5rem] drop-shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                      ¡HOT SALE!
                    </span>
                    <span className="block text-2xl sm:text-3xl font-bold mt-3 opacity-95">
                      en <span className="underline decoration-wavy decoration-yellow-200/70 underline-offset-[6px]">Pooled</span>
                    </span>
                  </motion.h2>

                  {/* Copy */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.38, duration: 0.5 }}
                    className="mt-6 text-base sm:text-lg leading-relaxed text-white/95 max-w-md"
                  >
                    Aprovechá los descuentos en productos seleccionados.
                  </motion.p>

                  {/* Mini benefits */}
                  <motion.ul
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.45 }}
                    className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/90"
                  >
                    <li className="inline-flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Hasta -50% OFF
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      Envío gratis +$150K
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Garantía oficial
                    </li>
                  </motion.ul>

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.4 }}
                    className="mt-8 flex flex-wrap items-center gap-3"
                  >
                    <Link
                      to="/tienda"
                      onClick={dismiss}
                      className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-red-600 shadow-xl hover:shadow-[0_20px_40px_-12px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Sparkles className="h-4 w-4" />
                      Ver ofertas
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={dismiss}
                      className="inline-flex h-12 items-center px-4 text-sm font-medium text-white/85 hover:text-white transition-colors"
                    >
                      Quizás luego
                    </button>
                  </motion.div>
                </div>
              </div>

              {/* ─── RIGHT · product image collage ──────────────────────── */}
              <div className="relative bg-[radial-gradient(circle_at_50%_30%,#1f2937_0%,#0f172a_70%)] p-5 sm:p-7 flex items-center justify-center overflow-hidden min-h-[300px]">
                {/* Ambient glows */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(220,38,38,0.30),transparent_70%)]" />
                <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-orange-500/25 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-red-500/20 blur-3xl" />

                <div className="relative grid grid-cols-2 gap-3 w-full max-w-[320px]">
                  {[
                    { img: rgbImg,  label: 'Luminaria RGB', discount: 35, delay: 0.30, rotate: -2.5 },
                    { img: ledImg,  label: 'LED Spot',      discount: 25, delay: 0.40, rotate:  2   },
                    { img: kitImg,  label: 'Kit completo',  discount: 50, delay: 0.50, rotate:  1.5 },
                    { img: ctrlImg, label: 'Controlador',   discount: 20, delay: 0.60, rotate: -2   },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.82, y: 26, rotate: item.rotate * 2 }}
                      animate={{ opacity: 1, scale: 1, y: 0, rotate: item.rotate }}
                      transition={{ delay: item.delay, duration: 0.55, ease: [0.2, 0, 0, 1] }}
                      whileHover={{ rotate: 0, scale: 1.04, zIndex: 5 }}
                      className="relative aspect-square rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]"
                    >
                      <img
                        src={item.img}
                        alt={item.label}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                      {/* Floating discount tag */}
                      <motion.span
                        initial={{ scale: 0, rotate: -25 }}
                        animate={{ scale: 1, rotate: -10 }}
                        transition={{ delay: item.delay + 0.18, type: 'spring', damping: 12, stiffness: 240 }}
                        className="absolute -top-1.5 -right-1.5 inline-flex items-center gap-0.5 rounded-lg bg-red-500 px-2 py-1 text-[11px] font-black text-white shadow-lg ring-2 ring-white/90 tracking-tight"
                      >
                        -{item.discount}%
                      </motion.span>

                      {/* Label */}
                      <span className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold uppercase tracking-wide text-white/95 drop-shadow-md truncate">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>


              </div>
            </div>

            {/* Marquee strip — bold ticker of benefits */}
            <div className="bg-black text-white py-3 px-6 flex items-center justify-center gap-x-6 gap-y-1 flex-wrap text-[11px] font-bold uppercase tracking-[0.18em]">
              <span className="inline-flex items-center gap-1.5 text-yellow-300">
                <Flame className="h-3 w-3" />
                Hasta -50%
              </span>
              <span className="opacity-30">●</span>
              <span className="opacity-95">Envío gratis +$150K</span>
              <span className="opacity-30 hidden sm:inline">●</span>
              <span className="opacity-95 hidden sm:inline">Garantía oficial</span>
              <span className="opacity-30 hidden md:inline">●</span>
              <span className="opacity-95 hidden md:inline">Pago en cuotas</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
