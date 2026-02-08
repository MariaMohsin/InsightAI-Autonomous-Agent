// components/dashboard/EditTodoModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AnimatedButton } from '../ui/AnimatedButton';
import { Todo, UpdateTodoDTO, TodoPriority, RecurrenceRule } from '@/types/todo';
import { PrioritySelector } from './PrioritySelector';
import { TagInput } from './TagInput';
import { DatePicker } from './DatePicker';
import { RecurrenceSelector } from './RecurrenceSelector';

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateTodoDTO) => Promise<any>;
  todo: Todo | null;
}

export const EditTodoModal: React.FC<EditTodoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  todo
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>(TodoPriority.MEDIUM);
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [reminderAt, setReminderAt] = useState<string | null>(null);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when todo changes
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setTags(todo.tags.map(tag => tag.name));
      setDueDate(todo.due_date);
      setReminderAt(todo.reminder_at);
      setRecurrenceRule(todo.recurrence_rule);
    }
  }, [todo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !todo) return;

    setIsSubmitting(true);
    try {
      await onSubmit(todo.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority,
        tag_names: tags,
        due_date: dueDate || undefined,
        reminder_at: reminderAt || undefined,
        recurrence_rule: recurrenceRule || undefined
      });
      onClose();
    } catch (error) {
      // Error is handled by useTodos hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && todo && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Todo</h2>
                  <p className="text-sm text-gray-600 mt-1">Update your task</p>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isSubmitting}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Buy groceries"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100"
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="edit-description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details..."
                    disabled={isSubmitting}
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none disabled:bg-gray-100"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="edit-priority" className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <PrioritySelector
                    value={priority}
                    onChange={setPriority}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags <span className="text-gray-400">(optional)</span>
                  </label>
                  <TagInput
                    selectedTags={tags}
                    onChange={setTags}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Due Date */}
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  onChange={setDueDate}
                  disabled={isSubmitting}
                />

                {/* Reminder */}
                {dueDate && (
                  <DatePicker
                    label="Reminder"
                    value={reminderAt}
                    onChange={setReminderAt}
                    disabled={isSubmitting}
                    showTime
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                )}

                {/* Recurrence */}
                <RecurrenceSelector
                  value={recurrenceRule}
                  onChange={setRecurrenceRule}
                  disabled={isSubmitting}
                  hasDueDate={!!dueDate}
                />

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <AnimatedButton
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton
                    type="submit"
                    variant="gradient"
                    disabled={!title.trim() || isSubmitting}
                    loading={isSubmitting}
                    className="flex-1"
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  >
                    Save Changes
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
