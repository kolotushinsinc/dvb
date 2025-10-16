'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, Eye, Filter, X } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, Category } from '@/types/product';
import { FadeIn, SlideIn } from '@/components/ui/Animation';
import { PageLoader, ProductCardSkeleton } from '@/components/ui/Loader';
import { ErrorDisplay, NetworkError } from '@/components/ErrorDisplay';
import { AuthModal } from '@/components/ui/AuthModal';
import { ProductQuickView } from '@/components/product/ProductQuickView';

const SalePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoriesState, setCategoriesState] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('discount');
  const [showFilters, setShowFilters] = useState(false);
  const { toggleFavorite, isFavorite, isLoggedIn, showAuthModal, setShowAuthModal } = useFavorites();

  // Load products on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Загружаем категории и товары параллельно
        const [categoriesResponse, productsResponse] = await Promise.all([
          api.categories.getAll(),
          api.products.getAll()
        ]);
        
        console.log('Categories response:', categoriesResponse);
        console.log('Products response:', productsResponse);
        
        // Фильтруем только активные категории
        const activeCategories = categoriesResponse.filter(c => c.isActive);
        
        // Сохраняем все активные категории в состояние
        setCategoriesState(activeCategories);
        
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
        console.log('Active categories:', activeCategories.length);
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

  const FilterSection = () => (
    <div className="space-y-8">
      {/* Price Range */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-4">Цена</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={15000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-4">Категории</h3>
        <div className="space-y-3">
          {categories.map(category => {
            const categoryFromState = categoriesState.find(c => c._id === category.id);
            return (
              <div key={category.id} className="flex items-center space-x-3">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                />
                <label
                  htmlFor={category.id}
                  className="flex-1 text-sm cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // Use the improved category click handler
                    if (categoryFromState) {
                      handleCategoryClick(categoryFromState.slug);
                    }
                  }}
                >
                  {category.name}
                  <span className="text-gray-400 ml-1">({category.count})</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Countries */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-4">Страна производитель</h3>
        <div className="space-y-3">
          {countries.map(country => (
            <div key={country.id} className="flex items-center space-x-3">
              <Checkbox
                id={country.id || ''}
                checked={country.id ? selectedCountries.includes(country.id) : false}
                onCheckedChange={(checked) => country.id && handleCountryChange(country.id, checked as boolean)}
              />
              <label
                htmlFor={country.id || ''}
                className="flex-1 text-sm cursor-pointer"
              >
                {country.name}
                <span className="text-gray-400 ml-1">({country.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full"
      >
        Очистить фильтры
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Распродажа
            {selectedCategories.length > 0 && (
              <span className="text-xl font-normal text-gray-600 ml-4">
                ({categories.find(c => selectedCategories.includes(c.id))?.name})
              </span>
            )}
          </h1>
          <p className="text-lg text-gray-600">
            Найдено товаров: {filteredProducts && Array.isArray(filteredProducts) ? filteredProducts.length : 0}
            {selectedCategories.length === 0 && (
              <span className="ml-2">(показаны все категории)</span>
            )}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full shadow-lg"
              size="lg"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'fixed inset-0 z-40 bg-white p-6 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0' : 'hidden'} lg:block w-full lg:w-80 lg:flex-shrink-0`}>
            {showFilters && (
              <div className="lg:hidden flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-bold">Фильтры</h2>
                <Button
                  onClick={() => setShowFilters(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}
            <div className="lg:bg-white lg:rounded-2xl lg:p-6 lg:shadow-sm">
              <FilterSection />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Сортировать:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
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
              <Button onClick={applyFilters} className="lg:hidden">
                Применить фильтры
              </Button>
            </div>

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
                          <img
                            src={product.mainImage || '/placeholder-product.jpg'}
                            alt={product.name}
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
                          {product.isOnSale && product.originalPrice && (
                            <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-semibold">
                              -{calculateDiscountPercentage(product.originalPrice, product.price)}%
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
                    Товары со скидкой не найдены
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

export default SalePage;