import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingCart, Droplet, LayoutDashboard } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Tienda', href: '#tienda' },
  { label: 'Kits', href: '#kits' },
  { label: 'Guía', href: '#guia' },
  { label: 'Distribuidores', href: '#distribuidores' },
  { label: 'FAQ', href: '#faq' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wobble, setWobble] = useState(false);

  const cartCount = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);
  const splashTick = useCart((s) => s.splashTick);
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (splashTick === 0) return;
    setWobble(true);
    const t = setTimeout(() => setWobble(false), 750);
    return () => clearTimeout(t);
  }, [splashTick]);

  const navLinkClass = cn(
    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
    scrolled
      ? 'text-foreground/80 hover:text-secondary hover:bg-muted'
      : 'text-white/90 hover:text-white hover:bg-white/10',
  );

  const adminLinkClass = cn(
    'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors',
    scrolled
      ? 'text-secondary hover:text-secondary hover:bg-muted'
      : 'text-secondary hover:text-white hover:bg-white/10',
  );

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/85 backdrop-blur-md shadow-card' : 'bg-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-3">
        {/* ── Logo ── */}
        <a href="#inicio" className="flex items-center gap-2 font-display font-bold text-lg shrink-0">
          <span className="grid place-items-center h-9 w-9 rounded-full gradient-aqua text-primary-foreground shadow-aqua">
            <Droplet className="h-4 w-4" fill="currentColor" />
          </span>
          <span className={cn(scrolled ? 'text-foreground' : 'text-white drop-shadow')}>
            AquaLed
          </span>
        </a>

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className={navLinkClass}>
              {l.label}
            </a>
          ))}

          {isAdmin && (
            <Link to="/admin" className={adminLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Gestión de Productos
            </Link>
          )}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1">
          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            aria-label="Abrir carrito"
            className={cn(
              'relative',
              scrolled ? '' : 'text-white hover:bg-white/10 hover:text-white',
            )}
          >
            <ShoppingCart className={cn('h-5 w-5', wobble && 'animate-cart-wobble')} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground">
                {cartCount}
              </span>
            )}
          </Button>

          {/* User icon / dropdown */}
          <UserMenu scrolled={scrolled} />

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menú"
                className={cn(
                  'lg:hidden',
                  scrolled ? '' : 'text-white hover:bg-white/10 hover:text-white',
                )}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-display">
                  <span className="grid place-items-center h-8 w-8 rounded-full gradient-aqua text-primary-foreground">
                    <Droplet className="h-4 w-4" fill="currentColor" />
                  </span>
                  AquaLed
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 rounded-md font-medium hover:bg-muted hover:text-secondary transition-colors"
                  >
                    {l.label}
                  </a>
                ))}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-3 rounded-md font-medium text-secondary hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Gestión de Productos
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
