import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryPageContent from './CategoryPageContent';

// Функция для генерации статических параметров для динамических маршрутов
export async function generateStaticParams() {
  try {
    // Попробуем загрузить категории из API
    const response = await fetch('https://api.dvberry.ru/api/categories');
    const data = await response.json();
    
    if (data.success && Array.isArray(data.data?.categories)) {
      return data.data.categories
        .filter((category: any) => category.isActive)
        .map((category: any) => ({
          category: category.slug
        }));
    }
  } catch (error) {
    console.error('Failed to load categories for static generation:', error);
  }
  
  // Возвращаем fallback категории если API недоступно
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