'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product } from '@/types/product';
import { useCart } from '@/components/cart/CartProvider';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const response = await api.favorites.get();
        setFavorites(response);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить избранные товары');
        console.error('Favorites load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success('Товар добавлен в корзину!');
  };

  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      await api.favorites.remove(productId);
      setFavorites(prev => prev.filter(p => p._id !== productId));
      toast.success('Товар удален из избранного');
    } catch (err) {
      toast.error('Не удалось удалить товар из избранного');
      console.error('Remove favorite error:', err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка избранного...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4 flex items-center">
            <Heart className="mr-3 text-red-500" />
            Избранное
          </h1>
          <p className="text-lg text-gray-600">
            {favorites.length > 0 
              ? `В избранном ${favorites.length} ${favorites.length === 1 ? 'товар' : favorites.length < 5 ? 'товара' : 'товаров'}`
              : 'У вас пока нет избранных товаров'
            }
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <Card key={product._id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-100 h-64">
                  <Link href={`/product/${product.slug}`}>
                    <img
                      src={product.mainImage || ''}
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
                    {product.isOnSale && (
                      <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-semibold">
                        -20%
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md text-red-500"
                      onClick={() => handleRemoveFromFavorites(product._id)}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                    <Link href={`/product/${product.slug}`}>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Product Info */}
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      {product.category.name}
                    </span>
                    <div className="flex items-center space-x-1">
                      {product.rating && (
                        <>
                          <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-gray-600">{product.rating}</span>
                          {product.reviews && (
                            <span className="text-sm text-gray-400">({product.reviews.length})</span>
                          )}
                        </>
                      )}
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
                    <Button
                      size="icon"
                      className="rounded-full bg-primary hover:bg-indigo-700"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Heart className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">У вас нет избранных товаров</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Добавляйте товары в избранное, чтобы не потерять их и вернуться к покупке позже.
            </p>
            <div className="mt-8">
              <Link href="/catalog">
                <Button className="px-6">
                  Перейти в каталог
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FavoritesPage;