import { Hero } from '@/components/site/Hero';
import { FeaturedProducts } from '@/components/site/FeaturedProducts';
import { BuyingWizard } from '@/components/site/BuyingWizard';
import { KitsSection } from '@/components/site/KitsSection';
import { DistributorsSection } from '@/components/site/DistributorsSection';
import { InstagramFeed } from '@/components/site/InstagramFeed';
import { FAQ } from '@/components/site/FAQ';
import { Footer } from '@/components/site/Footer';
import { WaveDivider } from '@/components/site/WaveDivider';
import { AdminRoleToggle } from '@/components/dev/AdminRoleToggle';

const Index = () => {
  return (
    <>
      <Hero />
      <WaveDivider fillClass="text-white" className="-mt-[60px] relative z-10" />
      <FeaturedProducts />
      <WaveDivider bgClass="bg-white" fillClass="text-slate-50" />
      <BuyingWizard />
      <WaveDivider bgClass="bg-slate-50" fillClass="text-white" />
      <KitsSection />
      <DistributorsSection />
      <InstagramFeed />
      <FAQ />
      <Footer />
      <AdminRoleToggle />
    </>
  );
};

export default Index;
