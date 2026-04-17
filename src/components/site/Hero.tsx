import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import heroImg from '@/assets/hero-pool-night.jpg';
import { buildWhatsAppLink, BUSINESS_NAME } from '@/lib/whatsapp';

export function Hero() {
  return (
    <section id="inicio" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      {/* Video container — placeholder image until client provides video */}
      <div className="absolute inset-0">
        {/*
          Cuando tengas el video, reemplazá este img por:
          <video autoPlay loop muted playsInline poster={heroImg} className="h-full w-full object-cover">
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        */}
        <img
          src={heroImg}
          alt="Pileta iluminada con LED de noche"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary/80" />
      </div>

      <div className="relative container h-full flex flex-col justify-center items-start text-primary-foreground pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium mb-5">
            <Sparkles className="h-3 w-3 text-secondary" />
            Iluminación LED profesional
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-balance">
            Tu pileta como{' '}
            <span className="bg-gradient-to-r from-secondary via-cyan-200 to-white bg-clip-text text-transparent">
              nunca antes
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-primary-foreground/85 max-w-xl text-balance">
            Luminarias LED, controladores inteligentes y kits completos. Asesoría personalizada y envíos a todo el país.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="gradient-gold text-gold-foreground hover:opacity-95 shadow-aqua">
              <a href="#tienda">
                Ver Catálogo <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20 hover:text-white">
              <a href={buildWhatsAppLink(`Hola ${BUSINESS_NAME}! Quiero una asesoría.`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> Asesoría por WhatsApp
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-primary-foreground/80">
            <div><span className="font-display text-2xl font-bold text-secondary block">+10k</span> piletas iluminadas</div>
            <div><span className="font-display text-2xl font-bold text-secondary block">5 años</span> de garantía</div>
            <div><span className="font-display text-2xl font-bold text-secondary block">24h</span> de respuesta</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-xs flex flex-col items-center gap-1"
      >
        <span>Descubrí más</span>
        <span className="h-8 w-[1px] bg-white/40" />
      </motion.div>
    </section>
  );
}
