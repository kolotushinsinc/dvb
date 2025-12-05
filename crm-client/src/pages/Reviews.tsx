import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Edit, Trash2, Search, Plus, User } from 'lucide-react';
import api from '@/lib/api';

interface FictionalAuthor {
  name: string;
  age?: number;
  city?: string;
  avatar?: string;
}

interface Review {
  _id: string;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  productId?: {
    _id: string;
    name: string;
    slug: string;
  };
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED';
  isFictional: boolean;
  fictionalAuthor?: FictionalAuthor;
  addedByAdmin: boolean;
  addedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AVATAR_OPTIONS = [
  '/avatars/avatar-1.png',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.png',
  '/avatars/avatar-5.png',
  '/avatars/avatar-6.png',
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    rating: 5,
    title: '',
    comment: '',
    status: 'PUBLISHED' as 'DRAFT' | 'PENDING' | 'PUBLISHED',
    isFictional: false,
    fictionalName: '',
    fictionalAge: undefined as number | undefined,
    fictionalCity: '',
    fictionalAvatar: '',
    userId: '',
  });

  useEffect(() => {
    loadReviews();
    loadProducts();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reviews');
      if (response.data?.success) {
        setReviews(response.data.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      const data = response.data.data || response.data;
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      productId: review.productId?._id || '',
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
      status: review.status,
      isFictional: review.isFictional,
      fictionalName: review.fictionalAuthor?.name || '',
      fictionalAge: review.fictionalAuthor?.age,
      fictionalCity: review.fictionalAuthor?.city || '',
      fictionalAvatar: review.fictionalAuthor?.avatar || '',
      userId: review.userId?._id || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

    try {
      await api.delete(`/admin/reviews/${id}`);
      loadReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Не удалось удалить отзыв');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reviewData: any = {
      rating: formData.rating,
      title: formData.title || undefined,
      comment: formData.comment,
      status: formData.status,
      isFictional: formData.isFictional,
    };

    if (formData.productId) {
      reviewData.productId = formData.productId;
    }

    if (formData.isFictional) {
      reviewData.fictionalAuthor = {
        name: formData.fictionalName,
        age: formData.fictionalAge || undefined,
        city: formData.fictionalCity || undefined,
        avatar: formData.fictionalAvatar || undefined,
      };
    } else if (formData.userId) {
      reviewData.userId = formData.userId;
    }

    try {
      if (editingReview) {
        await api.put(`/admin/reviews/${editingReview._id}`, reviewData);
      } else {
        await api.post('/admin/reviews', reviewData);
      }
      
      setShowDialog(false);
      setEditingReview(null);
      resetForm();
      loadReviews();
    } catch (error: any) {
      console.error('Failed to save review:', error);
      alert(error.response?.data?.error || 'Не удалось сохранить отзыв');
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      rating: 5,
      title: '',
      comment: '',
      status: 'PUBLISHED',
      isFictional: false,
      fictionalName: '',
      fictionalAge: undefined,
      fictionalCity: '',
      fictionalAvatar: '',
      userId: '',
    });
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.isFictional
        ? review.fictionalAuthor?.name.toLowerCase().includes(searchTerm.toLowerCase())
        : `${review.userId?.firstName} ${review.userId?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Управление отзывами</h1>
        <Button
          onClick={() => {
            setEditingReview(null);
            resetForm();
            setShowDialog(true);
          }}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="sm:inline">Добавить отзыв</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск по отзывам..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="DRAFT">Черновик</SelectItem>
            <SelectItem value="PENDING">На модерации</SelectItem>
            <SelectItem value="PUBLISHED">Опубликован</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Товар</TableHead>
              <TableHead className="min-w-[150px]">Автор</TableHead>
              <TableHead className="min-w-[120px]">Рейтинг</TableHead>
              <TableHead className="min-w-[200px]">Отзыв</TableHead>
              <TableHead className="min-w-[120px]">Статус</TableHead>
              <TableHead className="min-w-[100px]">Дата</TableHead>
              <TableHead className="text-right min-w-[80px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Отзывы не найдены
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow 
                  key={review._id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEdit(review)}
                >
                  <TableCell className="font-medium">
                    {review.productId?.name || 'Без товара'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {review.isFictional ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">{review.fictionalAuthor?.name}</div>
                            <div className="text-xs text-gray-500">Вымышленный</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {review.userId?.firstName?.charAt(0)}
                            {review.userId?.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">
                              {review.userId?.firstName} {review.userId?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{review.userId?.email}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{review.comment}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        review.status === 'PUBLISHED'
                          ? 'default'
                          : review.status === 'PENDING'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {review.status === 'PUBLISHED'
                        ? 'Опубликован'
                        : review.status === 'PENDING'
                        ? 'На модерации'
                        : 'Черновик'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(review._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? 'Редактировать отзыв' : 'Добавить отзыв'}
            </DialogTitle>
            <DialogDescription>
              Заполните форму для {editingReview ? 'редактирования' : 'создания'} отзыва
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection */}
            <div>
              <Label htmlFor="productId">Товар</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите товар" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fictional Author Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fictional"
                checked={formData.isFictional}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFictional: checked as boolean })
                }
              />
              <Label htmlFor="fictional" className="cursor-pointer">
                Вымышленный автор
              </Label>
            </div>

            {/* Author Fields */}
            {formData.isFictional ? (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="fictionalName">
                    Имя автора <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fictionalName"
                    value={formData.fictionalName}
                    onChange={(e) =>
                      setFormData({ ...formData, fictionalName: e.target.value })
                    }
                    placeholder="Например: Анна, 34 года, Москва"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fictionalAge">Возраст (опционально)</Label>
                    <Input
                      id="fictionalAge"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.fictionalAge || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fictionalAge: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="34"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fictionalCity">Город (опционально)</Label>
                    <Input
                      id="fictionalCity"
                      value={formData.fictionalCity}
                      onChange={(e) =>
                        setFormData({ ...formData, fictionalCity: e.target.value })
                      }
                      placeholder="Москва"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Аватар (опционально)</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((avatar, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData({ ...formData, fictionalAvatar: avatar })}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          formData.fictionalAvatar === avatar
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="userId">Пользователь (оставьте пустым для текущего)</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="ID пользователя"
                />
              </div>
            )}

            {/* Rating */}
            <div>
              <Label>
                Оценка <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Заголовок (опционально)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Краткое описание"
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="comment">
                Отзыв <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Поделитесь своим мнением..."
                rows={6}
                maxLength={2000}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.comment.length} / 2000
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Черновик</SelectItem>
                  <SelectItem value="PENDING">На модерации</SelectItem>
                  <SelectItem value="PUBLISHED">Опубликован</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  setEditingReview(null);
                  resetForm();
                }}
              >
                Отмена
              </Button>
              <Button type="submit">
                Сохранить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
