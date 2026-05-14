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

export function CountdownBanner() {
  const countdown = useCountdown();
  const [dismissed, setDismissed] = useState(false);

  if (!countdown || dismissed) return null;

  const { days, hours, minutes, seconds } = countdown;

  return (
    <div className="relative bg-[linear-gradient(90deg,#b91c1c_0%,#dc2626_40%,#f97316_80%,#f59e0b_100%)] text-white text-xs sm:text-sm">
      <div className="container flex items-center justify-center gap-2 sm:gap-4 py-2 px-10">
        {/* Label */}
        <span className="inline-flex items-center gap-1 font-bold uppercase tracking-widest text-yellow-200 shrink-0">
          <Flame className="h-3.5 w-3.5" />
          Hot Sale
        </span>

        <span className="opacity-50 hidden sm:inline">·</span>

        {/* Countdown */}
        <div className="flex items-center gap-1.5 font-mono font-bold tabular-nums">
          {days > 0 && (
            <>
              <span className="inline-flex flex-col items-center leading-none">
                <span className="text-base sm:text-lg">{pad(days)}</span>
                <span className="text-[9px] opacity-70 font-sans font-normal uppercase tracking-wider">días</span>
              </span>
              <span className="opacity-60 mb-2">:</span>
            </>
          )}
          <span className="inline-flex flex-col items-center leading-none">
            <span className="text-base sm:text-lg">{pad(hours)}</span>
            <span className="text-[9px] opacity-70 font-sans font-normal uppercase tracking-wider">hs</span>
          </span>
          <span className="opacity-60 mb-2">:</span>
          <span className="inline-flex flex-col items-center leading-none">
            <span className="text-base sm:text-lg">{pad(minutes)}</span>
            <span className="text-[9px] opacity-70 font-sans font-normal uppercase tracking-wider">min</span>
          </span>
          <span className="opacity-60 mb-2">:</span>
          <span className="inline-flex flex-col items-center leading-none">
            <span className="text-base sm:text-lg">{pad(seconds)}</span>
            <span className="text-[9px] opacity-70 font-sans font-normal uppercase tracking-wider">seg</span>
          </span>
        </div>

        <span className="opacity-50 hidden sm:inline">·</span>

        {/* CTA */}
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
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Marquee strip */}
      <div className="overflow-hidden bg-black/25 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/90 select-none">
        <style>{`
          @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
          .marquee-track { display: flex; width: max-content; animation: marquee 22s linear infinite; }
          .marquee-track:hover { animation-play-state: paused; }
          @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }
        `}</style>
        <div className="marquee-track">
          {[0, 1].map((i) => (
            <span key={i} className="flex items-center gap-6 pr-6">
              <span className="inline-flex items-center gap-1.5 text-yellow-300"><Flame className="h-3 w-3" /> HOT SALE 14, 15, 16 y 17 de Mayo</span>
              <span className="opacity-40">●</span>
              <span>Hasta -20% OFF</span>
              <span className="opacity-40">●</span>
              <span>Envío gratis a partir de $700mil</span>
              <span className="opacity-40">●</span>
              <span>Garantía oficial</span>
              <span className="opacity-40">●</span>
              <span>Pago en cuotas</span>
              <span className="opacity-40">●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
