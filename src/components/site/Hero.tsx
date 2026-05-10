import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Pooled · Hero Multi-Luminaire
 * Cinematic dark mode representing an array of premium pool lights.
 * Features structural clip-path beams with an enhanced deep-water ambient background.
 */

type Particle = { x: number; drift: number; duration: number; delay: number; size: number };

const PARTICLES: Particle[] = [
  { x: 20, drift: -15, duration: 12, delay: -2.0,  size: 2.0 },
  { x: 35, drift:  10, duration: 14, delay: -8.5,  size: 1.5 },
  { x: 50, drift:  -8, duration: 10, delay: -1.0,  size: 2.5 },
  { x: 65, drift:  18, duration: 13, delay: -11.0, size: 1.0 },
  { x: 80, drift: -12, duration: 16, delay: -4.5,  size: 1.5 },
  { x: 25, drift:   8, duration: 11, delay: -7.0,  size: 2.0 },
  { x: 45, drift:  -5, duration:  9, delay: -3.0,  size: 1.0 },
  { x: 75, drift:  14, duration: 12, delay: -6.0,  size: 1.5 },
  { x: 15, drift: -10, duration: 13, delay: -9.0,  size: 2.0 },
  { x: 55, drift:  20, duration: 15, delay: -2.5,  size: 1.0 },
  { x: 85, drift: -18, duration: 11, delay: -5.5,  size: 2.5 },
  { x: 40, drift:   5, duration: 10, delay: -8.0,  size: 1.5 },
  { x: 60, drift:  15, duration: 14, delay: -1.5,  size: 1.5 },
  { x: 30, drift: -12, duration: 12, delay: -10.0, size: 1.0 },
];

export function Hero() {
  return (
      <section
          id="inicio"
          className="pooled-hero relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-[#010810] text-white"
      >
        {/* Deep aquatic background base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#001226] via-[#011830] to-[#01060B]" />

        {/* Ambient water volume (Simulates deep water movement) */}
        <div className="pooled-hero__water-ambient absolute inset-0" aria-hidden="true" />

        {/* Engineering grid — subtle aquatic tint */}
        <div className="pooled-hero__grid absolute inset-0" aria-hidden="true" />

        {/* Edge vignette to push the eye toward center */}
        <div className="pooled-hero__vignette absolute inset-0" aria-hidden="true" />

        {/* --- MULTIPLE LIGHT SOURCES (Luminarias) --- */}
        {/* Left Luminaire */}
        <div className="pooled-hero__halo absolute left-[20%] top-0 -translate-x-1/2 -translate-y-1/2" />
        <div className="pooled-hero__beam pooled-hero__beam--left absolute inset-0" />

        {/* Center Luminaire */}
        <div className="pooled-hero__halo absolute left-[50%] top-0 -translate-x-1/2 -translate-y-1/2" />
        <div className="pooled-hero__beam pooled-hero__beam--center absolute inset-0" />

        {/* Right Luminaire */}
        <div className="pooled-hero__halo absolute left-[80%] top-0 -translate-x-1/2 -translate-y-1/2" />
        <div className="pooled-hero__beam pooled-hero__beam--right absolute inset-0" />

        {/* Particles (Micro-bubbles) rising inside the water */}
        <div className="pooled-hero__particles absolute inset-0" aria-hidden="true">
          {PARTICLES.map((p, i) => (
              <span
                  key={i}
                  className="pooled-hero__particle"
                  style={{
                    left: `${p.x}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                    ['--drift' as never]: `${p.drift}px`,
                  }}
              />
          ))}
        </div>

        {/* Hairline horizon at bottom for technical/precise feel */}
        <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00A3D6]/25 to-transparent"
            aria-hidden="true"
        />

        {/* --- CONTENT --- */}
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
          <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
              className="w-full flex flex-col items-center"
          >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00A3D6]/20 bg-[#005C8A]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#E0F2FE] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00A3D6] shadow-[0_0_10px_rgba(0,163,214,0.85)]" />
            Iluminación LED de precisión
          </span>

            <h1 className="pooled-hero__headline mt-7 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              La luz precisa
              <br />
              <span className="text-[#B5D8F0]">para tu pileta.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#94B8D1] sm:text-lg">
              Luminarias LED, controladores inteligentes y kits completos.
              Diseñados para ingenieros, instaladores y dueños exigentes.
            </p>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.2, 0, 0, 1] }}
                className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <a href="#tienda" className="pooled-hero__cta">
                Explorar Luminarias
                <ArrowRight className="h-4 w-4" />
              </a>

              <a href="#asesoria" className="pooled-hero__cta-ghost">
                Asesoría técnica
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#00A3D6]/60"
        >
          <span>Descubrí más</span>
          <span className="h-6 w-px bg-[#00A3D6]/40" />
        </motion.div>

        <style>{styles}</style>
      </section>
  );
}

/* ---------- STYLES ---------- */
const styles = `
.pooled-hero { isolation: isolate; }

/* Dynamic Ambient Water Background */
.pooled-hero__water-ambient {
  background:
    radial-gradient(circle at 30% 60%, rgba(0, 163, 214, 0.06) 0%, transparent 45%),
    radial-gradient(circle at 75% 40%, rgba(0, 92, 138, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 90%, rgba(0, 200, 255, 0.04) 0%, transparent 40%);
  filter: blur(40px);
  animation: pooled-water-ambient-shift 12s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes pooled-water-ambient-shift {
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.05) translate(2%, -2%); }
  100% { transform: scale(1.1) translate(-2%, 2%); }
}

/* Engineering Grid - Aquatic Tint */
.pooled-hero__grid {
  background-image:
    linear-gradient(to right,  rgba(0, 163, 214, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 163, 214, 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  background-position: center top;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 40%, #000 30%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 40%, #000 30%, transparent 90%);
  pointer-events: none;
}

/* Vignette to keep focus center-bottom */
.pooled-hero__vignette {
  background:
    radial-gradient(ellipse 80% 90% at 50% 60%, transparent 30%, rgba(1, 8, 15, 0.95) 100%),
    linear-gradient(to bottom, rgba(1, 8, 15, 0.2) 0%, transparent 30%, transparent 70%, rgba(1, 8, 15, 0.98) 100%);
  pointer-events: none;
}

/* Source Halos (The physical lights on the wall) */
.pooled-hero__halo {
  width: 450px;
  height: 450px;
  background:
    radial-gradient(circle at center, rgba(180, 240, 255, 0.40) 0%, rgba(0, 163, 214, 0.20) 20%, transparent 60%);
  filter: blur(25px);
  mix-blend-mode: screen;
  pointer-events: none;
  will-change: opacity;
  animation: pooled-halo-shimmer 6s ease-in-out infinite alternate;
}

/* Shared Beam Styles - Enriched Aquatic Colors */
.pooled-hero__beam {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(180, 245, 255, 0.15) 0%,
    rgba(0, 163, 214, 0.10) 30%,
    rgba(0, 92, 138, 0.04) 65%,
    transparent 100%
  );
  filter: blur(32px); /* Slightly increased blur for better water blending */
  mix-blend-mode: screen;
  pointer-events: none;
  animation: pooled-caustic-sway 8s ease-in-out infinite alternate;
}

/* Individual Clip Paths (Kept exactly as you liked them) */
.pooled-hero__beam--left {
  clip-path: polygon(15% 0%, 25% 0%, 55% 100%, -10% 100%);
  animation-delay: -2s;
}

.pooled-hero__beam--center {
  clip-path: polygon(45% 0%, 55% 0%, 80% 100%, 20% 100%);
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(0, 180, 230, 0.12) 35%,
    rgba(0, 92, 138, 0.05) 75%,
    transparent 100%
  );
  animation-delay: 0s;
}

.pooled-hero__beam--right {
  clip-path: polygon(75% 0%, 85% 0%, 110% 100%, 45% 100%);
  animation-delay: -4s;
}

/* Animations for underwater feel */
@keyframes pooled-halo-shimmer {
  0% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.95); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
}

@keyframes pooled-caustic-sway {
  0% { transform: skewX(-3deg) scaleY(1.02); opacity: 0.8; }
  100% { transform: skewX(3deg) scaleY(0.98); opacity: 1; }
}

/* Particles / Micro-bubbles */
.pooled-hero__particles {
  width: 100%;
  height: 100%;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
}

.pooled-hero__particle {
  position: absolute;
  top: 100%;
  border-radius: 9999px;
  background: rgba(220, 245, 255, 0.95);
  box-shadow:
    0 0 8px rgba(255, 255, 255, 0.7),
    0 0 16px rgba(0, 163, 214, 0.5);
  opacity: 0;
  animation: pooled-particle-rise linear infinite;
  will-change: transform, opacity;
}

@keyframes pooled-particle-rise {
  0%   { transform: translate3d(0, 0, 0); opacity: 0; }
  15%  { opacity: 0.7; }
  50%  { transform: translate3d(calc(var(--drift) * 0.5), -50vh, 0); opacity: 0.9; }
  85%  { opacity: 0.2; }
  100% { transform: translate3d(var(--drift), -110vh, 0); opacity: 0; }
}

/* Typography glowing within the light */
.pooled-hero__headline {
  text-shadow:
    0 0 50px rgba(0, 163, 214, 0.35),
    0 0 100px rgba(0, 92, 138, 0.25);
}

/* CTAs - Strict adherence to brand colors */
.pooled-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.75rem;
  padding: 0 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #FFFFFF;
  background: #005C8A;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.15),
    0 1px 2px rgba(0,0,0,0.4);
  transition: all 200ms ease;
}

.pooled-hero__cta:hover {
  background: #006FA3;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 0 0 1px rgba(0,163,214,0.3),
    0 4px 15px rgba(0,163,214,0.3);
  transform: translateY(-1px);
}

.pooled-hero__cta-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.75rem;
  padding: 0 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #B5D8F0;
  background: transparent;
  border: 1px solid rgba(0, 163, 214, 0.25);
  transition: all 180ms ease;
}

.pooled-hero__cta-ghost:hover {
  color: #FFFFFF;
  border-color: rgba(0, 163, 214, 0.5);
  background: rgba(0, 92, 138, 0.2);
}

@media (prefers-reduced-motion: reduce) {
  .pooled-hero__halo,
  .pooled-hero__beam,
  .pooled-hero__particle,
  .pooled-hero__water-ambient { animation: none; }
}
`;