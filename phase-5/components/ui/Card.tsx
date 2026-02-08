// components/ui/Card.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
  gradient = false
}) => {
  const baseClasses = 'rounded-2xl p-6';

  const glassClasses = glass
    ? 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl'
    : 'bg-white shadow-lg border border-gray-100';

  const gradientClasses = gradient
    ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white'
    : '';

  return (
    <motion.div
      className={`${baseClasses} ${gradientClasses || glassClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
    >
      {children}
    </motion.div>
  );
};
