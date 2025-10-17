import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2, Eye, Check } from 'lucide-react';
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

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  title?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  title = 'Изображения товара'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    
    if (files.length === 0) {
      toast.error('Пожалуйста, выберите изображения');
      return;
    }
    
    if (images.length + files.length > maxImages) {
      toast.error(`Максимум ${maxImages} изображений`);
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
  }, [images.length, maxImages]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => file.type.startsWith('image/'));
    
    if (files.length === 0) {
      toast.error('Пожалуйста, выберите изображения');
      return;
    }
    
    if (images.length + files.length > maxImages) {
      toast.error(`Максимум ${maxImages} изображений`);
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
    // Clear the input value so the same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images.length, maxImages]);

  const uploadImages = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(file => uploadApi.uploadSingle(file));
      const uploadedImages = await Promise.all(uploadPromises);
      
      onImagesChange([...images, ...uploadedImages]);
      toast.success(`Загружено ${uploadedImages.length} изображений`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Ошибка при загрузке изображений');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      await uploadApi.deleteImage(imageToRemove.filename);
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast.success('Изображение удалено');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Ошибка при удалении изображения');
    }
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleConfirmUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    await uploadImages(selectedFiles);
    setSelectedFiles([]);
  };

  const handleCancelUpload = () => {
    setSelectedFiles([]);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      
      {/* Upload Area */}
      {images.length < maxImages && (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-600">Загрузка...</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Перетащите изображения сюда или нажмите для выбора
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, GIF до 10MB. Максимум {maxImages} изображений
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Новые изображения ({selectedFiles.length})
            </h4>
            <div className="flex space-x-2">
              <Button
                onClick={handleCancelUpload}
                variant="outline"
                size="sm"
                disabled={isUploading}
              >
                Отменить
              </Button>
              <Button
                onClick={handleConfirmUpload}
                size="sm"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Загрузить ({selectedFiles.length})
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="relative overflow-hidden group">
                <CardContent className="p-0">
                  <LocalImagePreview
                    file={file}
                    onRemove={() => removeSelectedFile(index)}
                  />
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Image Preview */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Загруженные изображения ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="relative overflow-hidden group">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <ImagePreviewModal image={image}>
                      <div className="w-full h-full cursor-zoom-in">
                        <img
                          src={image.url.replace('https://api.dvberry.ru', '')}
                          alt={image.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </ImagePreviewModal>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex space-x-2">
                        <ImagePreviewModal image={image}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 hover:bg-white"
                          >
                            <Eye className="h-4 w-4 text-gray-800" />
                          </Button>
                        </ImagePreviewModal>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate" title={image.originalName}>
                      {image.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {images.length === 0 && (
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Нет загруженных изображений</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};