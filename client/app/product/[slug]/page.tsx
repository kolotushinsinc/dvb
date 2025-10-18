import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader } from '@/components/ui/Loader';
import ProductPageContent from '@/components/product/ProductPageContent';

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      <Header />
      <Suspense fallback={<Loader variant="page" size="xl" text="Загрузка товара..." />}>
        <ProductPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
