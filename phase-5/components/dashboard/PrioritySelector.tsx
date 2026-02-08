// components/dashboard/PrioritySelector.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { TodoPriority } from '@/types/todo';

interface PrioritySelectorProps {
  value: TodoPriority;
  onChange: (priority: TodoPriority) => void;
  disabled?: boolean;
}

const priorityConfig = {
  [TodoPriority.LOW]: {
    label: 'Low',
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    hoverColor: 'hover:bg-green-50',
    textColor: 'text-green-700',
    icon: '↓'
  },
  [TodoPriority.MEDIUM]: {
    label: 'Medium',
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    hoverColor: 'hover:bg-yellow-50',
    textColor: 'text-yellow-700',
    icon: '='
  },
  [TodoPriority.HIGH]: {
    label: 'High',
    color: 'bg-red-500',
    borderColor: 'border-red-500',
    hoverColor: 'hover:bg-red-50',
    textColor: 'text-red-700',
    icon: '↑'
  }
};

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const currentConfig = priorityConfig[value];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Priority Button */}
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl border-2 flex items-center justify-between
          transition-all duration-200
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
          ${isOpen ? currentConfig.borderColor : 'border-gray-200 hover:border-gray-300'}
        `}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${currentConfig.color}`} />
          <span className="font-medium text-gray-900">{currentConfig.label}</span>
        </div>
        <motion.svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {Object.entries(priorityConfig).map(([priority, config]) => (
              <motion.button
                key={priority}
                type="button"
                onClick={() => {
                  onChange(priority as TodoPriority);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                  ${config.hoverColor}
                  ${value === priority ? 'bg-gray-50' : ''}
                `}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.1 }}
              >
                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                <span className={`font-medium ${config.textColor}`}>{config.label}</span>
                <span className="text-gray-400 text-sm ml-auto">{config.icon}</span>
                {value === priority && (
                  <motion.svg
                    className="w-5 h-5 text-blue-600 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Export priority badge component for displaying priority in TodoCard
interface PriorityBadgeProps {
  priority: TodoPriority;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config = priorityConfig[priority];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        ${sizeClasses[size]}
        ${config.color} text-white
      `}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
