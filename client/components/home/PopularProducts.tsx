'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Heart, Eye } from 'lucide-react';
import { getAllProducts } from '@/lib/products';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';
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
    <section className="py-20 bg-gradient-to-b from-cream-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal-800 mb-4 tracking-tight">
            Популярные <span className="premium-text">товары</span>
          </h2>
          <p className="text-lg text-charcoal-600 max-w-3xl mx-auto">
            Эксклюзивная коллекция премиальных товаров, отобранных нашими стилистами
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-secondary-100 h-[400px] flex items-center justify-center">
                <Loader size="lg" text="Загрузка..." />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <FadeIn key={product._id} delay={index * 0.1}>
                <div
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-secondary-100 premium-shadow"
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                {/* Product Image */}
                <div className="relative overflow-hidden bg-secondary-50 h-72">
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
                  <div className={`absolute top-4 right-4 flex flex-col space-y-3 transition-all duration-300 ${
                    hoveredProduct === product._id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}>
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
                      {product.country || 'Россия'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-3 py-1 rounded-full">
                      {product.categoryId ? product.categoryId.name : (product.category ? product.category.name : 'Категория')}
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
          </FadeIn>
        ))
      ) : (
        <div className="col-span-3 text-center py-16">
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-secondary-100 premium-card">
            <h3 className="text-2xl font-bold text-charcoal-800 mb-4">Товары скоро появятся</h3>
            <p className="text-charcoal-600 mb-8 text-lg">Мы сейчас обновляем наш ассортимент премиальных товаров. Пожалуйста, зайдите позже, чтобы увидеть все новинки.</p>
            <Link href="/catalog">
              <Button size="lg" className="bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 font-medium px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-none">
                Смотреть весь каталог
              </Button>
            </Link>
          </div>
        </div>
      )}
        </div>

        <div className="text-center mt-16">
          <Link href="/catalog">
            <Button size="lg" className="bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 font-medium px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-none">
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
