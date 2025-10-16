'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, Eye } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCategories } from '@/hooks/useCategories';
import { useProducts, useFilteredProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';
import Link from 'next/link';
import { Product, Category } from '@/types/product';
import { SlideIn } from '@/components/ui/Animation';
import { PageLoader, ProductCardSkeleton } from '@/components/ui/Loader';
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
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Каталог товаров
          </h1>
          <p className="text-lg text-gray-600">
            Найдено товаров: {filteredProducts && Array.isArray(filteredProducts) ? filteredProducts.length : 0}
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <ProductCardSkeleton count={6} />
              ) : error ? (
                <div className="col-span-full">
                  <NetworkError onRetry={() => window.location.reload()} />
                </div>
              ) : filteredProducts && Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <SlideIn key={product._id} delay={index * 50}>
                    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                      {/* Product Image */}
                      <div className="relative overflow-hidden bg-gray-100 h-64">
                        <Link href={`/product/${product.slug}`}>
                          <OptimizedImage
                            src={product.mainImage || '/placeholder-product.jpg'}
                            alt={product.name}
                            width={400}
                            height={256}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col space-y-2">
                          {product.isBrandNew && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              NEW
                            </span>
                          )}
                          {product.isOnSale && (
                            <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-semibold">
                              -20%
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                          <Button
                            size="icon"
                            variant="secondary"
                            className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md ${
                              isFavorite(product._id) ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'
                            }`}
                            onClick={(e) => handleToggleFavorite(product, e)}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite(product._id) ? 'fill-current' : ''}`} />
                          </Button>
                          <ProductQuickView product={product}>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md text-gray-600 hover:text-blue-500"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </ProductQuickView>
                        </div>

                        {/* Country Origin */}
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                            {product.country}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                            {product.categoryId ? product.categoryId.name : (product.category ? product.category.name : '')}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">{product.rating || 0}</span>
                            <span className="text-sm text-gray-400">({product.reviewsCount || 0})</span>
                          </div>
                        </div>

                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-heading text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-primary">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SlideIn>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    Товары не найдены
                  </p>
                  <p className="text-gray-400 text-sm">
                    Попробуйте изменить параметры фильтрации или обновить страницу
                  </p>
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