'use client';

import { motion } from 'framer-motion';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { Loader } from '@/components/ui/Loader';

const PageTransitionLoader = () => {
  const isLoading = useNavigationLoading();

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Loader 
        variant="page" 
        size="full" 
        text="Загрузка страницы..." 
      />
    </motion.div>
  );
};

export default PageTransitionLoader;
