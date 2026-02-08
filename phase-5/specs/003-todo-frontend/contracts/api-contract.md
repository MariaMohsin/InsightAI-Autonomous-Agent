# API Contract: Frontend-Backend Integration

**Feature**: 003-todo-frontend
**Backend Spec**: 002-todo-app-restful-mvp
**Date**: 2026-01-17
**Status**: Complete

## Overview

This document defines the complete API contract between the Next.js frontend and FastAPI backend. All endpoints, request/response formats, status codes, and error handling are documented here.

---

## Base Configuration

### Endpoint Base URL

```
Development: http://localhost:8000
Production: https://api.todo-app.example.com (TBD)
```

**Environment Variable**: `NEXT_PUBLIC_API_URL`

### Request Headers

All requests must include:

```http
Content-Type: application/json
```

Protected endpoints additionally require:

```http
Authorization: Bearer <jwt_token>
```

### Response Format

All responses return JSON with appropriate HTTP status codes.

---

## Authentication Endpoints

### 1. User Registration

**Endpoint**: `POST /auth/register`

**Access**: Public (no JWT required)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Request Validation**:
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters

**Success Response** (201 Created):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-01-17T10:00:00Z"
  }
}
```

**Error Responses**:

```json
// 400 Bad Request - Email already exists
{
  "detail": "Email already registered"
}

// 400 Bad Request - Validation error
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}

// 400 Bad Request - Password too short
{
  "detail": "Password must be at least 8 characters"
}
```

**Frontend Handling**:
```typescript
// lib/api/auth.ts
export async function signup(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/register', { email, password });
  return response.data;
}
```

---

### 2. User Login

**Endpoint**: `POST /auth/login`

**Access**: Public (no JWT required)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Request Validation**:
- `email`: Required
- `password`: Required

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-01-17T10:00:00Z"
  }
}
```

**Error Responses**:

```json
// 401 Unauthorized - Invalid credentials
{
  "detail": "Invalid credentials"
}

// 400 Bad Request - Missing fields
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Frontend Handling**:
```typescript
// lib/api/auth.ts
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}
```

---

## Todo Management Endpoints

All todo endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 3. List All Todos

**Endpoint**: `GET /todos`

**Access**: Protected (JWT required)

**Request**: No body, token in header

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "is_completed": false,
    "created_at": "2026-01-17T10:00:00Z",
    "updated_at": "2026-01-17T10:00:00Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "title": "Finish project",
    "description": null,
    "is_completed": true,
    "created_at": "2026-01-17T09:00:00Z",
    "updated_at": "2026-01-17T11:00:00Z"
  }
]
```

**Response Notes**:
- Returns only todos belonging to the authenticated user
- `user_id` matches the user ID from JWT token
- Empty array `[]` if user has no todos
- Sorted by creation date (newest first) - backend implementation detail

**Error Responses**:

```json
// 401 Unauthorized - Missing or invalid token
{
  "detail": "Unauthorized"
}
```

**Frontend Handling**:
```typescript
// lib/api/todos.ts
export async function getTodos(): Promise<Todo[]> {
  const response = await apiClient.get('/todos');
  return response.data;
}
```

---

### 4. Create Todo

**Endpoint**: `POST /todos`

**Access**: Protected (JWT required)

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Request Validation**:
- `title`: Required, non-empty, max 255 characters
- `description`: Optional, max 1000 characters

**Success Response** (201 Created):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "created_at": "2026-01-17T10:00:00Z",
  "updated_at": "2026-01-17T10:00:00Z"
}
```

**Response Notes**:
- `user_id` is automatically set from JWT token (frontend never sends it)
- `is_completed` defaults to `false`
- `created_at` and `updated_at` are auto-generated

**Error Responses**:

```json
// 400 Bad Request - Missing title
{
  "detail": "Title is required"
}

// 400 Bad Request - Title too long
{
  "detail": "Title must be less than 255 characters"
}

// 401 Unauthorized - No token
{
  "detail": "Unauthorized"
}
```

**Frontend Handling**:
```typescript
// lib/api/todos.ts
export async function createTodo(data: CreateTodoDTO): Promise<Todo> {
  const response = await apiClient.post('/todos', data);
  return response.data;
}
```

---

### 5. Get Single Todo

**Endpoint**: `GET /todos/{id}`

**Access**: Protected (JWT required, ownership validated)

**Path Parameters**:
- `id`: Todo ID (integer)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": false,
  "created_at": "2026-01-17T10:00:00Z",
  "updated_at": "2026-01-17T10:00:00Z"
}
```

**Error Responses**:

```json
// 403 Forbidden - Todo belongs to another user
{
  "detail": "Forbidden - not your todo"
}

// 404 Not Found - Todo doesn't exist
{
  "detail": "Todo not found"
}

// 401 Unauthorized - No token
{
  "detail": "Unauthorized"
}
```

**Frontend Handling**:
```typescript
// lib/api/todos.ts
export async function getTodoById(id: number): Promise<Todo> {
  const response = await apiClient.get(`/todos/${id}`);
  return response.data;
}
```

---

### 6. Update Todo

**Endpoint**: `PUT /todos/{id}`

**Access**: Protected (JWT required, ownership validated)

**Path Parameters**:
- `id`: Todo ID (integer)

**Request Body**:
```json
{
  "title": "Buy groceries and snacks",
  "description": "Updated list: Milk, eggs, bread, chips"
}
```

**Request Validation**:
- `title`: Required, non-empty, max 255 characters
- `description`: Optional, max 1000 characters

**Success Response** (200 OK):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries and snacks",
  "description": "Updated list: Milk, eggs, bread, chips",
  "is_completed": false,
  "created_at": "2026-01-17T10:00:00Z",
  "updated_at": "2026-01-17T11:30:00Z"
}
```

**Response Notes**:
- `updated_at` is automatically refreshed
- `created_at` remains unchanged
- `is_completed` status is not modified (use PATCH /toggle for that)

**Error Responses**:

```json
// 403 Forbidden - Not your todo
{
  "detail": "Forbidden - not your todo"
}

// 404 Not Found
{
  "detail": "Todo not found"
}

// 400 Bad Request - Validation error
{
  "detail": "Title is required"
}
```

**Frontend Handling**:
```typescript
// lib/api/todos.ts
export async function updateTodo(id: number, data: UpdateTodoDTO): Promise<Todo> {
  const response = await apiClient.put(`/todos/${id}`, data);
  return response.data;
}
```

---

### 7. Toggle Todo Completion

**Endpoint**: `PATCH /todos/{id}/toggle`

**Access**: Protected (JWT required, ownership validated)

**Path Parameters**:
- `id`: Todo ID (integer)

**Request**: No body required

**Success Response** (200 OK):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "is_completed": true,
  "created_at": "2026-01-17T10:00:00Z",
  "updated_at": "2026-01-17T12:00:00Z"
}
```

**Response Notes**:
- `is_completed` is toggled (false → true, or true → false)
- `updated_at` is automatically refreshed
- Returns the full todo object with updated status

**Error Responses**:

```json
// 403 Forbidden
{
  "detail": "Forbidden - not your todo"
}

// 404 Not Found
{
  "detail": "Todo not found"
}
```

**Frontend Handling**:
```typescript
// lib/api/todos.ts
export async function toggleTodoComplete(id: number): Promise<Todo> {
  const response = await apiClient.patch(`/todos/${id}/toggle`);
  return response.data;
}
```

---

### 8. Delete Todo

**Endpoint**: `DELETE /todos/{id}`

**Access**: Protected (JWT required, ownership validated)

**Path Parameters**:
- `id`: Todo ID (integer)

**Success Response** (204 No Content):
- No response body
- HTTP 204 status indicates successful deletion

**Error Responses**:

```json
// 403 Forbidden
{
  "detail": "Forbidden - not your todo"
}

// 404 Not Found (todo already deleted or doesn't exist)
{
  "detail": "Todo not found"
}
```

**Frontend Handling**:
```typescript
// lib/api/todos.ts
export async function deleteTodo(id: number): Promise<void> {
  await apiClient.delete(`/todos/${id}`);
  // No return value for 204
}
```

---

## Error Handling

### Standard HTTP Status Codes

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| `200` | OK | Process success response |
| `201` | Created | Resource created, process response |
| `204` | No Content | Success, no response body |
| `400` | Bad Request | Show validation errors to user |
| `401` | Unauthorized | Redirect to login, clear token |
| `403` | Forbidden | Show "Access denied" message |
| `404` | Not Found | Show "Not found" message |
| `500` | Internal Server Error | Show generic error message |

### Error Response Format

All errors return JSON with a `detail` field:

```typescript
interface APIError {
  detail: string | ValidationError[];
}

interface ValidationError {
  loc: string[];  // ["body", "field_name"]
  msg: string;    // Human-readable error
  type: string;   // Error type identifier
}
```

### Frontend Error Handling Pattern

```typescript
try {
  const result = await todosAPI.createTodo(data);
  showToast.success('Todo created!');
  return result;
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuthToken();
      router.push('/login');
    } else if (error.response?.status === 400) {
      // Validation error
      const detail = error.response.data.detail;
      if (Array.isArray(detail)) {
        // Multiple validation errors
        detail.forEach(err => {
          showToast.error(err.msg);
        });
      } else {
        showToast.error(detail);
      }
    } else if (error.response?.status === 403) {
      showToast.error('You do not have permission to perform this action');
    } else {
      showToast.error('Something went wrong. Please try again.');
    }
  } else {
    // Network error
    showToast.error('Network error. Please check your connection.');
  }
}
```

---

## CORS Configuration

### Backend CORS Setup

The FastAPI backend must allow requests from the frontend origin:

```python
# Backend configuration (already implemented in Spec-2)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend Considerations

- Credentials (cookies) are included automatically when using httpOnly cookies
- Authorization header must be explicitly set for JWT bearer tokens
- CORS errors indicate backend misconfiguration (not a frontend issue)

---

## JWT Token Details

### Token Structure

JWT tokens are signed using HS256 algorithm with `BETTER_AUTH_SECRET`.

**Decoded Payload** (for reference only - frontend should not decode):
```json
{
  "sub": "1",              // User ID as string
  "email": "user@example.com",
  "exp": 1705584000        // Expiration timestamp (Unix epoch)
}
```

### Token Lifecycle

1. **Issuance**: Backend issues token on `/auth/register` or `/auth/login`
2. **Storage**: Frontend stores in httpOnly cookie or sessionStorage
3. **Usage**: Included in `Authorization: Bearer <token>` header for all protected requests
4. **Validation**: Backend validates signature and expiration on every protected request
5. **Expiration**: Token expires after 24 hours (configurable)
6. **Refresh**: Not implemented in MVP (user must log in again)

### Frontend Token Management

```typescript
// lib/auth/utils.ts

export function setAuthToken(token: string): void {
  // Option 1: httpOnly cookie (handled by Better Auth)
  // Option 2: sessionStorage (fallback)
  sessionStorage.setItem('auth_token', token);
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem('auth_token');
}

export function clearAuthToken(): void {
  sessionStorage.removeItem('auth_token');
}
```

---

## API Client Implementation

### Axios Instance Configuration

```typescript
// lib/api/client.ts

import axios from 'axios';
import { getAuthToken, clearAuthToken } from '@/lib/auth/utils';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Testing Checklist

### Contract Compliance Testing

- [ ] All endpoints return expected status codes
- [ ] Response bodies match documented schemas
- [ ] Error responses follow standard format
- [ ] JWT token is correctly included in headers
- [ ] 401 errors trigger logout and redirect
- [ ] Validation errors display field-specific messages
- [ ] User isolation is enforced (can't access other users' todos)

---

## Summary

**Total Endpoints**: 8
- **Public**: 2 (register, login)
- **Protected**: 6 (list, create, get, update, toggle, delete todos)

**Authentication**: JWT Bearer tokens in Authorization header

**Error Handling**: Consistent JSON format with `detail` field

**Data Ownership**: Enforced by backend using JWT user_id

**CORS**: Backend must allow frontend origin

---

**Status**: ✅ COMPLETE
**Date**: 2026-01-17
**Backend Compatibility**: Spec-2 (002-todo-app-restful-mvp)
