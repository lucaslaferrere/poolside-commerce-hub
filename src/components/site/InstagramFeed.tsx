import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import heroImg from '@/assets/hero-pool-night.jpg';
import rgbImg from '@/assets/product-rgb-light.jpg';
import kitImg from '@/assets/product-kit.jpg';
import ledImg from '@/assets/product-led-spot.jpg';
import ctrlImg from '@/assets/product-controller.jpg';

const POSTS = [
  { img: heroImg, alt: 'Pileta iluminada de noche' },
  { img: rgbImg, alt: 'LED RGB' },
  { img: kitImg, alt: 'Kit completo' },
  { img: ledImg, alt: 'LED blanco' },
  { img: ctrlImg, alt: 'Controlador' },
  { img: heroImg, alt: 'Iluminación nocturna' },
  { img: rgbImg, alt: 'Colores RGB' },
  { img: kitImg, alt: 'Combo completo' },
];

export function InstagramFeed() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Comunidad</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 flex items-center justify-center gap-3 flex-wrap">
            <Instagram className="h-8 w-8 text-secondary" />
            @pooled
          </h2>
          <p className="text-muted-foreground mt-3">Seguinos para inspirarte con instalaciones reales.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
          {POSTS.map((p, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={p.img}
                alt={p.alt}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-colors grid place-items-center">
                <Instagram className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
