import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  GripVertical,
  Link as LinkIcon,
} from 'lucide-react';
import { sliderApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Slide {
  _id?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink?: string;
  image: string;
  order: number;
  isActive: boolean;
}

export const Slider = () => {
  const queryClient = useQueryClient();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: sliderData, isLoading } = useQuery({
    queryKey: ['slider-admin'],
    queryFn: sliderApi.getAdmin,
  });

  useEffect(() => {
    if (sliderData?.slides) {
      setSlides(sliderData.slides);
    }
  }, [sliderData]);

  const addSlideMutation = useMutation({
    mutationFn: sliderApi.add,
    onSuccess: () => {
      toast.success('Слайд добавлен');
      queryClient.invalidateQueries({ queryKey: ['slider-admin'] });
      setIsDialogOpen(false);
      setEditingSlide(null);
    },
    onError: () => {
      toast.error('Ошибка при добавлении слайда');
    },
  });

  const updateSlideMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Slide> }) =>
      sliderApi.update(id, data),
    onSuccess: () => {
      toast.success('Слайд обновлен');
      queryClient.invalidateQueries({ queryKey: ['slider-admin'] });
      setIsDialogOpen(false);
      setEditingSlide(null);
    },
    onError: () => {
      toast.error('Ошибка при обновлении слайда');
    },
  });

  const deleteSlideMutation = useMutation({
    mutationFn: sliderApi.delete,
    onSuccess: () => {
      toast.success('Слайд удален');
      queryClient.invalidateQueries({ queryKey: ['slider-admin'] });
    },
    onError: () => {
      toast.error('Ошибка при удалении слайда');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await sliderApi.uploadImage(file);
      if (editingSlide) {
        setEditingSlide({ ...editingSlide, image: imageUrl });
      }
      toast.success('Изображение загружено');
    } catch (error) {
      toast.error('Ошибка при загрузке изображения');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (editingSlide._id) {
      updateSlideMutation.mutate({
        id: editingSlide._id,
        data: editingSlide,
      });
    } else {
      addSlideMutation.mutate(editingSlide);
    }
  };

  const handleAddNew = () => {
    setEditingSlide({
      title: '',
      subtitle: '',
      buttonText: 'Смотреть',
      buttonLink: '/catalog',
      image: '',
      order: slides.length,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот слайд?')) {
      deleteSlideMutation.mutate(id);
    }
  };

  const toggleActive = (slide: Slide) => {
    if (!slide._id) return;
    updateSlideMutation.mutate({
      id: slide._id,
      data: { isActive: !slide.isActive },
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Слайдер</h1>
          <p className="text-slate-600 mt-1">
            Управление слайдами на главной странице
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          Добавить слайд
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Слайды</h2>
        </div>

        <div className="p-6">
          {slides.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Нет слайдов</p>
              <p className="text-slate-400 mt-2">
                Добавьте первый слайд для главной страницы
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {slides.map((slide) => (
                <div
                  key={slide._id}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors"
                >
                  <div className="cursor-move">
                    <GripVertical className="w-5 h-5 text-slate-400" />
                  </div>

                  <div className="w-32 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {slide.title}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                      {slide.subtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
                        Кнопка: {slide.buttonText}
                      </span>
                      {slide.buttonLink && (
                        <span className="text-xs text-slate-400">
                          → {slide.buttonLink}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(slide)}
                      className={
                        slide.isActive
                          ? 'text-emerald-600 hover:text-emerald-700'
                          : 'text-slate-400 hover:text-slate-500'
                      }
                    >
                      {slide.isActive ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(slide)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Редактировать"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => slide._id && handleDelete(slide._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {editingSlide?._id ? 'Редактировать слайд' : 'Добавить слайд'}
            </DialogTitle>
          </DialogHeader>

          {editingSlide && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Изображение
                </label>
                <div className="space-y-4">
                  {editingSlide.image && (
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={editingSlide.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={editingSlide.image}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, image: e.target.value })
                      }
                      placeholder="URL изображения"
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <label className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        disabled={uploadingImage}
                        className="px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl"
                        onClick={(e) => {
                          e.preventDefault();
                          (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                        }}
                      >
                        <Upload className="w-5 h-5" />
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Заголовок
                </label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Подзаголовок
                </label>
                <input
                  type="text"
                  value={editingSlide.subtitle}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, subtitle: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Текст кнопки
                  </label>
                  <input
                    type="text"
                    value={editingSlide.buttonText}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        buttonText: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ссылка кнопки
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={editingSlide.buttonLink || ''}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          buttonLink: e.target.value,
                        })
                      }
                      placeholder="/catalog"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingSlide.isActive}
                  onChange={(e) =>
                    setEditingSlide({
                      ...editingSlide,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">
                  Активный слайд
                </label>
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={
                    addSlideMutation.isPending || updateSlideMutation.isPending
                  }
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {addSlideMutation.isPending || updateSlideMutation.isPending
                    ? 'Сохранение...'
                    : 'Сохранить'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Slider;
