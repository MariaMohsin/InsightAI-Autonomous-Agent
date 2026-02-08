// components/dashboard/DatePicker.tsx
'use client';

import { motion } from 'framer-motion';

interface DatePickerProps {
  value: string | null; // ISO date string
  onChange: (value: string | null) => void;
  label: string;
  disabled?: boolean;
  minDate?: string; // ISO date string
  showTime?: boolean; // For reminder_at
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  minDate,
  showTime = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue || null);
  };

  const handleClear = () => {
    onChange(null);
  };

  // Format the datetime-local value
  const formatValue = () => {
    if (!value) return '';
    if (showTime) {
      // For datetime-local input, need format: YYYY-MM-DDThh:mm
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
      // For date input, need format: YYYY-MM-DD
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  // Format display value
  const displayValue = () => {
    if (!value) return null;
    const date = new Date(value);
    if (showTime) {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} <span className="text-gray-400">(optional)</span>
      </label>

      <div className="relative">
        <input
          type={showTime ? 'datetime-local' : 'date'}
          value={formatValue()}
          onChange={handleChange}
          min={minDate}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
        />

        {value && !disabled && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Clear date"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>

      {value && (
        <p className="mt-1 text-xs text-gray-500">
          {displayValue()}
        </p>
      )}
    </div>
  );
};
