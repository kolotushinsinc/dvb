'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-secondary-100 opacity-25"></div>
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-primary-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-lg text-charcoal-600 font-medium">Загрузка корзины...</p>
          <p className="mt-2 text-charcoal-500">Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-block mb-4">
            <span className="text-sm text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-3 py-1 rounded-full">
              Оформление заказа
            </span>
          </div>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-charcoal-800 mb-4 tracking-tight">
            Корзина <span className="premium-text">покупок</span>
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl md:mx-0 mx-auto">
            {totalItems > 0 
              ? `В корзине ${totalItems} ${totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}`
              : 'Ваша корзина пуста'
            }
          </p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-secondary-100 shadow-lg premium-shadow rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-cream-50 to-white border-b border-secondary-100">
                  <CardTitle className="flex items-center justify-between text-charcoal-800">
                    <span className="font-heading">Товары в корзине</span>
                    <Dialog open={isClearCartDialogOpen} onOpenChange={setIsClearCartDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-200 rounded-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Очистить корзину
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-2xl border-secondary-100 shadow-lg premium-shadow">
                        <DialogHeader className="border-b border-secondary-100 pb-4">
                          <DialogTitle className="text-charcoal-800 font-heading">Подтверждение очистки корзины</DialogTitle>
                          <DialogDescription className="text-charcoal-600 mt-2">
                            Вы уверены, что хотите очистить корзину? Все товары будут удалены.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-4 space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => setIsClearCartDialogOpen(false)}
                            className="border-2 border-secondary-200 hover:border-charcoal-300 hover:text-charcoal-800 rounded-full px-6"
                          >
                            Отмена
                          </Button>
                          <Button
                            onClick={handleConfirmClearCart}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full px-6 shadow-md hover:shadow-lg"
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
                    <div key={`${item._id}-${item.size || ''}-${item.color || ''}`} className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-secondary-100 hover:bg-cream-50/30 transition-colors p-4 rounded-xl">
                      {/* Product Image */}
                      <div className="w-full sm:w-36 h-36 bg-secondary-50 rounded-xl overflow-hidden shadow-sm border border-secondary-100">
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
                            <Link href={`/product/${item.product.slug}`} className="font-heading font-bold text-lg hover:text-primary-500 transition-colors text-charcoal-800">
                              {item.product.name}
                            </Link>
                            {item.product.category && (
                              <div className="mt-2">
                                <span className="text-xs text-charcoal-500 uppercase tracking-wider font-medium bg-secondary-50 px-2 py-1 rounded-full">
                                  {item.product.category.name}
                                </span>
                              </div>
                            )}
                            
                            {(item.size || item.color) && (
                              <div className="flex gap-3 mt-3 items-center">
                                {item.size && (
                                  <Badge variant="outline" className="bg-secondary-50 text-charcoal-700 border-secondary-200 px-3 py-1 rounded-full">
                                    Размер: {item.size}
                                  </Badge>
                                )}
                                {item.color && (
                                  <div className="flex items-center gap-2 bg-secondary-50 px-3 py-1 rounded-full border border-secondary-200">
                                    <span className="text-xs text-charcoal-600">Цвет:</span>
                                    <div
                                      className="w-4 h-4 rounded-full border shadow-sm"
                                      style={{
                                        backgroundColor: getColorByName(item.color)?.value || '#CCCCCC',
                                        borderColor: item.color === 'Белый' ? '#E5E7EB' : undefined
                                      }}
                                      title={item.color}
                                    />
                                    <span className="text-xs text-charcoal-700">{item.color}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveItem(item._id, item.size, item.color)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-200 rounded-full h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center border border-secondary-200 rounded-full bg-secondary-50 shadow-sm">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1, item.size, item.color)}
                              disabled={item.quantity <= 1}
                              className="hover:bg-secondary-100 hover:text-charcoal-700 rounded-full h-9 w-9"
                            >
                              <Minus className="w-4 h-4 text-charcoal-600" />
                            </Button>
                            <span className="px-4 py-2 text-center min-w-[50px] text-charcoal-800 font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.size, item.color)}
                              className="hover:bg-secondary-100 hover:text-charcoal-700 rounded-full h-9 w-9"
                            >
                              <Plus className="w-4 h-4 text-charcoal-600" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-xl text-charcoal-800">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                            <p className="text-sm text-charcoal-500 mt-1">
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
              <div className="flex justify-center mt-8">
                <Link href="/catalog">
                  <Button 
                    variant="outline" 
                    className="border-2 border-secondary-200 hover:border-primary-300 hover:text-primary-600 font-medium px-6 py-6 h-auto rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                    Продолжить покупки
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 border-secondary-100 shadow-lg premium-shadow rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-cream-50 to-white border-b border-secondary-100">
                  <CardTitle className="text-charcoal-800 font-heading">Итого</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Товары ({totalQuantity} шт.)</span>
                    <span className="text-charcoal-800 font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-600">Скидка ({discount}%)</span>
                      <span className="text-green-600 font-medium">-{formatPrice(totalPrice * discount / 100)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Доставка</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-charcoal-800'}`}>
                      {deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  
                  <Separator className="bg-secondary-100" />
                  
                  <div className="flex justify-between font-bold text-xl">
                    <span className="text-charcoal-800">Итого к оплате</span>
                    <span className="premium-text">{formatPrice(finalTotal)}</span>
                  </div>
                  
                  {deliveryFee > 0 && (
                    <div className="bg-cream-50 rounded-xl p-3 border border-secondary-100">
                      <p className="text-sm text-charcoal-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Бесплатная доставка при заказе от 5000 ₽
                      </p>
                    </div>
                  )}
                  
                  {/* Promo Code */}
                  <div className="space-y-3 pt-4 bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                    <p className="font-medium text-charcoal-800">Промокод</p>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Введите промокод"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-white border-secondary-200 focus:border-primary-300 focus:ring-primary-200 text-charcoal-800 rounded-lg"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyPromoCode}
                        className="border-secondary-200 hover:border-primary-300 hover:text-primary-600"
                      >
                        Применить
                      </Button>
                    </div>
                    <p className="text-xs text-charcoal-500 italic">
                      Попробуйте промокоды: <span className="font-medium">demo10</span> или <span className="font-medium">demo20</span>
                    </p>
                  </div>
                  
                  {/* Checkout Button */}
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full mt-6 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 font-medium px-6 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-none"
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? 'Обработка...' : 'Оформить заказ'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <p className="text-xs text-charcoal-500 text-center mt-4">
                    Нажимая кнопку «Оформить заказ», вы соглашаетесь с <Link href="/terms" className="text-primary-500 hover:underline">условиями обработки</Link> персональных данных
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-secondary-100 premium-shadow">
            <div className="w-24 h-24 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-secondary-100">
              <ShoppingBag className="h-12 w-12 text-secondary-300" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-charcoal-800 font-heading">Ваша корзина пуста</h3>
            <p className="mt-4 text-charcoal-600 max-w-md mx-auto">
              Добавьте товары в корзину, чтобы оформить заказ. В нашем каталоге вы найдете множество интересных товаров.
            </p>
            <div className="mt-10">
              <Link href="/catalog">
                <Button className="bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 font-medium px-8 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-none">
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
