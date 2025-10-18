'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Minus, Plus, Heart, Share2, Truck, Shield, RotateCcw, Star,
  ShoppingCart, Check, ChevronLeft, ChevronRight, AlertCircle, Eye
} from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product } from '@/types/product';
import { FadeIn, SlideIn } from '@/components/ui/Animation';
import { ErrorDisplay, NotFound } from '@/components/ErrorDisplay';
import { AuthModal } from '@/components/ui/AuthModal';
import { ColorSelector } from './ColorSelector';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { LazyImage } from '@/components/ui/LazyImage';

export default function ProductPageContent() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { addItem, isInCart, items } = useCart();
  const { isFavorite, toggleFavorite, showAuthModal, setShowAuthModal } = useFavorites();

  // Load product on mount
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        console.log('Loading product with slug:', slug);
        
        // Test direct API call first
        try {
          const directResponse = await fetch(`https://api.dvberry.ru/api/products/${slug}`);
          console.log('Direct API response status:', directResponse.status);
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('Direct API response data:', directData);
          } else {
            console.error('Direct API call failed with status:', directResponse.status);
          }
        } catch (directError) {
          console.error('Direct API call error:', directError);
        }
        
        // Сначала загружаем продукт
        const productResponse = await api.products.getBySlug(slug);
        console.log('Product response:', productResponse);
        console.log('Product response type:', typeof productResponse);
        console.log('Product response keys:', Object.keys(productResponse || {}));
        
        // Handle different response formats
        let productData = productResponse;
        const productResponseAny = productResponse as any;
        
        if (productResponseAny && productResponseAny.success === true && productResponseAny.data && productResponseAny.data.product) {
          productData = productResponseAny.data.product;
          console.log('Using nested data.product format');
        }
        
        console.log('Final product data:', productData);
        setProduct(productData);
        setError(null);
        
        // Загружаем категории, чтобы проверить активность категории продукта
        const categoriesResponse = await api.categories.getAll();
        console.log('Categories response:', categoriesResponse);
        console.log('Product category slug:', productData.category?.slug);
        
        const categoryData = categoriesResponse.find(c => c.slug === productData.category?.slug);
        console.log('Found category data:', categoryData);
        
        // Skip category validation for now - just display the product
        // if (!categoryData || !categoryData.isActive) {
        //   setError('Категория товара не найдена или неактивна');
        //   setProduct(null);
        //   setRelatedProducts([]);
        //   return;
        // }
        
        // Load related products
        const relatedResponse = await api.products.getByCategory(productData.category?.slug || '');
        // Filter out the current product and limit to 4 items
        const filtered = relatedResponse
          .filter(p => p._id !== productData._id)
          .slice(0, 4);
        setRelatedProducts(filtered);
      } catch (err) {
        setError('Не удалось загрузить товар');
        console.error('Product load error:', err);
        console.error('Error details:', err instanceof Error ? err.message : err);
        console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  // Debug cart changes
  useEffect(() => {
    console.log('Cart items changed:', items);
    if (product) {
      console.log('Current product in cart:', isInCart(product._id, selectedSize, selectedColor));
    }
  }, [items, product, selectedSize, selectedColor, isInCart]);

  const handleAddToCart = () => {
    if (!product) return;
    
    console.log('handleAddToCart called:', {
      productId: product._id,
      quantity,
      size: selectedSize,
      color: selectedColor
    });
    
    // Check if size selection is required
    const hasSizeVariants = product.variants && product.variants.some(v => v.type === 'SIZE');
    const hasColorVariants = product.variants && product.variants.some(v => v.type === 'COLOR');
    
    if (hasSizeVariants && !selectedSize) {
      toast.error('Пожалуйста, выберите размер', {
        style: {
          color: '#1f2937',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
        },
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }
    
    if (hasColorVariants && !selectedColor) {
      toast.error('Пожалуйста, выберите цвет', {
        style: {
          color: '#1f2937',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
        },
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }
    
    addItem(product, quantity, selectedSize || undefined, selectedColor || undefined);
    toast.success('Товар добавлен в корзину!', {
      style: {
        color: '#1f2937',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
      },
      icon: <ShoppingCart className="h-5 w-5" />,
    });
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    
    console.log('handleToggleFavorite called for product:', product._id);
    toggleFavorite(product._id);
    // Сообщение об успехе/ошибке будет показано в хуке useFavorites
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    setQuantity(value);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const shouldTruncateDescription = (text: string) => {
    return text && text.length > 300;
  };

  const getTruncatedText = (text: string, maxLength: number = 300) => {
    if (!text || text.length <= maxLength) return text;
    
    // Find the last space within the maxLength to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    return lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) + '...' : truncated + '...';
  };

  const nextImage = () => {
    if (!product) return;
    setSelectedImageIndex((prev) => (prev + 1) % (product.images?.length || 1));
  };

  const prevImage = () => {
    if (!product) return;
    setSelectedImageIndex((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg border border-secondary-100 premium-card">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-6 text-lg text-charcoal-700 font-medium">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <NotFound message={error || 'Товар не найден'} />
          <div className="mt-8 text-center">
            <Link href="/catalog">
              <Button className="bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 font-medium px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-none">
                Вернуться в каталог
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <FadeIn>
          <div className="flex items-center text-sm text-charcoal-500 mb-10">
            <Link href="/" className="hover:text-primary-500 transition-colors">Главная</Link>
            <span className="mx-2">/</span>
            <Link href="/catalog" className="hover:text-primary-500 transition-colors">Каталог</Link>
            <span className="mx-2">/</span>
            <Link href={`/catalog/${product.category?.slug || ''}`} className="hover:text-primary-500 transition-colors">
              {product.category?.name || ''}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal-800 font-medium">{product.name}</span>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <SlideIn direction="left">
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative overflow-hidden bg-secondary-50 rounded-2xl h-96 md:h-[500px] shadow-lg border border-secondary-100 premium-shadow">
                <LazyImage
                  src={product.images?.[selectedImageIndex]?.url || product.mainImage || '/placeholder-product.jpg'}
                  thumbnailSrc={product.images?.[selectedImageIndex]?.thumbnailUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {product.images && product.images.length > 1 && (
                  <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full z-10 w-12 h-12 border border-primary-100 hover:border-primary-200 hover:scale-[1.03] transition-transform"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-5 h-5 text-charcoal-700" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full z-10 w-12 h-12 border border-primary-100 hover:border-primary-200 hover:scale-[1.03] transition-transform"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-5 h-5 text-charcoal-700" />
                        </Button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
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
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`relative overflow-hidden rounded-xl h-24 transition-all cursor-pointer shadow-md hover:shadow-lg ${
                        selectedImageIndex === index 
                          ? 'border-2 border-primary-500 ring-2 ring-primary-200 scale-105' 
                          : 'border border-secondary-100 hover:border-primary-200'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <LazyImage
                        src={image.url || '/placeholder-product.jpg'}
                        thumbnailSrc={image.thumbnailUrl}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SlideIn>

          {/* Product Details */}
          <SlideIn direction="right">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-3 py-1 rounded-full">
                    {product.category?.name || ''}
                  </span>
                  <div className="flex items-center space-x-1 bg-gold-50 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                    <span className="text-sm text-charcoal-700 font-medium">{product.rating || 4.5}</span>
                    <span className="text-sm text-charcoal-500">({product.reviews?.length || 0} отзывов)</span>
                  </div>
                </div>
                <h1 className="font-display text-3xl lg:text-5xl font-bold text-charcoal-800 mb-6 tracking-tight">
                  {product.name}
                </h1>
              </div>

              {/* Product Options Cards */}
              <div className="grid grid-cols-1 gap-4">
                {/* Price Card */}
                <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
                  <div className="flex items-center">
                    <div className="flex-1 p-4">
                      <span className="text-2xl font-bold text-charcoal-800">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-charcoal-500 line-through ml-2">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    {product.isOnSale && (
                      <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs px-4 py-2 h-full flex items-center font-semibold">
                        Скидка
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selector Card */}
                {product.variants && product.variants.some(v => v.type === 'COLOR') && (
                  <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
                    <div className="flex items-center">
                      <h3 className="font-medium text-charcoal-800 w-24">Цвет</h3>
                      <div className="flex-1">
                        <ColorSelector
                          colors={Array.from(new Set(product.variants.filter(v => v.type === 'COLOR').map(v => v.value).filter(Boolean)))}
                          selectedColor={selectedColor}
                          onColorChange={setSelectedColor}
                          compact={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Size Selector Card */}
                {product.variants && product.variants.some(v => v.type === 'SIZE') && (
                  <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
                    <div className="flex items-center">
                      <h3 className="font-medium text-charcoal-800 w-24">Размер</h3>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(product.variants.filter(v => v.type === 'SIZE').map(v => v.value).filter(Boolean))).map((size) => (
                            <Button
                              key={size}
                              variant={selectedSize === size ? "default" : "outline"}
                              size="sm"
                              className={selectedSize === size 
                                ? "bg-gradient-to-r from-primary-400 to-primary-500 text-primary-900 shadow-sm h-8 min-w-[40px]" 
                                : "border border-secondary-200 hover:border-primary-300 hover:text-primary-600 h-8 min-w-[40px]"}
                              onClick={() => setSelectedSize(size)}
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity Selector Card */}
                <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
                  <div className="flex flex-col space-y-3">
                    <h3 className="font-medium text-charcoal-800">Количество</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-secondary-200 rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          className="hover:bg-secondary-50 hover:text-primary-600 h-9 w-9"
                        >
                          <Minus className="w-4 h-4 text-charcoal-700" />
                        </Button>
                        <span className="px-4 text-center min-w-[40px] text-charcoal-800 font-medium">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="hover:bg-secondary-50 hover:text-primary-600 h-9 w-9"
                        >
                          <Plus className="w-4 h-4 text-charcoal-700" />
                        </Button>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {(() => {
                console.log('Product ID:', product._id);
                console.log('Selected size:', selectedSize);
                console.log('Selected color:', selectedColor);
                console.log('Is in cart:', isInCart(product._id, selectedSize, selectedColor));
                return isInCart(product._id, selectedSize, selectedColor);
              })() ? (
                <Link href="/cart" className="flex-1">
                  <Button
                    className="w-full py-6 bg-gradient-to-r from-gold-400 to-gold-600 text-charcoal-900 hover:from-gold-500 hover:to-gold-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gold-300"
                    variant="premium"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Перейти в корзину
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 py-6 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-14 h-14 border-2 border-secondary-200 hover:border-accent-300 hover:text-accent-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                onClick={handleToggleFavorite}
              >
                <Heart className={`w-6 h-6 ${isFavorite(product._id) ? 'fill-accent-500 text-accent-500' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-14 h-14 border-2 border-secondary-200 hover:border-primary-300 hover:text-primary-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <Share2 className="w-6 h-6" />
              </Button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 mt-6 border-t border-secondary-100">
              <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-md border border-secondary-100">
                <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary-500" />
                </div>
                <span className="text-sm font-medium text-charcoal-700">Бесплатная доставка от 5000 ₽</span>
              </div>
              <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-md border border-secondary-100">
                <div className="w-10 h-10 bg-gold-50 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold-500" />
                </div>
                <span className="text-sm font-medium text-charcoal-700">Гарантия качества</span>
              </div>
              <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-md border border-secondary-100">
                <div className="w-10 h-10 bg-accent-50 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-accent-500" />
                </div>
                <span className="text-sm font-medium text-charcoal-700">Возврат в течение 14 дней</span>
              </div>
            </div>
            </div>
          </SlideIn>
        </div>

        {/* Product Details Tabs - Desktop: Under images, Mobile: Under price */}
        <FadeIn delay={200}>
          <div className="mt-20 lg:mt-16 lg:col-span-2">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-secondary-50 p-1 rounded-xl">
                <TabsTrigger value="description" className="data-[state=active]:bg-white data-[state=active]:text-charcoal-800 data-[state=active]:shadow-md data-[state=inactive]:text-charcoal-600 rounded-lg">
                  Описание
                </TabsTrigger>
                <TabsTrigger value="characteristics" className="data-[state=active]:bg-white data-[state=active]:text-charcoal-800 data-[state=active]:shadow-md data-[state=inactive]:text-charcoal-600 rounded-lg">
                  Характеристики
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-charcoal-800 data-[state=active]:shadow-md data-[state=inactive]:text-charcoal-600 rounded-lg">
                  Отзывы ({product.reviews?.length || 0})
                </TabsTrigger>
              </TabsList>
            
              <TabsContent value="description" className="mt-8">
              <Card className="border border-secondary-100 shadow-lg">
                <CardContent className="p-8">
                  <div className="prose max-w-none text-charcoal-700">
                    {product.description && (
                      <>
                        <p className="text-charcoal-700 whitespace-pre-line leading-relaxed">
                          {isDescriptionExpanded
                            ? product.description
                            : getTruncatedText(product.description)}
                        </p>
                        {shouldTruncateDescription(product.description) && (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary-500 font-medium"
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          >
                            {isDescriptionExpanded ? 'Свернуть' : 'Подробнее'}
                          </Button>
                        )}
                      </>
                    )}
                    {!product.description && (
                      <p className="text-charcoal-700">Описание товара отсутствует.</p>
                    )}
                    {product.features && product.features.length > 0 && (
                      <>
                        <h3 className="text-xl font-semibold mt-8 mb-4 text-charcoal-800">Особенности</h3>
                        <ul className="space-y-2">
                          {product.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <Check className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-charcoal-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="characteristics" className="mt-8">
              <Card className="border border-secondary-100 shadow-lg">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-6 text-charcoal-800 text-lg border-b border-secondary-100 pb-2">Основные характеристики</h3>
                      <dl className="space-y-4">
                        <div className="flex justify-between border-b border-secondary-50 pb-2">
                          <dt className="text-charcoal-500">Категория</dt>
                          <dd className="font-medium text-charcoal-800">{product.category?.name || ''}</dd>
                        </div>
                        <div className="flex justify-between border-b border-secondary-50 pb-2">
                          <dt className="text-charcoal-500">Страна производитель</dt>
                          <dd className="font-medium text-charcoal-800">{product.country}</dd>
                        </div>
                        <div className="flex justify-between border-b border-secondary-50 pb-2">
                          <dt className="text-charcoal-500">Бренд</dt>
                          <dd className="font-medium text-charcoal-800">{product.brand}</dd>
                        </div>
                        {product.material && (
                          <div className="flex justify-between border-b border-secondary-50 pb-2">
                            <dt className="text-charcoal-500">Материал</dt>
                            <dd className="font-medium text-charcoal-800">{product.material}</dd>
                          </div>
                        )}
                        {product.weight && (
                          <div className="flex justify-between border-b border-secondary-50 pb-2">
                            <dt className="text-charcoal-500">Вес</dt>
                            <dd className="font-medium text-charcoal-800">{product.weight} г</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    {product.dimensions && (
                      <div>
                        <h3 className="font-medium mb-6 text-charcoal-800 text-lg border-b border-secondary-100 pb-2">Габариты</h3>
                        <dl className="space-y-3">
                          <div className="flex justify-between border-b border-secondary-50 pb-2">
                            <dt className="text-charcoal-500">Длина</dt>
                            <dd className="font-medium text-charcoal-800">{product.dimensions} см</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <Card className="border border-secondary-100 shadow-lg">
                <CardContent className="p-8">
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review, index) => (
                        <div key={index} className="border-b border-secondary-100 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-medium text-charcoal-800">Аноним</h4>
                            <div className="flex items-center">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-gold-500 text-gold-500'
                                        : 'text-secondary-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-charcoal-500 ml-2">
                                {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          </div>
                          <p className="text-charcoal-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-charcoal-500">Отзывов пока нет. Будьте первым, кто оставит отзыв!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
          </div>
        </FadeIn>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <FadeIn delay={400}>
            <div className="mt-20">
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-display text-3xl font-bold text-charcoal-800 tracking-tight">
                  Сопутствующие <span className="premium-text">товары</span>
                </h2>
                <Link href="/catalog" className="text-primary-500 hover:text-primary-600 font-medium flex items-center">
                  Смотреть все <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((product) => (
                  <SlideIn key={product._id} delay={50}>
                    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-secondary-100 premium-shadow">
                      {/* Product Image */}
                      <Link href={`/product/${product.slug}`}>
                        <div className="relative overflow-hidden bg-secondary-50 h-64">
                          <LazyImage
                            src={product.mainImage || '/placeholder-product.jpg'}
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
                              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl text-charcoal-600 hover:text-accent-500 hover:scale-110 transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(product._id);
                              }}
                            >
                              <Heart className={`w-5 h-5 ${isFavorite(product._id) ? 'fill-accent-500 text-accent-500' : ''}`} />
                            </Button>
                            <ProductQuickView product={product}>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl text-charcoal-600 hover:text-primary-500 hover:scale-110 transition-all duration-300"
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
                          {product.country && (
                            <div className="absolute bottom-4 left-4">
                              <span className="bg-white/90 backdrop-blur-sm text-charcoal-700 text-xs px-4 py-1.5 rounded-full font-medium shadow-sm border border-white/50">
                                {product.country}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-3 py-1 rounded-full">
                            {product.category?.name || ''}
                          </span>
                          <div className="flex items-center space-x-1 bg-gold-50 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                            <span className="text-sm text-charcoal-700 font-medium">{product.rating || 4.5}</span>
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
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>
      
      {/* Auth Modal for Favorites */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
