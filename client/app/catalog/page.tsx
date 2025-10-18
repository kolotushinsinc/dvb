'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, Eye, Search } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCategories } from '@/hooks/useCategories';
import { useProducts, useFilteredProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';
import Link from 'next/link';
import { Product, Category } from '@/types/product';
import { SlideIn } from '@/components/ui/Animation';
import { Loader } from '@/components/ui/Loader';
import { NetworkError } from '@/components/ErrorDisplay';
import { AuthModal } from '@/components/ui/AuthModal';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { UniversalFilters } from '@/components/catalog/UniversalFilters';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

const CatalogPage = () => {
  const [filterState, setFilterState] = useState({
    priceRange: [0, 15000] as [number, number],
    selectedCategories: [] as string[],
    selectedFilters: {} as Record<string, string[]>,
    selectedCountries: [] as string[]
  });
  
  const { toggleFavorite, isFavorite, isLoggedIn, showAuthModal, setShowAuthModal } = useFavorites();
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading, error } = useProducts();

  // Используем товары из основного хука

  // Применяем фильтры к товарам
   const filteredProducts = useFilteredProducts(products, categories, filterState);
  
  // Сортировка удалена по просьбе пользователя
  
  // Общий индикатор загрузки
   const loading = categoriesLoading || productsLoading;

  // Логирование удалено для оптимизации производительности

  // Загружаем товары через основной хук


  const handleToggleFavorite = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      await toggleFavorite(product._id);
      const message = isFavorite(product._id) ? 'Товар удален из избранного' : 'Товар добавлен в избранное';
      toast.success(message);
    } catch (error) {
      toast.error('Не удалось добавить товар в избранное');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-block mb-4">
            <span className="text-sm text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-3 py-1 rounded-full">
              Все товары
            </span>
          </div>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-charcoal-800 mb-4 tracking-tight">
            Каталог <span className="premium-text">товаров</span>
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl md:mx-0 mx-auto">
            Найдено товаров: <span className="font-semibold">{filteredProducts && Array.isArray(filteredProducts) ? filteredProducts.length : 0}</span>
          </p>
        </div>

        <div className="flex gap-8">
          {/* Universal Filters Component */}
          <UniversalFilters
            categories={categories}
            products={products}
            onFilterChange={(filters) => setFilterState(filters)}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Controls - ВРЕМЕННО УДАЛЕН */}
            {/* Блок сортировки вызывал проблемы с отображением товаров */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-secondary-100 h-[400px] flex items-center justify-center">
                    <Loader size="lg" text="Загрузка..." />
                  </div>
                ))
              ) : error ? (
                <div className="col-span-full">
                  <NetworkError onRetry={() => window.location.reload()} />
                </div>
              ) : filteredProducts && Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <SlideIn key={product._id} delay={index * 50}>
                    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-secondary-100 premium-shadow">
                      {/* Product Image */}
                      <div className="relative overflow-hidden bg-secondary-50 h-72">
                        <Link href={`/product/${product.slug}`}>
                          <OptimizedImage
                            src={product.mainImage || '/placeholder-product.jpg'}
                            alt={product.name}
                            width={500}
                            height={280}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col space-y-2">
                          {product.isBrandNew && (
                            <span className="bg-gradient-to-r from-gold-400 to-gold-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                              NEW
                            </span>
                          )}
                          {product.isOnSale && (
                            <span className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                              -20%
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-4 right-4 flex flex-col space-y-3 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                          <Button
                            size="icon"
                            variant="secondary"
                            className={`w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl ${
                              isFavorite(product._id) 
                                ? 'text-accent-500 hover:text-accent-600 hover:scale-110 transition-all duration-300' 
                                : 'text-charcoal-600 hover:text-accent-500 hover:scale-110 transition-all duration-300'
                            }`}
                            onClick={(e) => handleToggleFavorite(product, e)}
                          >
                            <Heart className={`w-5 h-5 ${isFavorite(product._id) ? 'fill-current' : ''}`} />
                          </Button>
                          <ProductQuickView product={product}>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl text-charcoal-600 hover:text-primary-500 hover:scale-110 transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                          </ProductQuickView>
                        </div>

                        {/* Country Origin */}
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-charcoal-700 text-xs px-4 py-1.5 rounded-full font-medium shadow-sm border border-white/50">
                            {product.country}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-3 py-1 rounded-full">
                            {product.categoryId ? product.categoryId.name : (product.category ? product.category.name : '')}
                          </span>
                          <div className="flex items-center space-x-1 bg-gold-50 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                            <span className="text-sm text-charcoal-700 font-medium">{product.rating || 4.5}</span>
                            <span className="text-sm text-charcoal-500">({product.reviewsCount || 12})</span>
                          </div>
                        </div>

                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-heading text-lg font-bold text-charcoal-800 mb-3 group-hover:text-primary-500 transition-colors line-clamp-2 h-14">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-100">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-charcoal-800">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-charcoal-500 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-all">
                            <span className="text-sm text-primary-500 group-hover:text-primary-600">→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SlideIn>
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg border border-secondary-100 premium-card">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-secondary-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-charcoal-800 mb-4">
                      Товары не найдены
                    </h3>
                    <p className="text-charcoal-600 mb-8">
                      Попробуйте изменить параметры фильтрации или обновить страницу
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="border-2 border-secondary-200 hover:border-primary-300 px-6 py-2"
                    >
                      Обновить страницу
                    </Button>
                  </div>
                </div>
              )}
            </div>
        
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Для добавления товара в избранное необходимо войти в систему"
      />
      
      <Footer />
    </div>
  );
};

export default CatalogPage;
