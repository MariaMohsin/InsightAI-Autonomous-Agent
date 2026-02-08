// types/todo.ts

export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum RecurrenceRule {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface Tag {
  id: number;
  name: string;
}

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  due_date: string | null; // ISO 8601 datetime
  reminder_at: string | null; // ISO 8601 datetime
  recurrence_rule: RecurrenceRule | null;
  recurrence_parent_id: number | null;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  tags: Tag[];
  is_completed: boolean; // Computed field from backend
  overdue: boolean; // Computed field from backend
}

export interface CreateTodoDTO {
  title: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_date?: string; // ISO 8601 datetime
  reminder_at?: string; // ISO 8601 datetime
  recurrence_rule?: RecurrenceRule;
  tag_names?: string[];
}

export interface UpdateTodoDTO {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_date?: string; // ISO 8601 datetime
  reminder_at?: string; // ISO 8601 datetime
  recurrence_rule?: RecurrenceRule;
  tag_names?: string[];
}

export interface TodoListResponse {
  todos: Todo[];
  total: number;
}
