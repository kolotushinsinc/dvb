'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Truck, CreditCard, Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Order } from '@/lib/api';

const OrderConfirmationPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const response = await api.orders.getOrderById(orderId);
        setOrder(response);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить информацию о заказе');
        console.error('Order load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'В обработке';
      case 'processing':
        return 'Собирается';
      case 'shipped':
        return 'Отправлен';
      case 'delivered':
        return 'Доставлен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка информации о заказе...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка</h1>
          <p className="text-gray-600 mb-6">{error || 'Информация о заказе не найдена'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profile">
              <Button>Мои заказы</Button>
            </Link>
            <Link href="/catalog">
              <Button variant="outline">Перейти в каталог</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Заказ успешно оформлен!
          </h1>
          <p className="text-lg text-gray-600">
            Спасибо за ваш заказ! Мы приняли его и уже начали обрабатывать.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Заказ #{order._id.slice(-8)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Дата оформления</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Статус</p>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Состав заказа</h3>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 py-3 border-b border-gray-100">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={item.product.mainImage || ''} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-primary">
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                        {(item.size || item.color) && (
                          <div className="flex gap-1 mt-1">
                            {item.size && (
                              <Badge variant="secondary" className="text-xs">Размер: {item.size}</Badge>
                            )}
                            {item.color && (
                              <Badge variant="secondary" className="text-xs">Цвет: {item.color}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Информация о доставке
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Адрес доставки</h3>
                    <div className="space-y-2">
                      <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Способ оплаты</h3>
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                      <span>Банковская карта</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Итоги заказа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Товары</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доставка</span>
                    <span>Бесплатно</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Итого</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                
                <div className="pt-6 space-y-3">
                  <p className="text-sm text-gray-600">
                    Мы отправили информацию о заказе на вашу почту.
                  </p>
                  <p className="text-sm text-gray-600">
                    Статус заказа можно отслеживать в личном кабинете.
                  </p>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Link href="/profile">
                    <Button className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Личный кабинет
                    </Button>
                  </Link>
                  <Link href="/catalog">
                    <Button variant="outline" className="w-full">
                      Продолжить покупки
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;