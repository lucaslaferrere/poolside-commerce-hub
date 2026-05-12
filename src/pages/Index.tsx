import { Hero } from '@/components/site/Hero';
import { FeaturedProducts } from '@/components/site/FeaturedProducts';
import { BuyingWizard } from '@/components/site/BuyingWizard';
import { KitsSection } from '@/components/site/KitsSection';
import { DistributorsSection } from '@/components/site/DistributorsSection';
import { InstagramFeed } from '@/components/site/InstagramFeed';
import { WarrantySection } from '@/components/site/WarrantySection';
import { FAQ } from '@/components/site/FAQ';
import { Footer } from '@/components/site/Footer';
import { AdminRoleToggle } from '@/components/dev/AdminRoleToggle';

const Index = () => {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <BuyingWizard />
      <KitsSection />
      <DistributorsSection />
      <InstagramFeed />
      <WarrantySection />
      <FAQ />
      <Footer />
      <AdminRoleToggle />
    </>
  );
};

export default Index;
