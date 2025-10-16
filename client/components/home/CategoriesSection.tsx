'use client';

import { Button } from '@/components/ui/button';
import { Eye, Shirt, Footprints, Gem, Percent, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Category } from '@/types/product';

const CategoriesSection = () => {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">
              Наши категории
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Откройте для себя уникальную коллекцию товаров со всего мира
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6">
                <div className="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  // Определяем иконки и стили для категорий
  const getCategoryConfig = (id: string) => {
    switch (id) {
      case 'glasses':
        return {
          icon: Eye,
          color: 'from-primary to-indigo-700',
          textColor: 'text-primary',
        };
      case 'clothing':
        return {
          icon: Shirt,
          color: 'from-accent to-brick-600',
          textColor: 'text-accent',
        };
      case 'shoes':
        return {
          icon: Footprints,
          color: 'from-gray-700 to-gray-900',
          textColor: 'text-gray-700',
        };
      case 'accessories':
        return {
          icon: Gem,
          color: 'from-purple-600 to-purple-800',
          textColor: 'text-purple-600',
        };
      case 'sale':
        return {
          icon: Percent,
          color: 'from-red-500 to-red-700',
          textColor: 'text-red-500',
        };
      case 'new':
        return {
          icon: Sparkles,
          color: 'from-green-500 to-green-700',
          textColor: 'text-green-500',
        };
      default:
        return {
          icon: Eye,
          color: 'from-primary to-indigo-700',
          textColor: 'text-primary',
        };
    };
  };

  return (
    <section className="py-16 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">
            Наши категории
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Откройте для себя уникальную коллекцию товаров со всего мира
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const { icon: IconComponent, color, textColor } = getCategoryConfig(category.slug);
            const href = category.slug === 'sale' 
              ? '/sale' 
              : category.slug === 'new'
                ? '/catalog/new'
                : `/catalog/${category.slug}`;

            return (
              <Link key={category._id} href={href}>
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Background Image */}
                  <div className="h-48 relative">
                    <OptimizedImage
                      src={category.image || 'https://images.pexels.com/photos/1895943/pexels-photo-1895943.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={category.name}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-80 group-hover:opacity-90 transition-opacity`} />
                    
                    {/* Icon */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-3 rounded-full">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-heading text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {category.description || 'Просмотреть товары'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${textColor}`}>
                        Перейти в каталог
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all">
                        <span className="text-sm">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;