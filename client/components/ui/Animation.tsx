'use client';

import React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  duration = 300, 
  delay = 0,
  className = '' 
}) => {
  return (
    <div
      className={className}
      style={{
        animation: `fadeIn ${duration}ms ease-in-out ${delay}ms forwards`,
        opacity: 0
      }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  direction = 'up',
  duration = 300, 
  delay = 0,
  className = '' 
}) => {
  const getAnimationName = () => {
    switch (direction) {
      case 'left': return 'slideInLeft';
      case 'right': return 'slideInRight';
      case 'down': return 'slideInDown';
      case 'up':
      default: return 'slideInUp';
    }
  };

  return (
    <div
      className={className}
      style={{
        animation: `${getAnimationName()} ${duration}ms ease-out ${delay}ms forwards`,
        opacity: 0
      }}
    >
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ 
  children, 
  duration = 300, 
  delay = 0,
  className = '' 
}) => {
  return (
    <div
      className={className}
      style={{
        animation: `scaleIn ${duration}ms ease-out ${delay}ms forwards`,
        opacity: 0
      }}
    >
      {children}
    </div>
  );
};

interface BounceInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export const BounceIn: React.FC<BounceInProps> = ({ 
  children, 
  duration = 600, 
  delay = 0,
  className = '' 
}) => {
  return (
    <div
      className={className}
      style={{
        animation: `bounceIn ${duration}ms ease-out ${delay}ms forwards`,
        opacity: 0
      }}
    >
      {children}
    </div>
  );
};

interface PulseProps {
  children: React.ReactNode;
  duration?: number;
  infinite?: boolean;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({ 
  children, 
  duration = 1000, 
  infinite = false,
  className = '' 
}) => {
  return (
    <div
      className={className}
      style={{
        animation: `pulse ${duration}ms ease-in-out ${infinite ? 'infinite' : 'forwards'}`
      }}
    >
      {children}
    </div>
  );
};

// Стили для анимаций
export const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideInDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideInLeft {
      from {
        transform: translateX(-20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideInRight {
      from {
        transform: translateX(20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }

    .shake {
      animation: shake 0.5s ease-in-out;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }
  `}</style>
);

// Компонент-обертка для добавления стилей анимаций
export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <AnimationStyles />
      {children}
    </>
  );
};