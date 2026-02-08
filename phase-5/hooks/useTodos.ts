// hooks/useTodos.ts

import { useState, useEffect, useCallback } from 'react';
import { getTodos, createTodo, updateTodo, toggleTodo, deleteTodo, completeRecurringTodo, GetTodosParams } from '@/lib/api/todos';
import { Todo, CreateTodoDTO, UpdateTodoDTO, TodoStatus, TodoPriority } from '@/types/todo';
import toast from 'react-hot-toast';

export interface UseTodosParams {
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  search?: string;
  dueRange?: 'overdue' | 'today' | 'this_week' | 'all';
  sortBy?: 'created_at' | 'updated_at' | 'due_date' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export function useTodos(params?: UseTodosParams) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch todos when params change
  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiParams: GetTodosParams = {
        status: params?.status,
        priority: params?.priority,
        tags: params?.tags,
        search: params?.search,
        due_range: params?.dueRange,
        sort_by: params?.sortBy || 'created_at',
        sort_order: params?.sortOrder || 'desc',
        limit: 1000 // Get all todos for now
      };

      const data = await getTodos(apiParams);
      console.log('📋 Fetched todos:', data);
      setTodos(data.todos);
      setTotal(data.total);
    } catch (error: any) {
      console.error('Failed to fetch todos:', error);
      setTodos([]);
      setTotal(0);
      toast.error('Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  }, [params?.status, params?.priority, params?.tags, params?.search, params?.dueRange, params?.sortBy, params?.sortOrder]);

  // Fetch todos when params change
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const refresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchTodos();
    } catch (error: any) {
      toast.error('Failed to refresh todos');
    } finally {
      setIsRefreshing(false);
    }
  };

  const addTodo = async (data: CreateTodoDTO) => {
    try {
      const newTodo = await createTodo(data);
      setTodos((prev) => [newTodo, ...prev]);
      toast.success('Todo created successfully!');
      return newTodo;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create todo';
      toast.error(message);
      throw error;
    }
  };

  const updateTodoById = async (id: number, data: UpdateTodoDTO) => {
    try {
      const updatedTodo = await updateTodo(id, data);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      toast.success('Todo updated successfully!');
      return updatedTodo;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update todo';
      toast.error(message);
      throw error;
    }
  };

  const toggleTodoById = async (id: number, isCompleted: boolean) => {
    try {
      // Find the todo to check if it's recurring
      const todo = todos.find(t => t.id === id);

      // If completing a recurring task, use the special endpoint
      if (isCompleted && todo?.recurrence_rule && todo?.due_date) {
        const result = await completeRecurringTodo(id);

        // Update the completed task and add the next instance
        setTodos((prev) => {
          const updated = prev.map((t) => (t.id === id ? result.completed_task : t));
          // Add next instance if it was created
          if (result.next_task) {
            return [result.next_task, ...updated];
          }
          return updated;
        });

        if (result.next_task) {
          const nextDate = new Date(result.next_task.due_date!).toLocaleDateString();
          toast.success(`Todo completed! 🎉 Next instance created for ${nextDate}`);
        } else {
          toast.success('Todo completed! 🎉');
        }

        return result.completed_task;
      } else {
        // Regular toggle
        const updatedTodo = await toggleTodo(id, isCompleted);
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
        toast.success(isCompleted ? 'Todo completed! 🎉' : 'Todo reopened');
        return updatedTodo;
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to toggle todo';
      toast.error(message);
      throw error;
    }
  };

  const deleteTodoById = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      toast.success('Todo deleted');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to delete todo';
      toast.error(message);
      throw error;
    }
  };

  // Computed values (with safety checks)
  const totalTodos = Array.isArray(todos) ? todos.length : 0;
  const completedTodos = Array.isArray(todos) ? todos.filter((todo) => todo.is_completed).length : 0;
  const pendingTodos = Array.isArray(todos) ? todos.filter((todo) => !todo.is_completed).length : 0;

  return {
    todos,
    isLoading,
    isRefreshing,
    totalTodos,
    completedTodos,
    pendingTodos,
    fetchTodos,
    refresh,
    addTodo,
    updateTodo: updateTodoById,
    toggleTodo: toggleTodoById,
    deleteTodo: deleteTodoById,
  };
}
