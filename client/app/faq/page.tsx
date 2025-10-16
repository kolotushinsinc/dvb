'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, Truck, Shield, RotateCcw, CreditCard, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const FAQPage = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const faqs = [
    {
      category: 'Заказы и оплата',
      icon: CreditCard,
      items: [
        {
          question: 'Как сделать заказ на сайте?',
          answer: 'Чтобы сделать заказ, выберите товары, добавьте их в корзину, перейдите к оформлению и заполните необходимые данные. После подтверждения заказа вы получите email с подтверждением.'
        },
        {
          question: 'Какие способы оплаты доступны?',
          answer: 'Мы принимаем оплату банковскими картами (Visa, MasterCard, МИР), электронными кошельками (Сбербанк Онлайн, QIWI, Яндекс.Деньги) и оплату наличными при получении.'
        },
        {
          question: 'Безопасны ли мои платежные данные?',
          answer: 'Да, все платежи обрабатываются через защищенные платежные шлюзы с использованием SSL-шифрования. Мы не храним данные вашей карты на наших серверах.'
        }
      ]
    },
    {
      category: 'Доставка',
      icon: Truck,
      items: [
        {
          question: 'Какие сроки доставки?',
          answer: 'По Москве и МО: 1-2 рабочих дня. По России: 3-7 рабочих дней в зависимости от региона. Точное время доставки будет указано при оформлении заказа.'
        },
        {
          question: 'Сколько стоит доставка?',
          answer: 'Бесплатная доставка при заказе от 5000 ₽. При заказе до 5000 ₽ стоимость доставки составляет 300 ₽ по Москве и 500 ₽ по России.'
        },
        {
          question: 'Могу ли я отслеживать свой заказ?',
          answer: 'Да, как только ваш заказ будет отправлен, вы получите email с трек-номером и ссылкой для отслеживания. Также вы можете отслеживать заказ в личном кабинете.'
        }
      ]
    },
    {
      category: 'Возврат и обмен',
      icon: RotateCcw,
      items: [
        {
          question: 'Можно ли вернуть товар?',
          answer: 'Да, вы можете вернуть товар в течение 14 дней с момента получения, если он не был в использовании, сохранен товарный вид и есть чек. Возврат осуществляется бесплатно.'
        },
        {
          question: 'Как обменять товар?',
          answer: 'Для обмена товара свяжитесь с нашей службой поддержки. Мы организуем доставку нового товара и заберем неподошедший. Обмен возможен в течение 14 дней.'
        },
        {
          question: 'Что делать, если товар пришел поврежденным?',
          answer: 'Если товар пришел поврежденным, немедленно свяжитесь с нашей службой поддержки. Мы организуем замену товара или возврат средств в зависимости от ситуации.'
        }
      ]
    },
    {
      category: 'Качество и гарантия',
      icon: Shield,
      items: [
        {
          question: 'Есть ли гарантия на товары?',
          answer: 'Да, на все товары предоставляется гарантия от производителя. Срок гарантии указан в описании товара и составляет от 6 месяцев до 2 лет в зависимости от категории товара.'
        },
        {
          question: 'Как проверяется качество товаров?',
          answer: 'Все товары проходят строгий контроль качества перед отправкой. Мы работаем только с проверенными поставщиками и регулярно проводим аудит качества продукции.'
        },
        {
          question: 'Что делать, если товар оказался бракованным?',
          answer: 'Если вы обнаружили брак, свяжитесь с нашей службой поддержки в течение гарантийного срока. Мы организуем замену товара или возврат средств.'
        }
      ]
    },
    {
      category: 'Аккаунт и личный кабинет',
      icon: HelpCircle,
      items: [
        {
          question: 'Как создать аккаунт?',
          answer: 'Нажмите на кнопку "Войти" в правом верхнем углу, затем выберите "Зарегистрироваться". Заполните форму и подтвердите регистрацию по email.'
        },
        {
          question: 'Что делать, если я забыл пароль?',
          answer: 'Нажмите "Войти", затем "Забыли пароль?". Введите свой email, и мы отправим инструкции по восстановлению пароля.'
        },
        {
          question: 'Как изменить данные аккаунта?',
          answer: 'Зайдите в личный кабинет, нажмите "Редактировать профиль" и внесите необходимые изменения. Все изменения сохраняются автоматически.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-6">
            Часто задаваемые вопросы
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Найдите ответы на самые распространенные вопросы о заказах, доставке, возврате и других аспектах работы нашего магазина
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по вопросам..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* FAQ Categories */}
        <Accordion 
          type="single" 
          collapsible 
          className="space-y-6"
          value={activeItem}
          onValueChange={setActiveItem}
        >
          {faqs.map((category, categoryIndex) => (
            <AccordionItem 
              key={categoryIndex} 
              value={category.category}
              className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{category.category}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  {category.items.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border-t border-gray-100 pt-4">
                      <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Still have questions? */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary to-indigo-700 rounded-2xl p-8 text-white">
            <h2 className="font-display text-2xl font-bold mb-4">
              Все еще остались вопросы?
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Наши специалисты всегда готовы помочь вам
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                <Link href="tel:+78001234567">Позвонить нам</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link href="/contacts">Написать сообщение</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-8 text-center">
            Популярные статьи
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Как правильно ухаживать за кожаной обувью',
                excerpt: 'Практические советы по уходу за кожаной обувью, чтобы она служила дольше.',
                image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400'
              },
              {
                title: 'Руководство по выбору солнцезащитных очков',
                excerpt: 'Как выбрать идеальные солнцезащитные очки по форме лица и стилю.',
                image: 'https://images.pexels.com/photos/2007647/pexels-photo-2007647.jpeg?auto=compress&cs=tinysrgb&w=400'
              },
              {
                title: 'Сезонные скидки: как получить максимальную выгоду',
                excerpt: 'Советы по покупке товаров в сезон распродаж со скидками до 70%.',
                image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400'
              }
            ].map((article, index) => (
              <Link key={index} href="#" className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;