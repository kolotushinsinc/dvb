import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import PopularProducts from '@/components/home/PopularProducts';
import BenefitsSection from '@/components/home/BenefitsSection';
import Footer from '@/components/layout/Footer';
import { FadeIn, SlideIn } from '@/components/ui/Animation';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <FadeIn>
          <HeroSection />
        </FadeIn>
        <SlideIn delay={200}>
          <CategoriesSection />
        </SlideIn>
        <SlideIn delay={400}>
          <PopularProducts />
        </SlideIn>
        <FadeIn delay={600}>
          <BenefitsSection />
        </FadeIn>
      </main>
      <FadeIn delay={800}>
        <Footer />
      </FadeIn>
    </div>
  );
}