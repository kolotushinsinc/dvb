import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Eye } from 'lucide-react';
import { uploadApi } from '@/lib/api';
import { toast } from 'sonner';
import { ImagePreviewModal } from './ImagePreviewModal';
import { LocalImagePreview } from './LocalImagePreview';

interface UploadedImage {
  filename: string;
  thumbnailFilename: string;
  originalName: string;
  size: number;
  url: string;
  thumbnailUrl: string;
}

interface MainImageUploadProps {
  image?: UploadedImage | null;
  onImageChange: (image: UploadedImage | null) => void;
}

export const MainImageUpload: React.FC<MainImageUploadProps> = ({ image, onImageChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, загрузите изображение');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Размер файла не должен превышать 10MB');
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const uploadedImage = await uploadApi.uploadSingle(file);
      onImageChange(uploadedImage);
      setSelectedFile(null);
      toast.success('Основное изображение загружено');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Ошибка при загрузке изображения');
    } finally {
      setIsUploading(false);
    }
  }, [onImageChange]);

  const handleConfirmUpload = useCallback(() => {
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  }, [selectedFile, handleFileUpload]);

  const handleCancelUpload = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback(() => {
    onImageChange(null);
    setSelectedFile(null);
  }, [onImageChange]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">Основное изображение</label>
      
      {image ? (
        <div className="relative group">
          <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={image.url}
              alt="Основное изображение"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex space-x-2">
                <ImagePreviewModal image={image}>
                  <div className="bg-white/90 rounded-full p-2 cursor-pointer">
                    <Eye className="w-6 h-6 text-gray-800" />
                  </div>
                </ImagePreviewModal>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-red-500 text-white rounded-full p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : selectedFile ? (
        <div className="space-y-4">
          <div className="relative group">
            <LocalImagePreview file={selectedFile} className="w-full h-64" />
            <button
              type="button"
              onClick={handleCancelUpload}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Загрузка...' : 'Подтвердить загрузку'}
            </button>
            <button
              type="button"
              onClick={handleCancelUpload}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Отменить
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
              <p className="text-sm text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                Перетащите изображение сюда или нажмите для выбора
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <span className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-md hover:bg-emerald-600 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Выбрать файл
                </span>
              </label>
            </>
          )}
        </div>
      )}
      
      {image && (
        <div className="text-sm text-gray-500">
          <p>Имя файла: {image.originalName}</p>
          <p>Размер: {(image.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
    </div>
  );
};