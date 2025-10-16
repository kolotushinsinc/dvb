'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Truck, Package, ArrowLeft, Shield } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getColorByName } from '@/lib/colors';

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
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect to cart page
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/cart" className="flex items-center text-primary hover:text-indigo-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в корзину
          </Link>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Оформление заказа
          </h1>
          <p className="text-lg text-gray-600">
            Заполните данные для оформления заказа
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Package className="w-5 h-5 mr-2" />
                  Контактная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+7 (999) 123-45-67"
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Truck className="w-5 h-5 mr-2" />
                  Адрес доставки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Имя *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Иван"
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Фамилия *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Иванов"
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Адрес *</Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ул. Ленина, д. 1, кв. 1"
                    className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Город *</Label>
                    <Input
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Москва"
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Область/край</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Московская обл."
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Почтовый индекс *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="123456"
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="country">Страна</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Способ оплаты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="cursor-pointer text-gray-900">Банковская карта</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="cursor-pointer text-gray-900">Наличные при получении</Label>
                  </div>
                </RadioGroup>

                {formData.paymentMethod === 'card' && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <Label htmlFor="cardName">Имя на карте *</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        required
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="IVAN IVANOV"
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Номер карты *</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Срок действия *</Label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          required
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="ММ/ГГ"
                          className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCVC">CVC *</Label>
                        <Input
                          id="cardCVC"
                          name="cardCVC"
                          required
                          value={formData.cardCVC}
                          onChange={handleChange}
                          placeholder="000"
                          className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Ваши платежные данные защищены и безопасны</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Комментарий к заказу</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Любые дополнительные пожелания или комментарии"
                  className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full py-6 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оформление заказа...' : `Оплатить ${formatPrice(finalTotal)}`}
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-gray-900">Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={`${item._id}-${item.size || ''}-${item.color || ''}`} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.mainImage ? (
                          <img
                            src={item.product.mainImage}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                        {(item.size || item.color) && (
                          <div className="flex gap-2 mt-1 items-center">
                            {item.size && (
                              <Badge variant="secondary" className="text-xs">Размер: {item.size}</Badge>
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
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Товары</span>
                    <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Доставка</span>
                    <span className="text-gray-900">{deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-sm text-gray-500">
                      Бесплатная доставка при заказе от 5000 ₽
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-700">Итого</span>
                  <span className="text-gray-900">{formatPrice(finalTotal)}</span>
                </div>
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