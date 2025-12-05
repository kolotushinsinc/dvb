import React, { useState, useEffect } from 'react';
import { History, Filter, Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'user' | 'role' | 'permission';
  entityId?: string;
  entityName?: string;
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const ACTION_LABELS = {
  create: 'Создание',
  update: 'Изменение',
  delete: 'Удаление'
};

const ACTION_COLORS = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500'
};

const ENTITY_LABELS = {
  user: 'Пользователь',
  role: 'Роль',
  permission: 'Разрешение'
};

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/audit?${params.toString()}`);
      setLogs(response.data.logs);
      setTotalPages(response.data.pagination.pages);
    } catch (error: any) {
      toast.error('Ошибка загрузки истории');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      entityType: '',
      action: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderChanges = (changes?: AuditLog['changes']) => {
    if (!changes || changes.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {changes.map((change, index) => (
          <div key={index} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
            <span className="font-medium">{change.field}:</span>{' '}
            {change.oldValue !== undefined && (
              <>
                <span className="text-red-600">{JSON.stringify(change.oldValue)}</span>
                {' → '}
              </>
            )}
            <span className="text-green-600">{JSON.stringify(change.newValue)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">История изменений</h1>
          <p className="text-slate-600 mt-1">Журнал всех действий пользователей в системе</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.entityType}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Все типы</option>
            <option value="user">Пользователи</option>
            <option value="role">Роли</option>
            <option value="permission">Разрешения</option>
          </select>

          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Все действия</option>
            <option value="create">Создание</option>
            <option value="update">Изменение</option>
            <option value="delete">Удаление</option>
          </select>

          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            placeholder="Дата от"
          />

          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            placeholder="Дата до"
          />

          <Button variant="outline" onClick={resetFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
        </div>
      </Card>

      {/* Logs Timeline */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Загрузка...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>История изменений пуста</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log._id}
                className="flex gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${ACTION_COLORS[log.action]} flex items-center justify-center text-white`}>
                    {log.action === 'create' && <FileText className="w-5 h-5" />}
                    {log.action === 'update' && <FileText className="w-5 h-5" />}
                    {log.action === 'delete' && <FileText className="w-5 h-5" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${ACTION_COLORS[log.action]} text-white`}>
                          {ACTION_LABELS[log.action]}
                        </Badge>
                        <Badge variant="outline">
                          {ENTITY_LABELS[log.entityType]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-900">
                        <span className="font-medium">{log.userName}</span>
                        {' '}
                        {log.action === 'create' && 'создал(а)'}
                        {log.action === 'update' && 'изменил(а)'}
                        {log.action === 'delete' && 'удалил(а)'}
                        {' '}
                        {log.entityName && (
                          <span className="font-medium">"{log.entityName}"</span>
                        )}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  </div>

                  {renderChanges(log.changes)}

                  {log.ipAddress && (
                    <div className="mt-2 text-xs text-slate-500">
                      IP: {log.ipAddress}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center">
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
    </div>
  );
};
