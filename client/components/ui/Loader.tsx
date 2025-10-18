'use client';

import React from 'react';

interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'button' | 'inline' | 'page';
  text?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Premium unified loader component that can be used in different contexts
 */
const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'default',
  text,
  className = '',
  containerClassName = ''
}) => {
  // Size classes for the loader
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    full: 'w-32 h-32'
  };
  
  // Text size classes based on loader size
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    full: 'text-xl'
  };
  
  // Container classes based on variant
  const containerVariantClasses = {
    default: 'flex items-center justify-center',
    button: 'inline-flex items-center justify-center',
    inline: 'inline-flex items-center',
    page: 'fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm'
  };
  
  // Loader wrapper classes based on variant
  const loaderWrapperClasses = {
    default: '',
    button: '',
    inline: '',
    page: 'bg-white p-8 rounded-2xl shadow-xl border border-secondary-100 premium-shadow flex flex-col items-center'
  };
  
  // Render the premium loader
  return (
    <div className={`${containerVariantClasses[variant]} ${containerClassName}`}>
      <div className={`${loaderWrapperClasses[variant]}`}>
        <div className={`relative ${sizeClasses[size]} ${className}`}>
          {/* Outer circle with gradient border */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-300 to-gold-300 p-[2px]">
            <div className="absolute inset-0 rounded-full bg-white"></div>
          </div>
          
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" 
               style={{ 
                 borderLeftColor: '#ffd091', 
                 borderTopColor: '#ffd091',
                 animationDuration: '0.8s'
               }}>
          </div>
          
          {/* Inner circle with logo or icon */}
          <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-primary-50 to-cream-50 flex items-center justify-center">
            <span className="text-primary-500 font-bold text-[40%]">DB</span>
          </div>
        </div>
        
        {/* Text below loader */}
        {text && (
          <p className={`mt-4 ${textSizeClasses[size]} text-charcoal-600 font-medium`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Export the unified loader component
export { Loader };

// Export named components for backward compatibility
export const PageLoader = (props: any) => <Loader variant="page" size="xl" text="Загрузка..." {...props} />;
export const ButtonLoader = (props: any) => <Loader variant="button" size="sm" {...props} />;
export const ProductCardSkeleton = ({ count = 6, ...props }: { count?: number } & any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-secondary-100 h-[400px] flex items-center justify-center">
        <Loader size="lg" text="Загрузка..." {...props} />
      </div>
    ))}
  </div>
);
export const CardSkeleton = ProductCardSkeleton;
export const TableSkeleton = (props: any) => <div className="p-8 text-center"><Loader size="lg" text="Загрузка таблицы..." {...props} /></div>;
export const FormSkeleton = (props: any) => <div className="p-8 text-center"><Loader size="lg" text="Загрузка формы..." {...props} /></div>;

// Default export for easier imports
export default Loader;
