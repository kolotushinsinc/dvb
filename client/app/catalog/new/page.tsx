
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, Eye, ShoppingCart, Filter, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, Category } from '@/types/product';
import { FadeIn, SlideIn } from '@/components/ui/Animation';
import { PageLoader, ProductCardSkeleton } from '@/components/ui/Loader';
import { ErrorDisplay, NetworkError } from '@/components/ErrorDisplay';

const NewProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoriesState, setCategoriesState] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const { addItem } = useCart();

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Сначала загружаем все категории
        const categoriesResponse = await api.categories.getAll();
        console.log('Categories response:', categoriesResponse);
        const activeCategories = categoriesResponse.filter(c => c.isActive);
        const activeCategorySlugs = activeCategories.map(c => c.slug);
        
        // Сохраняем категории в состояние
        setCategoriesState(activeCategories);
        
        // Загружаем все товары
        const productsResponse = await api.products.getAll();
        console.log('Products response:', productsResponse);
        const allProducts = productsResponse.data;
        
        // Фильтруем товары по активным категориям и только новинки
        console.log('Active category slugs:', activeCategorySlugs);
        console.log('All products:', allProducts);
        const filteredProducts = allProducts.filter(product =>
          product.category && activeCategorySlugs.includes(product.category.slug) && product.isBrandNew
        );
        console.log('Filtered products:', filteredProducts);
        
        setProducts(filteredProducts);
        setFilteredProducts(filteredProducts);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить товары');
        console.error('Product load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Используем категории из состояния, если они загружены
  const categories = Array.from(
    new Set(products.map(p => p.category?.slug).filter(Boolean))
  ).map(categorySlug => {
    const categoryData = categoriesState.find(c => c.slug === categorySlug);
    return {
      id: categorySlug,
      name: categoryData?.name || categorySlug,
      count: products.filter(p => p.category?.slug === categorySlug).length
    };
  });

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

  const handleCountryChange = (countryId: string, checked: boolean) => {
    setSelectedCountries(prev => 
      checked ? [...prev, countryId] : prev.filter(id => id !== countryId)
    );
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Товар добавлен в корзину!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = products.filter(product => {
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      const categoryMatch = selectedCategories.length === 0 || (product.category && selectedCategories.includes(product.category.slug));
      const countryMatch = selectedCountries.length === 0 || (product.country && selectedCountries.includes(product.country));
      
      return priceMatch && categoryMatch && countryMatch;
    });

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'new':
        filtered = filtered.sort((a, b) => (b.isBrandNew ? 1 : 0) - (a.isBrandNew ? 1 : 0));
        break;
      default: // popularity
        filtered = filtered.sort((a, b) =>
          ((b.rating || 0) * (b.reviews?.length || 0)) - ((a.rating || 0) * (a.reviews?.length || 0))
        );
    }

    setFilteredProducts(filtered);
  };

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [selectedCategories, selectedCountries, priceRange, sortBy, filteredProducts]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setPriceRange([0, 15000]);
    setSortBy('popularity');
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
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-3">
              <Checkbox
                id={category.id}
                checked={category.id ? selectedCategories.includes(category.id) : false}
                onCheckedChange={(checked) => category.id && handleCategoryChange(category.id, checked as boolean)}
              />
              <label
                htmlFor={category.id}
                className="flex-1 text-sm cursor-pointer"
              >
                {category.name}
                <span className="text-gray-400 ml-1">({category.count})</span>
              </label>
            </div>
          ))}
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
            Новинки
          </h1>
          <p className="text-lg text-gray-600">
            Найдено товаров: {filteredProducts.length}
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
          <div className={`${showFilters ? 'fixed inset-0 z-40 bg-white p-6 overflow-y-auto' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
            <div className="lg:hidden flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Фильтры</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <FilterSection />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sorting and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Сортировка:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Выберите сортировку" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">По популярности</SelectItem>
                    <SelectItem value="price-low">Сначала дешевые</SelectItem>
                    <SelectItem value="price-high">Сначала дорогие</SelectItem>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                    <SelectItem value="new">Сначала новинки</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <ErrorDisplay
                error={error}
              />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры фильтрации</p>
                <Button onClick={clearFilters}>
                  Очистить фильтры
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <FadeIn key={product._id} className="group">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                      <div className="relative">
                        <Link href={`/product/${product.slug}`}>
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={product.images[0]?.url || '/placeholder-product.png'}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        </Link>
                        <div className="absolute top-3 left-3 flex space-x-2">
                          {product.isBrandNew && (
                            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              Новинка
                            </span>
                          )}
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 flex flex-col space-y-2">
                          <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
                            <Heart className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="mb-2">
                          {product.category && (
                            <Link href={`/catalog/${product.category.slug}`}>
                              <span className="text-xs text-gray-500 hover:text-gray-700">
                                {product.category.name}
                              </span>
                            </Link>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          <Link href={`/product/${product.slug}`} className="hover:text-blue-600 transition-colors">
                            {product.name}
                          </Link>
                        </h3>
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">
                            {product.rating?.toFixed(1) || '0.0'} ({product.reviews?.length || 0} отзывов)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.originalPrice && product.originalPrice > product.price ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-red-600">
                                  {formatPrice(product.price)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => handleAddToCart(product, e)}
                            className="rounded-full p-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewProductsPage;
