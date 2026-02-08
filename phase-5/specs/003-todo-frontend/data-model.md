# Data Model: Frontend Application & Full-Stack Integration

**Feature**: 003-todo-frontend
**Date**: 2026-01-17
**Status**: Complete

## Overview

This document defines the frontend data models (TypeScript interfaces and types) that represent entities in the todo application. These models match the backend API contracts and provide type safety throughout the frontend application.

---

## Core Entities

### 1. User

Represents an authenticated user in the system.

```typescript
// types/auth.ts

export interface User {
  id: number;
  email: string;
  created_at: string; // ISO 8601 datetime
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}
```

**Field Descriptions**:
- `id`: Unique identifier for the user (assigned by backend)
- `email`: User's email address (must be unique, validated as email format)
- `created_at`: Timestamp when user account was created (ISO 8601 format)
- `access_token`: JWT token issued by backend for authentication
- `token_type`: Always "bearer" for HTTP Authorization header format

**Validation Rules** (enforced on frontend):
- `email`: Must match email regex pattern
- `password`: Minimum 8 characters (per FR-AUTH-003 from backend spec)

**Relationships**:
- A User has many Todos (one-to-many)

---

### 2. Todo

Represents a task item belonging to a specific user.

```typescript
// types/todo.ts

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

export interface CreateTodoDTO {
  title: string;
  description?: string;
}

export interface UpdateTodoDTO {
  title?: string;
  description?: string;
}

export interface TodoListResponse {
  todos: Todo[];
}
```

**Field Descriptions**:
- `id`: Unique identifier for the todo (assigned by backend)
- `user_id`: Foreign key to the User who owns this todo (set by backend from JWT)
- `title`: Todo item title (required, 1-255 characters)
- `description`: Optional detailed description (max 1000 characters)
- `is_completed`: Completion status (default: false)
- `created_at`: Timestamp when todo was created (ISO 8601 format)
- `updated_at`: Timestamp when todo was last modified (ISO 8601 format)

**Validation Rules** (enforced on frontend before API submission):
- `title`: Required, non-empty, max 255 characters
- `description`: Optional, max 1000 characters if provided
- `is_completed`: Boolean, defaults to false

**State Transitions**:
- `is_completed` can toggle between `true` and `false` via PATCH /todos/{id}/toggle endpoint
- `updated_at` is automatically updated by backend on any modification

**Relationships**:
- A Todo belongs to one User (many-to-one)
- `user_id` is enforced at backend level; frontend never sends it (extracted from JWT)

---

## Supporting Types

### 3. API Error Response

Standard error format returned by backend.

```typescript
// types/api.ts

export interface APIError {
  detail: string; // Human-readable error message
  error?: string; // Optional error code
}

export interface ValidationError {
  loc: string[]; // Field path that failed validation
  msg: string;   // Validation error message
  type: string;  // Validation type (e.g., "value_error.email")
}

export interface ValidationErrorResponse {
  detail: ValidationError[];
}
```

**Usage**:
- Returned on 4xx and 5xx responses from backend
- Frontend displays `detail` message to users
- Validation errors provide field-specific feedback

---

### 4. Form State Types

Local state types for form components.

```typescript
// types/forms.ts

export interface LoginFormState {
  email: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;
}

export interface SignupFormState {
  email: string;
  password: string;
  confirmPassword: string;
  isSubmitting: boolean;
  error: string | null;
}

export interface TodoFormState {
  title: string;
  description: string;
  isSubmitting: boolean;
  error: string | null;
}
```

**Purpose**:
- Manage form input state
- Track submission status for loading indicators (FR-017)
- Display form-specific errors (FR-016)

---

### 5. UI State Types

Application-level UI state.

```typescript
// types/ui.ts

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number; // milliseconds
}

export interface ModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  todo?: Todo; // Present when mode is "edit"
}
```

**Purpose**:
- Track loading states for async operations (FR-017)
- Manage toast notifications (FR-018, FR-019)
- Control modal visibility for create/edit todo dialogs

---

## Validation Schemas

### Zod Schemas for Runtime Validation

```typescript
// lib/utils/validators.ts

import { z } from 'zod';

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const todoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

// Type inference from schemas
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type TodoFormData = z.infer<typeof todoSchema>;
```

**Purpose**:
- Ensure data validity before API submission (FR-015, SC-010)
- Provide type-safe form data
- Generate consistent error messages

---

## Data Flow

### Authentication Flow

```
User Input → SignupFormData (validated) → POST /auth/register → AuthResponse → User + Token → Store Token → Redirect to Dashboard
```

### Todo Creation Flow

```
User Input → TodoFormData (validated) → CreateTodoDTO → POST /todos → Todo → Add to Local State → Show Success Toast
```

### Todo Update Flow

```
User Edit → TodoFormData (validated) → UpdateTodoDTO → PUT /todos/{id} → Todo → Update Local State → Show Success Toast
```

### Todo Toggle Flow

```
User Click → PATCH /todos/{id}/toggle → Todo (updated is_completed) → Update Local State → Visual Feedback
```

### Todo Delete Flow

```
User Confirm → DELETE /todos/{id} → 204 No Content → Remove from Local State → Show Success Toast
```

---

## Data Storage

### Client-Side Storage

| Data | Storage Method | Rationale |
|------|----------------|-----------|
| **JWT Token** | httpOnly Cookie (primary) | XSS-proof, secure, automatic inclusion in requests |
| **User Info** | React Context (AuthContext) | In-memory, no sensitive data, lost on refresh (re-fetch on mount) |
| **Todos List** | Component State (useState) | Temporary, refetched on mount, no persistence needed |
| **Form Data** | Component State (React Hook Form) | Ephemeral, cleared on submit/cancel |

**Why No Persistent Client Storage**:
- No offline mode requirement (per Out of Scope)
- Fresh data fetched on each session ensures consistency
- Reduces complexity and potential security issues

---

## Type Guards and Utilities

### Type Guards

```typescript
// lib/utils/type-guards.ts

export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error &&
    typeof (error as APIError).detail === 'string'
  );
}

export function isValidationErrorResponse(error: unknown): error is ValidationErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error &&
    Array.isArray((error as ValidationErrorResponse).detail)
  );
}
```

**Purpose**:
- Safe type narrowing for error handling
- Enables TypeScript to infer correct error types

---

## Summary

**Total Entities**: 2 core (User, Todo) + 5 supporting types (APIError, FormState, UIState, etc.)

**Type Safety**:
- All API responses typed
- Zod validation ensures runtime type safety
- TypeScript catches compile-time errors

**Validation Layers**:
1. Client-side form validation (React Hook Form + Zod)
2. API request validation (backend Pydantic models)
3. Database constraints (enforced by backend SQLModel)

**Data Ownership**:
- User owns multiple Todos
- Backend enforces ownership via JWT user_id
- Frontend respects backend filtering (never attempts to filter by user client-side)

---

**Status**: ✅ COMPLETE
**Date**: 2026-01-17
**Aligns With**: Backend Spec-2 (002-todo-app-restful-mvp)
