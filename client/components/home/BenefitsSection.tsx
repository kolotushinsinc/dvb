import { Truck, Shield, RotateCcw, Headphones, Star, Globe } from 'lucide-react';

const benefits = [
  {
    icon: Globe,
    title: 'Эксклюзивные очки из Китая',
    description: 'Уникальные дизайнерские модели, которых больше нет нигде',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Star,
    title: 'Европейское качество одежды',
    description: 'Премиальные бренды из Италии, Германии, Франции и Турции',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: RotateCcw,
    title: 'Гарантия возврата',
    description: 'Возврат товара в течение 30 дней без лишних вопросов',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Truck,
    title: 'Быстрая доставка',
    description: 'По России от 1-3 дней, международные заказы 14-21 день',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Shield,
    title: 'Защита покупателя',
    description: 'Все товары застрахованы, безопасная оплата картой',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: Headphones,
    title: 'Поддержка 24/7',
    description: 'Наша команда всегда готова помочь с выбором товара',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-16 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">
            Почему выбирают DV BERRY?
          </h2>
          <p className="text-lg text-slate-600">
            Мы объединили лучшее со всего мира для создания уникального шопинг-опыта
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="group text-center p-6 bg-white rounded-2xl border border-cream-200 hover:shadow-md transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${benefit.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-700 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;