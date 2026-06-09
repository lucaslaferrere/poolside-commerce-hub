import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/site/Header';
import { AnnouncementBar } from '@/components/site/AnnouncementBar';
import { CartDrawer } from '@/components/site/CartDrawer';
import { WhatsAppFAB } from '@/components/site/WhatsAppFAB';
import { WaterSplash } from '@/components/site/WaterSplash';

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Scrolls to an `#anchor` after a Link navigation. Needed because React Router
 * does not auto-scroll to a hash like a browser would on a real anchor click.
 */
function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    const id = hash.slice(1);
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    // Defer one frame so the target page has mounted
    const t = window.setTimeout(tryScroll, 80);
    return () => window.clearTimeout(t);
  }, [pathname, hash]);
  return null;
}

export function RootLayout({ children }: RootLayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <ScrollToHash />
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <CartDrawer />
      {isHomePage && (
        <>
          <WhatsAppFAB />
          <WaterSplash />
        </>
      )}
    </>
  );
}
