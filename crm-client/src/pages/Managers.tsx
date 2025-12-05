import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Shield, UserCog, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isAdmin: boolean;
  isManager: boolean;
  isClient: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const Managers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>(''); // admin or manager
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    isAdmin: false,
    isManager: false,
    isClient: false,
    isActive: true
  });

  const isSuperAdmin = currentUser?.email === 'admin@dvberry.com';

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterStatus, filterType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('isActive', filterStatus);
      if (filterType === 'admin') params.append('isAdmin', 'true');
      if (filterType === 'manager') params.append('isAdmin', 'false');

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error: any) {
      toast.error('Ошибка загрузки пользователей');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        isAdmin: user.isAdmin,
        isManager: user.isManager,
        isClient: user.isClient,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        isAdmin: false,
        isManager: false,
        isClient: false,
        isActive: true
      });
    }
    setShowUserDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      // Prevent non-superadmin from creating/editing admins
      if (!isSuperAdmin && formData.isAdmin) {
        toast.error('Только главный администратор может управлять администраторами');
        return;
      }

      // Ensure at least one role is selected
      if (!formData.isAdmin && !formData.isManager && !formData.isClient) {
        toast.error('Выберите тип пользователя');
        return;
      }

      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, formData);
        toast.success('Пользователь обновлен');
      } else {
        await api.post('/admin/users', formData);
        toast.success('Пользователь создан');
      }
      setShowUserDialog(false);
      fetchUsers();
    } catch (error: any) {
      const errorData = error.response?.data;
      console.error('Save error:', errorData);
      
      if (errorData?.details && Array.isArray(errorData.details)) {
        // Show validation errors
        const validationErrors = errorData.details.map((d: any) => `${d.path}: ${d.msg}`).join(', ');
        toast.error(`Ошибка валидации: ${validationErrors}`);
      } else {
        const errorMessage = errorData?.error || errorData?.message || 'Ошибка сохранения';
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    // Prevent deleting superadmin
    if (deletingUser.email === 'admin@dvberry.com') {
      toast.error('Нельзя удалить главного администратора');
      return;
    }

    // Prevent non-superadmin from deleting admins
    if (!isSuperAdmin && deletingUser.isAdmin) {
      toast.error('Только главный администратор может удалять администраторов');
      return;
    }

    try {
      await api.delete(`/admin/users/${deletingUser._id}`);
      toast.success('Пользователь удален');
      setShowDeleteDialog(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка удаления');
    }
  };

  const getUserGroupBadge = (user: User) => {
    if (user.isAdmin) {
      return <Badge className="bg-purple-500 text-white"><Shield className="w-3 h-3 mr-1" />Администратор</Badge>;
    }
    if (user.isManager) {
      return <Badge className="bg-blue-500 text-white"><UserCog className="w-3 h-3 mr-1" />Менеджер</Badge>;
    }
    if (user.isClient) {
      return <Badge className="bg-green-500 text-white"><UserCog className="w-3 h-3 mr-1" />Клиент</Badge>;
    }
    return <Badge className="bg-gray-500 text-white"><UserCog className="w-3 h-3 mr-1" />Пользователь</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Менеджеры</h1>
          <p className="text-slate-600 mt-1">Управление пользователями и их правами</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Все типы</option>
            <option value="admin">Администраторы</option>
            <option value="manager">Менеджеры</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Все статусы</option>
            <option value="true">Активные</option>
            <option value="false">Неактивные</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterStatus('');
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                    Загрузка...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-slate-500">{user.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUserGroupBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <Badge className="bg-green-500 text-white">Активен</Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white">Неактивен</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingUser(user);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Назад
            </Button>
            <span className="text-sm text-slate-600">
              Страница {currentPage} из {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Вперед
            </Button>
          </div>
        )}
      </Card>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="password">Пароль {!editingUser && '*'}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? 'Оставьте пустым, чтобы не менять' : ''}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label className="block text-sm font-medium text-slate-700 mb-3">Тип пользователя</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAdmin: true, isManager: false, isClient: false })}
                  disabled={!isSuperAdmin}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.isAdmin
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Shield className={`w-6 h-6 mx-auto mb-2 ${formData.isAdmin ? 'text-purple-500' : 'text-slate-400'}`} />
                  <div className="text-sm font-medium text-slate-900">Администратор</div>
                  {!isSuperAdmin && <div className="text-xs text-slate-500 mt-1">Только для главного админа</div>}
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAdmin: false, isManager: true, isClient: false })}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    formData.isManager
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <UserCog className={`w-6 h-6 mx-auto mb-2 ${formData.isManager ? 'text-blue-500' : 'text-slate-400'}`} />
                  <div className="text-sm font-medium text-slate-900">Менеджер</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAdmin: false, isManager: false, isClient: true })}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    formData.isClient
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <UserCog className={`w-6 h-6 mx-auto mb-2 ${formData.isClient ? 'text-green-500' : 'text-slate-400'}`} />
                  <div className="text-sm font-medium text-slate-900">Клиент</div>
                </button>
              </div>
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700">Активен</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveUser} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
              {editingUser ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">
            Вы уверены, что хотите удалить пользователя {deletingUser?.firstName} {deletingUser?.lastName}?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
