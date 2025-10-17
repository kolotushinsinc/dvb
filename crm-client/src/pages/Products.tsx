import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Package,
  X,
  Eye,
  MoreVertical
} from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ColorSelector } from '@/components/ColorSelector';
import { ProductAttributes } from '@/components/ProductAttributes';
import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle, CustomDialogFooter } from '@/components/ui/CustomDialog';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ImageUpload';
import { MainImageUpload } from '@/components/MainImageUpload';
import { ImagePreviewModal } from '@/components/ImagePreviewModal';

export const Products = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states for creating a new product
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    category: '',
    isBrandNew: false,
    isOnSale: false,
    isFeatured: false,
    mainImage: null as any,
    images: [] as any[],
    brand: '',
    material: '',
    country: '',
    weight: '',
    dimensions: '',
    seoTitle: '',
    seoDescription: '',
    features: [] as string[],
    variants: [] as { type: 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'SEASON' | 'TECHNOLOGY'; value: string; price?: string; stock?: string }[],
    attributes: {} as any
  });

  // Получаем цвет из атрибутов для использования в цветовых вариантах
  const getMainColorFromAttributes = (attributes: any) => {
    return attributes?.color || '';
  };

  // Получаем информацию о цвете для отображения
  const getColorDisplayInfo = (colorCode: string) => {
    const colorMap: { [key: string]: { name: string; value: string } } = {
      'BLACK': { name: 'Черный', value: '#000000' },
      'WHITE': { name: 'Белый', value: '#FFFFFF' },
      'GRAY': { name: 'Серый', value: '#808080' },
      'BROWN': { name: 'Коричневый', value: '#A52A2A' },
      'BLUE': { name: 'Синий', value: '#0000FF' },
      'GREEN': { name: 'Зеленый', value: '#008000' },
      'RED': { name: 'Красный', value: '#FF0000' },
      'PINK': { name: 'Розовый', value: '#FFC0CB' },
      'PURPLE': { name: 'Фиолетовый', value: '#800080' },
      'YELLOW': { name: 'Желтый', value: '#FFFF00' },
      'ORANGE': { name: 'Оранжевый', value: '#FFA500' },
      'BEIGE': { name: 'Бежевый', value: '#F5F5DC' },
      'MULTICOLOR': { name: 'Разноцветный', value: '#808080' }
    };
    return colorMap[colorCode] || { name: colorCode, value: '#808080' };
  };

  // Form states for editing a product
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    category: '',
    isBrandNew: false,
    isOnSale: false,
    isFeatured: false,
    mainImage: null as any,
    images: [] as any[],
    brand: '',
    material: '',
    country: '',
    weight: '',
    dimensions: '',
    seoTitle: '',
    seoDescription: '',
    features: [] as string[],
    variants: [] as { type: 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'SEASON' | 'TECHNOLOGY'; value: string; price?: string; stock?: string }[],
    attributes: {} as any
  });

  const [newFeature, setNewFeature] = useState('');
  const [newVariant, setNewVariant] = useState({ type: 'SIZE' as 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'SEASON' | 'TECHNOLOGY', value: '', price: '', stock: '' });

  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', page, selectedCategory, search],
    queryFn: () => productsApi.getAll({
      page,
      limit: 10,
      category: selectedCategory,
      search,
    }),
    placeholderData: (previousData) => previousData,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });
  
  // Преобразуем данные в массив категорий
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const deleteProductMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Товар удален');
    },
    onError: () => {
      toast.error('Ошибка при удалении товара');
    },
  });

  const createProductMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Товар создан');
      setShowCreateModal(false);
      resetCreateForm();
    },
    onError: () => {
      toast.error('Ошибка при создании товара');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Товар обновлен');
      setShowEditModal(false);
      setSelectedProduct(null);
    },
    onError: () => {
      toast.error('Ошибка при обновлении товара');
    },
  });

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct._id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  const handleEdit = async (product: Product) => {
    // Fetch full product data with images
    const fullProduct = await productsApi.getById(product._id);
    setSelectedProduct(fullProduct);
    setEditFormData({
      name: fullProduct.name,
      description: fullProduct.description || '',
      shortDescription: fullProduct.shortDescription || '',
      price: fullProduct.price.toString(),
      originalPrice: fullProduct.originalPrice?.toString() || '',
      stock: fullProduct.stock.toString(),
      sku: fullProduct.sku || '',
      category: typeof fullProduct.category === 'object' ? fullProduct.category._id : fullProduct.category || '',
      isBrandNew: fullProduct.isBrandNew || false,
      isOnSale: fullProduct.isOnSale || false,
      isFeatured: fullProduct.isFeatured || false,
      mainImage: fullProduct.images?.find(img => img.isMain) ? {
        filename: fullProduct.images?.find(img => img.isMain)?.url?.split('/').pop() || '',
        thumbnailFilename: fullProduct.images?.find(img => img.isMain)?.thumbnailUrl?.split('/').pop() || '',
        originalName: fullProduct.name || '',
        size: 0,
        url: fullProduct.images?.find(img => img.isMain)?.url || '',
        thumbnailUrl: fullProduct.images?.find(img => img.isMain)?.thumbnailUrl || ''
      } : null,
      images: fullProduct.images?.filter(img => !img.isMain).map(img => ({
        filename: img.url?.split('/').pop() || '',
        thumbnailFilename: img.thumbnailUrl?.split('/').pop() || '',
        originalName: img.alt || '',
        size: 0,
        url: img.url || '',
        thumbnailUrl: img.thumbnailUrl || ''
      })) || [],
      brand: fullProduct.brand || '',
      material: fullProduct.material || '',
      country: fullProduct.country || '',
      weight: fullProduct.weight?.toString() || '',
      dimensions: fullProduct.dimensions || '',
      seoTitle: fullProduct.seoTitle || '',
      seoDescription: fullProduct.seoDescription || '',
      features: fullProduct.features || [],
      variants: fullProduct.variants?.map(v => ({
        type: v.type,
        value: v.value,
        price: v.price?.toString() || '',
        stock: v.stock?.toString() || ''
      })) || [],
      attributes: fullProduct.attributes || {}
    });
    setShowEditModal(true);
  };

  const resetCreateForm = () => {
    setCreateFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      stock: '',
      sku: '',
      category: '',
      isBrandNew: false,
      isOnSale: false,
      isFeatured: false,
      mainImage: null,
      images: [],
      brand: '',
      material: '',
      country: '',
      weight: '',
      dimensions: '',
      seoTitle: '',
      seoDescription: '',
      features: [],
      variants: [],
      attributes: {}
    });
  };

  const handleCreateFormChange = (field: string, value: any) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine main image and gallery images into a single images array
    const allImages = [];
    
    // Add main image first if it exists
    if (createFormData.mainImage) {
      allImages.push({
        url: createFormData.mainImage.url,
        thumbnailUrl: createFormData.mainImage.thumbnailUrl,
        alt: createFormData.name,
        isMain: true,
        sortOrder: 0
      });
    }
    
    // Add gallery images
    const galleryImages = createFormData.images.map((img, index) => ({
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      alt: createFormData.name,
      isMain: !createFormData.mainImage && index === 0, // Only mark as main if no main image is set
      sortOrder: createFormData.mainImage ? index + 1 : index
    }));
    
    allImages.push(...galleryImages);
    
    const productData = {
      ...createFormData,
      price: parseFloat(createFormData.price),
      originalPrice: createFormData.originalPrice ? parseFloat(createFormData.originalPrice) : undefined,
      stock: parseInt(createFormData.stock),
      mainImage: undefined, // Remove mainImage as it's now part of images array
      thumbnailUrl: undefined, // Remove thumbnailUrl as it's now part of images array
      images: allImages,
      variants: createFormData.variants.map(v => ({
        ...v,
        price: v.price ? parseFloat(v.price) : undefined,
        stock: v.stock ? parseInt(v.stock) : undefined
      }))
    };
    createProductMutation.mutate(productData as any);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    // Combine main image and gallery images into a single images array
    const allImages = [];
    
    // Add main image first if it exists
    if (editFormData.mainImage) {
      allImages.push({
        url: editFormData.mainImage.url,
        thumbnailUrl: editFormData.mainImage.thumbnailUrl,
        alt: editFormData.name,
        isMain: true,
        sortOrder: 0
      });
    }
    
    // Add gallery images
    const galleryImages = editFormData.images.map((img, index) => ({
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      alt: editFormData.name,
      isMain: !editFormData.mainImage && index === 0, // Only mark as main if no main image is set
      sortOrder: editFormData.mainImage ? index + 1 : index
    }));
    
    allImages.push(...galleryImages);
    
    const productData = {
      ...editFormData,
      price: parseFloat(editFormData.price),
      originalPrice: editFormData.originalPrice ? parseFloat(editFormData.originalPrice) : undefined,
      stock: parseInt(editFormData.stock),
      mainImage: undefined, // Remove mainImage as it's now part of images array
      thumbnailUrl: undefined, // Remove thumbnailUrl as it's now part of images array
      images: allImages,
      variants: editFormData.variants.map(v => ({
        ...v,
        price: v.price ? parseFloat(v.price) : undefined,
        stock: v.stock ? parseInt(v.stock) : undefined
      }))
    };
    updateProductMutation.mutate({ id: selectedProduct._id, data: productData as any });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setCreateFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setCreateFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addEditFeature = () => {
    if (newFeature.trim()) {
      setEditFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeEditFeature = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    if (newVariant.value.trim()) {
      setCreateFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant }]
      }));
      setNewVariant({ type: 'SIZE', value: '', price: '', stock: '' });
    }
  };

  const addColorFromAttributes = () => {
    const mainColor = getMainColorFromAttributes(createFormData.attributes);
    if (mainColor && !createFormData.variants.some(v => v.type === 'COLOR' && v.value === mainColor)) {
      setCreateFormData(prev => ({
        ...prev,
        variants: [...prev.variants, {
          type: 'COLOR',
          value: mainColor,
          price: '',
          stock: ''
        }]
      }));
      toast.success(`Добавлен цветовой вариант: ${mainColor}`);
    }
  };

  const removeVariant = (index: number) => {
    setCreateFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const addEditVariant = () => {
    if (newVariant.value.trim()) {
      setEditFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant }]
      }));
      setNewVariant({ type: 'SIZE', value: '', price: '', stock: '' });
    }
  };

  const removeEditVariant = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const addEditColorFromAttributes = () => {
    const mainColor = getMainColorFromAttributes(editFormData.attributes);
    if (mainColor && !editFormData.variants.some(v => v.type === 'COLOR' && v.value === mainColor)) {
      setEditFormData(prev => ({
        ...prev,
        variants: [...prev.variants, {
          type: 'COLOR',
          value: mainColor,
          price: '',
          stock: ''
        }]
      }));
      toast.success(`Добавлен цветовой вариант: ${mainColor}`);
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
          <h1 className="text-3xl font-bold text-slate-900">Товары</h1>
          <p className="text-slate-600 mt-1">Управление ассортиментом магазина</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" />
          Добавить товар
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select
            className="px-6 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Все категории</option>
            {categories?.map((category: Category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <Button variant="outline" className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Фильтры
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {productsData?.products?.map((product: Product) => (
            <div
              key={product._id}
              className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-4xl">
                    {product.mainImage ? (
                      <img className="w-full h-full rounded-2xl object-cover" src={product.mainImage.replace('https://api.dvberry.ru', '')} alt="" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.stock > 0 ? "success" : "destructive"}>
                      {product.stock > 0 ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{product.name || 'N/A'}</h3>
                <p className="text-sm text-slate-500 mb-4">{typeof product.category === 'object' ? product.category.name : product.category || 'N/A'}</p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">₽{product.price ? new Intl.NumberFormat('ru-RU').format(product.price) : '0'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">В наличии</p>
                    <p className={`text-lg font-bold ${
                      product.stock > 20 ? 'text-emerald-600' :
                      product.stock > 0 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {product.stock !== undefined ? product.stock : 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Изменить
                  </button>
                  {product.mainImage && (
                    <ImagePreviewModal
                      image={{
                        filename: product.mainImage.split('/').pop() || '',
                        thumbnailFilename: '',
                        originalName: product.name,
                        size: 0,
                        url: product.mainImage,
                        thumbnailUrl: product.mainImage
                      }}
                    >
                      <button className="p-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </ImagePreviewModal>
                  )}
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-700">
          Показано {(page - 1) * 10 + 1} - {Math.min(page * 10, productsData?.total || 0)} из {productsData?.total} товаров
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Назад
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={!productsData || productsData.products?.length < 10}
            className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Вперед
          </Button>
        </div>
      </div>

      {/* Create Product Modal */}
      <CustomDialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <CustomDialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <CustomDialogHeader>
            <CustomDialogTitle className="text-xl font-bold text-slate-900">Добавить товар</CustomDialogTitle>
          </CustomDialogHeader>
          
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название товара</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.name}
                  onChange={(e) => handleCreateFormChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Категория</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.category}
                  onChange={(e) => handleCreateFormChange('category', e.target.value)}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Цена</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.price}
                  onChange={(e) => handleCreateFormChange('price', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Старая цена</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.originalPrice}
                  onChange={(e) => handleCreateFormChange('originalPrice', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Количество на складе</label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.stock}
                  onChange={(e) => handleCreateFormChange('stock', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.sku}
                  onChange={(e) => handleCreateFormChange('sku', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Бренд</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.brand}
                  onChange={(e) => handleCreateFormChange('brand', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Материал</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.material}
                  onChange={(e) => handleCreateFormChange('material', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Страна</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.country}
                  onChange={(e) => handleCreateFormChange('country', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Вес (г)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.weight}
                  onChange={(e) => handleCreateFormChange('weight', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Габариты</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={createFormData.dimensions}
                  onChange={(e) => handleCreateFormChange('dimensions', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Краткое описание</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={2}
                value={createFormData.shortDescription}
                onChange={(e) => handleCreateFormChange('shortDescription', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Полное описание</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={4}
                value={createFormData.description}
                onChange={(e) => handleCreateFormChange('description', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SEO заголовок</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={createFormData.seoTitle}
                onChange={(e) => handleCreateFormChange('seoTitle', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SEO описание</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={2}
                value={createFormData.seoDescription}
                onChange={(e) => handleCreateFormChange('seoDescription', e.target.value)}
              />
            </div>
            
            <div>
              <MainImageUpload
                image={createFormData.mainImage}
                onImageChange={(image) => handleCreateFormChange('mainImage', image)}
              />
            </div>
            
            <div>
              <ImageUpload
                images={createFormData.images}
                onImagesChange={(images) => handleCreateFormChange('images', images)}
                maxImages={9}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Характеристики</label>
              <div className="space-y-2">
                {createFormData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...createFormData.features];
                        newFeatures[index] = e.target.value;
                        handleCreateFormChange('features', newFeatures);
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => removeFeature(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Новая характеристика"
                  />
                  <Button type="button" variant="outline" onClick={addFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Варианты</label>
                {getMainColorFromAttributes(createFormData.attributes) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addColorFromAttributes}
                    className="text-xs"
                  >
                    Использовать цвет из атрибутов
                  </Button>
                )}
              </div>
              {getMainColorFromAttributes(createFormData.attributes) && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <div
                      className="w-3 h-3 rounded-full mr-2 border border-gray-300"
                      style={{ backgroundColor: getColorDisplayInfo(getMainColorFromAttributes(createFormData.attributes)).value }}
                    ></div>
                    Основной цвет товара: <span className="font-medium ml-1">{getColorDisplayInfo(getMainColorFromAttributes(createFormData.attributes)).name}</span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {createFormData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select
                      className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      value={variant.type}
                      onChange={(e) => {
                        const newVariants = [...createFormData.variants];
                        newVariants[index].type = e.target.value as 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'SEASON' | 'TECHNOLOGY';
                        handleCreateFormChange('variants', newVariants);
                      }}
                    >
                      <option value="SIZE">Размер</option>
                      <option value="COLOR">Цвет</option>
                      <option value="MATERIAL">Материал</option>
                      <option value="STYLE">Стиль</option>
                      <option value="SEASON">Сезон</option>
                      <option value="TECHNOLOGY">Технология</option>
                    </select>
                    {variant.type === 'COLOR' ? (
                      <div className="col-span-2">
                        <ColorSelector
                          selectedColor={variant.value}
                          onColorChange={(colorName) => {
                            const newVariants = [...createFormData.variants];
                            newVariants[index].value = colorName;
                            handleCreateFormChange('variants', newVariants);
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        value={variant.value}
                        onChange={(e) => {
                          const newVariants = [...createFormData.variants];
                          newVariants[index].value = e.target.value;
                          handleCreateFormChange('variants', newVariants);
                        }}
                        placeholder="Значение"
                      />
                    )}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      value={variant.price}
                      onChange={(e) => {
                        const newVariants = [...createFormData.variants];
                        newVariants[index].price = e.target.value;
                        handleCreateFormChange('variants', newVariants);
                      }}
                      placeholder="Цена"
                    />
                    <Button type="button" variant="outline" onClick={() => removeVariant(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <select
                    className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={newVariant.type}
                    onChange={(e) => setNewVariant({...newVariant, type: e.target.value as 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'SEASON' | 'TECHNOLOGY'})}
                  >
                    <option value="SIZE">Размер</option>
                    <option value="COLOR">Цвет</option>
                    <option value="MATERIAL">Материал</option>
                    <option value="STYLE">Стиль</option>
                    <option value="SEASON">Сезон</option>
                    <option value="TECHNOLOGY">Технология</option>
                  </select>
                  {newVariant.type === 'COLOR' ? (
                    <div className="col-span-2">
                      <ColorSelector
                        selectedColor={newVariant.value}
                        onColorChange={(colorName) => setNewVariant({...newVariant, value: colorName})}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      value={newVariant.value}
                      onChange={(e) => setNewVariant({...newVariant, value: e.target.value})}
                      placeholder="Значение"
                    />
                  )}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
                    placeholder="Цена"
                  />
                  <input
                    type="number"
                    min="0"
                    className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})}
                    placeholder="Кол-во"
                  />
                  <Button type="button" variant="outline" onClick={addVariant}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Атрибуты товара</label>
              <ProductAttributes
                category={createFormData.category && categories ? categories.find(c => c._id === createFormData.category) || null : null}
                attributes={createFormData.attributes}
                onChange={(attributes) => handleCreateFormChange('attributes', attributes)}
                variants={createFormData.variants}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBrandNew"
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                  checked={createFormData.isBrandNew}
                  onChange={(e) => handleCreateFormChange('isBrandNew', e.target.checked)}
                />
                <label htmlFor="isBrandNew" className="ml-2 block text-sm text-slate-900">
                  Новинка
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isOnSale"
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                  checked={createFormData.isOnSale}
                  onChange={(e) => handleCreateFormChange('isOnSale', e.target.checked)}
                />
                <label htmlFor="isOnSale" className="ml-2 block text-sm text-slate-900">
                  Распродажа
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                  checked={createFormData.isFeatured}
                  onChange={(e) => handleCreateFormChange('isFeatured', e.target.checked)}
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-slate-900">
                  Рекомендуемый
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Отмена
              </Button>
              <Button type="submit" disabled={createProductMutation.isPending} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
                {createProductMutation.isPending ? 'Создание...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </CustomDialogContent>
      </CustomDialog>

      {/* Edit Product Modal */}
      <CustomDialog open={showEditModal} onOpenChange={setShowEditModal}>
        <CustomDialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <CustomDialogHeader>
            <CustomDialogTitle className="text-xl font-bold text-slate-900">Редактировать товар</CustomDialogTitle>
          </CustomDialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название товара</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.name}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Категория</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.category}
                  onChange={(e) => handleEditFormChange('category', e.target.value)}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Цена</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.price}
                  onChange={(e) => handleEditFormChange('price', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Старая цена</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.originalPrice}
                  onChange={(e) => handleEditFormChange('originalPrice', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Количество на складе</label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.stock}
                  onChange={(e) => handleEditFormChange('stock', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.sku}
                  onChange={(e) => handleEditFormChange('sku', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Бренд</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.brand}
                  onChange={(e) => handleEditFormChange('brand', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Материал</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.material}
                  onChange={(e) => handleEditFormChange('material', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Страна</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.country}
                  onChange={(e) => handleEditFormChange('country', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Вес (г)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.weight}
                  onChange={(e) => handleEditFormChange('weight', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Габариты</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={editFormData.dimensions}
                  onChange={(e) => handleEditFormChange('dimensions', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Краткое описание</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={2}
                value={editFormData.shortDescription}
                onChange={(e) => handleEditFormChange('shortDescription', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Полное описание</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={4}
                value={editFormData.description}
                onChange={(e) => handleEditFormChange('description', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SEO заголовок</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={editFormData.seoTitle}
                onChange={(e) => handleEditFormChange('seoTitle', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SEO описание</label>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={2}
                value={editFormData.seoDescription}
                onChange={(e) => handleEditFormChange('seoDescription', e.target.value)}
              />
            </div>
            
            <div>
              <MainImageUpload
                image={editFormData.mainImage}
                onImageChange={(image) => handleEditFormChange('mainImage', image)}
              />
            </div>
            
            <div>
              <ImageUpload
                images={editFormData.images}
                onImagesChange={(images) => handleEditFormChange('images', images)}
                maxImages={9}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Характеристики</label>
              <div className="space-y-2">
                {editFormData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...editFormData.features];
                        newFeatures[index] = e.target.value;
                        handleEditFormChange('features', newFeatures);
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => removeEditFeature(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Новая характеристика"
                  />
                  <Button type="button" variant="outline" onClick={addEditFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Варианты</label>
                {getMainColorFromAttributes(editFormData.attributes) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEditColorFromAttributes}
                    className="text-xs"
                  >
                    Использовать цвет из атрибутов
                  </Button>
                )}
              </div>
              {getMainColorFromAttributes(editFormData.attributes) && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <div
                      className="w-3 h-3 rounded-full mr-2 border border-gray-300"
                      style={{ backgroundColor: getColorDisplayInfo(getMainColorFromAttributes(editFormData.attributes)).value }}
                    ></div>
                    Основной цвет товара: <span className="font-medium ml-1">{getColorDisplayInfo(getMainColorFromAttributes(editFormData.attributes)).name}</span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {editFormData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select
                      className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      value={variant.type}
                      onChange={(e) => {
                        const newVariants = [...editFormData.variants];
                        newVariants[index].type = e.target.value as 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'SEASON' | 'TECHNOLOGY';
                        handleEditFormChange('variants', newVariants);
                      }}
                    >
                      <option value="SIZE">Размер</option>
                      <option value="COLOR">Цвет</option>
                      <option value="MATERIAL">Материал</option>
                      <option value="STYLE">Стиль</option>
                      <option value="SEASON">Сезон</option>
                      <option value="TECHNOLOGY">Технология</option>
                    </select>
                    {variant.type === 'COLOR' ? (
                      <div className="col-span-2">
                        <ColorSelector
                          selectedColor={variant.value}
                          onColorChange={(colorName) => {
                            const newVariants = [...editFormData.variants];
                            newVariants[index].value = colorName;
                            handleEditFormChange('variants', newVariants);
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        value={variant.value}
                        onChange={(e) => {
                          const newVariants = [...editFormData.variants];
                          newVariants[index].value = e.target.value;
                          handleEditFormChange('variants', newVariants);
                        }}
                        placeholder="Значение"
                      />
                    )}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      value={variant.price}
                      onChange={(e) => {
                        const newVariants = [...editFormData.variants];
                        newVariants[index].price = e.target.value;
                        handleEditFormChange('variants', newVariants);
                      }}
                      placeholder="Цена"
                    />
                    <Button type="button" variant="outline" onClick={() => removeEditVariant(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <select
                    className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={newVariant.type}
                    onChange={(e) => setNewVariant({...newVariant, type: e.target.value as 'SIZE' | 'COLOR' | 'MATERIAL' | 'STYLE' | 'SEASON' | 'TECHNOLOGY'})}
                  >
                    <option value="SIZE">Размер</option>
                    <option value="COLOR">Цвет</option>
                    <option value="MATERIAL">Материал</option>
                    <option value="STYLE">Стиль</option>
                    <option value="SEASON">Сезон</option>
                    <option value="TECHNOLOGY">Технология</option>
                  </select>
                  {newVariant.type === 'COLOR' ? (
                    <div className="col-span-2">
                      <ColorSelector
                        selectedColor={newVariant.value}
                        onColorChange={(colorName) => setNewVariant({...newVariant, value: colorName})}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      value={newVariant.value}
                      onChange={(e) => setNewVariant({...newVariant, value: e.target.value})}
                      placeholder="Значение"
                    />
                  )}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
                    placeholder="Цена"
                  />
                  <input
                    type="number"
                    min="0"
                    className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})}
                    placeholder="Кол-во"
                  />
                  <Button type="button" variant="outline" onClick={addEditVariant}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Атрибуты товара</label>
              <ProductAttributes
                category={editFormData.category && categories ? categories.find(c => c._id === editFormData.category) || null : null}
                attributes={editFormData.attributes}
                onChange={(attributes) => handleEditFormChange('attributes', attributes)}
                variants={editFormData.variants}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsBrandNew"
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                  checked={editFormData.isBrandNew}
                  onChange={(e) => handleEditFormChange('isBrandNew', e.target.checked)}
                />
                <label htmlFor="editIsBrandNew" className="ml-2 block text-sm text-slate-900">
                  Новинка
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsOnSale"
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                  checked={editFormData.isOnSale}
                  onChange={(e) => handleEditFormChange('isOnSale', e.target.checked)}
                />
                <label htmlFor="editIsOnSale" className="ml-2 block text-sm text-slate-900">
                  Распродажа
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsFeatured"
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                  checked={editFormData.isFeatured}
                  onChange={(e) => handleEditFormChange('isFeatured', e.target.checked)}
                />
                <label htmlFor="editIsFeatured" className="ml-2 block text-sm text-slate-900">
                  Рекомендуемый
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Отмена
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]">
                {updateProductMutation.isPending ? 'Сохранение...' : 'Сохранить'}
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
              Вы уверены, что хотите удалить товар "{selectedProduct?.name}"? Это действие невозможно отменить.
            </p>
          </div>
          <CustomDialogFooter className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProduct(null);
              }}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Отмена
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 transform hover:scale-[1.02]"
            >
              {deleteProductMutation.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </CustomDialogFooter>
        </CustomDialogContent>
      </CustomDialog>
    </div>
  );
};