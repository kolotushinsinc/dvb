import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryPageContent from './CategoryPageContent';

// Функция для генерации статических параметров для динамических маршрутов
export async function generateStaticParams() {
  // Возвращаем заранее определенные категории для статической генерации
  return [
    { category: 'glasses' },
    { category: 'clothing' },
    { category: 'shoes' },
    { category: 'accessories' },
  ];
}

export default function CategoryPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      <Suspense fallback={
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      }>
        <CategoryPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}