# Implementation Plan: Frontend Application & Full-Stack Integration

**Branch**: `003-todo-frontend` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-todo-frontend/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a Next.js 16+ frontend application that integrates with the existing FastAPI backend to provide a complete, secure todo management web application. The frontend will implement Better Auth for JWT-based authentication, consume RESTful API endpoints, and provide a responsive UI for user signup, login, and full CRUD operations on tasks. The implementation must enforce user isolation, handle authentication tokens securely, and deliver all features defined in the spec with proper error handling and validation.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+ (App Router, React 19)
**Primary Dependencies**:
- Next.js 16+ (App Router)
- Better Auth (JWT authentication)
- React 19
- Tailwind CSS 4.x
- Axios or native fetch (HTTP client)
- React Hook Form + Zod (form validation)
- jose or jwt-decode (JWT handling)

**Storage**: N/A (frontend only - backend handles Neon PostgreSQL)
**Testing**: Jest + React Testing Library (optional for MVP)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (frontend only, integrates with existing backend)
**Performance Goals**:
- Page load < 2 seconds
- API response handling < 1 second
- Form submission feedback < 500ms
- LCP (Largest Contentful Paint) < 2.5s

**Constraints**:
- Must integrate with existing FastAPI backend at specified API endpoints
- Must use Better Auth with JWT tokens matching backend validation
- Must enforce client-side route protection
- Must handle token expiry and refresh
- Responsive design (mobile 375px+, desktop 1024px+)
- Zero console errors in browser devtools

**Scale/Scope**:
- 6 main pages (landing, signup, login, dashboard, create/edit task modals)
- 8-12 React components
- 5 API integration functions
- Single-user interface (no admin panel)
- ~2,000-3,000 lines of code

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Security-First Development ✅

- **JWT Token Handling**: Frontend will securely store JWT tokens (httpOnly cookies recommended via Better Auth)
- **Authorization Headers**: All protected API requests will include `Authorization: Bearer <token>` header
- **Client-Side Route Protection**: Implement route guards to prevent unauthenticated access to dashboard
- **Token Validation**: Handle 401/403 responses from backend and redirect to login
- **No Sensitive Data Leakage**: Never log tokens or passwords in console/errors
- **XSS Protection**: Use React's built-in XSS protection, avoid dangerouslySetInnerHTML
- **CSRF Protection**: Better Auth will handle CSRF tokens for authentication endpoints

**Status**: PASS - Security enforced at multiple layers (authentication, authorization, input validation)

### Principle II: Spec-Driven Implementation ✅

- **Spec Compliance**: Implementation follows approved spec.md requirements exactly
- **API Contract Adherence**: Frontend will consume backend APIs as defined in Spec-2
- **No Ad-Hoc Changes**: All behavior changes require spec amendments
- **Living Documentation**: Contracts and API integration documented in this plan

**Status**: PASS - Full spec exists, implementation will follow strictly

### Principle III: User Isolation and Data Integrity ✅

- **User ID from JWT**: User identity extracted from validated JWT token by backend
- **Backend Enforcement**: Frontend sends JWT; backend enforces ownership at database level
- **No Client-Side User ID**: Frontend never sends user_id in request bodies (backend extracts from token)
- **UI Filtering**: Dashboard only displays tasks returned by backend (pre-filtered by user)

**Status**: PASS - User isolation enforced by backend, frontend respects backend contracts

### Principle IV: Production Realism ✅

- **Environment Variables**: Use `.env.local` for `NEXT_PUBLIC_API_URL` and `BETTER_AUTH_SECRET`
- **Proper Error Handling**: User-friendly error messages, graceful degradation on API failures
- **Connection Pooling**: N/A for frontend (backend concern)
- **No Hardcoded Secrets**: All sensitive config via environment variables
- **Production-Ready Patterns**: Next.js App Router, proper React patterns, TypeScript for type safety

**Status**: PASS - Production patterns used throughout

### Principle V: Full-Stack Clarity ✅

- **Clear Layer Boundaries**:
  - Frontend: Next.js (UI components, client state, API calls)
  - Backend: FastAPI (business logic, database access, authentication)
  - Database: Neon PostgreSQL (data persistence)
- **Documented API Contracts**: Backend endpoints documented in Spec-2 and contracts/ directory
- **Explicit API Client**: Centralized `lib/api.ts` module for all backend communication
- **No Over-Engineering**: Simple fetch/axios calls, straightforward React components

**Status**: PASS - Clear separation of concerns, well-defined boundaries

### GATE RESULT: ✅ ALL PRINCIPLES SATISFIED

No violations detected. Implementation follows all constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/ (EXISTING - from Spec-2)
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   └── routers/
│       ├── auth.py      # POST /auth/register, /auth/login
│       └── todos.py     # GET/POST/PUT/PATCH/DELETE /todos
├── requirements.txt
├── .env
└── run_server.py

frontend/ (NEW - this feature)
├── app/
│   ├── layout.tsx                 # Root layout with auth provider
│   ├── page.tsx                   # Landing page (redirects to login/dashboard)
│   ├── (auth)/
│   │   ├── signup/
│   │   │   └── page.tsx          # User registration page
│   │   └── login/
│   │       └── page.tsx          # User login page
│   └── (protected)/
│       └── dashboard/
│           └── page.tsx          # Todo dashboard (protected route)
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── auth/
│   │   ├── AuthProvider.tsx      # Better Auth context
│   │   └── ProtectedRoute.tsx    # Route guard component
│   └── todos/
│       ├── TodoList.tsx           # List of all todos
│       ├── TodoCard.tsx           # Individual todo item
│       ├── CreateTodoForm.tsx     # Create new todo modal
│       └── EditTodoForm.tsx       # Edit existing todo modal
├── lib/
│   ├── api/
│   │   ├── client.ts              # Axios instance with interceptors
│   │   ├── auth.ts                # Auth API calls (signup, login)
│   │   └── todos.ts               # Todo API calls (CRUD)
│   ├── auth/
│   │   ├── better-auth.ts         # Better Auth configuration
│   │   └── utils.ts               # Token storage, validation
│   └── utils/
│       └── validators.ts          # Zod schemas for validation
├── types/
│   ├── auth.ts                    # User, AuthResponse types
│   └── todo.ts                    # Todo, CreateTodoDTO types
├── hooks/
│   ├── useAuth.ts                 # Authentication hook
│   └── useTodos.ts                # Todo management hook
├── styles/
│   └── globals.css                # Tailwind directives
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

**Structure Decision**: Web application with separate frontend/backend directories. Frontend uses Next.js 16+ App Router with route groups for organization:
- `(auth)` route group: Public authentication pages
- `(protected)` route group: Protected dashboard and todo management
- Clear separation of components by domain (auth, todos, ui)
- Centralized API client in `lib/api/` for all backend communication

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations detected. Constitution Check passed all principles.

This section intentionally left empty as there are no complexity violations to justify.
