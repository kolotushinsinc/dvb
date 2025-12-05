'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, X, Upload, User } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Review, FictionalAuthor } from '@/types/product';
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
import { Checkbox } from '@/components/ui/checkbox';

interface ReviewFormProps {
  productId?: string;
  productName?: string;
  existingReview?: Review;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const AVATAR_OPTIONS = [
  '/avatars/avatar-1.png',
  '/avatars/avatar-2.png',
  '/avatars/avatar-3.png',
  '/avatars/avatar-4.png',
  '/avatars/avatar-5.png',
  '/avatars/avatar-6.png',
];

export function ReviewForm({
  productId,
  productName,
  existingReview,
  isOpen,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  const isEditing = !!existingReview;

  // Form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PENDING' | 'PUBLISHED'>('PENDING');

  // Fictional author state
  const [isFictional, setIsFictional] = useState(false);
  const [fictionalName, setFictionalName] = useState('');
  const [fictionalAge, setFictionalAge] = useState<number | undefined>(undefined);
  const [fictionalCity, setFictionalCity] = useState('');
  const [fictionalAvatar, setFictionalAvatar] = useState('');

  // Real user state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Initialize form with existing review data when editing
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title || '');
      setComment(existingReview.comment);
      setStatus(existingReview.status);
      setIsFictional(existingReview.isFictional || false);
      
      if (existingReview.isFictional && existingReview.fictionalAuthor) {
        setFictionalName(existingReview.fictionalAuthor.name || '');
        setFictionalAge(existingReview.fictionalAuthor.age);
        setFictionalCity(existingReview.fictionalAuthor.city || '');
        setFictionalAvatar(existingReview.fictionalAuthor.avatar || '');
      } else if (existingReview.userId) {
        setSelectedUserId(typeof existingReview.userId === 'string' ? existingReview.userId : existingReview.userId._id);
      }
    }
  }, [existingReview]);

  // Load users for admin
  useEffect(() => {
    if (isAdmin && !isFictional) {
      loadUsers();
    }
  }, [isAdmin, isFictional]);

  // Auto-fill current user if logged in and not admin editing
  useEffect(() => {
    if (user && !isEditing && !isAdmin) {
      setSelectedUserId(user._id);
    }
  }, [user, isEditing, isAdmin]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersList: UserOption[] = [];
      
      // Add current user
      if (user) {
        usersList.push({
          _id: user._id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
        });
      }
      
      // Add review author if editing and different from current user
      if (existingReview && !existingReview.isFictional && existingReview.userId) {
        const reviewUserId = typeof existingReview.userId === 'string' 
          ? existingReview.userId 
          : existingReview.userId._id;
        
        // Only add if not already in the list
        if (!usersList.some(u => u._id === reviewUserId)) {
          const reviewUser = typeof existingReview.userId === 'object' 
            ? existingReview.userId 
            : null;
          
          if (reviewUser) {
            usersList.push({
              _id: reviewUser._id,
              firstName: reviewUser.firstName || '',
              lastName: reviewUser.lastName || '',
              email: reviewUser.email || '',
            });
          }
        }
      }
      
      setUsers(usersList);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Пожалуйста, выберите оценку');
      return;
    }

    if (!comment.trim()) {
      toast.error('Пожалуйста, напишите отзыв');
      return;
    }

    if (isFictional && !fictionalName.trim()) {
      toast.error('Пожалуйста, укажите имя автора');
      return;
    }

    if (!isFictional && !selectedUserId) {
      toast.error('Пожалуйста, выберите пользователя');
      return;
    }

    try {
      setSubmitting(true);

      const reviewData: any = {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      };

      if (isAdmin) {
        reviewData.status = status;
      }

      if (isFictional) {
        reviewData.isFictional = true;
        reviewData.fictionalAuthor = {
          name: fictionalName.trim(),
          age: fictionalAge || undefined,
          city: fictionalCity.trim() || undefined,
          avatar: fictionalAvatar || undefined,
        };
      } else {
        reviewData.isFictional = false;
        if (isAdmin && selectedUserId !== user?._id) {
          reviewData.userId = selectedUserId;
        }
      }

      if (productId && !isEditing) {
        reviewData.productId = productId;
      }

      if (isEditing && existingReview) {
        await api.reviews.update(existingReview._id, reviewData);
        toast.success('Отзыв успешно обновлен');
      } else {
        await api.reviews.create(reviewData);
        toast.success(
          isAdmin && status === 'PUBLISHED'
            ? 'Отзыв успешно опубликован'
            : 'Отзыв отправлен на модерацию'
        );
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast.error(error.message || 'Не удалось отправить отзыв');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setTitle('');
    setComment('');
    setStatus('PENDING');
    setIsFictional(false);
    setFictionalName('');
    setFictionalAge(undefined);
    setFictionalCity('');
    setFictionalAvatar('');
    setSelectedUserId(user?._id || '');
  };

  const handleClose = () => {
    if (!isEditing) {
      resetForm();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-charcoal-800">
            {isEditing ? 'Редактировать отзыв' : 'Добавить отзыв'}
          </DialogTitle>
          {productName && (
            <DialogDescription className="text-charcoal-600">
              {productName}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Author Selection - Admin Only */}
          {isAdmin && (
            <div className="space-y-4 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fictional"
                  checked={isFictional}
                  onCheckedChange={(checked) => setIsFictional(checked as boolean)}
                />
                <Label htmlFor="fictional" className="text-sm font-medium cursor-pointer">
                  Вымышленный автор
                </Label>
              </div>

              {isFictional ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fictionalName" className="text-sm font-medium">
                      Имя автора <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fictionalName"
                      value={fictionalName}
                      onChange={(e) => setFictionalName(e.target.value)}
                      placeholder="Например: Анна, 34 года, Москва"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fictionalAge" className="text-sm font-medium">
                        Возраст (опционально)
                      </Label>
                      <Input
                        id="fictionalAge"
                        type="number"
                        min="1"
                        max="120"
                        value={fictionalAge || ''}
                        onChange={(e) =>
                          setFictionalAge(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        placeholder="34"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fictionalCity" className="text-sm font-medium">
                        Город (опционально)
                      </Label>
                      <Input
                        id="fictionalCity"
                        value={fictionalCity}
                        onChange={(e) => setFictionalCity(e.target.value)}
                        placeholder="Москва"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Аватар (опционально)
                    </Label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_OPTIONS.map((avatar, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFictionalAvatar(avatar)}
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
                            fictionalAvatar === avatar
                              ? 'border-primary-500 ring-2 ring-primary-200'
                              : 'border-secondary-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="w-full h-full rounded-full bg-secondary-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-charcoal-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="userId" className="text-sm font-medium">
                    Пользователь <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите пользователя" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.firstName} {u.lastName} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Rating */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Оценка <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-gold-500 text-gold-500'
                        : 'text-secondary-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-charcoal-600">
                  {rating} из 5
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Заголовок (опционально)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Краткое описание вашего опыта"
              maxLength={100}
              className="mt-1"
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Отзыв <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Поделитесь своим мнением о товаре..."
              rows={6}
              maxLength={2000}
              className="mt-1 resize-none"
              required
            />
            <div className="text-xs text-charcoal-500 mt-1 text-right">
              {comment.length} / 2000
            </div>
          </div>

          {/* Status - Admin Only */}
          {isAdmin && (
            <div>
              <Label htmlFor="status" className="text-sm font-medium">
                Статус
              </Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Черновик</SelectItem>
                  <SelectItem value="PENDING">На модерации</SelectItem>
                  <SelectItem value="PUBLISHED">Опубликован</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-primary-900"
            >
              {submitting
                ? 'Отправка...'
                : isEditing
                ? 'Сохранить'
                : 'Отправить отзыв'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
