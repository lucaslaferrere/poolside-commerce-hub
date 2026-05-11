import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Instagram,
  ChevronLeft,
  Wifi,
  BatteryFull,
  SignalHigh,
  ArrowUpRight,
} from 'lucide-react';
import heroImg from '@/assets/hero-pool-night.jpg';
import rgbImg  from '@/assets/product-rgb-light.jpg';
import kitImg  from '@/assets/product-kit.jpg';
import ledImg  from '@/assets/product-led-spot.jpg';
import ctrlImg from '@/assets/product-controller.jpg';

interface Post {
  img: string;
  location: string;
  caption: string;
  likes: string;
  time: string;
}

const POSTS: Post[] = [
  { img: heroImg, location: 'Cariló · Buenos Aires', caption: 'Piscina de 9m con sistema RGB Pooled. Diseño y montaje propio.', likes: '2.412', time: 'Hace 1 día' },
  { img: rgbImg,  location: 'San Isidro',             caption: 'Sincronización con app: 16M de colores y escenas guardadas.',  likes: '1.876', time: 'Hace 2 días' },
  { img: kitImg,  location: 'Pinamar',                caption: 'Kit completo instalado en un fin de semana. Cliente feliz.',     likes: '3.104', time: 'Hace 3 días' },
  { img: ledImg,  location: 'Tigre',                  caption: 'LED 12 W blanco frío. Reemplazo de halógena tradicional.',       likes: '964',   time: 'Hace 4 días' },
  { img: ctrlImg, location: 'Nordelta',               caption: 'Controlador wifi compatible con Alexa & Google Home.',           likes: '1.328', time: 'Hace 5 días' },
  { img: heroImg, location: 'Pilar',                  caption: 'Inauguración nocturna. La piscina queda como el escenario.',      likes: '4.221', time: 'Hace 6 días' },
  { img: rgbImg,  location: 'Mar del Plata',          caption: 'Modo fiesta activado para el cumpleaños del cliente.',           likes: '2.703', time: 'Hace 1 sem' },
  { img: kitImg,  location: 'Bariloche',              caption: 'Antes / después de una renovación completa.',                     likes: '1.547', time: 'Hace 1 sem' },
];

export function InstagramFeed() {
  // Duplicate the feed so the CSS marquee can loop seamlessly (translateY -50%).
  const loop = [...POSTS, ...POSTS];

  return (
    <section
      id="comunidad"
      className="ig relative overflow-hidden py-20 md:py-28 bg-neutral-50"
    >
      {/* Ambient background */}
      <div className="ig__dots absolute inset-0" aria-hidden="true" />
      <div className="ig__glow absolute" aria-hidden="true" />

      <div className="relative container">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-brand/15 bg-brand/5 text-[11px] font-medium uppercase tracking-[0.18em] text-brand">
            <Instagram className="h-3 w-3" />
            Comunidad
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.05] mt-5">
            Inspiración real,
            <br />
            <span className="text-neutral-500">desde la comunidad.</span>
          </h2>
          <p className="mt-5 text-neutral-500 max-w-md mx-auto leading-relaxed">
            Seguinos en{' '}
            <a
              href="https://www.instagram.com/pooled.ok"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand font-medium hover:text-brand-hover transition-colors"
            >
              @pooled.ok
            </a>{' '}
            para ver instalaciones completas, antes y después y novedades técnicas.
          </p>
        </motion.div>

        {/* Showcase */}
        <div className="ig__showcase relative mx-auto max-w-3xl">
          {/* Ambient blurred images behind the phone (desktop only) */}
          <div className="ig__ambient ig__ambient--tl" aria-hidden="true">
            <img src={heroImg} alt="" />
          </div>
          <div className="ig__ambient ig__ambient--tr" aria-hidden="true">
            <img src={rgbImg} alt="" />
          </div>
          <div className="ig__ambient ig__ambient--bl" aria-hidden="true">
            <img src={kitImg} alt="" />
          </div>
          <div className="ig__ambient ig__ambient--br" aria-hidden="true">
            <img src={ledImg} alt="" />
          </div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0, 1], delay: 0.15 }}
            className="ig-phone relative mx-auto"
          >
            {/* side buttons */}
            <span className="ig-phone__btn ig-phone__btn--silent" />
            <span className="ig-phone__btn ig-phone__btn--vol-up" />
            <span className="ig-phone__btn ig-phone__btn--vol-down" />
            <span className="ig-phone__btn ig-phone__btn--power" />

            <div className="ig-phone__frame">
              <div className="ig-phone__screen">
                {/* status bar */}
                <div className="ig-phone__status">
                  <span>9:41</span>
                  <span className="ig-phone__island" />
                  <div className="flex items-center gap-1.5 text-neutral-900">
                    <SignalHigh className="h-3 w-3" strokeWidth={2.5} />
                    <Wifi className="h-3 w-3" strokeWidth={2.5} />
                    <BatteryFull className="h-4 w-4" strokeWidth={2} />
                  </div>
                </div>

                {/* IG app header */}
                <div className="ig-phone__appbar">
                  <ChevronLeft className="h-5 w-5 text-neutral-900" />
                  <div className="flex items-center gap-1">
                    <span className="text-[15px] font-semibold text-neutral-900">pooled.ok</span>
                    <span className="grid place-items-center h-3.5 w-3.5 rounded-full bg-[#3897F0] text-white text-[8px] font-bold leading-none">
                      ✓
                    </span>
                  </div>
                  <MoreHorizontal className="h-5 w-5 text-neutral-900" />
                </div>

                {/* Scrolling feed */}
                <div className="ig-phone__feed-mask">
                  <div className="ig-phone__feed-scroll">
                    {loop.map((p, i) => (
                      <IgPost key={i} post={p} />
                    ))}
                  </div>
                </div>

                {/* Bottom fade so posts at the edge soften */}
                <div className="ig-phone__feed-fade" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Follow CTA */}
        <div className="mt-14 flex justify-center">
          <a
            href="https://www.instagram.com/pooled.ok"
            target="_blank"
            rel="noopener noreferrer"
            className="ig__cta"
          >
            <Instagram className="h-4 w-4" />
            Seguinos en @pooled
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <style>{styles}</style>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Single Instagram-style post card rendered inside the phone screen.
   ──────────────────────────────────────────────────────────────────────── */
function IgPost({ post }: { post: Post }) {
  return (
    <article className="border-b border-neutral-100">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid place-items-center h-8 w-8 rounded-full bg-brand text-brand-foreground text-[10px] font-bold shrink-0">
            P
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold leading-tight text-neutral-900 truncate">pooled</p>
            <p className="text-[10px] text-neutral-500 truncate">{post.location}</p>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-neutral-700 shrink-0" />
      </div>

      {/* Image */}
      <div className="aspect-square bg-neutral-100">
        <img src={post.img} alt="" className="h-full w-full object-cover" loading="lazy" />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3.5 px-3 py-2 text-neutral-900">
        <Heart       className="h-[18px] w-[18px]" strokeWidth={1.8} />
        <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.8} />
        <Send        className="h-[18px] w-[18px]" strokeWidth={1.8} />
        <Bookmark    className="h-[18px] w-[18px] ml-auto" strokeWidth={1.8} />
      </div>

      {/* Likes + caption + time */}
      <div className="px-3 pb-3 text-[12px] leading-snug text-neutral-900">
        <p className="font-semibold">{post.likes} Me gusta</p>
        <p className="mt-1">
          <span className="font-semibold">pooled</span>{' '}
          <span className="text-neutral-700">{post.caption}</span>
        </p>
        <p className="text-[10px] text-neutral-400 mt-1.5 uppercase tracking-wide">{post.time}</p>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Styles — phone shell, scrolling animation, ambient halos.
   ──────────────────────────────────────────────────────────────────────── */
const styles = `
/* Section ambience */
.ig__dots {
  background-image: radial-gradient(circle at 1px 1px, rgba(2, 8, 23, 0.05) 1px, transparent 0);
  background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 95%);
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 95%);
  pointer-events: none;
}
.ig__glow {
  top: -160px;
  left: 50%;
  transform: translateX(-50%);
  width: 720px;
  height: 720px;
  background: radial-gradient(circle, hsl(var(--brand) / 0.14), transparent 60%);
  filter: blur(50px);
  pointer-events: none;
}

/* Ambient blurred IG tiles behind the phone (sm+ only) */
.ig__ambient {
  display: none;
  position: absolute;
  border-radius: 14px;
  overflow: hidden;
  opacity: 0.5;
  filter: blur(8px) saturate(0.55);
  pointer-events: none;
}
.ig__ambient img { width: 100%; height: 100%; object-fit: cover; }
@media (min-width: 768px) {
  .ig__ambient { display: block; }
  .ig__ambient--tl { top: -10px;  left: 4%;   width: 150px; height: 150px; transform: rotate(-6deg); }
  .ig__ambient--tr { top: 40px;   right: 4%;  width: 170px; height: 170px; transform: rotate(8deg); }
  .ig__ambient--bl { bottom: 30px;left: 6%;   width: 180px; height: 180px; transform: rotate(4deg); opacity: 0.45; }
  .ig__ambient--br { bottom: -20px;right: 6%; width: 140px; height: 140px; transform: rotate(-9deg); opacity: 0.45; }
}
@media (min-width: 1024px) {
  .ig__ambient--tl { left: 8%; }
  .ig__ambient--tr { right: 8%; }
  .ig__ambient--bl { left: 12%; bottom: 50px; }
  .ig__ambient--br { right: 12%; bottom: 0; }
}

/* ── Phone shell ──────────────────────────────────────────────────────── */
.ig-phone {
  position: relative;
  width: 300px;
  filter:
    drop-shadow(0 18px 28px rgba(15, 23, 42, 0.16))
    drop-shadow(0 40px 80px rgba(15, 23, 42, 0.12));
}
@media (min-width: 640px) {
  .ig-phone { width: 320px; }
}

.ig-phone__frame {
  position: relative;
  background: linear-gradient(180deg, #1c1c1e 0%, #0f0f10 100%);
  border-radius: 48px;
  padding: 7px;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    inset 0 1px 0    rgba(255, 255, 255, 0.10);
}

.ig-phone__screen {
  position: relative;
  width: 100%;
  height: 640px;
  background: #ffffff;
  border-radius: 41px;
  overflow: hidden;
}

/* Side hardware buttons */
.ig-phone__btn {
  position: absolute;
  background: #1a1a1a;
  border-radius: 2px;
  z-index: 1;
}
.ig-phone__btn--silent   { left: -2px;  top: 88px;  width: 3px; height: 28px; }
.ig-phone__btn--vol-up   { left: -2px;  top: 124px; width: 3px; height: 52px; }
.ig-phone__btn--vol-down { left: -2px;  top: 184px; width: 3px; height: 52px; }
.ig-phone__btn--power    { right: -2px; top: 140px; width: 3px; height: 78px; }

/* Status bar */
.ig-phone__status {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 22px;
  font-size: 12px;
  font-weight: 600;
  color: #0a0a0a;
}
.ig-phone__island {
  position: absolute;
  left: 50%;
  top: 7px;
  transform: translateX(-50%);
  width: 92px;
  height: 26px;
  background: #000;
  border-radius: 9999px;
}

/* IG app header */
.ig-phone__appbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #f1f1f1;
}

/* Feed mask + auto scroll */
.ig-phone__feed-mask {
  position: relative;
  height: calc(100% - 76px);
  overflow: hidden;
}
.ig-phone__feed-scroll {
  animation: ig-scroll 40s linear infinite;
  will-change: transform;
}
.ig-phone:hover .ig-phone__feed-scroll {
  animation-play-state: paused;
}
@keyframes ig-scroll {
  0%   { transform: translate3d(0, 0,    0); }
  100% { transform: translate3d(0, -50%, 0); }
}
/* prefers-reduced-motion: feed scroll kept intentional — decorative only */

/* Soft fade at the bottom of the feed window for a subtle scroll cue */
.ig-phone__feed-fade {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.95));
  pointer-events: none;
}

/* Follow CTA — outline pill with brand glow on hover */
.ig__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.75rem;
  padding: 0 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #FFFFFF;
  background: hsl(var(--brand));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 1px 2px rgba(0, 0, 0, 0.18);
  transition:
    background 200ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 220ms cubic-bezier(0.2, 0, 0, 1),
    transform  200ms cubic-bezier(0.2, 0, 0, 1);
}
.ig__cta:hover {
  background: hsl(var(--brand-hover));
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 8px 24px hsl(var(--brand) / 0.35),
    0 0 32px  hsl(var(--brand) / 0.18);
}
.ig__cta:active {
  background: hsl(var(--brand-active));
  transform: translateY(0);
}
`;
