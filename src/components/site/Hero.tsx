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
          className="pooled-hero relative h-[90svh] min-h-[600px] w-full overflow-hidden bg-[#010810] text-white"
      >
        {/* Video background */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="https://pub-6232b7116b2042bbb2308cbdd5eec1b1.r2.dev/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          onEnded={(e) => { e.currentTarget.currentTime = 0; e.currentTarget.play(); }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* --- CONTENT --- */}
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
          <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
              className="w-full flex flex-col items-center"
          >
          {/*<span className="inline-flex items-center gap-2 rounded-full border border-[#00A3D6]/20 bg-[#005C8A]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#E0F2FE] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00A3D6] shadow-[0_0_10px_rgba(0,163,214,0.85)]" />
            Iluminación LED de precisión
          </span> */}

            <h1 className="pooled-hero__headline mt-7 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              Donde la luz
              <br />
              <span className="text-[#B5D8F0]">transforma cada momento.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#94B8D1] sm:text-lg">
              Luminarias LED subacuáticas de fabricación nacional. Para profesionales y clientes que no negocian calidad.
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

              <a href="#guia" className="pooled-hero__cta-ghost">
                Consultá tu proyecto
              </a>
            </motion.div>
          </motion.div>
        </div>



        {/* Water-surface wave — three layered paths for depth.
            Path corners overhang the viewBox by 300 user units on each side
            so the horizontal sway animation never exposes the dark hero. */}
        <div className="pooled-hero__wave pointer-events-none absolute inset-x-0 bottom-[-1px] z-10" aria-hidden="true">
          <svg
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
            className="block w-full h-[110px] md:h-[150px]"
          >
            <path
              d="M-300,70 C240,140 480,30 720,80 C960,130 1200,30 1740,80 L1740,260 L-300,260 Z"
              fill="rgba(255,255,255,0.18)"
            />
            <path
              d="M-300,100 C240,170 480,55 720,105 C960,155 1200,55 1740,105 L1740,260 L-300,260 Z"
              fill="rgba(255,255,255,0.45)"
            />
            <path
              d="M-300,130 C240,200 480,80 720,130 C960,180 1200,80 1740,130 L1740,260 L-300,260 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

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
  mix-blend-mode: screen;
  pointer-events: none;
  will-change: opacity, transform;
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
  mix-blend-mode: screen;
  pointer-events: none;
  will-change: transform;
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

/* Color light — capa de color que cubre todo el haz con clip-path */
.pooled-hero__color-light {
  filter: blur(40px);
  mix-blend-mode: screen;
  opacity: 0.08;
  pointer-events: none;
  animation: pooled-light-color 18s ease-in-out infinite;
}

.pooled-hero__color-light--left {
  clip-path: polygon(15% 0%, 25% 0%, 55% 100%, -10% 100%);
}

.pooled-hero__color-light--center {
  clip-path: polygon(45% 0%, 55% 0%, 80% 100%, 20% 100%);
}

.pooled-hero__color-light--right {
  clip-path: polygon(75% 0%, 85% 0%, 110% 100%, 45% 100%);
}

@keyframes pooled-light-color {
  0%,  12% { background: rgba(0,   163, 214, 0.9); }  /* Cyan aqua    */
  25%, 37% { background: rgba(138,  43, 226, 0.9); }  /* Violeta      */
  50%, 62% { background: rgba(0,   200, 120, 0.9); }  /* Verde esmeralda */
  75%, 87% { background: rgba(200, 225, 255, 0.9); }  /* Blanco frío  */
  100%     { background: rgba(0,   163, 214, 0.9); }  /* Cyan aqua    */
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

/* Water-surface wave — gentle horizontal sway for layered depth */
.pooled-hero__wave svg path:nth-child(1) {
  transform-origin: center bottom;
  animation: pooled-wave-back 9s ease-in-out infinite alternate;
}
.pooled-hero__wave svg path:nth-child(2) {
  transform-origin: center bottom;
  animation: pooled-wave-mid  7s ease-in-out infinite alternate;
}
.pooled-hero__wave svg path:nth-child(3) {
  transform-origin: center bottom;
  animation: pooled-wave-front 5.5s ease-in-out infinite alternate;
}
@keyframes pooled-wave-back  { from { transform: translateX(-2%); } to { transform: translateX(2%);  } }
@keyframes pooled-wave-mid   { from { transform: translateX(2%);  } to { transform: translateX(-2%); } }
@keyframes pooled-wave-front { from { transform: translateX(-1%); } to { transform: translateX(1%);  } }

@media (prefers-reduced-motion: reduce) {
  .pooled-hero__halo,
  .pooled-hero__beam,
  .pooled-hero__particle,
  .pooled-hero__water-ambient,
  .pooled-hero__wave svg path { animation: none; }
}
`;