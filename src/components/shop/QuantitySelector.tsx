import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  /** Optional label rendered to the left of the stepper. */
  label?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  className,
  label,
}: QuantitySelectorProps) {
  const safeMax = Math.max(min, max);
  const clamp = (n: number) => Math.min(safeMax, Math.max(min, n));

  const dec = () => onChange(clamp(value - 1));
  const inc = () => onChange(clamp(value + 1));

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      )}
      <div
        className={cn(
          'flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden',
          disabled && 'opacity-50 pointer-events-none',
        )}
        role="group"
        aria-label="Selector de cantidad"
      >
        <button
          type="button"
          onClick={dec}
          disabled={disabled || value <= min}
          aria-label="Disminuir cantidad"
          className="h-10 w-10 grid place-items-center text-slate-500 hover:bg-slate-100 hover:text-primary disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span
          aria-live="polite"
          className="w-10 text-center font-display font-bold text-[15px] text-primary select-none tabular-nums"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={disabled || value >= safeMax}
          aria-label="Aumentar cantidad"
          className="h-10 w-10 grid place-items-center text-slate-500 hover:bg-slate-100 hover:text-primary disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
