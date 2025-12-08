'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useCategories } from '@/contexts/CategoriesContext';
import { api } from '@/lib/api';

const Footer = () => {
  const { categories } = useCategories(); // Use the categories context
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({
    address: 'г. Находка, ул. Ленинская 10, офис 10',
    phone: '+7 (914) 731-99-09',
    email: 'siriusdark999@yandex.ru',
    telegram: ''
  });

  useEffect(() => {
    // Fetch settings from API
    const fetchSettings = async () => {
      try {
        const data = await api.settings.get();
        setSettings({
          address: data.address || 'г. Находка, ул. Ленинская 10, офис 10',
          phone: data.phone || '+7 (914) 731-99-09',
          email: data.email || 'siriusdark999@yandex.ru',
          telegram: data.telegram || ''
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
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
                <span className="text-charcoal-600">{settings.phone} (круглосуточно)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gold-50 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gold-500" />
                </div>
                <span className="text-charcoal-600">{settings.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent-50 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-accent-500" />
                </div>
                <span className="text-charcoal-600">{settings.address}, Россия</span>
              </div>
              {settings.telegram && (
                <Link 
                  href={settings.telegram} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  <span className="font-medium">Telegram</span>
                </Link>
              )}
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

export { Footer };
export default Footer;
