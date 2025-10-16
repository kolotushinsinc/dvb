import { Search, Filter, UserPlus, Mail, Phone, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');

  const customers = [
    {
      id: '1',
      name: 'Иван Петров',
      email: 'ivan.petrov@example.com',
      phone: '+7 (999) 123-45-67',
      orders: 12,
      totalSpent: 189450,
      avatar: '👤',
      status: 'active',
    },
    {
      id: '2',
      name: 'Мария Сидорова',
      email: 'maria.sidorova@example.com',
      phone: '+7 (999) 234-56-78',
      orders: 8,
      totalSpent: 125600,
      avatar: '👩',
      status: 'active',
    },
    {
      id: '3',
      name: 'Алексей Иванов',
      email: 'alexey.ivanov@example.com',
      phone: '+7 (999) 345-67-89',
      orders: 15,
      totalSpent: 234890,
      avatar: '👨',
      status: 'active',
    },
    {
      id: '4',
      name: 'Елена Васильева',
      email: 'elena.vasilyeva@example.com',
      phone: '+7 (999) 456-78-90',
      orders: 5,
      totalSpent: 87300,
      avatar: '👩',
      status: 'active',
    },
    {
      id: '5',
      name: 'Дмитрий Козлов',
      email: 'dmitry.kozlov@example.com',
      phone: '+7 (999) 567-89-01',
      orders: 20,
      totalSpent: 345670,
      avatar: '👨',
      status: 'vip',
    },
    {
      id: '6',
      name: 'Анна Смирнова',
      email: 'anna.smirnova@example.com',
      phone: '+7 (999) 678-90-12',
      orders: 3,
      totalSpent: 45600,
      avatar: '👩',
      status: 'new',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip':
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white';
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'new':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'vip':
        return 'VIP';
      case 'active':
        return 'Активный';
      case 'new':
        return 'Новый';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Клиенты</h1>
          <p className="text-slate-600 mt-1">Управление базой клиентов</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
          <UserPlus className="w-5 h-5" />
          Добавить клиента
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Всего клиентов', value: '4,567', change: '+15.3%', color: 'from-blue-500 to-blue-600' },
          { label: 'Новые (месяц)', value: '234', change: '+23.1%', color: 'from-emerald-500 to-emerald-600' },
          { label: 'VIP клиенты', value: '89', change: '+8.7%', color: 'from-amber-500 to-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <span className="text-sm font-semibold text-emerald-600">{stat.change}</span>
            </div>
            <div className={`mt-3 h-1.5 bg-gradient-to-r ${stat.color} rounded-full`} />
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
                placeholder="Поиск клиентов..."
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
                  Клиент
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Заказов
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Сумма покупок
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
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-xl">
                        {customer.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                        <p className="text-xs text-slate-500">ID: {customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900">{customer.orders}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900">₽{customer.totalSpent.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {getStatusText(customer.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">Показано 6 из 4,567 клиентов</p>
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
