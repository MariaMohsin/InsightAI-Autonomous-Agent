// components/dashboard/RecurrenceSelector.tsx
'use client';

import { motion } from 'framer-motion';
import { RecurrenceRule } from '@/types/todo';

interface RecurrenceSelectorProps {
  value: RecurrenceRule | null;
  onChange: (value: RecurrenceRule | null) => void;
  disabled?: boolean;
  hasDueDate: boolean; // Only show if due date is set
}

const recurrenceOptions = [
  { value: null, label: 'None', icon: '×' },
  { value: RecurrenceRule.DAILY, label: 'Daily', icon: '📅' },
  { value: RecurrenceRule.WEEKLY, label: 'Weekly', icon: '📆' },
  { value: RecurrenceRule.MONTHLY, label: 'Monthly', icon: '🗓️' }
];

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  hasDueDate
}) => {
  if (!hasDueDate) {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Repeat <span className="text-gray-400">(optional)</span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        {recurrenceOptions.map((option) => (
          <motion.button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`
              px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all
              flex items-center justify-center gap-2
              ${value === option.value
                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            <span className="text-lg">{option.icon}</span>
            <span>{option.label}</span>
          </motion.button>
        ))}
      </div>

      {value && (
        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Next instance will be created automatically when you complete this todo
        </p>
      )}
    </div>
  );
};
