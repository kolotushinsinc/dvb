'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCategories } from '@/contexts/CategoriesContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, Eye, Filter, X, Search } from 'lucide-react';
import { UniversalFilters } from '@/components/catalog/UniversalFilters';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, Category } from '@/types/product';
import { FadeIn, SlideIn } from '@/components/ui/Animation';
import { Loader } from '@/components/ui/Loader';
import { ErrorDisplay, NetworkError } from '@/components/ErrorDisplay';
import { AuthModal } from '@/components/ui/AuthModal';
import { ProductQuickView } from '@/components/product/ProductQuickView';

const SalePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { categories: categoriesState } = useCategories();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('discount');
  const { toggleFavorite, isFavorite, isLoggedIn, showAuthModal, setShowAuthModal } = useFavorites();

  // Load products on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Загружаем товары
        const productsResponse = await api.products.getAll();
        
        console.log('Products response:', productsResponse);
        
        // Получаем все товары из ответа API
        let allProducts = [];
        
        // Приводим productsResponse к типу any для проверки разных форматов ответа
        const productsResponseAny = productsResponse as any;
        
        // Проверяем, что productsResponseAny не null и не undefined
        if (!productsResponseAny) {
          console.error('Products response is null or undefined');
          setProducts([]);
          setFilteredProducts([]);
          setError('Ошибка загрузки товаров');
          setLoading(false);
          return;
        }
        
        // Формат из api.products.getAll: { data: [...], summary: {...} }
        if (productsResponseAny && productsResponseAny.data && Array.isArray(productsResponseAny.data)) {
          allProducts = productsResponseAny.data;
          console.log('Using api.products.getAll format');
        }
        // Формат 1: { success: true, data: { products: [...], pagination: {...} } }
        else if (productsResponseAny &&
            productsResponseAny.success === true &&
            productsResponseAny.data &&
            productsResponseAny.data.products &&
            Array.isArray(productsResponseAny.data.products)) {
          allProducts = productsResponseAny.data.products;
          console.log('Using nested data.products format');
        }
        // Формат 2: { products: [...], pagination: {...} }
        else if (productsResponseAny &&
                 productsResponseAny.products &&
                 Array.isArray(productsResponseAny.products)) {
          allProducts = productsResponseAny.products;
          console.log('Using direct products format');
        }
        // Формат 3: { data: [...] }
        else if (productsResponseAny &&
                 productsResponseAny.data &&
                 Array.isArray(productsResponseAny.data)) {
          allProducts = productsResponseAny.data;
          console.log('Using direct data format');
        }
        // Формат 4: Прямой массив товаров
        else if (Array.isArray(productsResponseAny)) {
          allProducts = productsResponseAny;
          console.log('Using direct array format');
        }
        // Если ни один формат не распознан
        else {
          console.error('API response format is not recognized:', productsResponse);
          setProducts([]);
          setFilteredProducts([]);
          setError('Ошибка загрузки товаров');
          setLoading(false);
          return;
        }
        
        // Фильтруем только товары со скидкой
        const saleProducts = allProducts.filter((product: any) => product.isOnSale);
        
        // Проверяем, что товары загружены
        if (!saleProducts || saleProducts.length === 0) {
          console.warn('No sale products found in API response');
          setProducts([]);
          setFilteredProducts([]);
          setError('Товары со скидкой не найдены');
          setLoading(false);
          return;
        }
        
        // Сохраняем все товары в состояние
        console.log('Setting products state with:', saleProducts.length, 'sale products');
        setProducts(saleProducts);
        
        // Изначально показываем все товары без фильтрации
        console.log('Setting filteredProducts state with all sale products');
        setFilteredProducts([...saleProducts]);
        
        // Убедимся, что при загрузке страницы ни одна категория не выбрана
        setSelectedCategories([]);
        
        console.log('All sale products loaded:', saleProducts.length);
        console.log('Active categories:', categoriesState.length);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить товары');
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Используем категории из состояния, если они загружены
  const categories = categoriesState.map(category => ({
    id: category._id,
    slug: category.slug,
    name: category.name,
    count: products.filter(p => p.categoryId && p.categoryId._id === category._id).length
  }));

  const countries = Array.from(
    new Set(products.map(p => p.country).filter(Boolean))
  ).map(country => ({
    id: country,
    name: country,
    count: products.filter(p => p.country === country).length
  }));

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
  };

  const handleCategoryClick = (categorySlug: string) => {
    // Find the category by slug
    const category = categoriesState.find(c => c.slug === categorySlug);
    if (category) {
      // If this category is already selected, deselect it (show all products)
      // If it's not selected, select only this category (show products from this category only)
      if (selectedCategories.includes(category._id)) {
        // Deselect this category to show all products
        setSelectedCategories([]);
      } else {
        // Select only this category
        setSelectedCategories([category._id]);
      }
    }
  };

  const handleCountryChange = (countryId: string, checked: boolean) => {
    setSelectedCountries(prev => 
      checked ? [...prev, countryId] : prev.filter(id => id !== countryId)
    );
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

  const calculateDiscountPercentage = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Apply filters
  const applyFilters = () => {
    console.log('Applying filters with selectedCategories:', selectedCategories);
    console.log('Applying filters with products:', products);
    console.log('Applying filters with priceRange:', priceRange);
    console.log('Applying filters with selectedCountries:', selectedCountries);
    
    // Если нет товаров, выходим
    if (!products || products.length === 0) {
      console.log('No products to filter');
      setFilteredProducts([]);
      return;
    }
    
    let filtered = products.filter(product => {
      // Проверка цены
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Если ни одна категория не выбрана, показываем все товары
      // Если выбраны категории, показываем только товары из выбранных категорий
      let categoryMatch = true;
      if (selectedCategories.length > 0) {
        // Проверяем categoryId
        if (product.categoryId && product.categoryId._id) {
          categoryMatch = selectedCategories.includes(product.categoryId._id);
          console.log(`Product ${product.name}: categoryId=${product.categoryId._id}, categoryMatch=${categoryMatch}`);
        }
        // Проверяем category (альтернативный формат)
        else if (product.category && product.category._id) {
          categoryMatch = selectedCategories.includes(product.category._id);
          console.log(`Product ${product.name}: category._id=${product.category._id}, categoryMatch=${categoryMatch}`);
        }
        // Если у товара нет категории, он не проходит фильтрацию
        else {
          categoryMatch = false;
          console.log(`Product ${product.name}: no category, categoryMatch=${categoryMatch}`);
        }
      } else {
        console.log(`Product ${product.name}: no category filter applied, categoryMatch=${categoryMatch}`);
      }
      
      // Проверка страны
      const countryMatch = selectedCountries.length === 0 || (product.country && selectedCountries.includes(product.country));
      console.log(`Product ${product.name}: country=${product.country}, selectedCountries=${selectedCountries}, countryMatch=${countryMatch}`);
      
      console.log(`Product ${product.name}: final result - priceMatch=${priceMatch}, categoryMatch=${categoryMatch}, countryMatch=${countryMatch}`);
      
      return priceMatch && categoryMatch && countryMatch;
    });

    console.log('Filtered products before sorting:', filtered);

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        filtered = filtered.sort((a, b) => {
          const discountA = a.originalPrice ? calculateDiscountPercentage(a.originalPrice, a.price) : 0;
          const discountB = b.originalPrice ? calculateDiscountPercentage(b.originalPrice, b.price) : 0;
          return discountB - discountA;
        });
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'new':
        filtered = filtered.sort((a, b) => (b.isBrandNew ? 1 : 0) - (a.isBrandNew ? 1 : 0));
        break;
      default: // popularity
        filtered = filtered.sort((a, b) =>
          ((b.rating || 0) * (b.reviewsCount || 0)) - ((a.rating || 0) * (a.reviewsCount || 0))
        );
    }

    console.log('Final filtered products:', filtered);
    setFilteredProducts([...filtered]); // Create a new array to ensure reactivity
  };

  // Apply filters when dependencies change
  useEffect(() => {
    console.log('useEffect triggered for applying filters');
    console.log('Products length:', products.length);
    console.log('Selected categories:', selectedCategories);
    console.log('Selected countries:', selectedCountries);
    console.log('Price range:', priceRange);
    console.log('Sort by:', sortBy);
    
    if (products.length > 0) {
      console.log('Applying filters...');
      applyFilters();
    } else {
      console.log('No products to filter');
    }
  }, [selectedCategories, selectedCountries, priceRange, sortBy, products]);
  
  // Debugging effect to track filteredProducts
  useEffect(() => {
    console.log('Filtered products updated:', filteredProducts);
    console.log('Filtered products length:', filteredProducts?.length);
  }, [filteredProducts]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setPriceRange([0, 15000]);
    setSortBy('discount');
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-block mb-4">
            <span className="text-sm text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-3 py-1 rounded-full">
              Специальные предложения
            </span>
          </div>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-charcoal-800 mb-4 tracking-tight">
            Распродажа <span className="premium-text">коллекция</span>
            {selectedCategories.length > 0 && (
              <span className="text-2xl font-normal text-charcoal-600 ml-4">
                ({categories.find(c => selectedCategories.includes(c.id))?.name})
              </span>
            )}
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl md:mx-0 mx-auto">
            Найдено товаров: <span className="font-semibold">{filteredProducts && Array.isArray(filteredProducts) ? filteredProducts.length : 0}</span>
            {selectedCategories.length === 0 && (
              <span className="ml-2">(показаны все категории)</span>
            )}
          </p>
        </div>

        <div className="flex gap-8">

          {/* Universal Filters Component */}
          <UniversalFilters
            categories={categoriesState}
            products={products}
            onFilterChange={(filters) => {
              setSelectedCategories(filters.selectedCategories);
              setPriceRange(filters.priceRange);
              setSelectedCountries(filters.selectedCountries);
              applyFilters();
            }}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-charcoal-600">Сортировать:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 border-secondary-200 bg-secondary-50 focus:border-primary-300 focus:ring-primary-200 focus:bg-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">По размеру скидки</SelectItem>
                    <SelectItem value="price-low">Цена: по возрастанию</SelectItem>
                    <SelectItem value="price-high">Цена: по убыванию</SelectItem>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                    <SelectItem value="new">Сначала новинки</SelectItem>
                    <SelectItem value="popularity">По популярности</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Apply Filters Button */}
              <Button 
                onClick={applyFilters} 
                className="lg:hidden bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 shadow-lg hover:shadow-xl"
              >
                Применить фильтры
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                          <img
                            src={product.mainImage || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col space-y-2">
                          {product.isBrandNew && (
                            <span className="bg-gradient-to-r from-gold-400 to-gold-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                              НОВОЕ
                            </span>
                          )}
                          {product.isOnSale && product.originalPrice && (
                            <span className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                              -{calculateDiscountPercentage(product.originalPrice, product.price)}%
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
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
                        <div className="flex items-center justify-between mb-2">
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
                      Товары со скидкой не найдены
                    </h3>
                    <p className="text-charcoal-600 mb-8">
                      Попробуйте изменить параметры фильтрации или обновить страницу
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

export default SalePage;
