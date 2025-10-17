'use client';

import { motion } from 'framer-motion';

const SmoothTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
};

export default SmoothTransition;