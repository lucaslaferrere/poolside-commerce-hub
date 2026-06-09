import { CreditCard, Truck, ShieldCheck } from 'lucide-react';

const ITEMS = [
  { icon: CreditCard,  text: '3 cuotas sin interés en compras a partir de $1.000.000' },
  { icon: Truck,       text: 'Envío a todo el país' },
  { icon: ShieldCheck, text: 'Garantía oficial en todos los productos' },
];

const TRACK = [...ITEMS, ...ITEMS];

export function AnnouncementBar() {
  return (
    <>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 22s linear infinite;
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#0B1F3A] text-white overflow-hidden h-[34px] flex items-center">
        <div className="marquee-track flex whitespace-nowrap">
          {TRACK.map((item, i) => {
            const Icon = item.icon;
            return (
              <span key={i} className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wide mx-12">
                <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span>{item.text}</span>
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
}
