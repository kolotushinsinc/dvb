'use client';

import { motion } from 'framer-motion';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';

const PageTransitionLoader = () => {
  const isLoading = useNavigationLoading();

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-cream-50 to-white"
    >
          <div className="relative w-32 h-32">
            {/* Mirror effect container */}
            <div className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-indigo-700/20 backdrop-blur-sm border border-primary/30 shadow-xl">
              {/* Animated mirror shine */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut'
                }}
                style={{ transform: 'skewX(-20deg)' }}
              />
              
              {/* Central logo or icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="text-primary"
                >
                  <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <motion.path
                      d="M40 10C23.4315 10 10 23.4315 10 40C10 56.5685 23.4315 70 40 70C56.5685 70 70 56.5685 70 40C70 23.4315 56.5685 10 40 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />
                    <motion.path
                      d="M40 20V40L50 50"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.2 }}
                    />
                  </svg>
                </motion.div>
              </div>
              
              {/* Rotating ring */}
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-primary/30"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'linear'
                }}
              />
              
              {/* Pulsing effect */}
              <motion.div
                className="absolute inset-4 rounded-full bg-primary/10"
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut'
                }}
              />
            </div>
            
            {/* Loading text */}
            <motion.div
              className="absolute -bottom-6 left-0 right-0 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <p className="text-xs text-gray-600 font-medium">Загрузка...</p>
            </motion.div>
          </div>
        </motion.div>
  );
};

export default PageTransitionLoader;