import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { DashboardStats } from '@/types';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color
}: {
  title: string;
  value: string;
  icon: any;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-slate-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {trend && trendValue && (
      <div className={`flex items-center gap-1 text-sm font-semibold ${
        trend === 'up' ? 'text-emerald-600' : 'text-red-600'
      }`}>
        {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {trendValue}
      </div>
    )}
  </div>
);

export const Dashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return <div>Ошибка загрузки данных</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-700';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'REFUNDED':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'Доставлен';
      case 'PROCESSING':
        return 'Обработка';
      case 'SHIPPED':
        return 'Отправлен';
      case 'PENDING':
        return 'Ожидание';
      case 'CONFIRMED':
        return 'Подтвержден';
      case 'CANCELLED':
        return 'Отменен';
      case 'REFUNDED':
        return 'Возвращен';
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Общая выручка"
          value={`₽${new Intl.NumberFormat('ru-RU').format(stats.totalRevenue)}`}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          color="from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Заказы"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          trend="up"
          trendValue="+8.2%"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Клиенты"
          value={stats.totalCustomers.toString()}
          icon={Users}
          trend="up"
          trendValue="+15.3%"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Товары"
          value={stats.totalProducts.toString()}
          icon={Package}
          trend="down"
          trendValue="-2.4%"
          color="from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
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
                    Сумма
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(stats.recentOrders || []).map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      #{order.orderNumber?.slice(-6) || order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {order.shippingFirstName + ' ' + order.shippingLastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      ₽{new Intl.NumberFormat('ru-RU').format(order.totalAmount)}
                    </td>
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

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Топ товары</h2>
          </div>
          <div className="p-6 space-y-4">
            {(stats.topProducts || []).map((product, index) => (
              <div key={product._id} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-2xl">
                  🕶️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">{typeof product.category === 'object' ? product.category.name : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ₽{new Intl.NumberFormat('ru-RU').format(product.price)}
                  </p>
                  <p className="text-xs text-slate-500">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};