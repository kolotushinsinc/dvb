'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Category } from '@/types/product';

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const currentYear = new Date().getFullYear();

  // Load categories on mount with caching
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.categories.getAll();
        setCategories(response.filter(c => c.isActive));
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Use fallback categories if API call fails
        setCategories([
          { _id: 'glasses', name: 'Очки', slug: 'glasses', isActive: true, sortOrder: 1, level: 1 },
          { _id: 'clothing', name: 'Одежда', slug: 'clothing', isActive: true, sortOrder: 2, level: 1 },
          { _id: 'shoes', name: 'Обувь', slug: 'shoes', isActive: true, sortOrder: 3, level: 1 },
          { _id: 'accessories', name: 'Аксессуары', slug: 'accessories', isActive: true, sortOrder: 4, level: 1 }
        ]);
      }
    };

    loadCategories();
  }, []);

  return (
    <footer className="bg-white border-t border-secondary-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-300 to-primary-300 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <span className="text-primary-900 font-bold text-base">DB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-charcoal-800 tracking-tight group-hover:text-primary-600 transition-colors">DV BERRY</span>
                <span className="text-xs text-charcoal-500 -mt-1">Premium Store</span>
              </div>
            </Link>
            <p className="text-charcoal-600 leading-relaxed">
              Уникальная торговая платформа, объединяющая солнцезащитные очки из Китая и качественную одежду из Европы.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-charcoal-500 hover:text-primary-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-charcoal-500 hover:text-primary-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-charcoal-500 hover:text-primary-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-6 text-charcoal-800 border-b border-secondary-100 pb-2">Каталог</h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category._id}>
                  <Link href={`/catalog/${category.slug}`} className="text-charcoal-600 hover:text-primary-500 transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/sale" className="text-charcoal-600 hover:text-primary-500 transition-colors">
                  Распродажа
                </Link>
              </li>
              <li>
                <Link href="/catalog/new" className="text-charcoal-600 hover:text-primary-500 transition-colors">
                  Новинки
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-6 text-charcoal-800 border-b border-secondary-100 pb-2">Поддержка</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-charcoal-600 hover:text-primary-500 transition-colors">Главная</Link></li>
              <li><Link href="/catalog" className="text-charcoal-600 hover:text-primary-500 transition-colors">Каталог</Link></li>
              <li><Link href="/about" className="text-charcoal-600 hover:text-primary-500 transition-colors">О нас</Link></li>
              <li><Link href="/contacts" className="text-charcoal-600 hover:text-primary-500 transition-colors">Контакты</Link></li>
              <li><Link href="/faq" className="text-charcoal-600 hover:text-primary-500 transition-colors">Частые вопросы</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-6 text-charcoal-800 border-b border-secondary-100 pb-2">Контакты</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary-500" />
                </div>
                <span className="text-charcoal-600">+7 (914) 731-99-09 (круглосуточно)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gold-50 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gold-500" />
                </div>
                <span className="text-charcoal-600">siriusdark999@yandex.ru</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent-50 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-accent-500" />
                </div>
                <span className="text-charcoal-600">г. Находка, ул. Ленинская 10, офис 10, Россия</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-100 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-charcoal-500 text-sm">
              © {currentYear} DV BERRY. Все права защищены.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-charcoal-500 hover:text-primary-500 transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="text-charcoal-500 hover:text-primary-500 transition-colors">
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
