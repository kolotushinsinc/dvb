'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                {loadingProductData ? (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full transition-colors z-10"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full transition-colors z-10"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </>
                ) : displayProduct.mainImage ? (
                  <LazyImage
                    src={displayProduct.mainImage}
                    alt={displayProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <span className="text-gray-500">Нет изображения</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {!loadingProductData && (displayProduct.images && displayProduct.images.length > 1) && (
                <div className="flex space-x-2 overflow-x-auto py-2">
                  {displayProduct.images.map((image: ProductImage, index: number) => (
                    <button
                      key={index}
                      className={cn(
                        'relative w-16 h-16 overflow-hidden rounded border',
                        currentImageIndex === index ? 'border-primary' : 'border-gray-200'
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
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{displayProduct.name}</h2>
                <p className="text-gray-600">{displayProduct.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                {displayProduct.category && (
                  <Badge variant="secondary">{displayProduct.category.name}</Badge>
                )}
                {displayProduct.isBrandNew && <Badge variant="default">Новинка</Badge>}
                {displayProduct.isOnSale && <Badge variant="destructive">Распродажа</Badge>}
              </div>

              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('ru-RU').format(displayProduct.price)} ₽
              </div>

              {/* Color Selector */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Цвет:</h3>
                  <ColorSelector
                    colors={availableColors}
                    selectedColor={selectedColor || undefined}
                    onColorChange={setSelectedColor}
                  />
                </div>
              )}

              {/* Size Selector */}
              {availableSizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Размер:</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        className={cn(
                          'px-3 py-1 border rounded-md text-sm',
                          selectedSize === size
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <h3 className="text-sm font-medium mb-2">Количество:</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(displayProduct.stock, quantity + 1))}
                    disabled={quantity >= displayProduct.stock}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  В наличии: {displayProduct.stock} шт.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={displayProduct.stock === 0}
                  className="flex-1"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Добавить в корзину
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFavoriteButtonClick}
                  className="flex-1"
                >
                  <Heart className={cn('mr-2 h-4 w-4', isFavorite(displayProduct._id) ? 'fill-red-500 text-red-500' : '')} />
                  {isFavorite(displayProduct._id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                </Button>
              </div>

              {/* View Full Product Button */}
              <div className="pt-2">
                <Button asChild variant="ghost" className="w-full">
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