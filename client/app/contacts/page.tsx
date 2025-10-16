'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import Link from 'next/link';

const ContactsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Свяжитесь с нами
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Мы всегда рады помочь вам с любыми вопросами, предложениями или проблемами
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-8">
              Контактная информация
            </h2>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="flex items-start space-x-4 pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Адрес</h3>
                    <p className="text-gray-700">
                      г. Находка, ул. Ленинская 10, офис 10<br />
                      Россия
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-start space-x-4 pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                    <p className="text-gray-700">
                      <Link href="tel:+79147319909" className="hover:text-primary">
                        +7 (914) 731-99-09
                      </Link>
                      <br />
                      <span className="text-sm">Круглосуточно</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-start space-x-4 pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-700">
                      <Link href="mailto:siriusdark999@yandex.ru" className="hover:text-primary">
                        siriusdark999@yandex.ru
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-start space-x-4 pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Режим работы</h3>
                    <p className="text-gray-700">
                      Понедельник - Пятница: 9:00 - 18:00<br />
                      Суббота - Воскресенье: 10:00 - 16:00
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <div className="mt-8">
              <h3 className="font-display text-xl font-bold text-gray-900 mb-4">Наш офис</h3>
              <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2924.4703748786!2d132.8983573154327!3d42.81155697916585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5fb48abbe5b5f6a1%3A0x8b4c3e3e3e3e3e3!2z0L_RgNC-0YHQutC-0Lkg0JzQvtGB0LrQstCwLCAxMCwg0J3QvtCy0L7RgdGC0LDRgtC-0L3QsNGPINC-0LHQu9Cw0YHRgdC40Y8!5e0!3m2!1sru!2sru!4v1620000000000!5m2!1sru!2sru"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Наш офис на карте"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-8">
              Напишите нам
            </h2>
            
            {submitSuccess ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Сообщение отправлено!</h3>
                  <p className="text-green-700">
                    Спасибо за ваше сообщение. Мы свяжемся с вами в ближайшее время.
                  </p>
                  <Button 
                    className="mt-6"
                    onClick={() => setSubmitSuccess(false)}
                  >
                    Отправить еще одно сообщение
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Форма обратной связи</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Имя *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ваше имя"
                          className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="ваш@email.com"
                          className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Тема *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Тема сообщения"
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Сообщение *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Напишите ваше сообщение здесь..."
                        rows={6}
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-12 text-center">
            Часто задаваемые вопросы
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                question: 'Как сделать заказ?',
                answer: 'Чтобы сделать заказ, выберите товары, добавьте их в корзину, перейдите к оформлению и заполните необходимые данные.'
              },
              {
                question: 'Какие способы оплаты доступны?',
                answer: 'Мы принимаем банковские карты, электронные кошельки и оплату при получении.'
              },
              {
                question: 'Какие сроки доставки?',
                answer: 'Сроки доставки зависят от региона. По Москве - 1-2 дня, по России - 3-7 дней.'
              },
              {
                question: 'Можно ли вернуть товар?',
                answer: 'Да, вы можете вернуть товар в течение 14 дней с момента получения, если он не был в использовании.'
              },
              {
                question: 'Есть ли гарантия на товары?',
                answer: 'Да, на все товары предоставляется гарантия от производителя. Срок гарантии указан в описании товара.'
              },
              {
                question: 'Как отследить заказ?',
                answer: 'Информацию о статусе заказа можно найти в личном кабинете или по ссылке, отправленной на email.'
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactsPage;