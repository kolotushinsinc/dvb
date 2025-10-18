'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye, ChevronLeft, ChevronRight, Star, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColorSelector } from './ColorSelector';
import { AuthModal } from '@/components/ui/AuthModal';
import { useCart } from '@/components/cart/CartProvider';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { Product, ProductImage, ProductVariant } from '@/types/product';
import { cn } from '@/lib/utils';
import { LazyImage } from '@/components/ui/LazyImage';
import { api } from '@/lib/api';

interface ProductQuickViewProps {
  product: Product;
  className?: string;
  children: React.ReactNode;
}

export function ProductQuickView({ product, className, children }: ProductQuickViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullProductData, setFullProductData] = useState<Product | null>(null);
  const [loadingProductData, setLoadingProductData] = useState(false);

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  // Initialize with the first available color and size
  useEffect(() => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const colorVariants = product.variants.filter(v => v.type === 'COLOR');
      const sizeVariants = product.variants.filter(v => v.type === 'SIZE');
      
      if (colorVariants.length > 0) {
        setSelectedColor(colorVariants[0].value);
      }
      
      if (sizeVariants.length > 0) {
        setSelectedSize(sizeVariants[0].value);
      }
    }
  }, [product]);

  // Fetch complete product data when modal opens
  useEffect(() => {
    const fetchCompleteProductData = async () => {
      if (isOpen && product._id) {
        try {
          setLoadingProductData(true);
          console.log('Fetching complete product data for:', product._id);
          const completeProduct = await api.products.getById(product._id);
          console.log('Complete product data:', completeProduct);
          
          // Handle different response formats
          let productData = completeProduct;
          const completeProductAny = completeProduct as any;
          
          if (completeProductAny && completeProductAny.success === true && completeProductAny.data && completeProductAny.data.product) {
            productData = completeProductAny.data.product;
            console.log('Using nested data.product format');
          }
          
          setFullProductData(productData);
          setCurrentImageIndex(0); // Reset to first image
        } catch (error) {
          console.error('Error fetching complete product data:', error);
          // Fall back to using the original product data
          setFullProductData(product);
        } finally {
          setLoadingProductData(false);
        }
      }
    };

    fetchCompleteProductData();
  }, [isOpen, product._id]);

  const handleAddToCart = () => {
    if (!selectedColor && !selectedSize) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите цвет или размер',
        variant: 'destructive',
      });
      return;
    }

    // Check if we have enough stock
    if (displayProduct.stock < quantity) {
      toast({
        title: 'Ошибка',
        description: 'Недостаточно товара на складе',
        variant: 'destructive',
      });
      return;
    }

    addItem(displayProduct, quantity, selectedSize || undefined, selectedColor || undefined);

    toast({
      title: 'Товар добавлен в корзину',
      description: `${displayProduct.name} добавлен в корзину`,
    });

    setIsOpen(false);
  };

  const handleAddToFavorites = async () => {
    try {
      await toggleFavorite(displayProduct._id);
      if (isFavorite(displayProduct._id)) {
        toast({
          title: 'Товар удален из избранного',
          description: `${displayProduct.name} удален из избранного`,
        });
      } else {
        toast({
          title: 'Товар добавлен в избранное',
          description: `${displayProduct.name} добавлен в избранное`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар в избранное',
        variant: 'destructive',
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleFavoriteButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleAddToFavorites();
  };

  const nextImage = () => {
    if (!displayProduct.images || displayProduct.images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % displayProduct.images.length);
  };

  const prevImage = () => {
    if (!displayProduct.images || displayProduct.images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + displayProduct.images.length) % displayProduct.images.length);
  };

  // Use the complete product data if available, otherwise fall back to the original product
  const displayProduct = fullProductData || product;
  
  // Get available colors and sizes
  const availableColors = Array.from(
    new Set(displayProduct.variants && Array.isArray(displayProduct.variants) ?
      displayProduct.variants.filter(v => v.type === 'COLOR').map((variant: ProductVariant) => variant.value) :
      []
    )
  );

  const availableSizes = Array.from(
    new Set(displayProduct.variants && Array.isArray(displayProduct.variants) ?
      displayProduct.variants.filter(v => v.type === 'SIZE').map((variant: ProductVariant) => variant.value) :
      []
    )
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setIsOpen(false);
        }
      }}>
        <DialogTrigger asChild onClick={handleQuickView}>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 sm:p-6 rounded-xl border-none shadow-2xl bg-gradient-to-b from-cream-50 to-white" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Product Images */}
            <div className="space-y-4 sm:space-y-6">
              <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg border border-secondary-100 premium-shadow bg-secondary-50">
                {loadingProductData ? (
                  <div className="flex items-center justify-center h-full bg-secondary-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400"></div>
                  </div>
                ) : (displayProduct.images && displayProduct.images.length > 0) ? (
                  <>
                    <LazyImage
                      src={displayProduct.images[currentImageIndex].url}
                      thumbnailSrc={displayProduct.images[currentImageIndex].thumbnailUrl}
                      alt={displayProduct.images[currentImageIndex].alt || displayProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Navigation Buttons */}
                    {displayProduct.images.length > 1 && (
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
                      {displayProduct.isBrandNew && (
                        <span className="bg-gradient-to-r from-gold-400 to-gold-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                          НОВОЕ
                        </span>
                      )}
                      {displayProduct.isOnSale && (
                        <span className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                          -20%
                        </span>
                      )}
                    </div>
                    
                    {/* Country Origin */}
                    {displayProduct.country && (
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-charcoal-700 text-xs px-4 py-1.5 rounded-full font-medium shadow-sm border border-white/50">
                          {displayProduct.country}
                        </span>
                      </div>
                    )}
                  </>
                ) : displayProduct.mainImage ? (
                  <LazyImage
                    src={displayProduct.mainImage}
                    alt={displayProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-secondary-50">
                    <span className="text-charcoal-500">Нет изображения</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {!loadingProductData && (displayProduct.images && displayProduct.images.length > 1) && (
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  {displayProduct.images.map((image: ProductImage, index: number) => (
                    <button
                      key={index}
                      className={cn(
                        'relative overflow-hidden rounded-xl h-20 transition-all cursor-pointer shadow-md hover:shadow-lg',
                        currentImageIndex === index 
                          ? 'border-2 border-primary-500 ring-2 ring-primary-200 scale-105' 
                          : 'border border-secondary-100 hover:border-primary-200'
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <LazyImage
                        src={image.url}
                        thumbnailSrc={image.thumbnailUrl}
                        alt={image.alt || `${displayProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-0">
              <div>
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <span className="text-sm text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-3 py-1 rounded-full">
                    {displayProduct.category?.name || ''}
                  </span>
                  <div className="flex items-center space-x-1 bg-gold-50 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                    <span className="text-sm text-charcoal-700 font-medium">{displayProduct.rating || 4.5}</span>
                  </div>
                </div>
                <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal-800 mb-3 sm:mb-4 tracking-tight">
                  {displayProduct.name}
                </h2>
                <p className="text-charcoal-600 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 text-sm sm:text-base">
                  {displayProduct.description}
                </p>
              </div>

              {/* Price Card */}
              <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden">
                <div className="flex items-center">
                  <div className="flex-1 p-4">
                    <span className="text-2xl font-bold text-charcoal-800">
                      {new Intl.NumberFormat('ru-RU').format(displayProduct.price)} ₽
                    </span>
                    {displayProduct.originalPrice && (
                      <span className="text-sm text-charcoal-500 line-through ml-2">
                        {new Intl.NumberFormat('ru-RU').format(displayProduct.originalPrice)} ₽
                      </span>
                    )}
                  </div>
                  {displayProduct.isOnSale && (
                    <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs px-4 py-2 h-full flex items-center font-semibold">
                      Скидка
                    </div>
                  )}
                </div>
              </div>

              {/* Product Options Cards */}
              <div className="grid grid-cols-1 gap-4">
                {/* Color Selector Card */}
                {availableColors.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                      <h3 className="font-medium text-charcoal-800 sm:w-24">Цвет</h3>
                      <div className="flex-1">
                        <ColorSelector
                          colors={availableColors}
                          selectedColor={selectedColor || undefined}
                          onColorChange={setSelectedColor}
                          compact={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Size Selector Card */}
                {availableSizes.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                      <h3 className="font-medium text-charcoal-800 sm:w-24">Размер</h3>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.map((size) => (
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                      <div className="flex items-center border border-secondary-200 rounded-lg w-fit">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="hover:bg-secondary-50 hover:text-primary-600 h-9 w-9"
                        >
                          <Minus className="w-4 h-4 text-charcoal-700" />
                        </Button>
                        <span className="px-4 text-center min-w-[40px] text-charcoal-800 font-medium">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQuantity(Math.min(displayProduct.stock, quantity + 1))}
                          disabled={quantity >= displayProduct.stock}
                          className="hover:bg-secondary-50 hover:text-primary-600 h-9 w-9"
                        >
                          <Plus className="w-4 h-4 text-charcoal-700" />
                        </Button>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${displayProduct.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {displayProduct.stock > 0 ? `В наличии: ${displayProduct.stock} шт.` : 'Нет в наличии'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={displayProduct.stock === 0}
                  className="flex-1 py-6 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {displayProduct.stock > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-14 h-14 border-2 border-secondary-200 hover:border-accent-300 hover:text-accent-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  onClick={handleFavoriteButtonClick}
                >
                  <Heart className={`w-6 h-6 ${isFavorite(displayProduct._id) ? 'fill-accent-500 text-accent-500' : ''}`} />
                </Button>
              </div>

              {/* View Full Product Button */}
              <div className="pt-2">
                <Button asChild variant="ghost" className="w-full hover:bg-secondary-50 hover:text-primary-600">
                  <Link href={`/product/${displayProduct.slug}`}>
                    Перейти на страницу товара
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal for Favorites */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Для добавления товара в избранное необходимо войти в систему"
      />
    </>
  );
}
