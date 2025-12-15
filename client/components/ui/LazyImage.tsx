import React, { useState, useRef, useEffect } from 'react';
import { ImageSkeleton } from './ImageSkeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  thumbnailSrc?: string;
  className?: string;
  width?: string;
  height?: string;
  onClick?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  thumbnailSrc,
  className = '',
  width = '100%',
  height = '100%',
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useHighQuality, setUseHighQuality] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Process image URLs to use proxy path if they contain the server URL
  const processImageUrl = (url: string) => {
    if (!url) return url;
    // If the URL contains the server address, replace it with the proxy path
    return url.replace('https://api.dvberry.ru', '');
  };

  const processedSrc = processImageUrl(src);
  const processedThumbnailSrc = thumbnailSrc ? processImageUrl(thumbnailSrc) : undefined;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const loadImage = () => {
    setIsLoading(true);
    setError(false);
    
    // First load thumbnail if available
    if (thumbnailSrc && !useHighQuality) {
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
        
        // After a short delay, load the high quality image
        setTimeout(() => {
          setUseHighQuality(true);
        }, 300);
      };
      img.onerror = () => {
        setError(true);
        setIsLoading(false);
      };
      img.src = processedThumbnailSrc || '';
    } else {
      // Load high quality image directly
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
      };
      img.onerror = () => {
        setError(true);
        setIsLoading(false);
      };
      img.src = processedSrc;
    }
  };

  const handleImageClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      onClick={handleImageClick}
    >
      {isLoading && (
        <ImageSkeleton 
          width={width} 
          height={height} 
          className="absolute inset-0"
        />
      )}
      
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-gray-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Ошибка загрузки</p>
          </div>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={useHighQuality ? processedSrc : (processedThumbnailSrc || processedSrc)}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width, height }}
        />
      )}
      
      {/* Loading overlay for smooth transition */}
      {isLoading && isLoaded && (
        <div className="absolute inset-0 bg-white bg-opacity-50 transition-opacity duration-300 opacity-0" />
      )}
    </div>
  );
};