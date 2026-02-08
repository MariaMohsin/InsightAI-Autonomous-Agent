// lib/api/todos.ts

import apiClient from './client';
import { Todo, CreateTodoDTO, UpdateTodoDTO, TodoStatus, TodoPriority, TodoListResponse } from '@/types/todo';

export interface GetTodosParams {
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  search?: string;
  due_range?: 'overdue' | 'today' | 'this_week' | 'all';
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority';
  sort_order?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}

/**
 * Get all todos for the authenticated user with optional filters and sorting
 */
export async function getTodos(params?: GetTodosParams): Promise<TodoListResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append('tag', tag));
    }
    if (params.search) queryParams.append('search', params.search);
    if (params.due_range) queryParams.append('due_range', params.due_range);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  }

  const url = `/todos/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get<TodoListResponse>(url);
  return response.data;
}

/**
 * Create a new todo
 */
export async function createTodo(data: CreateTodoDTO): Promise<Todo> {
  const response = await apiClient.post<Todo>('/todos/', data);
  return response.data;
}

/**
 * Update an existing todo
 */
export async function updateTodo(id: number, data: UpdateTodoDTO): Promise<Todo> {
  const response = await apiClient.put<Todo>(`/todos/${id}/`, data);
  return response.data;
}

/**
 * Toggle todo completion status
 */
export async function toggleTodo(id: number, isCompleted: boolean): Promise<Todo> {
  const response = await apiClient.patch<Todo>(`/todos/${id}/`, {
    is_completed: isCompleted
  });
  return response.data;
}

/**
 * Delete a todo
 */
export async function deleteTodo(id: number): Promise<void> {
  await apiClient.delete(`/todos/${id}/`);
}

/**
 * Complete a recurring todo and get next instance
 */
export async function completeRecurringTodo(id: number): Promise<{
  completed_task: Todo;
  next_task: Todo | null;
}> {
  const response = await apiClient.patch(`/todos/${id}/complete`);
  return response.data;
}
