import { CreditCard } from 'lucide-react';

export function AnnouncementBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#0B1F3A] text-white">
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium tracking-wide">
        <CreditCard className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
        <span>
          3 cuotas sin interés en compras a partir de{' '}
          <span className="font-bold text-cyan-300">$1.000.000</span>
        </span>
      </div>
    </div>
  );
}
