import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface UploadedImage {
  filename: string;
  thumbnailFilename: string;
  originalName: string;
  size: number;
  url: string;
  thumbnailUrl: string;
}

interface ImagePreviewModalProps {
  image: UploadedImage;
  children: React.ReactNode;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ image, children }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const resetView = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetView();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRotate();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={`${isFullscreen ? 'inset-0 m-0 max-w-none max-h-none rounded-none' : 'max-w-4xl max-h-[90vh]'} p-0 bg-black`} aria-describedby="image-preview-description">
        <DialogTitle className="sr-only">
          Предпросмотр изображения: {image.originalName}
        </DialogTitle>
        <DialogDescription id="image-preview-description" className="sr-only">
          Предпросмотр изображения с возможностью масштабирования, вращения и перемещения
        </DialogDescription>
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            aria-label="Закрыть предпросмотр"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header with controls */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm p-4 pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-white font-medium truncate max-w-xs sm:max-w-md text-sm sm:text-base">
              {image.originalName}
            </h3>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                disabled={scale <= 0.5}
                aria-label="Уменьшить"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-white text-xs sm:text-sm min-w-[3rem] text-center font-medium">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                disabled={scale >= 3}
                aria-label="Увеличить"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="h-6 w-px bg-white/30 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                aria-label="Повернуть"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetView}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                aria-label="Сбросить вид"
              >
                <span className="text-xs">Сброс</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 hidden sm:flex"
                aria-label={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                aria-label="Скачать изображение"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image container */}
          <div
            ref={contentRef}
            className="flex-1 flex items-center justify-center overflow-hidden bg-black p-4"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={(e) => {
              e.preventDefault();
              if (e.deltaY < 0) {
                handleZoomIn();
              } else {
                handleZoomOut();
              }
            }}
            style={{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }}
          >
            <img
              src={image.url}
              alt={image.originalName}
              className="max-w-full max-h-full object-contain select-none transition-transform duration-200 will-change-transform"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              }}
              draggable="false"
            />
          </div>

          {/* Footer with image info and controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-white text-xs sm:text-sm">
              <div>
                <p>Размер: {(image.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="text-right space-y-1">
                <p>Мышь: перемещение при зуме</p>
                <p>Колесико: масштабирование</p>
                <p className="hidden sm:inline">Клавиши: +, -, R, F, Esc</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};