'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, Eye, ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useFavorites } from '@/hooks/useFavorites';
import { useCategories } from '@/hooks/useCategories';
import { useProducts, useFilteredProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, Category } from '@/types/product';
import { SlideIn } from '@/components/ui/Animation';
import { Loader } from '@/components/ui/Loader';
import { AuthModal } from '@/components/ui/AuthModal';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { UniversalFilters } from '@/components/catalog/UniversalFilters';
import { LazyImage } from '@/components/ui/LazyImage';

function CategoryPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.category as string;
  const searchQuery = searchParams.get('search') || '';
  
  const [filterState, setFilterState] = useState({
    priceRange: [0, 15000] as [number, number],
    selectedCategories: [] as string[],
    selectedFilters: {} as Record<string, string[]>,
    selectedCountries: [] as string[]
  });
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite, isLoggedIn, showAuthModal, setShowAuthModal } = useFavorites();
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading } = useProducts({ category: categorySlug });
  
  // Function to clear filters
  const clearFilters = () => {
    setFilterState({
      priceRange: [0, 15000],
      selectedCategories: currentCategory ? [currentCategory._id] : [],
      selectedFilters: {},
      selectedCountries: []
    });
  };
  
  // Применяем фильтры к товарам
  const filteredProducts = useFilteredProducts(products, categories, filterState);
  
  // Фильтрация по поисковому запросу
  const searchFilteredProducts = useMemo(() => {
    if (!searchQuery) return filteredProducts;
    
    return filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredProducts, searchQuery]);
  
  // Сортировка удалена по просьбе пользователя
  
  // Проверяем существование категории
  const currentCategory = categories.find(c => c.slug === categorySlug);
  
  // Общий индикатор загрузки
  const loading = categoriesLoading || productsLoading;
  
  // Логирование удалено для оптимизации производительности
  
  useEffect(() => {
    if (categories.length > 0 && !currentCategory) {
      setError('Категория не найдена');
    } else if (currentCategory && !currentCategory.isActive) {
      setError('Категория неактивна');
    }
  }, [categories, currentCategory]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Товар добавлен в корзину!');
  };

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

  const getCategoryName = (slug: string) => {
    switch (slug) {
      case 'glasses': return 'Очки';
      case 'clothing': return 'Одежда';
      case 'shoes': return 'Обувь';
      case 'accessories': return 'Аксессуары';
      case 'sale': return 'Распродажа';
      case 'new': return 'Новинки';
      default: return slug;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
        <Loader 
          variant="page" 
          size="xl" 
          text={`Загрузка товаров категории "${getCategoryName(categorySlug)}"`}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-block mb-4">
            <span className="text-sm text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-3 py-1 rounded-full">
              Каталог
            </span>
          </div>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-charcoal-800 mb-4 tracking-tight">
            {getCategoryName(categorySlug)} <span className="premium-text">коллекция</span>
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl md:mx-0 mx-auto">
            Найдено товаров: <span className="font-semibold">{searchFilteredProducts.length}</span>
            {searchQuery && (
              <span className="ml-2">по запросу "<span className="font-semibold">{searchQuery}</span>"</span>
            )}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Universal Filters Component */}
          <UniversalFilters
            categories={categories}
            products={products}
            onFilterChange={(filters) => setFilterState(filters)}
            initialCategory={currentCategory?._id}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Controls - ВРЕМЕННО УДАЛЕН */}
            {/* Блок сортировки вызывал проблемы с отображением товаров */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {searchFilteredProducts.map((product) => (
                <SlideIn key={product._id}>
                  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-secondary-100 premium-shadow">
                      {/* Product Image */}
                      <div className="relative overflow-hidden bg-secondary-50 h-72">
                        <LazyImage
                          src={product.mainImage || '/placeholder-product.jpg'}
                          thumbnailSrc={product.thumbnailUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
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
                          <h3 className="font-heading text-lg font-bold text-charcoal-800 mb-3 group-hover:text-primary-500 transition-colors line-clamp-2 h-14 cursor-pointer">
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
                          <Button
                            size="icon"
                            className="rounded-full bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            onClick={(e) => handleAddToCart(product, e)}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                </SlideIn>
              ))}
            </div>

            {searchFilteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-secondary-100 premium-card">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-secondary-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal-800 mb-4">
                    По вашим критериям ничего не найдено
                  </h3>
                  <p className="text-charcoal-600 mb-8">
                    Попробуйте изменить параметры фильтрации или выбрать другую категорию товаров
                  </p>
                  <Button 
                    variant="outline"
                    onClick={clearFilters}
                    className="border-2 border-secondary-200 hover:border-primary-300 px-6 py-2"
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Для добавления товара в избранное необходимо войти в систему"
      />
    </div>
  );
}

export default CategoryPageContent;
