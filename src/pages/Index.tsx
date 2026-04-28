import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { FeaturedProducts } from '@/components/site/FeaturedProducts';
import { BuyingWizard } from '@/components/site/BuyingWizard';
import { KitsSection } from '@/components/site/KitsSection';
import { DistributorsSection } from '@/components/site/DistributorsSection';
import { InstagramFeed } from '@/components/site/InstagramFeed';
import { FAQ } from '@/components/site/FAQ';
import { Footer } from '@/components/site/Footer';
import { CartDrawer } from '@/components/site/CartDrawer';
import { WhatsAppFAB } from '@/components/site/WhatsAppFAB';
import { WaveDivider } from '@/components/site/WaveDivider';
import { WaterSplash } from '@/components/site/WaterSplash';
import { AdminRoleToggle } from '@/components/dev/AdminRoleToggle';

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <WaveDivider fillClass="text-background" className="-mt-[60px] relative z-10" />
      <FeaturedProducts />
      <BuyingWizard />
      <KitsSection />
      <DistributorsSection />
      <InstagramFeed />
      <FAQ />
      <Footer />
      <CartDrawer />
      <WhatsAppFAB />
      <WaterSplash />
      <AdminRoleToggle />
    </main>
  );
};

export default Index;
