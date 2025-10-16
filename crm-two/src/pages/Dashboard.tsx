import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      title: 'Общая выручка',
      value: '₽2,456,890',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Заказы',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Клиенты',
      value: '4,567',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Товары',
      value: '892',
      change: '-2.4%',
      trend: 'down',
      icon: Package,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const recentOrders = [
    { id: '#12345', customer: 'Иван Петров', product: 'Ray-Ban Aviator', amount: '₽15,990', status: 'delivered' },
    { id: '#12346', customer: 'Мария Сидорова', product: 'Nike Air Max', amount: '₽12,500', status: 'processing' },
    { id: '#12347', customer: 'Алексей Иванов', product: 'Adidas Jacket', amount: '₽8,990', status: 'shipped' },
    { id: '#12348', customer: 'Елена Васильева', product: 'Oakley Holbrook', amount: '₽18,500', status: 'pending' },
    { id: '#12349', customer: 'Дмитрий Козлов', product: 'Puma Sneakers', amount: '₽9,990', status: 'delivered' },
  ];

  const topProducts = [
    { name: 'Ray-Ban Aviator', sales: 156, revenue: '₽2,494,440', image: '🕶️' },
    { name: 'Nike Air Max 270', sales: 143, revenue: '₽1,787,500', image: '👟' },
    { name: 'Oakley Holbrook', sales: 98, revenue: '₽1,813,000', image: '🕶️' },
    { name: 'Adidas Ultraboost', sales: 87, revenue: '₽1,218,000', image: '👟' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Доставлен';
      case 'processing':
        return 'Обработка';
      case 'shipped':
        return 'Отправлен';
      case 'pending':
        return 'Ожидание';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Дашборд</h1>
        <p className="text-slate-600 mt-1">Обзор ключевых показателей вашего магазина</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Последние заказы</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID Заказа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{order.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Топ товары</h2>
          </div>
          <div className="p-6 space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-2xl">
                  {product.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.sales} продаж</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{product.revenue}</p>
                  <p className="text-xs text-slate-500">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
