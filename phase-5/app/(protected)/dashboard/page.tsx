// app/(protected)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { TodoCard } from '@/components/dashboard/TodoCard';
import { AddTodoModal } from '@/components/dashboard/AddTodoModal';
import { EditTodoModal } from '@/components/dashboard/EditTodoModal';
import { FilterSortControls, FilterSortState } from '@/components/dashboard/FilterSortControls';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo } from '@/types/todo';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filters, setFilters] = useState<FilterSortState>({
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const {
    todos,
    total,
    isLoading,
    totalTodos,
    completedTodos,
    pendingTodos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo
  } = useTodos({
    status: filters.status,
    priority: filters.priority,
    tags: filters.tags,
    search: filters.search,
    dueRange: filters.dueRange,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleAddTodo = () => {
    setIsAddModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout userEmail={user?.email} onLogout={logout}>
      {/* Page Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold">{user?.email?.split('@')[0]}</span>! 👋
            </p>
          </div>

          <AnimatedButton
            variant="gradient"
            onClick={handleAddTodo}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Todo
          </AnimatedButton>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <DashboardStats
        totalTodos={totalTodos}
        completedTodos={completedTodos}
        pendingTodos={pendingTodos}
      />

      {/* Search Bar */}
      <SearchBar
        value={filters.search || ''}
        onChange={(search) => setFilters({ ...filters, search: search || undefined })}
      />

      {/* Filter and Sort Controls */}
      <FilterSortControls filters={filters} onChange={setFilters} />

      {/* Main Content Card */}
      <Card glass className="min-h-[400px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">My Todos</h2>
            <p className="text-sm text-gray-600">
              {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
              {total > todos.length && ` (${total} total)`}
            </p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : todos.length === 0 ? (
          /* Empty State or No Results */
          filters.search || filters.status || filters.priority || filters.tags?.length ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No todos found</h3>
              <p className="text-gray-600 mb-6">
                {filters.search
                  ? `No results for "${filters.search}". Try a different search term.`
                  : 'No todos match your current filters. Try adjusting your filters.'}
              </p>
              <button
                onClick={() => setFilters({ sortBy: 'created_at', sortOrder: 'desc' })}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <EmptyState onAddTodo={handleAddTodo} />
          )
        ) : (
          /* Todo List */
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence>
              {todos.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TodoCard
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={handleEditTodo}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </Card>

      {/* Quick Actions - Coming Soon */}
      {totalTodos === 0 && !isLoading && (
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            {
              title: 'Quick Add',
              desc: 'Create tasks instantly',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ),
              gradient: 'from-blue-500 to-cyan-500',
              action: handleAddTodo
            },
            {
              title: 'Stay Organized',
              desc: 'Track all your tasks',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              ),
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              title: 'Mark Complete',
              desc: 'Check off finished tasks',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              gradient: 'from-orange-500 to-red-500'
            },
            {
              title: 'Track Progress',
              desc: 'See your productivity',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              gradient: 'from-green-500 to-teal-500'
            }
          ].map((action, index) => (
            <motion.button
              key={action.title}
              className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 hover:shadow-xl transition-all duration-300 text-left group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={action.action}
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.gradient} text-white mb-3 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.desc}</p>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Add Todo Modal */}
      <AddTodoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addTodo}
      />

      {/* Edit Todo Modal */}
      <EditTodoModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={updateTodo}
        todo={editingTodo}
      />
    </DashboardLayout>
  );
}
