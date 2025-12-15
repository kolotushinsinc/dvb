import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Permission {
  resource: string;
  actions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
}

interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const RESOURCES = [
  { id: 'products', label: 'Товары' },
  { id: 'categories', label: 'Категории' },
  { id: 'orders', label: 'Заказы' },
  { id: 'customers', label: 'Клиенты' },
  { id: 'users', label: 'Пользователи' },
  { id: 'roles', label: 'Роли' },
  { id: 'settings', label: 'Настройки' }
];

const ACTIONS = [
  { id: 'read', label: 'Чтение' },
  { id: 'create', label: 'Создание' },
  { id: 'update', label: 'Редактирование' },
  { id: 'delete', label: 'Удаление' },
  { id: 'export', label: 'Экспорт' }
];

export const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: RESOURCES.map(resource => ({
      resource: resource.id,
      actions: {
        read: false,
        create: false,
        update: false,
        delete: false,
        export: false
      }
    }))
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error: any) {
      toast.error('Ошибка загрузки ролей');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: RESOURCES.map(resource => {
          const existingPerm = role.permissions.find(p => p.resource === resource.id);
          return existingPerm || {
            resource: resource.id,
            actions: {
              read: false,
              create: false,
              update: false,
              delete: false,
              export: false
            }
          };
        })
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: RESOURCES.map(resource => ({
          resource: resource.id,
          actions: {
            read: false,
            create: false,
            update: false,
            delete: false,
            export: false
          }
        }))
      });
    }
    setShowRoleDialog(true);
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole._id}`, formData);
        toast.success('Роль обновлена');
      } else {
        await api.post('/roles', formData);
        toast.success('Роль создана');
      }
      setShowRoleDialog(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const handleDeleteRole = async () => {
    if (!deletingRole) return;

    try {
      await api.delete(`/roles/${deletingRole._id}`);
      toast.success('Роль удалена');
      setShowDeleteDialog(false);
      setDeletingRole(null);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка удаления');
    }
  };

  const togglePermission = (resourceIndex: number, action: string) => {
    const newPermissions = [...formData.permissions];
    newPermissions[resourceIndex].actions[action as keyof typeof newPermissions[0]['actions']] = 
      !newPermissions[resourceIndex].actions[action as keyof typeof newPermissions[0]['actions']];
    setFormData({ ...formData, permissions: newPermissions });
  };

  const toggleAllActions = (resourceIndex: number, value: boolean) => {
    const newPermissions = [...formData.permissions];
    ACTIONS.forEach(action => {
      newPermissions[resourceIndex].actions[action.id as keyof typeof newPermissions[0]['actions']] = value;
    });
    setFormData({ ...formData, permissions: newPermissions });
  };

  const getPermissionCount = (role: Role) => {
    let count = 0;
    role.permissions.forEach(perm => {
      Object.values(perm.actions).forEach(value => {
        if (value) count++;
      });
    });
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Роли и права</h1>
          <p className="text-slate-600 mt-1">Управление ролями и разрешениями пользователей</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать роль
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Загрузка...
          </div>
        ) : roles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Роли не найдены
          </div>
        ) : (
          roles.map((role) => (
            <Card key={role._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-slate-900">{role.name}</h3>
                </div>
                {role.isSystem && (
                  <Badge className="bg-blue-500 text-white">Системная</Badge>
                )}
              </div>

              {role.description && (
                <p className="text-sm text-slate-600 mb-4">{role.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Разрешений:</span>
                  <Badge variant="outline">{getPermissionCount(role)}</Badge>
                </div>
                {role.updatedBy && (
                  <div className="text-xs text-slate-500">
                    Изменено: {role.updatedBy.firstName} {role.updatedBy.lastName}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(role)}
                  className="flex-1"
                  disabled={role.isSystem}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Редактировать
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeletingRole(role);
                    setShowDeleteDialog(true);
                  }}
                  className="text-red-600 hover:text-red-900"
                  disabled={role.isSystem}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Редактировать роль' : 'Создать роль'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="name">Название роли *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Менеджер продаж"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание роли"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Права доступа</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Ресурс
                      </th>
                      {ACTIONS.map(action => (
                        <th key={action.id} className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                          {action.label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                        Все
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {RESOURCES.map((resource, resourceIndex) => {
                      const permission = formData.permissions[resourceIndex];
                      const allChecked = ACTIONS.every(action => 
                        permission.actions[action.id as keyof typeof permission.actions]
                      );
                      
                      return (
                        <tr key={resource.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {resource.label}
                          </td>
                          {ACTIONS.map(action => (
                            <td key={action.id} className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={permission.actions[action.id as keyof typeof permission.actions]}
                                onChange={() => togglePermission(resourceIndex, action.id)}
                                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                              />
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={(e) => toggleAllActions(resourceIndex, e.target.checked)}
                              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveRole} className="bg-gradient-to-r from-emerald-500 to-cyan-500">
              {editingRole ? 'Сохранить' : 'Создать'}
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
            Вы уверены, что хотите удалить роль "{deletingRole?.name}"?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleDeleteRole} className="bg-red-500 hover:bg-red-600">
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
