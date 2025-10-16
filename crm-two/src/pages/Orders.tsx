import { Search, Filter, Eye, Download, Package } from 'lucide-react';
import { useState } from 'react';

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState('');

  const orders = [
    {
      id: '#12345',
      customer: 'Иван Петров',
      date: '15 окт. 2024',
      items: 2,
      total: 24480,
      status: 'delivered',
      products: 'Ray-Ban Aviator, Nike Cap',
    },
    {
      id: '#12346',
      customer: 'Мария Сидорова',
      date: '15 окт. 2024',
      items: 1,
      total: 12500,
      status: 'processing',
      products: 'Nike Air Max 270',
    },
    {
      id: '#12347',
      customer: 'Алексей Иванов',
      date: '14 окт. 2024',
      items: 3,
      total: 32480,
      status: 'shipped',
      products: 'Adidas Jacket, Puma Sneakers',
    },
    {
      id: '#12348',
      customer: 'Елена Васильева',
      date: '14 окт. 2024',
      items: 1,
      total: 18500,
      status: 'pending',
      products: 'Oakley Holbrook',
    },
    {
      id: '#12349',
      customer: 'Дмитрий Козлов',
      date: '13 окт. 2024',
      items: 2,
      total: 19980,
      status: 'delivered',
      products: 'Puma Sneakers x2',
    },
    {
      id: '#12350',
      customer: 'Анна Смирнова',
      date: '13 окт. 2024',
      items: 4,
      total: 45600,
      status: 'cancelled',
      products: 'Various items',
    },
    {
      id: '#12351',
      customer: 'Сергей Новиков',
      date: '12 окт. 2024',
      items: 1,
      total: 15990,
      status: 'shipped',
      products: 'Ray-Ban Wayfarer',
    },
    {
      id: '#12352',
      customer: 'Ольга Федорова',
      date: '12 окт. 2024',
      items: 3,
      total: 38970,
      status: 'delivered',
      products: 'Oakley, Nike, Adidas',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Заказы</h1>
          <p className="text-slate-600 mt-1">Управление и отслеживание заказов</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
          <Download className="w-5 h-5" />
          Экспорт
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Всего', value: '1,234', color: 'from-slate-600 to-slate-700' },
          { label: 'Ожидание', value: '45', color: 'from-amber-500 to-amber-600' },
          { label: 'Обработка', value: '89', color: 'from-blue-500 to-blue-600' },
          { label: 'Отправлено', value: '156', color: 'from-purple-500 to-purple-600' },
          { label: 'Доставлено', value: '944', color: 'from-emerald-500 to-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <div className={`mt-2 h-1 bg-gradient-to-r ${stat.color} rounded-full`} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск заказов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
              <Filter className="w-5 h-5" />
              Фильтры
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  ID Заказа
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Товары
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{order.customer}</p>
                      <p className="text-xs text-slate-500">{order.products}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{order.items}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    ₽{order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">Показано 8 из 1,234 заказов</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Назад
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all">
              Далее
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
