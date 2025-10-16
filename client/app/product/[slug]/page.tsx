import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/Loader';
import ProductPageContent from '@/components/product/ProductPageContent';

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      <Suspense fallback={<PageLoader />}>
        <ProductPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}