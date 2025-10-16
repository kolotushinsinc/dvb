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
    return <div className="min-h-screen bg-cream-50 flex items-center justify-center">Загрузка...</div>;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <NotFound message={error || 'Товар не найден'} />
          <div className="mt-6 text-center">
            <Link href="/catalog">
              <Button>Вернуться в каталог</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <FadeIn>
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-primary">Главная</Link>
            <span className="mx-2">/</span>
            <Link href="/catalog" className="hover:text-primary">Каталог</Link>
            <span className="mx-2">/</span>
            <Link href={`/catalog/${product.category?.slug || ''}`} className="hover:text-gray-700 transition-colors">
              {product.category?.name || ''}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <SlideIn direction="left">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative overflow-hidden bg-gray-100 rounded-2xl h-96 md:h-[500px]">
                <LazyImage
                  src={product.images?.[selectedImageIndex]?.url || product.mainImage || '/placeholder-product.jpg'}
                  thumbnailSrc={product.images?.[selectedImageIndex]?.thumbnailUrl}
                  alt={product.name}
                  className="w-full h-full"
                />
                
                {/* Image Navigation */}
                {product.images && product.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-gray-100 rounded-full transition-colors z-10"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-gray-100 rounded-full transition-colors z-10"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
                  {product.isBrandNew && (
                    <Badge className="bg-green-500 text-white">NEW</Badge>
                  )}
                  {product.isOnSale && (
                    <Badge className="bg-accent text-white">-20%</Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`relative overflow-hidden rounded-lg h-20 border-2 transition-colors cursor-pointer ${
                        selectedImageIndex === index ? 'border-gray-800' : 'border-transparent hover:border-gray-300'
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                  {product.category?.name || ''}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating || 0}</span>
                  <span className="text-sm text-gray-500">({product.reviews?.length || 0} отзывов)</span>
                </div>
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              {/* Price - Under the product name */}
              <div className="flex items-baseline space-x-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.isOnSale && (
                  <Badge className="bg-accent text-white">Скидка</Badge>
                )}
              </div>
            </div>

            {/* Variants */}
            {(product.variants && product.variants.length > 0) && (
              <div className="space-y-4">
                {/* Size Selector */}
                {product.variants && product.variants.some(v => v.type === 'SIZE') && (
                  <div>
                    <h3 className="font-medium mb-2">Размер</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(product.variants.filter(v => v.type === 'SIZE').map(v => v.value).filter(Boolean))).map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "default" : "outline"}
                          size="sm"
                          className={selectedSize === size ? "" : "hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200"}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.variants && product.variants.some(v => v.type === 'COLOR') && (
                  <ColorSelector
                    colors={Array.from(new Set(product.variants.filter(v => v.type === 'COLOR').map(v => v.value).filter(Boolean)))}
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                  />
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="font-medium mb-2">Количество</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="hover:bg-transparent hover:text-gray-700"
                  >
                    <Minus className="w-4 h-4 text-gray-700" />
                  </Button>
                  <span className="px-4 py-2 text-center min-w-[50px] text-gray-900">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="hover:bg-transparent hover:text-gray-700"
                  >
                    <Plus className="w-4 h-4 text-gray-700" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {(() => {
                console.log('Product ID:', product._id);
                console.log('Selected size:', selectedSize);
                console.log('Selected color:', selectedColor);
                console.log('Is in cart:', isInCart(product._id, selectedSize, selectedColor));
                return isInCart(product._id, selectedSize, selectedColor);
              })() ? (
                <Link href="/cart" className="flex-1">
                  <Button
                    className="w-full py-6"
                    variant="outline"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Корзина
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 py-6"
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleToggleFavorite}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product._id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-5 h-5 text-primary" />
                <span>Бесплатная доставка от 5000 ₽</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span>Гарантия качества</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="w-5 h-5 text-primary" />
                <span>Возврат в течение 14 дней</span>
              </div>
            </div>
            </div>
          </SlideIn>
        </div>

        {/* Product Details Tabs - Desktop: Under images, Mobile: Under price */}
        <FadeIn delay={200}>
          <div className="mt-16 lg:mt-12 lg:col-span-2">
            <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description" className="data-[state=active]:text-black data-[state=inactive]:text-gray-700/70">Описание</TabsTrigger>
              <TabsTrigger value="characteristics" className="data-[state=active]:text-black data-[state=inactive]:text-gray-700/70">Характеристики</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:text-black data-[state=inactive]:text-gray-700/70">Отзывы ({product.reviews?.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none text-gray-900">
                    {product.description && (
                      <>
                        <p className="text-gray-900 whitespace-pre-line">
                          {isDescriptionExpanded
                            ? product.description
                            : getTruncatedText(product.description)}
                        </p>
                        {shouldTruncateDescription(product.description) && (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary font-normal"
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          >
                            {isDescriptionExpanded ? 'Свернуть' : 'Подробнее'}
                          </Button>
                        )}
                      </>
                    )}
                    {!product.description && (
                      <p className="text-gray-900">Описание товара отсутствует.</p>
                    )}
                    {product.features && product.features.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">Особенности</h3>
                        <ul className="space-y-2">
                          {product.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-900">{feature}</span>
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
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-4">Основные характеристики</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Категория</dt>
                          <dd>{product.category?.name || ''}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Страна производитель</dt>
                          <dd>{product.country}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Бренд</dt>
                          <dd>{product.brand}</dd>
                        </div>
                        {product.material && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Материал</dt>
                            <dd>{product.material}</dd>
                          </div>
                        )}
                        {product.weight && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Вес</dt>
                            <dd>{product.weight} г</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    {product.dimensions && (
                      <div>
                        <h3 className="font-medium mb-4">Габариты</h3>
                        <dl className="space-y-3">
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Длина</dt>
                            <dd>{product.dimensions} см</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-medium">Аноним</h4>
                            <div className="flex items-center">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 ml-2">
                                {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Отзывов пока нет. Будьте первым, кто оставит отзыв!</p>
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
            <div className="mt-16">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
              Сопутствующие товары
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link key={product._id} href={`/product/${product.slug}`}>
                  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="relative overflow-hidden bg-gray-100 h-48">
                      <LazyImage
                        src={product.mainImage || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.isBrandNew && (
                        <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 group-hover:text-gray-700 transition-colors truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category?.name || ''}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ProductQuickView product={product}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </ProductQuickView>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={(e) => {
                              e.preventDefault();
                              addItem(product);
                              toast.success('Товар добавлен в корзину!');
                            }}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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