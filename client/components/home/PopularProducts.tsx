'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Heart, Eye } from 'lucide-react';
import { getAllProducts } from '@/lib/products';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import Link from 'next/link';
import { CardSkeleton } from '@/components/ui/Loader';
import { FadeIn } from '@/components/ui/Animation';
import { AuthModal } from '@/components/ui/AuthModal';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { LazyImage } from '@/components/ui/LazyImage';

const PopularProducts = () => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite, isLoggedIn, showAuthModal, setShowAuthModal } = useFavorites();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Получаем все товары, ограничиваем до 6 штук
        const response = await getAllProducts({ limit: 6 });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Не удалось загрузить товары');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  const handleToggleFavorite = async (product: any, e: React.MouseEvent) => {
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
    <section className="py-16 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">
            Наши товары
          </h2>
          <p className="text-lg text-slate-600">
            Все товары из нашего ассортимента - очки, одежда и обувь
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <FadeIn key={product._id} delay={index * 0.1}>
                <div
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-100 h-64">
                  <Link href={`/product/${product.slug}`}>
                    <LazyImage
                      src={product.mainImage || '/placeholder-product.jpg'}
                      thumbnailSrc={(product as any).thumbnailUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                  <div className={`absolute top-4 right-4 flex flex-col space-y-2 transition-all duration-300 ${
                    hoveredProduct === product._id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}>
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
                      {product.country || 'Россия'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                      {product.categoryId ? product.categoryId.name : (product.category ? product.category.name : 'Категория')}
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
                      <span className="text-xl font-bold text-gray-900">
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
          </FadeIn>
        ))
      ) : (
        <div className="col-span-3 text-center py-12">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Товары скоро появятся</h3>
            <p className="text-gray-600 mb-6">Мы сейчас обновляем наш ассортимент. Пожалуйста, зайдите позже, чтобы увидеть все товары.</p>
            <Link href="/catalog">
              <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50">
                Смотреть весь каталог
              </Button>
            </Link>
          </div>
        </div>
      )}
        </div>

        <div className="text-center mt-12">
          <Link href="/catalog">
            <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50">
              Смотреть весь каталог
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Для добавления товара в избранное необходимо войти в систему"
      />
    </section>
  );
};

export default PopularProducts;