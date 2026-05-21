import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="gradient-deep text-primary-foreground">
      {/* Main grid */}
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <img src="/Pooled blanco.svg" alt="Pooled" className="h-12 md:h-24 w-auto" />
            <p className="text-sm leading-relaxed text-primary-foreground/70 mt-4 max-w-xs">
              Iluminación LED y accesorios para piscina. Calidad pro y asesoría experta.
            </p>
          </div>

          {/* Products */}
          <div className="md:col-span-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-white/90 mb-5">
              Productos
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link to="/tienda" className="hover:text-white transition-colors">Catálogo</Link></li>
              <li><Link to={{ pathname: '/', hash: '#kits' }} className="hover:text-white transition-colors">Kits prearmados</Link></li>
              <li><Link to={{ pathname: '/', hash: '#guia' }} className="hover:text-white transition-colors">Guía de compra</Link></li>
              <li><Link to={{ pathname: '/', hash: '#faq' }} className="hover:text-white transition-colors">Preguntas frecuentes</Link></li>
              <li><Link to="/garantia" className="hover:text-white transition-colors">Garantía</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-white/90 mb-5">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span>+54 9 11 2342-7593</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <span>ventas@pooled.com.ar</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="md:col-span-2">
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-white/90 mb-5">
              Seguinos
            </h4>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://www.instagram.com/pooled.ok"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/pooled.ok/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@pooledok"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/pooledargentina/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-primary-foreground/55 mt-5 leading-relaxed">
              Aceptamos MercadoPago y transferencia.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar — darker shade + top border for separation */}
      <div className="border-t border-white/10 bg-black/25">
        <div className="container py-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/60">
          <span>© {new Date().getFullYear()} Pooled. Todos los derechos reservados.</span>
          <span>
            Hecho por{' '}
            <a
              href="https://www.lrsolutions.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-foreground/80 hover:text-white underline-offset-4 hover:underline transition-colors duration-200"
            >
              L&amp;R Solutions
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
