'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Truck, Package, ArrowLeft, Shield, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getColorByName } from '@/lib/colors';
import { LazyImage } from '@/components/ui/LazyImage';

interface CheckoutForm {
  // Contact Information
  email: string;
  phone: string;
  
  // Shipping Address
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Payment Method
  paymentMethod: 'card' | 'cash';
  cardNumber?: string;
  cardExpiry?: string;
  cardCVC?: string;
  cardName?: string;
  
  // Order Notes
  notes?: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { items, totalPrice, loading, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(300);
  const [formData, setFormData] = useState<CheckoutForm>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Россия',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: '',
    notes: ''
  });

  // Check if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      toast.error('Корзина пуста');
      router.push('/cart');
    }
  }, [items, loading, router]);

  // Calculate delivery fee based on total price
  useEffect(() => {
    setDeliveryFee(totalPrice > 5000 ? 0 : 300);
  }, [totalPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value: 'card' | 'cash') => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.email || !formData.phone || !formData.firstName || !formData.lastName || 
        !formData.address || !formData.city || !formData.postalCode) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return false;
    }

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVC || !formData.cardName) {
        toast.error('Пожалуйста, заполните все данные карты');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare order data
      const orderItems = items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }));
      
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone
      };
      
      // Create order
      const order = await api.orders.create(orderItems, shippingAddress);
      
      // Clear cart
      await clearCart();
      
      // Show success message
      toast.success('Заказ успешно оформлен!');
      
      // Redirect to order confirmation page
      router.push(`/order-confirmation/${order._id}`);
    } catch (error: any) {
      toast.error(error.message || 'Не удалось оформить заказ');
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const finalTotal = totalPrice + deliveryFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-secondary-100 opacity-25"></div>
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-primary-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-lg text-charcoal-600 font-medium">Загрузка данных...</p>
          <p className="mt-2 text-charcoal-500">Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect to cart page
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
            Оформление <span className="premium-text">заказа</span>
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl md:mx-0 mx-auto">
            Заполните данные для завершения покупки
          </p>
          <div className="mt-6">
            <Link href="/cart" className="inline-flex items-center text-primary-500 hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="border-b border-primary-300 hover:border-primary-500">Вернуться в корзину</span>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <Card className="border-secondary-100 shadow-lg premium-shadow rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cream-50 to-white border-b border-secondary-100">
                <CardTitle className="flex items-center text-charcoal-800 font-heading">
                  <Package className="w-5 h-5 mr-2 text-primary-500" />
                  Контактная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-charcoal-700 font-medium">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-charcoal-700 font-medium">Телефон *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+7 (999) 123-45-67"
                      className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-secondary-100 shadow-lg premium-shadow rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cream-50 to-white border-b border-secondary-100">
                <CardTitle className="flex items-center text-charcoal-800 font-heading">
                  <Truck className="w-5 h-5 mr-2 text-primary-500" />
                  Адрес доставки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-charcoal-700 font-medium">Имя *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Иван"
                      className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-charcoal-700 font-medium">Фамилия *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Иванов"
                      className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-charcoal-700 font-medium">Адрес *</Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ул. Ленина, д. 1, кв. 1"
                    className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-charcoal-700 font-medium">Город *</Label>
                    <Input
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Москва"
                      className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-charcoal-700 font-medium">Область/край</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Московская обл."
                      className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode" className="text-charcoal-700 font-medium">Почтовый индекс *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="123456"
                      className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="country" className="text-charcoal-700 font-medium">Страна</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border-secondary-100 shadow-lg premium-shadow rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cream-50 to-white border-b border-secondary-100">
                <CardTitle className="flex items-center text-charcoal-800 font-heading">
                  <CreditCard className="w-5 h-5 mr-2 text-primary-500" />
                  Способ оплаты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 bg-secondary-50 p-4 rounded-xl border border-secondary-100 hover:border-primary-200 transition-colors cursor-pointer">
                    <RadioGroupItem value="card" id="card" className="text-primary-500" />
                    <Label htmlFor="card" className="cursor-pointer text-charcoal-800 font-medium flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-primary-500" />
                      Банковская карта
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 bg-secondary-50 p-4 rounded-xl border border-secondary-100 hover:border-primary-200 transition-colors cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" className="text-primary-500" />
                    <Label htmlFor="cash" className="cursor-pointer text-charcoal-800 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                      Наличные при получении
                    </Label>
                  </div>
                </RadioGroup>

                {formData.paymentMethod === 'card' && (
                  <div className="space-y-4 pt-4 border-t border-secondary-100 mt-4">
                    <div>
                      <Label htmlFor="cardName" className="text-charcoal-700 font-medium">Имя на карте *</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        required
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="IVAN IVANOV"
                        className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber" className="text-charcoal-700 font-medium">Номер карты *</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry" className="text-charcoal-700 font-medium">Срок действия *</Label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          required
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="ММ/ГГ"
                          className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCVC" className="text-charcoal-700 font-medium">CVC *</Label>
                        <Input
                          id="cardCVC"
                          name="cardCVC"
                          required
                          value={formData.cardCVC}
                          onChange={handleChange}
                          placeholder="000"
                          className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-charcoal-600 bg-cream-50 p-3 rounded-xl border border-secondary-100">
                      <Shield className="w-5 h-5 text-primary-500" />
                      <span>Ваши платежные данные защищены и безопасны</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card className="border-secondary-100 shadow-lg premium-shadow rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cream-50 to-white border-b border-secondary-100">
                <CardTitle className="text-charcoal-800 font-heading">Комментарий к заказу</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Label htmlFor="notes" className="text-charcoal-700 font-medium mb-1.5 block">Дополнительная информация</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Любые дополнительные пожелания или комментарии к заказу"
                  className="bg-secondary-50 border-secondary-200 focus:border-primary-300 focus:ring-primary-200 focus:bg-white text-charcoal-800 rounded-lg"
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900 font-medium px-6 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-none text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-primary-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Оформление заказа...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Оплатить {formatPrice(finalTotal)}
                </div>
              )}
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-secondary-100 shadow-lg premium-shadow rounded-2xl overflow-hidden sticky top-8">
              <CardHeader className="bg-gradient-to-r from-cream-50 to-white border-b border-secondary-100">
                <CardTitle className="text-charcoal-800 font-heading">Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={`${item._id}-${item.size || ''}-${item.color || ''}`} className="flex gap-4 pb-4 border-b border-secondary-100 hover:bg-cream-50/30 transition-colors p-3 rounded-lg">
                      <div className="w-16 h-16 bg-secondary-50 rounded-lg overflow-hidden flex-shrink-0 border border-secondary-100 shadow-sm">
                        {item.product.mainImage ? (
                          <LazyImage
                            src={item.product.mainImage}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : item.product.images && item.product.images.length > 0 ? (
                          <LazyImage
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary-100">
                            <ShoppingBag className="h-6 w-6 text-secondary-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-charcoal-800">{item.product.name}</p>
                        <p className="text-sm text-charcoal-500">
                          {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                        {(item.size || item.color) && (
                          <div className="flex gap-2 mt-1 items-center">
                            {item.size && (
                              <Badge variant="outline" className="bg-secondary-50 text-charcoal-700 border-secondary-200 text-xs">
                                Размер: {item.size}
                              </Badge>
                            )}
                            {item.color && (
                              <div className="flex items-center gap-1 bg-secondary-50 px-2 py-0.5 rounded-full border border-secondary-200 text-xs">
                                <span className="text-charcoal-600">Цвет:</span>
                                <div
                                  className="w-3 h-3 rounded-full border shadow-sm"
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
                      <div className="text-right">
                        <p className="font-medium text-charcoal-800">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="bg-secondary-100" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Товары</span>
                    <span className="text-charcoal-800 font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Доставка</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-charcoal-800'}`}>
                      {deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}
                    </span>
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
                </div>
                
                <Separator className="bg-secondary-100" />
                
                <div className="flex justify-between font-bold text-xl">
                  <span className="text-charcoal-800">Итого</span>
                  <span className="premium-text">{formatPrice(finalTotal)}</span>
                </div>
                
                <p className="text-xs text-charcoal-500 text-center mt-4">
                  Нажимая кнопку «Оплатить», вы соглашаетесь с <Link href="/terms" className="text-primary-500 hover:underline">условиями обработки</Link> персональных данных
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
