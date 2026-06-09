import { useState, useEffect } from 'react';
import { CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MESSAGES = [
  {
    icon: CreditCard,
    text: (
      <>
        3 cuotas sin interés en compras a partir de{' '}
        <span className="font-bold text-cyan-300">$1.000.000</span>
      </>
    ),
  },
  {
    icon: Truck,
    text: <>Envío a todo el país</>,
  },
  {
    icon: ShieldCheck,
    text: <>Garantía oficial en todos los productos</>,
  },
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const { icon: Icon, text } = MESSAGES[index];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#0B1F3A] text-white overflow-hidden">
      <div className="flex items-center justify-center px-4 py-2 h-[34px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wide"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
            <span>{text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
