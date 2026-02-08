# Implementation Plan: Multi-User Todo Application with JWT Authentication

**Branch**: `001-todo-app-mvp` | **Date**: 2026-01-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-todo-app-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a secure, spec-compliant full-stack Todo web application with JWT-based authentication. The system enables users to register, authenticate, and manage personal tasks through a responsive web interface. Security-first approach enforces user isolation at every layer (frontend, backend, database) to prevent cross-user data leakage. Implementation follows spec-driven development principles with explicit API contracts, proper error handling, and production-grade patterns suitable for real-world deployment.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x with Next.js 16+ (App Router)
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: Next.js 16+, Better Auth, React 19+, TypeScript
- Backend: FastAPI 0.100+, SQLModel 0.14+, PyJWT 2.8+, python-jose, passlib
- Database: Neon Serverless PostgreSQL (psycopg2-binary or asyncpg)

**Storage**: Neon Serverless PostgreSQL with connection pooling via pgbouncer

**Testing**:
- Frontend: Jest, React Testing Library (optional for hackathon)
- Backend: pytest, httpx (for FastAPI testing)

**Target Platform**:
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge)
- Backend: Python ASGI server (Uvicorn)
- Deployment: Vercel (frontend), Railway/Render (backend), Neon (database)

**Project Type**: Web application (frontend + backend separation)

**Performance Goals**:
- Signup/signin: < 5 seconds end-to-end
- Task operations: < 3 seconds (create, update, delete)
- Page load: < 2 seconds for authenticated dashboard
- API response: < 500ms p95 for task endpoints

**Constraints**:
- BETTER_AUTH_SECRET must be identical in frontend and backend environments
- JWT tokens must be validated on every protected endpoint (no exceptions)
- Database queries must filter by authenticated user ID (enforced at query level)
- Neon serverless requires connection pooling awareness (avoid connection exhaustion)
- Hackathon timeline: Complete MVP within limited timeframe

**Scale/Scope**:
- Expected users: 10-100 (hackathon evaluators and demo users)
- Task volume: ~100 tasks per user
- Concurrent requests: 10-20 simultaneous users
- Code size: ~2000-3000 LOC total (frontend + backend)
- Features: 3 user stories (auth, task creation, task management)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Security-First Development ✅

- **JWT Authentication**: Better Auth configured to issue JWT tokens on signup/signin
- **Token Validation**: FastAPI middleware validates JWT on every protected endpoint
- **User Identity**: User ID extracted exclusively from verified JWT tokens (never from client data)
- **Error Handling**: 401 Unauthorized for missing/invalid tokens, 403 Forbidden for ownership violations
- **Password Security**: Passwords hashed with bcrypt before database storage
- **SQL Injection Prevention**: SQLModel ORM with parameterized queries
- **XSS Prevention**: Next.js automatic escaping, Content Security Policy headers

**Status**: PASS - Security enforced at every layer (frontend, backend, database)

### II. Spec-Driven Implementation ✅

- **API Contracts**: All endpoints defined in contracts/ before implementation
- **Request/Response Schemas**: Pydantic models for validation
- **Spec Alignment**: Implementation follows spec.md requirements without deviation
- **Change Management**: Spec amendments required before behavior changes

**Status**: PASS - Following spec-driven workflow, contracts generated in Phase 1

### III. User Isolation and Data Integrity ✅

- **Task Ownership**: Every task linked to user_id via foreign key
- **Query Filtering**: All database queries filter by authenticated user ID
- **Ownership Verification**: Backend validates task.user_id == JWT.user_id on updates/deletes
- **Zero Data Leakage**: Users cannot access other users' tasks (enforced at DB and API layer)

**Status**: PASS - User isolation enforced at database schema and query level

### IV. Production Realism ✅

- **Environment Variables**: BETTER_AUTH_SECRET, DATABASE_URL via .env files
- **Connection Pooling**: Neon pgbouncer configuration for serverless environment
- **Error Handling**: Proper HTTP status codes, user-friendly error messages
- **Logging**: Structured logging for debugging and audit trails
- **No Shortcuts**: No mock auth, no hardcoded secrets, no dev-only patterns

**Status**: PASS - Production-grade patterns from day one

### V. Full-Stack Clarity ✅

- **Layer Separation**: Clear frontend (Next.js) ↔ API (FastAPI) ↔ database (PostgreSQL) boundaries
- **Explicit Code**: No unnecessary abstractions, straightforward implementations
- **API Contracts**: OpenAPI documentation generated automatically by FastAPI
- **Consistent Patterns**: RESTful conventions, standard HTTP methods and status codes

**Status**: PASS - Clear architecture with well-defined responsibilities per layer

### Overall Assessment

**All Constitution Gates: PASSED ✅**

No violations detected. Implementation plan aligns with all five core principles. Ready to proceed to Phase 0 research.

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
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app initialization
│   ├── config.py                  # Environment variables, settings
│   ├── database.py                # SQLModel engine, session management
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── middleware.py          # JWT validation middleware
│   │   ├── dependencies.py        # get_current_user dependency
│   │   └── utils.py               # Password hashing, JWT creation
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # User SQLModel schema
│   │   └── task.py                # Task SQLModel schema
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py                # User Pydantic schemas (request/response)
│   │   └── task.py                # Task Pydantic schemas (request/response)
│   └── routers/
│       ├── __init__.py
│       ├── auth.py                # /auth/signup, /auth/signin
│       └── tasks.py               # /tasks/* endpoints
├── tests/
│   ├── __init__.py
│   ├── test_auth.py               # Authentication flow tests
│   └── test_tasks.py              # Task CRUD tests
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
└── README.md                      # Backend setup instructions

frontend/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing/redirect page
│   ├── (auth)/
│   │   ├── signin/
│   │   │   └── page.tsx           # Sign in page
│   │   └── signup/
│   │       └── page.tsx           # Sign up page
│   └── (dashboard)/
│       └── tasks/
│           ├── page.tsx           # Task list view
│           ├── [id]/
│           │   └── page.tsx       # Task detail/edit view
│           └── new/
│               └── page.tsx       # New task form
├── components/
│   ├── auth/
│   │   ├── SignInForm.tsx         # Sign in form component
│   │   └── SignUpForm.tsx         # Sign up form component
│   ├── tasks/
│   │   ├── TaskList.tsx           # Task list component
│   │   ├── TaskItem.tsx           # Single task item
│   │   ├── TaskForm.tsx           # Task creation/edit form
│   │   └── TaskActions.tsx        # Edit/delete/toggle buttons
│   └── ui/
│       ├── Button.tsx             # Reusable button component
│       ├── Input.tsx              # Reusable input component
│       └── ErrorMessage.tsx       # Error display component
├── lib/
│   ├── auth.ts                    # Better Auth configuration
│   ├── api.ts                     # API client with JWT handling
│   └── utils.ts                   # Helper functions
├── types/
│   ├── user.ts                    # User TypeScript types
│   └── task.ts                    # Task TypeScript types
├── public/                        # Static assets
├── .env.local.example             # Environment variables template
├── next.config.mjs                # Next.js configuration
├── package.json                   # Node dependencies
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # Frontend setup instructions
```

**Structure Decision**: Selected **Option 2: Web Application** structure with clear frontend/backend separation. This aligns with the full-stack nature of the project and the constitution's principle of Full-Stack Clarity (Principle V). Each layer has well-defined responsibilities:

- **Backend** (`backend/`): Python FastAPI handles authentication, task CRUD, and database operations
- **Frontend** (`frontend/`): Next.js 16+ App Router handles UI, routing, and client-side state
- **Clear Boundaries**: Frontend calls backend APIs over HTTP; backend never exposes database directly to frontend

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** All architectural decisions align with constitution principles. No complexity justifications required.
