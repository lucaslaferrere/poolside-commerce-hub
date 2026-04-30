import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/site/Header';
import { CartDrawer } from '@/components/site/CartDrawer';
import { WhatsAppFAB } from '@/components/site/WhatsAppFAB';
import { WaterSplash } from '@/components/site/WaterSplash';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const location = useLocation();

  // Only show WhatsApp FAB and water splash on home page
  const isHomePage = location.pathname === '/';

  return (
    <>
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

