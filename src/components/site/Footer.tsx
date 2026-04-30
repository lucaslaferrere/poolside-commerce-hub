import { Droplet, Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="gradient-deep text-primary-foreground mt-16">
      <div className="container py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-secondary">
              <Droplet className="h-4 w-4" fill="currentColor" />
            </span>
            Pooled
          </div>
          <p className="text-sm text-primary-foreground/70 mt-3">
            Iluminación LED y accesorios para piletas. Calidad pro y asesoría experta.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Tienda</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><a href="#tienda" className="hover:text-secondary">Productos</a></li>
            <li><a href="#kits" className="hover:text-secondary">Kits</a></li>
            <li><a href="#guia" className="hover:text-secondary">Guía de compra</a></li>
            <li><a href="#faq" className="hover:text-secondary">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +54 11 0000-0000</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hola@pooled.com.ar</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Buenos Aires, Argentina</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Seguinos</h4>
          <div className="flex gap-2">
            <a href="#" aria-label="Instagram" className="h-10 w-10 grid place-items-center rounded-full bg-white/10 hover:bg-secondary transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="h-10 w-10 grid place-items-center rounded-full bg-white/10 hover:bg-secondary transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-primary-foreground/60 mt-4">
            Aceptamos: MercadoPago, transferencia y efectivo.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-4 text-xs text-primary-foreground/60 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Pooled. Todos los derechos reservados.</span>
          <span>Hecho por L&R Solutions.</span>
        </div>
      </div>
    </footer>
  );
}
