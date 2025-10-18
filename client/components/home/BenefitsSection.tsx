import { Truck, Shield, RotateCcw, Headphones, Star, Globe } from 'lucide-react';

const benefits = [
  {
    icon: Globe,
    title: 'Эксклюзивные очки из Китая',
    description: 'Уникальные дизайнерские модели, которых больше нет нигде',
    color: 'text-primary-500',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    shadowColor: 'shadow-primary-100/50',
  },
  {
    icon: Star,
    title: 'Европейское качество одежды',
    description: 'Премиальные бренды из Италии, Германии, Франции и Турции',
    color: 'text-gold-500',
    bgColor: 'bg-gold-50',
    borderColor: 'border-gold-200',
    shadowColor: 'shadow-gold-100/50',
  },
  {
    icon: RotateCcw,
    title: 'Гарантия возврата',
    description: 'Возврат товара в течение 30 дней без лишних вопросов',
    color: 'text-accent-500',
    bgColor: 'bg-accent-50',
    borderColor: 'border-accent-200',
    shadowColor: 'shadow-accent-100/50',
  },
  {
    icon: Truck,
    title: 'Быстрая доставка',
    description: 'По России от 1-3 дней, международные заказы 14-21 день',
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    shadowColor: 'shadow-primary-100/50',
  },
  {
    icon: Shield,
    title: 'Защита покупателя',
    description: 'Все товары застрахованы, безопасная оплата картой',
    color: 'text-bronze-500',
    bgColor: 'bg-bronze-50',
    borderColor: 'border-bronze-200',
    shadowColor: 'shadow-bronze-100/50',
  },
  {
    icon: Headphones,
    title: 'Поддержка 24/7',
    description: 'Наша команда всегда готова помочь с выбором товара',
    color: 'text-gold-600',
    bgColor: 'bg-gold-50',
    borderColor: 'border-gold-200',
    shadowColor: 'shadow-gold-100/50',
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal-800 mb-4 tracking-tight">
            Почему выбирают <span className="premium-text">DV BERRY</span>?
          </h2>
          <p className="text-lg text-charcoal-600 max-w-3xl mx-auto">
            Мы объединили лучшее со всего мира для создания уникального премиального шопинг-опыта
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className={`group text-center p-8 bg-white rounded-2xl border ${benefit.borderColor} hover:shadow-xl transition-all duration-300 ${benefit.shadowColor} hover:-translate-y-2`}
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 ${benefit.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <IconComponent className={`w-10 h-10 ${benefit.color}`} />
                </div>
                <h3 className="font-heading text-xl font-bold text-charcoal-800 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
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
