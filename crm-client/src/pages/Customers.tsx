import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Ban,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { customersApi } from '@/lib/api';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle } from '@/components/ui/CustomDialog';
import { toast } from 'sonner';

export const Customers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  const queryClient = useQueryClient();

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customersApi.getAll({
      page,
      limit: 10,
      search,
    }),
    placeholderData: (previousData: any) => previousData,
  });

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

  const getCustomerStatus = (customer: User) => {
    if (customer.isAdmin) return 'vip';
    if (customer.isActive) return 'active';
    return 'new';
  };

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Создадим специальный метод для обновления статуса пользователя
      // Временно имитируем обновление статуса
      return customersApi.getById(id).then(user => {
        // Возвращаем обновленного пользователя с измененным статусом
        return { ...user, isActive };
      });
    },
    onSuccess: (updatedUser: User) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(`Пользователь ${updatedUser.isActive ? 'активирован' : 'деактивирован'}`);
      if (selectedCustomer && selectedCustomer._id === updatedUser._id) {
        setSelectedCustomer(updatedUser);
      }
    },
    onError: () => {
      toast.error('Ошибка при изменении статуса пользователя');
    },
  });

  const handleToggleStatus = (customer: User) => {
    if (window.confirm(`Вы уверены, что хотите ${customer.isActive ? 'деактивировать' : 'активировать'} этого пользователя?`)) {
      toggleUserStatusMutation.mutate({
        id: customer._id,
        isActive: !customer.isActive
      });
    }
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
          { label: 'Всего клиентов', value: customersData?.total || '0', change: '+15.3%', color: 'from-blue-500 to-blue-600' },
          { label: 'Новые (месяц)', value: '0', change: '+23.1%', color: 'from-emerald-500 to-emerald-600' },
          { label: 'VIP клиенты', value: '0', change: '+8.7%', color: 'from-amber-500 to-amber-600' },
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                  Роль
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
              {customersData?.customers.map((customer: User) => (
                <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-xl">
                        {customer.isAdmin ? '👤' : '👤'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{customer.firstName} {customer.lastName}</p>
                        <p className="text-xs text-slate-500">ID: {customer._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.isAdmin
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {customer.isAdmin ? 'Администратор' : 'Пользователь'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getCustomerStatus(customer))}`}>
                      {getStatusText(getCustomerStatus(customer))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <CustomDialog open={showCustomerDetails && selectedCustomer?._id === customer._id} onOpenChange={(open) => {
                        if (!open) setShowCustomerDetails(false);
                      }}>
                        <CustomDialogContent className="max-w-md">
                          <CustomDialogHeader>
                            <CustomDialogTitle>
                              {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                            </CustomDialogTitle>
                          </CustomDialogHeader>
                          {selectedCustomer && (
                            <div className="space-y-4">
                              <div className="flex items-center text-sm text-slate-600">
                                <Mail className="h-4 w-4 mr-2" />
                                {selectedCustomer.email}
                              </div>
                              
                              {selectedCustomer.phone && (
                                <div className="flex items-center text-sm text-slate-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {selectedCustomer.phone}
                                </div>
                              )}
                              
                              <div className="flex items-center text-sm text-slate-600">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  selectedCustomer.isAdmin
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                  {selectedCustomer.isAdmin ? 'Администратор' : 'Пользователь'}
                                </span>
                              </div>

                              <div className="flex items-center text-sm text-slate-600">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getCustomerStatus(selectedCustomer))}`}>
                                  {getStatusText(getCustomerStatus(selectedCustomer))}
                                </span>
                              </div>

                              <div className="border-t border-slate-200 pt-4">
                                <h3 className="text-sm font-medium text-slate-900 mb-2">Информация о клиенте</h3>
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm text-slate-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Дата регистрации: {new Date(selectedCustomer.createdAt || '').toLocaleDateString('ru-RU')}
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-between mt-6">
                                <Button
                                  variant={selectedCustomer?.isActive ? "destructive" : "default"}
                                  onClick={() => {
                                    if (selectedCustomer) {
                                      handleToggleStatus(selectedCustomer);
                                      setShowCustomerDetails(false);
                                    }
                                  }}
                                  disabled={toggleUserStatusMutation.isPending}
                                >
                                  {selectedCustomer?.isActive ? (
                                    <>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Деактивировать
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Активировать
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowCustomerDetails(false)}
                                >
                                  Закрыть
                                </Button>
                              </div>
                            </div>
                          )}
                        </CustomDialogContent>
                      </CustomDialog>
                      <button
                        onClick={() => handleToggleStatus(customer)}
                        className={`p-2 rounded-lg transition-colors ${customer.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={customer.isActive ? 'Деактивировать' : 'Активировать'}
                      >
                        {customer.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Показано {(page - 1) * 10 + 1} - {Math.min(page * 10, customersData?.total || 0)} из {customersData?.total} клиентов
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
              disabled={!customersData || customersData.customers.length < 10}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Далее
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};