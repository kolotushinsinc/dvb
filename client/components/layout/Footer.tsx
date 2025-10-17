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
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DV</span>
              </div>
              <span className="font-display text-2xl font-bold">BERRY</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Уникальная торговая платформа, объединяющая солнцезащитные очки из Китая и качественную одежду из Европы.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Каталог</h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category._id}>
                  <Link href={`/catalog/${category.slug}`} className="text-gray-300 hover:text-white transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/sale" className="text-gray-300 hover:text-white transition-colors">
                  Распродажа
                </Link>
              </li>
              <li>
                <Link href="/catalog/new" className="text-gray-300 hover:text-white transition-colors">
                  Новинки
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Поддержка</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Главная</Link></li>
              <li><Link href="/catalog" className="text-gray-300 hover:text-white transition-colors">Каталог</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">О нас</Link></li>
              <li><Link href="/contacts" className="text-gray-300 hover:text-white transition-colors">Контакты</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-white transition-colors">Частые вопросы</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Контакты</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">+7 (914) 731-99-09 (круглосуточно)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">siriusdark999@yandex.ru</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">г. Находка, ул. Ленинская 10, офис 10, Россия</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} DV BERRY. Все права защищены.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
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