'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Truck, Shield, RotateCcw, Users } from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    orders: 0,
    satisfaction: 0
  });

  // Simulate loading stats
  useEffect(() => {
    const loadStats = async () => {
      // In a real app, we would fetch these from the API
      setTimeout(() => {
        setStats({
          customers: 5000,
          products: 200,
          orders: 12000,
          satisfaction: 98
        });
      }, 1000);
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            О нас
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            DV BERRY - это уникальная торговая платформа, объединяющая солнцезащитные очки из Китая и качественную одежду из Европы.
          </p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.customers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Довольных клиентов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.products}</div>
              <div className="text-sm text-gray-600">Товаров в каталоге</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.orders.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Обработанных заказов</div>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-6">
              Наша история
            </h2>
            <p className="text-gray-600 mb-4">
              DV BERRY была основана в 2020 году с целью предоставить российским покупателям доступ к высококачественной одежде и аксессуарам из Европы и Китая.
            </p>
            <p className="text-gray-600 mb-4">
              Мы начали с небольшого ассортимента солнцезащитных очков, но быстро расширились, добавив одежду, обувь и аксессуары от проверенных поставщиков.
            </p>
            <p className="text-gray-600">
              Сегодня мы гордимся тем, что являемся одним из ведущих поставщиков модной одежды и аксессуаров в России, обслуживая более 5000 довольных клиентов.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3184358/pexels-photo-3184358.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Our story"
              className="w-full h-96 object-cover rounded-2xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-1" />
                <Star className="w-5 h-5 text-yellow-400 mr-1" />
                <Star className="w-5 h-5 text-yellow-400 mr-1" />
                <Star className="w-5 h-5 text-yellow-400 mr-1" />
                <Star className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="font-bold">4.9/5</span>
              </div>
              <p className="text-sm text-gray-600">Рейтинг клиентов</p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-12 text-center">
            Наши ценности
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-6 h-6 mr-2 text-primary" />
                  Быстрая доставка
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Мы гарантируем быструю и надежную доставку по всей России. Бесплатная доставка при заказе от 5000 ₽.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-primary" />
                  Гарантия качества
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Все наши товары проходят строгий контроль качества. Мы работаем только с проверенными поставщиками.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RotateCcw className="w-6 h-6 mr-2 text-primary" />
                  Простой возврат
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Не понравился товар? Верните его в течение 14 дней без лишних вопросов. Мы ценим ваше доверие.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-12 text-center">
            Наша команда
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Александр Иванов', role: 'Основатель', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Мария Петрова', role: 'Менеджер по закупкам', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Дмитрий Сидоров', role: 'Логист', image: 'https://images.pexels.com/photos/842980/pexels-photo-842980.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Елена Козлова', role: 'Менеджер по клиентам', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400' }
            ].map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <div className="text-primary text-sm">{member.role}</div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary to-indigo-700 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="font-display text-3xl font-bold mb-4">
                Готовы начать покупки?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Присоединяйтесь к тысячам довольных клиентов уже сегодня
              </p>
              <Link href="/catalog">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  Перейти в каталог
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;