'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CreditCard, Truck, RotateCcw, Shield, HelpCircle, Search } from 'lucide-react';

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
              <HelpCircle className="w-10 h-10 text-gray-700" />
            </div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Часто задаваемые вопросы
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Найдите ответы на самые распространенные вопросы о заказах, доставке и возврате товаров
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по вопросам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, categoryIndex) => (
              <div 
                key={categoryIndex}
                className="premium-card overflow-hidden"
              >
                <Accordion type="single" collapsible>
                  <AccordionItem value={category.category} className="border-none">
                    <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <category.icon className="w-6 h-6 text-gray-700" />
                        </div>
                        <span className="text-lg font-semibold text-gray-900 text-left">
                          {category.category}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6 pt-2">
                        {category.items.map((faq, faqIndex) => (
                          <div 
                            key={faqIndex} 
                            className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0"
                          >
                            <h3 className="font-semibold text-gray-900 mb-3 text-base">
                              {faq.question}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                По вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос.
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16">
          <div className="premium-card bg-gradient-to-br from-gray-800 to-gray-900 p-8 sm:p-10 text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4" style={{ color: '#000000' }}>
              Не нашли ответ на свой вопрос?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#000000' }}>
              Наша служба поддержки всегда готова помочь вам. Свяжитесь с нами удобным способом.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/contacts"
                className="inline-flex items-center justify-center px-8 py-4 bg-white font-semibold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                style={{ color: '#000000' }}
              >
                Связаться с нами
              </a>
              <a 
                href="tel:+78001234567"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/30"
                style={{ color: '#000000' }}
              >
                Позвонить нам
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
