'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getColorByName } from '@/lib/colors';
import { LazyImage } from '@/components/ui/LazyImage';

const CartPage = () => {
  const { items, totalItems, totalQuantity, totalPrice, loading, error, removeItem, updateQuantity, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isClearCartDialogOpen, setIsClearCartDialogOpen] = useState(false);

  const handleQuantityChange = async (id: string, quantity: number, size?: string, color?: string) => {
    if (quantity < 1) {
      await removeItem(id, size, color);
    } else {
      await updateQuantity(id, quantity, size, color);
    }
  };

  const handleRemoveItem = async (id: string, size?: string, color?: string) => {
    await removeItem(id, size, color);
    toast.success('Товар удален из корзины', {
      style: {
        color: '#1f2937',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
      },
    });
  };

  const handleConfirmClearCart = async () => {
    await clearCart();
    toast.success('Корзина очищена', {
      style: {
        color: '#1f2937',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
      },
    });
    setIsClearCartDialogOpen(false);
  };

  const handleApplyPromoCode = () => {
    // Simple promo code logic for demo
    if (promoCode.toLowerCase() === 'demo10') {
      setDiscount(10);
      toast.success('Промокод применен! Скидка 10%');
    } else if (promoCode.toLowerCase() === 'demo20') {
      setDiscount(20);
      toast.success('Промокод применен! Скидка 20%');
    } else {
      setDiscount(0);
      toast.error('Неверный промокод');
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Корзина пуста');
      return;
    }

    setIsCheckingOut(true);
    try {
      // Redirect to checkout page
      window.location.href = '/checkout';
    } catch (error) {
      toast.error('Не удалось перейти к оформлению заказа');
      setIsCheckingOut(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const discountedTotal = totalPrice * (1 - discount / 100);
  const deliveryFee = discountedTotal > 5000 ? 0 : 300;
  const finalTotal = discountedTotal + deliveryFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка корзины...</p>
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
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Корзина
          </h1>
          <p className="text-lg text-gray-600">
            {totalItems > 0 
              ? `В корзине ${totalItems} ${totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}`
              : 'Ваша корзина пуста'
            }
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-900">
                    <span>Товары в корзине</span>
                    <Dialog open={isClearCartDialogOpen} onOpenChange={setIsClearCartDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:bg-transparent hover:text-red-600 border-transparent"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Очистить корзину
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900">Подтверждение очистки корзины</DialogTitle>
                          <DialogDescription className="text-gray-700">
                            Вы уверены, что хотите очистить корзину? Все товары будут удалены.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsClearCartDialogOpen(false)}
                            className="hover:bg-transparent hover:text-gray-900"
                          >
                            Отмена
                          </Button>
                          <Button
                            onClick={handleConfirmClearCart}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Очистить корзину
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item._id}-${item.size || ''}-${item.color || ''}`} className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-200">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                        {item.product.mainImage ? (
                          <LazyImage
                            src={item.product.mainImage}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : item.product.images && item.product.images.length > 0 ? (
                          <LazyImage
                            src={item.product.images[0].url}
                            thumbnailSrc={item.product.images[0].thumbnailUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <Link href={`/product/${item.product.slug}`} className="font-bold text-lg hover:text-primary transition-colors text-gray-900">
                              {item.product.name}
                            </Link>
                            {item.product.category && (
                              <p className="text-sm text-gray-500 mt-1">{item.product.category.name}</p>
                            )}
                            
                            {(item.size || item.color) && (
                              <div className="flex gap-2 mt-2 items-center">
                                {item.size && (
                                  <Badge variant="secondary">Размер: {item.size}</Badge>
                                )}
                                {item.color && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">Цвет:</span>
                                    <div
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{
                                        backgroundColor: getColorByName(item.color)?.value || '#CCCCCC',
                                        borderColor: item.color === 'Белый' ? '#E5E7EB' : undefined
                                      }}
                                      title={item.color}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item._id, item.size, item.color)}
                            className="text-red-500 hover:bg-transparent hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.size, item.color)}
                              disabled={item.quantity <= 1}
                              className="hover:bg-transparent hover:text-gray-700"
                            >
                              <Minus className="w-4 h-4 text-gray-700" />
                            </Button>
                            <span className="px-4 py-2 text-center min-w-[50px] text-gray-900">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.size, item.color)}
                              className="hover:bg-transparent hover:text-gray-700"
                            >
                              <Plus className="w-4 h-4 text-gray-700" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatPrice(item.product.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Continue Shopping */}
              <div className="flex justify-center mt-6">
                <Link href="/catalog">
                  <Button variant="outline">
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Продолжить покупки
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-gray-900">Итого</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Товары ({totalQuantity} шт.)</span>
                    <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-gray-700">Скидка ({discount}%)</span>
                      <span className="text-gray-900">-{formatPrice(totalPrice * discount / 100)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Доставка</span>
                    <span className="text-gray-900">{deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-700">Итого к оплате</span>
                    <span className="text-gray-900">{formatPrice(finalTotal)}</span>
                  </div>
                  
                  {deliveryFee > 0 && (
                    <p className="text-sm text-gray-500">
                      Бесплатная доставка при заказе от 5000 ₽
                    </p>
                  )}
                  
                  {/* Promo Code */}
                  <div className="space-y-2 pt-4">
                    <p className="font-medium">Промокод</p>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Введите промокод"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                      />
                      <Button variant="outline" onClick={handleApplyPromoCode}>
                        Применить
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Попробуйте промокоды: demo10 или demo20
                    </p>
                  </div>
                  
                  {/* Checkout Button */}
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full mt-6"
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? 'Обработка...' : 'Оформить заказ'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Нажимая кнопку «Оформить заказ», вы соглашаетесь с условиями обработки персональных данных
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">Ваша корзина пуста</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Добавьте товары в корзину, чтобы оформить заказ.
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

export default CartPage;