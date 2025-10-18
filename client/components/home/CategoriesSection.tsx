'use client';

import { Button } from '@/components/ui/button';
import { Eye, Shirt, Footprints, Gem, Percent, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCategories } from '@/contexts/CategoriesContext';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Category } from '@/types/product';

const CategoriesSection = () => {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal-800 mb-4 tracking-tight">
              Наши <span className="premium-text">категории</span>
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Откройте для себя уникальную коллекцию премиальных товаров со всего мира
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-secondary-100">
                <div className="h-56 bg-secondary-100 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-6 bg-secondary-100 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-secondary-100 rounded w-3/4 animate-pulse"></div>
                <div className="h-10 mt-6 flex justify-between items-center">
                  <div className="h-4 bg-secondary-100 rounded w-1/3 animate-pulse"></div>
                  <div className="h-10 w-10 bg-secondary-100 rounded-full animate-pulse"></div>
                </div>
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
          color: 'from-primary-400 to-primary-600',
          textColor: 'text-primary-500',
          borderColor: 'border-primary-200',
          hoverColor: 'group-hover:text-primary-600',
          iconBg: 'bg-primary-100',
          iconColor: 'text-primary-600',
        };
      case 'clothing':
        return {
          icon: Shirt,
          color: 'from-gold-400 to-gold-600',
          textColor: 'text-gold-500',
          borderColor: 'border-gold-200',
          hoverColor: 'group-hover:text-gold-600',
          iconBg: 'bg-gold-100',
          iconColor: 'text-gold-600',
        };
      case 'shoes':
        return {
          icon: Footprints,
          color: 'from-charcoal-600 to-charcoal-800',
          textColor: 'text-charcoal-600',
          borderColor: 'border-charcoal-200',
          hoverColor: 'group-hover:text-charcoal-800',
          iconBg: 'bg-charcoal-100',
          iconColor: 'text-charcoal-600',
        };
      case 'accessories':
        return {
          icon: Gem,
          color: 'from-bronze-400 to-bronze-600',
          textColor: 'text-bronze-500',
          borderColor: 'border-bronze-200',
          hoverColor: 'group-hover:text-bronze-600',
          iconBg: 'bg-bronze-100',
          iconColor: 'text-bronze-600',
        };
      case 'sale':
        return {
          icon: Percent,
          color: 'from-accent-400 to-accent-600',
          textColor: 'text-accent-500',
          borderColor: 'border-accent-200',
          hoverColor: 'group-hover:text-accent-600',
          iconBg: 'bg-accent-100',
          iconColor: 'text-accent-600',
        };
      case 'new':
        return {
          icon: Sparkles,
          color: 'from-primary-400 to-gold-500',
          textColor: 'text-primary-500',
          borderColor: 'border-primary-200',
          hoverColor: 'group-hover:text-gold-500',
          iconBg: 'bg-primary-100',
          iconColor: 'text-gold-500',
        };
      default:
        return {
          icon: Eye,
          color: 'from-primary-400 to-primary-600',
          textColor: 'text-primary-500',
          borderColor: 'border-primary-200',
          hoverColor: 'group-hover:text-primary-600',
          iconBg: 'bg-primary-100',
          iconColor: 'text-primary-600',
        };
    };
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal-800 mb-4 tracking-tight">
            Наши <span className="premium-text">категории</span>
          </h2>
          <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
            Откройте для себя уникальную коллекцию премиальных товаров со всего мира
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((category) => {
            const { 
              icon: IconComponent, 
              color, 
              textColor, 
              borderColor, 
              hoverColor,
              iconBg,
              iconColor
            } = getCategoryConfig(category.slug);
            
            const href = category.slug === 'sale' 
              ? '/sale' 
              : category.slug === 'new'
                ? '/catalog/new'
                : `/catalog/${category.slug}`;

            return (
              <Link key={category._id} href={href}>
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-secondary-100 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 premium-shadow">
                  {/* Background Image */}
                  <div className="h-56 relative">
                    <OptimizedImage
                      src={category.image || 'https://images.pexels.com/photos/1895943/pexels-photo-1895943.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={category.name}
                      width={500}
                      height={280}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-70 group-hover:opacity-80 transition-opacity duration-500`} />
                    
                    {/* Icon */}
                    <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                    
                    {/* Category Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="font-heading text-2xl font-bold text-white mb-1 drop-shadow-md">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-charcoal-600 mb-6 line-clamp-2 h-12">
                      {category.description || 'Просмотреть эксклюзивную коллекцию товаров'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${textColor} ${hoverColor} transition-colors duration-300`}>
                        Перейти в каталог
                      </span>
                      <div className={`w-10 h-10 rounded-full ${iconBg} group-hover:bg-gradient-to-r ${color} flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md`}>
                        <span className={`text-lg ${iconColor} group-hover:text-white transition-colors duration-300`}>→</span>
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
