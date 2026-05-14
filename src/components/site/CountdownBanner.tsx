import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, X } from 'lucide-react';

// May 17 23:59:59 ART (UTC-3) = May 18 02:59:59 UTC
const DEADLINE = new Date('2026-05-18T02:59:59Z');

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function useCountdown() {
  const [diff, setDiff] = useState(() => DEADLINE.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setDiff(DEADLINE.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const ITEMS = [
  '🔥 HOT SALE 14, 15, 16 y 17 de Mayo',
  'Hasta -20% OFF',
  'Envío gratis a partir de $700mil',
  'Garantía oficial',
  'Pago en cuotas',
];

export function CountdownBanner() {
  const countdown = useCountdown();
  const [dismissed, setDismissed] = useState(false);

  if (!countdown || dismissed) return null;

  const { days, hours, minutes, seconds } = countdown;

  return (
    <div className="relative bg-red-600 text-white text-xs sm:text-sm">
      {/* Countdown row */}
      <div className="container flex items-center justify-center gap-2 sm:gap-4 py-2 px-10">
        <span className="inline-flex items-center gap-1 font-bold uppercase tracking-widest text-yellow-200 shrink-0">
          <Flame className="h-3.5 w-3.5" />
          Hot Sale
        </span>

        <span className="opacity-40 hidden sm:inline">·</span>

        <div className="flex items-center gap-1.5 font-mono font-bold tabular-nums">
          {days > 0 && (
            <>
              <span className="inline-flex flex-col items-center leading-none">
                <span className="text-base sm:text-lg">{pad(days)}</span>
                <span className="text-[9px] opacity-70 font-sans font-normal uppercase tracking-wider">días</span>
              </span>
              <span className="opacity-50 mb-2">:</span>
            </>
          )}
          <span className="inline-flex flex-col items-center leading-none">
            <span className="text-base sm:text-lg">{pad(hours)}</span>
            <span className="text-[9px] opacity-70 font-sans font-normal uppercase tracking-wider">hs</span>
          </span>
          <span className="opacity-50 mb-2">:</span>
          <span className="inline-flex flex-col items-center leading-none">
            <span className="text-base sm:text-lg">{pad(minutes)}</span>
            <span className="text-[9px] opacity-70 font-sans font-normal uppercase tracking-wider">min</span>
          </span>
          <span className="opacity-50 mb-2">:</span>
          <span className="inline-flex flex-col items-center leading-none">
            <span className="text-base sm:text-lg">{pad(seconds)}</span>
            <span className="text-[9px] opacity-70 font-sans font-normal uppercase tracking-wider">seg</span>
          </span>
        </div>

        <span className="opacity-40 hidden sm:inline">·</span>

        <Link
          to="/tienda"
          className="hidden sm:inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline shrink-0"
        >
          Ver ofertas <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar"
        className="absolute right-2 top-3 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Marquee strip */}
      <div className="overflow-hidden bg-red-800 py-1 text-[11px] font-bold uppercase tracking-[0.16em] select-none">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((copy) => (
            <span key={copy} className="flex items-center">
              {ITEMS.map((item, i) => (
                <span key={i} className="flex items-center gap-3 px-4">
                  <span>{item}</span>
                  <span className="opacity-30">◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
