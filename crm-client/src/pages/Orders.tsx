import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle,
  Clock,
  TruckIcon,
  XCircle,
  Eye,
  Download,
  Package
} from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle, CustomDialogDescription, CustomDialogFooter } from '@/components/ui/CustomDialog';
import { Badge } from '@/components/ui/badge';

const statusLabels = {
  PENDING: 'В ожидании',
  CONFIRMED: 'Подтвержден',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменен',
  REFUNDED: 'Возвращен',
};

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Clock,
  SHIPPED: TruckIcon,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  REFUNDED: XCircle,
};

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  REFUNDED: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const Orders = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', page, selectedStatus],
    queryFn: () => ordersApi.getAll({
      page,
      limit: 10,
      status: selectedStatus,
    }),
    placeholderData: (previousData) => previousData,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Статус заказа обновлен');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса заказа');
    },
  });

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Заказы</h1>
          <p className="text-slate-600 mt-1">Управление и отслеживание заказов</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
          <Download className="w-5 h-5 mr-2" />
          Экспорт
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Всего', value: ordersData?.total?.toString() || '0', color: 'from-slate-600 to-slate-700' },
          { label: 'Ожидание', value: '0', color: 'from-amber-500 to-amber-600' },
          { label: 'Обработка', value: '0', color: 'from-blue-500 to-blue-600' },
          { label: 'Отправлено', value: '0', color: 'from-purple-500 to-purple-600' },
          { label: 'Доставлено', value: '0', color: 'from-emerald-500 to-emerald-600' },
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            
            <select
              className="px-6 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Все статусы</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <Button variant="outline" className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
              <Filter className="w-5 h-5 mr-2" />
              Фильтры
            </Button>
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
              {ordersData?.orders?.map((order: Order) => {
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                return (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">#{order.orderNumber?.slice(-6) || order._id.slice(-6)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{order.shippingFirstName} {order.shippingLastName}</p>
                        <p className="text-xs text-slate-500">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{order.items?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      ₽{new Intl.NumberFormat('ru-RU').format(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'destructive' : 'secondary'} className="border">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value as Order['status'])}
                          className="text-xs rounded border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Показано {(page - 1) * 10 + 1} - {Math.min(page * 10, ordersData?.total || 0)} из {ordersData?.total} заказов
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </Button>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={!ordersData || ordersData.orders?.length < 10}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Далее
            </Button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <CustomDialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <CustomDialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <CustomDialogHeader>
            <CustomDialogTitle className="text-xl font-bold text-slate-900">Детали заказа #{selectedOrder?._id.slice(-6)}</CustomDialogTitle>
          </CustomDialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Клиент</h3>
                  <p className="text-sm text-slate-900">
                    {selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}
                  </p>
                  <p className="text-sm text-slate-500">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Статус</h3>
                  <Badge variant={selectedOrder.status === 'DELIVERED' ? 'success' : selectedOrder.status === 'CANCELLED' ? 'destructive' : 'secondary'} className="border">
                    {statusLabels[selectedOrder.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Дата создания</h3>
                  <p className="text-sm text-slate-900">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Сумма</h3>
                  <p className="text-sm font-slate-900">
                    {new Intl.NumberFormat('ru-RU').format(selectedOrder.totalAmount)} ₽
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Адрес доставки</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-900">
                    {selectedOrder.shippingAddress}, {selectedOrder.shippingCity}
                  </p>
                  <p className="text-sm text-slate-900">
                    {selectedOrder.shippingState}, {selectedOrder.shippingZip}
                  </p>
                  <p className="text-sm text-slate-900">{selectedOrder.shippingCountry}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Товары</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Товар
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Количество
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Цена
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                            {typeof item.product === 'object' ? item.product.name : 'Товар'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {item.quantity} шт.
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                            {new Intl.NumberFormat('ru-RU').format(item.price)} ₽
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CustomDialogContent>
      </CustomDialog>
    </div>
  );
};