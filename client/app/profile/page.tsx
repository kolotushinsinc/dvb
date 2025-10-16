'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, ShoppingBag, Heart, MapPin, CreditCard, LogOut, Edit } from 'lucide-react';
import { api, Order } from '@/lib/api';
import { Product } from '@/types/product';
import { toast } from 'sonner';
import { useCart } from '@/components/cart/CartProvider';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addresses: Array<{
    _id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
}

interface Favorite {
  _id: string;
  product: Product;
  createdAt: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const { clearCart } = useCart();

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Get user profile
        const userResponse = await api.auth.getProfile();
        setUser(userResponse.data);
        setEditForm({
          firstName: userResponse.data.firstName,
          lastName: userResponse.data.lastName,
          email: userResponse.data.email,
          phone: userResponse.data.phone || ''
        });
        
        // Get user orders
        const ordersResponse = await api.orders.getUserOrders();
        setOrders(ordersResponse);
        
        // Get user favorites
        const favoritesResponse = await api.favorites.get();
        // Преобразуем массив продуктов в массив избранного
        const favoritesData = favoritesResponse.map((product, index) => ({
          _id: `fav-${index}`,
          product,
          createdAt: new Date().toISOString()
        }));
        setFavorites(favoritesData);
      } catch (err) {
        toast.error('Не удалось загрузить данные профиля');
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const response = await api.auth.updateProfile(editForm.firstName, editForm.lastName, editForm.email);
      setUser(response.data);
      setIsEditing(false);
      toast.success('Профиль успешно обновлен');
    } catch (err) {
      toast.error('Не удалось обновить профиль');
      console.error('Profile update error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      clearCart();
      toast.success('Вы успешно вышли из системы');
      window.location.href = '/';
    } catch (err) {
      toast.error('Не удалось выйти из системы');
      console.error('Logout error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
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
          <p className="mt-4 text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Необходимо войти в систему</h1>
          <p className="mb-6">Для доступа к личному кабинету необходимо авторизоваться</p>
          <Link href="/auth/login">
            <Button>Войти</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Личный кабинет
          </h1>
          <p className="text-lg text-gray-600">
            {user.firstName} {user.lastName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Мой профиль
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Имя</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Телефон</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  )}
                  <Button 
                    onClick={() => setIsEditing(!isEditing)} 
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Отменить' : 'Редактировать'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Адреса доставки
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {user.addresses.map((address) => (
                      <div key={address._id} className="border rounded-lg p-3">
                        {address.isDefault && (
                          <Badge className="mb-2">По умолчанию</Badge>
                        )}
                        <p className="font-medium">{address.street}</p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-sm text-gray-600">{address.country}</p>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      Добавить адрес
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">У вас нет сохраненных адресов</p>
                    <Button variant="outline">Добавить адрес</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full mt-6 text-red-500 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Мои заказы
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Избранное
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-6">
                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <Card key={order._id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>Заказ #{order._id.slice(-8)}</CardTitle>
                              <CardDescription>
                                {formatDate(order.createdAt)}
                              </CardDescription>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                  <img 
                                    src={item.product.mainImage || ''}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Link href={`/product/${item.product._id}`} className="font-medium hover:text-primary">
                                    {item.product.name}
                                  </Link>
                                  <p className="text-sm text-gray-500">Количество: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{formatPrice(item.price)}</p>
                                </div>
                              </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Итого:</span>
                              <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                Повторить заказ
                              </Button>
                              <Button size="sm">
                                Отследить заказ
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">У вас еще нет заказов</h3>
                      <p className="text-gray-500 mb-6">Перейдите в каталог, чтобы сделать первый заказ</p>
                      <Link href="/catalog">
                        <Button>Перейти в каталог</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="favorites" className="mt-6">
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((favorite) => (
                      <Card key={favorite._id}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                              <img 
                                src={favorite.product.mainImage || ''}
                                alt={favorite.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <Link 
                                href={`/product/${favorite.product._id}`} 
                                className="font-medium hover:text-primary"
                              >
                                {favorite.product.name}
                              </Link>
                              <p className="font-bold text-primary mt-1">
                                {formatPrice(favorite.product.price)}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">
                                  Добавлено {formatDate(favorite.createdAt)}
                                </p>
                                <Button variant="outline" size="sm">
                                  В корзину
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">У вас нет избранных товаров</h3>
                      <p className="text-gray-500 mb-6">Добавляйте товары в избранное, чтобы не потерять их</p>
                      <Link href="/catalog">
                        <Button>Перейти в каталог</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Редактирование профиля</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSaveProfile} className="flex-1">
                  Сохранить
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;