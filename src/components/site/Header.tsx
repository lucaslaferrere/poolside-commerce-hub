import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  ShoppingCart,
  Droplet,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';

const LOGO_DARK  = '/Pooled negro.svg';
const LOGO_LIGHT = '/Pooled blanco.svg';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';

type NavLink =
  | { kind: 'hash'; label: string; hash: string }   // jumps to an anchor on the home page
  | { kind: 'route'; label: string; to: string };   // react-router navigation

const PUBLIC_NAV: NavLink[] = [
  { kind: 'hash',  label: 'Inicio',         hash: 'inicio' },
  { kind: 'route', label: 'Tienda',         to: '/tienda' },
  { kind: 'hash',  label: 'Kits',           hash: 'kits' },
  { kind: 'hash',  label: 'Guía',           hash: 'guia' },
  { kind: 'hash',  label: 'Distribuidores', hash: 'distribuidores' },
  { kind: 'hash',  label: 'FAQ',            hash: 'faq' },
];

const ADMIN_NAV: { label: string; to: string; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', to: '/admin',  icon: LayoutDashboard },
  { label: 'Pedidos',   to: '/orders', icon: ClipboardList },
];

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wobble, setWobble] = useState(false);
  const [dropping, setDropping] = useState(false);

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
    setDropping(true);
    const t1 = setTimeout(() => setWobble(false), 750);
    const t2 = setTimeout(() => setDropping(false), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [splashTick]);

  // The home page has a dark hero, so a transparent header reads as white text
  // on dark backdrop. Anywhere else the header MUST be solid; otherwise white
  // text on a white page disappears.
  const solid = !isHome || scrolled;

  const navLinkClass = cn(
    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
    solid
      ? 'text-neutral-700 hover:text-brand hover:bg-neutral-100'
      : 'text-white/90 hover:text-white hover:bg-white/10',
  );

  const adminLinkClass = cn(
    'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors',
    solid
      ? 'text-brand hover:text-brand-hover hover:bg-brand/5'
      : 'text-[#00A3D6] hover:text-white hover:bg-white/10',
  );

  // Render hash anchors as anchors on the home page (instant in-page jump) and
  // as Links to "/#hash" elsewhere (client-side navigation; ScrollToHash in
  // RootLayout handles the scroll after the home page mounts).
  const renderHashLink = (link: Extract<NavLink, { kind: 'hash' }>, mobile = false) => {
    const cls = mobile
      ? 'px-3 py-3 rounded-md font-medium text-neutral-700 hover:bg-neutral-100 hover:text-brand transition-colors'
      : navLinkClass;
    const onClick = mobile ? () => setMobileOpen(false) : undefined;

    if (isHome) {
      return (
        <a key={link.hash} href={`#${link.hash}`} className={cls} onClick={onClick}>
          {link.label}
        </a>
      );
    }
    return (
      <Link
        key={link.hash}
        to={{ pathname: '/', hash: `#${link.hash}` }}
        className={cls}
        onClick={onClick}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid
          ? 'bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs'
          : 'bg-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-3">
        {/* Logo — always a Link so it returns home from any page */}
        <Link to="/" className="shrink-0">
          <img
            src={solid ? LOGO_DARK : LOGO_LIGHT}
            alt="Pooled"
            className="h-12 md:h-[12.5rem] w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {PUBLIC_NAV.map((l) =>
            l.kind === 'route' ? (
              <Link key={l.to} to={l.to} className={navLinkClass}>
                {l.label}
              </Link>
            ) : (
              renderHashLink(l)
            ),
          )}

          {isAdmin &&
            ADMIN_NAV.map((item) => (
              <Link key={item.to} to={item.to} className={adminLinkClass}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            aria-label="Abrir carrito"
            className={cn(
              'relative overflow-visible',
              solid ? 'text-neutral-700 hover:text-brand' : 'text-white hover:bg-white/10 hover:text-white',
            )}
          >
            <ShoppingCart className={cn('h-5 w-5', wobble && 'animate-cart-wobble')} />

            {/* Drop falling into the cart icon when an item is added */}
            <AnimatePresence>
              {dropping && (
                <motion.span
                  key={`drop-${splashTick}`}
                  initial={{ y: -20, opacity: 0, scale: 0.7 }}
                  animate={{
                    y: 0,
                    opacity: [0, 1, 1, 0],
                    scale: [0.7, 1, 1, 0.4],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.55,
                    times: [0, 0.25, 0.7, 1],
                    ease: [0.55, 0, 0.85, 1],
                  }}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand"
                  aria-hidden="true"
                >
                  <Droplet className="h-3 w-3 drop-shadow-[0_0_6px_hsl(var(--brand)/0.55)]" fill="currentColor" />
                </motion.span>
              )}
            </AnimatePresence>

            {/* Ripple at the cart center as the drop arrives */}
            <AnimatePresence>
              {dropping && (
                <motion.span
                  key={`ripple-${splashTick}`}
                  initial={{ scale: 0.4, opacity: 0.55 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.28, ease: 'easeOut' }}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-brand"
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>

            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-brand text-brand-foreground">
                {cartCount}
              </span>
            )}
          </Button>

          <UserMenu scrolled={solid} />

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menú"
                className={cn(
                  'lg:hidden',
                  solid ? 'text-neutral-700 hover:text-brand' : 'text-white hover:bg-white/10 hover:text-white',
                )}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>
                  <img src={LOGO_DARK} alt="Pooled" className="h-12 w-auto" />
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-8 flex flex-col gap-1">
                {PUBLIC_NAV.map((l) =>
                  l.kind === 'route' ? (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-3 rounded-md font-medium text-neutral-700 hover:bg-neutral-100 hover:text-brand transition-colors"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    renderHashLink(l, true)
                  ),
                )}

                {isAdmin && (
                  <>
                    <hr className="my-2 border-neutral-200" />
                    {ADMIN_NAV.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-3 rounded-md font-medium text-brand hover:bg-brand/5 transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
