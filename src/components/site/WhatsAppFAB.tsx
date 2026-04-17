import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink, BUSINESS_NAME } from '@/lib/whatsapp';
import { motion } from 'framer-motion';

export function WhatsAppFAB() {
  const href = buildWhatsAppLink(`Hola ${BUSINESS_NAME}! Quería hacer una consulta.`);
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring' }}
      className="fixed bottom-5 right-5 z-40 grid place-items-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-deep hover:scale-110 transition-transform"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    </motion.a>
  );
}
