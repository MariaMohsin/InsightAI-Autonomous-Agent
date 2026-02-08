// components/dashboard/StatCard.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  gradient: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  gradient,
  delay = 0
}) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {/* Gradient background */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full -mr-16 -mt-16`} />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <motion.h3
              className="text-4xl font-bold text-gray-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
            >
              {value}
            </motion.h3>
          </div>

          <motion.div
            className={`p-4 rounded-xl ${gradient} shadow-lg`}
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-white w-6 h-6">
              {icon}
            </div>
          </motion.div>
        </div>

        {/* Animated progress bar */}
        <motion.div
          className="mt-4 h-1 rounded-full bg-gray-100 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          <motion.div
            className={`h-full ${gradient}`}
            initial={{ width: '0%' }}
            animate={{ width: value > 0 ? '75%' : '0%' }}
            transition={{ delay: delay + 0.4, duration: 0.8, ease: 'easeOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
