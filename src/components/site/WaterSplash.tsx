import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/store/cart';

interface Burst {
  id: number;
  x: number;
  y: number;
}

const DROPLETS = 14;

export function WaterSplash() {
  const tick = useCart((s) => s.splashTick);
  const origin = useCart((s) => s.splashOrigin);
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    if (tick === 0) return;
    // Default to cart icon position (top-right) if no origin given
    const cartEl = document.querySelector('[aria-label="Abrir carrito"]') as HTMLElement | null;
    const rect = cartEl?.getBoundingClientRect();
    const target = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth - 40, y: 32 };

    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x: target.x, y: target.y }]);
    const t = setTimeout(() => {
      setBursts((b) => b.filter((x) => x.id !== id));
    }, 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute"
            style={{ left: burst.x, top: burst.y }}
          >
            {/* Central splash ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full border-2 border-secondary"
              style={{ boxShadow: '0 0 20px hsl(var(--secondary) / 0.6)' }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-secondary/30"
            />

            {/* Droplets flying outward */}
            {Array.from({ length: DROPLETS }).map((_, i) => {
              const angle = (i / DROPLETS) * Math.PI * 2;
              const distance = 60 + Math.random() * 50;
              const dx = Math.cos(angle) * distance;
              const dy = Math.sin(angle) * distance;
              const size = 6 + Math.random() * 8;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: dx,
                    y: dy + 40, // gravity pull
                    opacity: 0,
                    scale: 0.4,
                  }}
                  transition={{ duration: 0.8, ease: [0.2, 0.7, 0.4, 1], delay: 0.02 * i }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: size,
                    height: size,
                    background:
                      'radial-gradient(circle at 30% 30%, hsl(var(--secondary) / 0.95), hsl(var(--primary) / 0.8))',
                    boxShadow: '0 0 8px hsl(var(--secondary) / 0.7)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
