// components/dashboard/FilterSortControls.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { TodoStatus, TodoPriority } from '@/types/todo';
import { useTags } from '@/hooks/useTags';

export interface FilterSortState {
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  search?: string;
  dueRange?: 'overdue' | 'today' | 'this_week' | 'all';
  sortBy: 'created_at' | 'updated_at' | 'due_date' | 'priority';
  sortOrder: 'asc' | 'desc';
}

interface FilterSortControlsProps {
  filters: FilterSortState;
  onChange: (filters: FilterSortState) => void;
}

export const FilterSortControls: React.FC<FilterSortControlsProps> = ({
  filters,
  onChange
}) => {
  const { tags: availableTags } = useTags();
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Close tag dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    if (showTagDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTagDropdown]);

  const handleStatusChange = (status?: TodoStatus) => {
    onChange({ ...filters, status });
  };

  const handlePriorityChange = (priority?: TodoPriority) => {
    onChange({ ...filters, priority });
  };

  const handleTagToggle = (tagName: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    onChange({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
  };

  const handleDueRangeChange = (dueRange?: 'overdue' | 'today' | 'this_week' | 'all') => {
    onChange({ ...filters, dueRange: dueRange === 'all' ? undefined : dueRange });
  };

  const handleSortByChange = (sortBy: FilterSortState['sortBy']) => {
    onChange({ ...filters, sortBy });
  };

  const handleSortOrderChange = () => {
    onChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  const clearFilters = () => {
    onChange({
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.status !== undefined || filters.priority !== undefined || (filters.tags && filters.tags.length > 0) || filters.dueRange !== undefined;

  return (
    <motion.div
      className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Status Filter */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Status
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleStatusChange(undefined)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${!filters.status
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              All
            </button>
            {Object.values(TodoStatus).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize
                  ${filters.status === status
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Priority
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handlePriorityChange(undefined)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${!filters.priority
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              All
            </button>
            {Object.values(TodoPriority).map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityChange(priority)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize
                  flex items-center gap-1.5
                  ${filters.priority === priority
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    priority === TodoPriority.HIGH
                      ? 'bg-red-500'
                      : priority === TodoPriority.MEDIUM
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Tags {filters.tags && filters.tags.length > 0 && `(${filters.tags.length})`}
          </label>
          <div className="relative" ref={tagDropdownRef}>
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="w-full px-3 py-1.5 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-sm font-medium text-left flex items-center justify-between"
            >
              <span className="text-gray-700">
                {filters.tags && filters.tags.length > 0 ? `${filters.tags.length} selected` : 'Select tags'}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showTagDropdown && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border-2 border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                {availableTags.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    No tags yet
                  </div>
                ) : (
                  availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.name)}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        filters.tags?.includes(tag.name)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {filters.tags?.includes(tag.name) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-900">{tag.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Due Date Range Filter */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Due Date
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleDueRangeChange('all')}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${!filters.dueRange
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              All
            </button>
            <button
              onClick={() => handleDueRangeChange('overdue')}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${filters.dueRange === 'overdue'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              Overdue
            </button>
            <button
              onClick={() => handleDueRangeChange('today')}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${filters.dueRange === 'today'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              Today
            </button>
            <button
              onClick={() => handleDueRangeChange('this_week')}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${filters.dueRange === 'this_week'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortByChange(e.target.value as FilterSortState['sortBy'])}
              className="flex-1 px-3 py-1.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm font-medium"
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
            <button
              onClick={handleSortOrderChange}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {filters.sortOrder === 'asc' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <motion.button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition-all self-end lg:self-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Filters
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
