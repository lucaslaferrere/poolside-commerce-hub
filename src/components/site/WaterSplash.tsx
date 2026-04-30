import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/store/cart';

interface Droplet {
  dx: number;
  dy: number;
  w: number;
  h: number;
  useSecondary: boolean;
  duration: number;
  delay: number;
  finalDy: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  droplets: Droplet[];
}

const DROPLETS = 16;

function getCartCenter() {
  const el = document.querySelector('[aria-label="Abrir carrito"]') as HTMLElement | null;
  const r = el?.getBoundingClientRect();
  return r
    ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    : { x: window.innerWidth - 40, y: 32 };
}

function makeDroplets(): Droplet[] {
  return Array.from({ length: DROPLETS }, (_, i) => {
    const angle = (i / DROPLETS) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const distance = 55 + Math.random() * 65;
    const w = 4 + Math.random() * 10;
    return {
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      finalDy: 25 + Math.random() * 25,
      w,
      h: w * (0.7 + Math.random() * 0.7),
      useSecondary: Math.random() > 0.4,
      duration: 0.65 + Math.random() * 0.3,
      delay: Math.random() * 0.07,
    };
  });
}

export function WaterSplash() {
  const tick = useCart((s) => s.splashTick);
  const origin = useCart((s) => s.splashOrigin);
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    if (tick === 0) return;
    const pos = origin ?? getCartCenter();
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x: pos.x, y: pos.y, droplets: makeDroplets() }]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {bursts.map((burst) => {
          const cart = getCartCenter();
          const fdx = cart.x - burst.x;
          const fdy = cart.y - burst.y;
          const dist = Math.sqrt(fdx * fdx + fdy * fdy);
          const arcPeakY = fdy / 2 - dist * 0.35;

          return (
            <div
              key={burst.id}
              className="absolute"
              style={{ left: burst.x, top: burst.y }}
            >
              {/* Outer ring */}
              <motion.div
                initial={{ scale: 0, opacity: 0.75 }}
                animate={{ scale: 4.5, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 border-secondary"
                style={{ boxShadow: '0 0 18px hsl(var(--secondary) / 0.55)' }}
              />

              {/* Inner fill ring */}
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2.8, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.04 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-secondary/35"
              />

              {/* White pop flash */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0.7 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white/90"
              />

              {/* Scatter droplets */}
              {burst.droplets.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: d.dx,
                    y: d.dy + d.finalDy,
                    opacity: 0,
                    scale: 0.15,
                  }}
                  transition={{
                    duration: d.duration,
                    ease: [0.1, 0.75, 0.3, 1],
                    delay: d.delay,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: d.w,
                    height: d.h,
                    background: d.useSecondary
                      ? 'radial-gradient(circle at 30% 30%, hsl(var(--secondary) / 0.95), hsl(var(--primary) / 0.75))'
                      : 'radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.9), hsl(var(--secondary) / 0.6))',
                    boxShadow: '0 0 6px hsl(var(--secondary) / 0.45)',
                  }}
                />
              ))}

              {/* Fly-to-cart main particle */}
              <motion.div
                initial={{ x: 0, y: 0, scale: 1.3, opacity: 1 }}
                animate={{
                  x: fdx,
                  y: [0, arcPeakY, fdy],
                  scale: [1.3, 1.1, 0.1],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 0.58,
                  times: [0, 0.42, 1],
                  ease: 'easeInOut',
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 13,
                  height: 13,
                  background:
                    'radial-gradient(circle at 35% 30%, hsl(var(--secondary)), hsl(var(--primary) / 0.85))',
                  boxShadow:
                    '0 0 14px hsl(var(--secondary) / 0.9), 0 0 4px rgba(255,255,255,0.8)',
                }}
              />

              {/* Trail drops */}
              {([0.08, 0.17, 0.28] as const).map((delay, i) => {
                const ratio = 0.72 - i * 0.14;
                return (
                  <motion.div
                    key={`trail-${i}`}
                    initial={{ x: 0, y: 0, scale: 0.7, opacity: 0.75 }}
                    animate={{
                      x: fdx * ratio,
                      y: [0, arcPeakY * ratio, fdy * ratio],
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.52,
                      delay,
                      times: [0, 0.42, 1],
                      ease: 'easeInOut',
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: 7 - i * 1.5,
                      height: 7 - i * 1.5,
                      background: 'hsl(var(--secondary) / 0.65)',
                      boxShadow: '0 0 4px hsl(var(--secondary) / 0.4)',
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
