import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Tag, Package } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle, CustomDialogFooter } from '@/components/ui/CustomDialog';

export const Categories = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    image: '',
    slug: '',
    isActive: true,
    sortOrder: 0,
    parentId: '',
    level: 0,
    categoryType: 'GLASSES' as 'GLASSES' | 'SHOES' | 'CLOTHING' | 'ACCESSORIES',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    image: '',
    slug: '',
    isActive: true,
    sortOrder: 0,
    parentId: '',
    level: 0,
    categoryType: 'GLASSES' as 'GLASSES' | 'SHOES' | 'CLOTHING' | 'ACCESSORIES',
  });

  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(true),
  });

  const createCategoryMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория создана');
      setShowCreateModal(false);
      setCreateFormData({
        name: '',
        description: '',
        image: '',
        slug: '',
        isActive: true,
        sortOrder: 0,
        parentId: '',
        level: 0,
        categoryType: 'GLASSES'
      });
    },
    onError: () => {
      toast.error('Ошибка при создании категории');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория обновлена');
      setShowEditModal(false);
      setSelectedCategory(null);
    },
    onError: () => {
      toast.error('Ошибка при обновлении категории');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория удалена');
    },
    onError: () => {
      toast.error('Ошибка при удалении категории');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a copy of the form data to modify
    const formData = { ...createFormData };
    
    // No need to convert empty string to null anymore as the server now accepts empty strings
    
    createCategoryMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory) {
      // Create a copy of the form data to modify
      const formData = { ...editFormData };
      
      // No need to convert empty string to null anymore as the server now accepts empty strings
      
      updateCategoryMutation.mutate({
        id: selectedCategory._id,
        data: formData,
      });
    }
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || 0 : value
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || 0 : value
    }));
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory._id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      slug: category.slug,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      parentId: category.parentId || '',
      level: category.level,
      categoryType: category.categoryType || 'GLASSES',
    });
    setShowEditModal(true);
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
          <h1 className="text-3xl font-bold text-slate-900">Категории</h1>
          <p className="text-slate-600 mt-1">Управление категориями товаров</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" />
          Добавить категорию
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(categories) && categories?.map((category, index) => {
          // Define gradient colors based on index
          const gradients = [
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-purple-500 to-pink-500',
            'from-amber-500 to-orange-500',
            'from-red-500 to-rose-500',
            'from-slate-600 to-slate-700'
          ];
          const gradient = gradients[index % gradients.length];
          
          return (
            <div
              key={category._id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
            >
              <div className={`h-2 bg-gradient-to-r ${gradient}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-4xl shadow-lg`}>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <Tag className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{category.name}</h3>
                
                {category.description && (
                  <p className="text-sm text-slate-600 mb-4">{category.description}</p>
                )}

                <div className="flex items-center gap-2 text-slate-600">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">
                    {category.productsCount !== undefined ? `${category.productsCount} товаров` : '0 товаров'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {category.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                    Просмотреть товары
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {Array.isArray(categories) && categories?.length === 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl border border-emerald-200 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
              <Package className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Организуйте свой каталог</h3>
              <p className="text-slate-600">
                Создавайте и управляйте категориями для лучшей организации товаров. Это поможет клиентам быстрее находить нужные продукты.
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="px-8 py-3 bg-white text-emerald-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex-shrink-0">
              Добавить категорию
            </Button>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      <CustomDialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <CustomDialogContent className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
          <CustomDialogHeader>
            <CustomDialogTitle className="text-xl font-bold text-slate-900">Добавить категорию</CustomDialogTitle>
          </CustomDialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Название
              </label>
              <input
                type="text"
                name="name"
                value={createFormData.name}
                onChange={handleCreateChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Название категории"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Описание
              </label>
              <textarea
                name="description"
                value={createFormData.description}
                onChange={handleCreateChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Описание категории"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Изображение URL
              </label>
              <input
                type="text"
                name="image"
                value={createFormData.image}
                onChange={handleCreateChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="URL изображения"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL-идентификатор (slug)
              </label>
              <input
                type="text"
                name="slug"
                value={createFormData.slug}
                onChange={handleCreateChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="url-identifikator"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Родительская категория
              </label>
              <select
                name="parentId"
                value={createFormData.parentId}
                onChange={handleCreateChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">Нет (корневая категория)</option>
                {Array.isArray(categories) && categories?.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Тип категории
              </label>
              <select
                name="categoryType"
                value={createFormData.categoryType}
                onChange={handleCreateChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="GLASSES">Очки</option>
                <option value="SHOES">Обувь</option>
                <option value="CLOTHING">Одежда</option>
                <option value="ACCESSORIES">Аксессуары</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Порядок сортировки
              </label>
              <input
                type="number"
                name="sortOrder"
                value={createFormData.sortOrder}
                onChange={handleCreateChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Активна
              </label>
              <select
                name="isActive"
                value={createFormData.isActive ? 'true' : 'false'}
                onChange={(e) => setCreateFormData(prev => ({
                  ...prev,
                  isActive: e.target.value === 'true'
                }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Отмена
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
                {createCategoryMutation.isPending ? 'Создание...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </CustomDialogContent>
      </CustomDialog>

      {/* Edit Category Modal */}
      <CustomDialog open={showEditModal} onOpenChange={setShowEditModal}>
        <CustomDialogContent className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
          <CustomDialogHeader>
            <CustomDialogTitle className="text-xl font-bold text-slate-900">Редактировать категорию</CustomDialogTitle>
          </CustomDialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Название
              </label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Описание
              </label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Изображение URL
              </label>
              <input
                type="text"
                name="image"
                value={editFormData.image}
                onChange={handleEditChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL-идентификатор (slug)
              </label>
              <input
                type="text"
                name="slug"
                value={editFormData.slug}
                onChange={handleEditChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Родительская категория
              </label>
              <select
                name="parentId"
                value={editFormData.parentId}
                onChange={handleEditChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">Нет (корневая категория)</option>
                {Array.isArray(categories) && categories?.map(category => {
                  // Исключаем текущую категорию и её дочерние элементы из списка родительских
                  if (selectedCategory && (category._id === selectedCategory._id ||
                      (category.children && category.children.some(child => child._id === selectedCategory._id)))) {
                    return null;
                  }
                  return (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Тип категории
              </label>
              <select
                name="categoryType"
                value={editFormData.categoryType}
                onChange={handleEditChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="GLASSES">Очки</option>
                <option value="SHOES">Обувь</option>
                <option value="CLOTHING">Одежда</option>
                <option value="ACCESSORIES">Аксессуары</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Порядок сортировки
              </label>
              <input
                type="number"
                name="sortOrder"
                value={editFormData.sortOrder}
                onChange={handleEditChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Активна
              </label>
              <select
                name="isActive"
                value={editFormData.isActive ? 'true' : 'false'}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  isActive: e.target.value === 'true'
                }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Отмена
              </Button>
              <Button type="submit" disabled={updateCategoryMutation.isPending} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
                {updateCategoryMutation.isPending ? 'Обновление...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </CustomDialogContent>
      </CustomDialog>

      {/* Delete Confirmation Modal */}
      <CustomDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <CustomDialogContent className="max-w-md">
          <CustomDialogHeader>
            <CustomDialogTitle className="text-xl font-bold text-slate-900">Подтверждение удаления</CustomDialogTitle>
          </CustomDialogHeader>
          <div className="py-4">
            <p className="text-slate-700">
              Вы уверены, что хотите удалить категорию "{selectedCategory?.name}"? Это действие невозможно отменить.
            </p>
          </div>
          <CustomDialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedCategory(null);
              }}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Отмена
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteCategoryMutation.isPending}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 transform hover:scale-[1.02]"
            >
              {deleteCategoryMutation.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </CustomDialogFooter>
        </CustomDialogContent>
      </CustomDialog>
    </div>
  );
};