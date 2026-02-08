# Research: Frontend Application & Full-Stack Integration

**Feature**: 003-todo-frontend
**Date**: 2026-01-17
**Status**: Complete

## Overview

This document captures research decisions for implementing a Next.js 16+ frontend that integrates with the existing FastAPI backend. All technical unknowns from the planning phase have been resolved through research into best practices, patterns, and the existing backend implementation.

---

## 1. Better Auth Integration with Next.js App Router

### Decision

Use Better Auth v1.x with Next.js 16+ App Router for JWT-based authentication.

### Configuration Approach

```typescript
// lib/auth/better-auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: {
    // Better Auth can store sessions in database or use JWT-only mode
    type: "jwt-only" // Stateless JWT tokens matching backend
  },
  jwt: {
    // Must match backend JWT configuration
    secret: process.env.BETTER_AUTH_SECRET,
    expiresIn: "24h"
  }
});
```

### Rationale

- Better Auth provides built-in JWT handling that can match the backend's JWT validation
- Supports httpOnly cookies for secure token storage
- Integrates seamlessly with Next.js App Router
- Reduces boilerplate for auth flows (signup, login, logout, session management)

### Integration with Backend

The backend (FastAPI) validates JWT tokens using the same `BETTER_AUTH_SECRET`. Better Auth on the frontend will:
1. Call the backend's `/auth/register` and `/auth/login` endpoints
2. Receive JWT token from backend response
3. Store token in httpOnly cookie or secure storage
4. Include token in `Authorization: Bearer <token>` header for all API requests

### Alternatives Considered

- **NextAuth.js**: More complex, designed for OAuth flows, overkill for simple JWT auth
- **Custom JWT handling**: Reinventing the wheel, error-prone, lacks built-in security features
- **Auth0/Clerk**: Third-party services, not aligned with the self-hosted backend approach

---

## 2. HTTP Client for API Communication

### Decision

Use Axios with interceptors for all backend API calls.

### Implementation Pattern

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage(); // From Better Auth or localStorage
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
      // Redirect to login or refresh token
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Rationale

- **Axios Advantages**:
  - Interceptors for automatic token injection and error handling
  - Better TypeScript support
  - Automatic JSON parsing
  - Request/response transformation
  - Timeout configuration
  - Browser and Node.js compatibility

- **Why not native fetch**:
  - Requires manual interceptor implementation
  - Less ergonomic error handling
  - No built-in timeout support
  - More boilerplate for common tasks

### Alternatives Considered

- **Native fetch with wrapper**: More code, less features
- **SWR/React Query**: Better for data fetching but adds complexity for mutations; can layer on top of Axios if needed
- **tRPC**: Requires backend changes, not compatible with existing FastAPI

---

## 3. Form Validation Strategy

### Decision

Use React Hook Form + Zod for all form validation (signup, login, create/edit todo).

### Implementation Pattern

```typescript
// lib/utils/validators.ts
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
});

// components/auth/SignupForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const SignupForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    // Call API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      {/* ... */}
    </form>
  );
};
```

### Rationale

- **React Hook Form**:
  - Minimal re-renders (better performance)
  - Built-in error handling
  - Easy integration with UI libraries
  - TypeScript support

- **Zod**:
  - Type-safe validation
  - Composable schemas
  - Great error messages
  - Can infer TypeScript types from schemas

- **Why together**:
  - Best-in-class combination for React forms
  - Reduces boilerplate
  - Ensures validation consistency across frontend
  - Catches errors before API submission (FR-015, FR-010)

### Alternatives Considered

- **Formik**: More boilerplate, slower performance
- **Manual validation**: Error-prone, inconsistent
- **Yup**: Less type-safe than Zod
- **HTML5 validation only**: Insufficient, no custom rules

---

## 4. State Management for Todos

### Decision

Use React built-in state (useState, useContext) with custom hooks for todo management. No external state management library needed for MVP.

### Implementation Pattern

```typescript
// hooks/useTodos.ts
import { useState, useEffect } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/lib/api/todos';

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (todoData) => {
    const newTodo = await createTodo(todoData);
    setTodos([newTodo, ...todos]);
  };

  // Similar for updateTodo, deleteTodo, toggleComplete

  return { todos, loading, error, addTodo, updateTodo, deleteTodo };
}
```

### Rationale

- **Sufficient for MVP scope**:
  - Single dashboard page managing todos
  - No complex cross-component state sharing
  - No need for global state beyond auth context

- **React built-ins are enough**:
  - useState for component-local state
  - useContext for auth state
  - Custom hooks for reusable logic
  - Keeps bundle size small

- **When to upgrade**:
  - If adding multiple pages needing shared todo state
  - If implementing optimistic updates
  - If adding real-time sync

### Alternatives Considered

- **Redux Toolkit**: Overkill for simple CRUD, adds complexity
- **Zustand**: Simpler than Redux but still unnecessary for this scope
- **Jotai/Recoil**: Atomic state good for complex apps, not needed here
- **TanStack Query (React Query)**: Excellent choice if adding caching, pagination, or offline support later

---

## 5. Styling and UI Component Approach

### Decision

Use Tailwind CSS 4.x for styling with a minimal custom component library (Button, Input, Modal).

### Rationale

- **Tailwind CSS**:
  - Utility-first approach = fast development
  - Built-in responsive design
  - Small production bundle (purges unused styles)
  - Well-documented, widely adopted
  - Works seamlessly with Next.js 16+

- **Custom Components vs UI Library**:
  - **Decision**: Build minimal custom components
  - **Why not Shadcn/UI or Radix**: Adds complexity for simple forms
  - **Why not Material-UI**: Heavy bundle, opinionated styles
  - **Simple Button/Input**: Easy to customize, no dependency bloat

### Implementation

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', onClick, children }: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded font-medium transition';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {children}
    </button>
  );
};
```

### Alternatives Considered

- **CSS Modules**: More boilerplate, harder to maintain
- **Styled Components**: Runtime overhead, slower than Tailwind
- **Shadcn/UI**: Good but unnecessary complexity for MVP
- **Bootstrap**: Less modern, harder to customize

---

## 6. Route Protection Strategy

### Decision

Implement middleware-based route protection using Next.js 16+ middleware and Better Auth session validation.

### Implementation Pattern

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/signup');
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard');

  // Redirect to login if accessing protected page without token
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Rationale

- **Next.js Middleware**:
  - Runs at the edge before page render
  - Prevents flash of protected content
  - Server-side validation (more secure than client-only)
  - Can validate token without client JS

- **Why this approach**:
  - Enforces authentication at routing level (FR-006, FR-007)
  - Handles redirects automatically
  - Works with or without JavaScript enabled
  - Single source of truth for route protection

### Alternatives Considered

- **Client-side only (useEffect check)**: Security risk, flash of content
- **getServerSideProps check**: Works but runs on every request, middleware is faster
- **HOC wrapper**: More boilerplate, harder to maintain

---

## 7. Token Storage Best Practices

### Decision

Store JWT tokens in httpOnly cookies (recommended) or secure sessionStorage as fallback.

### Storage Strategy

| Method | Pros | Cons | Decision |
|--------|------|------|----------|
| httpOnly Cookie | Most secure (XSS-proof) | Requires CORS setup | **PRIMARY CHOICE** |
| sessionStorage | Easy to implement | Vulnerable to XSS | Fallback if httpOnly unavailable |
| localStorage | Persists across sessions | Vulnerable to XSS | **AVOID** |
| In-memory only | Most secure | Lost on refresh | Too restrictive for UX |

### Implementation

```typescript
// lib/auth/utils.ts
export const setAuthToken = (token: string) => {
  // Better Auth handles httpOnly cookie automatically
  // Or manual implementation:
  document.cookie = `auth-token=${token}; Secure; HttpOnly; SameSite=Strict; Max-Age=86400`;
};

export const getAuthToken = (): string | null => {
  // Read from cookie (server-side) or sessionStorage (client-side)
  return sessionStorage.getItem('auth-token');
};

export const clearAuthToken = () => {
  document.cookie = 'auth-token=; Max-Age=0';
  sessionStorage.removeItem('auth-token');
};
```

### Rationale

- **httpOnly Cookies**:
  - Inaccessible to JavaScript (XSS protection)
  - Automatically sent with requests
  - Secure flag for HTTPS only
  - SameSite prevents CSRF

- **Security Compliance**: Meets NFR-SEC-002, NFR-SEC-003 from backend spec

### Alternatives Considered

- **localStorage**: Persistent but XSS-vulnerable
- **In-memory Redux store**: Lost on refresh, poor UX
- **IndexedDB**: Overkill for simple token storage

---

## 8. Error Handling and User Feedback

### Decision

Implement centralized error handling with toast notifications for user feedback.

### Implementation Pattern

```typescript
// lib/utils/toast.ts (simple implementation or use react-hot-toast)
export const showToast = {
  success: (message: string) => {
    // Show success notification
  },
  error: (message: string) => {
    // Show error notification
  },
  info: (message: string) => {
    // Show info notification
  },
};

// Usage in API calls
try {
  await createTodo(data);
  showToast.success('Todo created successfully!');
} catch (error) {
  if (error.response?.status === 401) {
    showToast.error('Session expired. Please log in again.');
    // Redirect to login
  } else if (error.response?.status === 400) {
    showToast.error(error.response.data.message);
  } else {
    showToast.error('Something went wrong. Please try again.');
  }
}
```

### Rationale

- **User-Friendly Errors**: Meets FR-016, FR-019, FR-021, SC-011
- **Consistent UX**: All errors displayed in same format
- **Non-Intrusive**: Toast notifications don't block UI
- **Accessible**: Can be enhanced with ARIA labels

### Library Choice

**react-hot-toast** or **sonner**:
- Lightweight (~3KB)
- Customizable
- Accessible
- TypeScript support
- Can be styled with Tailwind

### Alternatives Considered

- **Custom modal alerts**: Too intrusive
- **Console.log only**: Not user-facing
- **Inline error text only**: Missed for asynchronous errors

---

## 9. Backend API Endpoints Integration

### Research Findings

From Spec-2 (002-todo-app-restful-mvp), the backend provides these endpoints:

**Authentication (Public)**:
- `POST /auth/register` - Create account
- `POST /auth/login` - Authenticate user

**Todos (Protected - JWT Required)**:
- `GET /todos` - List user's todos
- `POST /todos` - Create new todo
- `GET /todos/{id}` - Get single todo
- `PUT /todos/{id}` - Update todo
- `PATCH /todos/{id}/toggle` - Toggle completion status
- `DELETE /todos/{id}` - Delete todo

### Frontend API Client Structure

```typescript
// lib/api/auth.ts
export const authAPI = {
  signup: (email: string, password: string) =>
    apiClient.post('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

// lib/api/todos.ts
export const todosAPI = {
  getAll: () => apiClient.get('/todos'),
  getById: (id: number) => apiClient.get(`/todos/${id}`),
  create: (data: CreateTodoDTO) => apiClient.post('/todos', data),
  update: (id: number, data: UpdateTodoDTO) => apiClient.put(`/todos/${id}`, data),
  toggleComplete: (id: number) => apiClient.patch(`/todos/${id}/toggle`),
  delete: (id: number) => apiClient.delete(`/todos/${id}`),
};
```

### Decision

- Use existing backend endpoints without modifications
- Frontend adapts to backend contract
- No backend changes required for this feature

---

## 10. Responsive Design Breakpoints

### Decision

Use Tailwind CSS default breakpoints with mobile-first approach.

### Breakpoints

- **Mobile**: 375px - 639px (sm)
- **Tablet**: 640px - 1023px (md)
- **Desktop**: 1024px+ (lg, xl)

### Implementation Strategy

```tsx
// Example: Todo card responsive layout
<div className="
  flex flex-col gap-2          // Mobile: stack vertically
  md:flex-row md:items-center  // Tablet+: horizontal layout
  lg:gap-4                     // Desktop: larger gaps
">
  <h3 className="text-lg md:text-xl">{todo.title}</h3>
  <div className="flex gap-2 mt-2 md:mt-0 md:ml-auto">
    {/* Action buttons */}
  </div>
</div>
```

### Rationale

- **Mobile-first**: Easier to enhance than to strip down
- **Tailwind breakpoints**: Industry standard, well-documented
- **Meets SC-008, SC-009**: Usable on 375px+ mobile and 1024px+ desktop

---

## Summary of Research Decisions

| Concern | Decision | Rationale |
|---------|----------|-----------|
| **Authentication** | Better Auth with JWT | Matches backend, secure, modern |
| **HTTP Client** | Axios with interceptors | Auto token injection, error handling |
| **Form Validation** | React Hook Form + Zod | Type-safe, performant, great DX |
| **State Management** | React hooks (useState/Context) | Sufficient for MVP, no over-engineering |
| **Styling** | Tailwind CSS 4.x | Fast development, small bundle, responsive |
| **Route Protection** | Next.js middleware | Server-side, secure, no flash of content |
| **Token Storage** | httpOnly cookies (primary) | XSS-proof, secure, automatic |
| **Error Handling** | Toast notifications (react-hot-toast) | User-friendly, consistent, accessible |
| **API Integration** | Centralized API client with Axios | Matches backend contract from Spec-2 |
| **Responsive Design** | Tailwind breakpoints (mobile-first) | Industry standard, meets SC-008/SC-009 |

---

## Next Steps

All research is complete. Proceeding to:
1. **Phase 1**: Generate data-model.md, contracts/, and quickstart.md
2. **Phase 2**: Create tasks.md with implementation tasks (via `/speckit.tasks`)

---

**Status**: ✅ COMPLETE
**Date**: 2026-01-17
**Reviewed by**: Planning workflow
