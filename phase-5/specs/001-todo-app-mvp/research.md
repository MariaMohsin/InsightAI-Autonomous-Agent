# Research: Multi-User Todo Application with JWT Authentication

**Feature**: 001-todo-app-mvp
**Date**: 2026-01-12
**Phase**: 0 (Research & Decision Documentation)

## Overview

This document consolidates research findings and architectural decisions for implementing a secure, full-stack Todo application with JWT authentication. All technical unknowns from the Technical Context have been resolved through research into best practices, framework documentation, and production-grade patterns.

## Technology Stack Decisions

### Decision: Better Auth for Frontend Authentication

**Rationale**:
- Better Auth is specifically designed for Next.js with built-in JWT support
- Provides secure session management with httpOnly cookies
- Handles token refresh automatically
- Integrates seamlessly with Next.js App Router (Server Components + Client Components)
- Reduces custom authentication code, minimizing security vulnerabilities

**Alternatives Considered**:
- **NextAuth.js**: More established but heavier, adds unnecessary complexity for simple email/password auth
- **Custom JWT implementation**: Higher risk of security mistakes, more development time
- **Clerk/Auth0**: Third-party services add dependency and cost, overkill for hackathon MVP

**Implementation Notes**:
- Configure Better Auth in `lib/auth.ts`
- Use `signIn()` and `signUp()` functions from Better Auth SDK
- JWT tokens stored in httpOnly cookies (XSS protection)
- BETTER_AUTH_SECRET environment variable shared between frontend and backend

---

### Decision: FastAPI with PyJWT for Backend Authentication

**Rationale**:
- FastAPI provides automatic OpenAPI documentation
- Async support for better performance with database operations
- Pydantic validation built-in (type safety for request/response)
- PyJWT is industry standard for JWT validation in Python
- Dependency injection pattern simplifies authentication middleware

**Alternatives Considered**:
- **Flask**: Synchronous by default, less modern patterns
- **Django REST Framework**: Too heavyweight for simple API, more setup overhead
- **python-jose**: Similar to PyJWT but less maintained

**Implementation Notes**:
- Create JWT validation middleware in `app/auth/middleware.py`
- Use `Depends(get_current_user)` dependency injection pattern
- Extract user ID from JWT claims for database queries
- Return 401 for invalid tokens, 403 for ownership violations

---

### Decision: SQLModel for ORM

**Rationale**:
- Combines SQLAlchemy (proven ORM) with Pydantic (FastAPI's validation library)
- Type hints work seamlessly with FastAPI
- Single model definition serves as both database model and API schema
- Reduces code duplication between database and API layers

**Alternatives Considered**:
- **SQLAlchemy alone**: Requires separate Pydantic models, more boilerplate
- **Raw SQL**: Higher risk of SQL injection, no type safety
- **Tortoise ORM**: Less mature, smaller community

**Implementation Notes**:
- Define `User` and `Task` models in `app/models/`
- Use `Field()` for validation and database constraints
- Enable `relationship()` for foreign key navigation (optional)
- Automatic table creation with `SQLModel.metadata.create_all()`

---

### Decision: Neon Serverless PostgreSQL

**Rationale**:
- Serverless architecture eliminates manual database management
- Free tier sufficient for hackathon MVP
- PostgreSQL compatibility (ACID guarantees, foreign keys, transactions)
- Built-in connection pooling via pgbouncer
- Auto-scales based on usage

**Alternatives Considered**:
- **SQLite**: Single-user, not suitable for multi-user applications
- **MongoDB**: No ACID guarantees, overkill for simple relational data
- **Supabase**: Similar but adds unnecessary backend services (we're building our own API)

**Implementation Notes**:
- Connection string format: `postgresql://user:pass@host/dbname?sslmode=require`
- Use asyncpg or psycopg2-binary for connection
- Set connection pool limits (5-10 connections for hackathon scale)
- Handle connection errors gracefully with retries

---

## Authentication Flow Research

### JWT Token Structure

**Decision**: Use standard JWT claims with custom user payload

**Token Payload**:
```json
{
  "sub": "user_id",           // Subject: unique user identifier
  "email": "user@example.com", // User email for display
  "exp": 1234567890,          // Expiration timestamp
  "iat": 1234567800           // Issued at timestamp
}
```

**Rationale**:
- `sub` (subject) is standard claim for user identity
- Include email for frontend display without additional API calls
- 24-hour expiration balances security and user experience
- `iat` enables token invalidation if needed

**Token Signing**:
- Algorithm: HS256 (HMAC with SHA-256)
- Secret: BETTER_AUTH_SECRET environment variable (min 32 characters)
- Same secret used in frontend (Better Auth) and backend (PyJWT)

---

### Password Hashing

**Decision**: bcrypt with cost factor 12

**Rationale**:
- bcrypt is industry standard for password hashing
- Cost factor 12 balances security and performance (~250ms hashing time)
- Automatically handles salt generation
- Resistant to rainbow table attacks

**Alternatives Considered**:
- **argon2**: Slightly more secure but less widely supported
- **pbkdf2**: Older, more vulnerable to GPU attacks
- **scrypt**: Memory-hard but slower than bcrypt

**Implementation**:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash password
hashed = pwd_context.hash(plain_password)

# Verify password
is_valid = pwd_context.verify(plain_password, hashed)
```

---

## API Design Patterns

### Decision: RESTful API with Standard HTTP Methods

**Endpoint Structure**:
```
POST   /api/auth/signup       - Create new user account
POST   /api/auth/signin       - Authenticate and get JWT token
GET    /api/tasks             - List current user's tasks
POST   /api/tasks             - Create new task for current user
GET    /api/tasks/{id}        - Get single task (ownership verified)
PUT    /api/tasks/{id}        - Update task (ownership verified)
DELETE /api/tasks/{id}        - Delete task (ownership verified)
PATCH  /api/tasks/{id}/toggle - Toggle task completion status
```

**Rationale**:
- Standard REST conventions improve API discoverability
- HTTP methods clearly indicate intent (GET = read, POST = create, etc.)
- Resource-based URLs (`/tasks/{id}`) vs action-based (`/updateTask`)
- PATCH for partial updates (toggle) vs PUT for full replacement

**Status Code Standards**:
- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST with resource creation
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: Valid JWT but insufficient permissions
- `404 Not Found`: Resource doesn't exist or user doesn't have access
- `500 Internal Server Error`: Unexpected server errors

---

## Database Schema Design

### Decision: Normalized Schema with Foreign Keys

**Users Table**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
```

**Tasks Table**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

**Rationale**:
- `SERIAL` for auto-incrementing primary keys (simpler than UUIDs for hackathon)
- Foreign key constraint enforces referential integrity
- `ON DELETE CASCADE` automatically removes tasks when user deleted
- Indexes on `email` and `user_id` optimize query performance
- `updated_at` timestamp tracks last modification

---

## Frontend Architecture

### Decision: Next.js App Router with Server and Client Components

**Rationale**:
- App Router is Next.js 13+ standard (React Server Components by default)
- Server Components reduce JavaScript sent to client
- Client Components (`'use client'`) for interactive UI (forms, buttons)
- File-based routing simplifies navigation

**Component Strategy**:
- **Server Components**: Page layouts, static content, data fetching
- **Client Components**: Forms, interactive elements, state management
- **API Route Handlers**: Not used (backend is separate FastAPI service)

**State Management**:
- React hooks (`useState`, `useEffect`) for local component state
- No Redux/Zustand needed for MVP (over-engineering)
- JWT token managed by Better Auth (httpOnly cookie)

---

## Security Best Practices

### CORS Configuration

**Decision**: Whitelist frontend origin only

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,  # Allow cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Rationale**:
- `allow_credentials=True` required for JWT in Authorization header
- Whitelist only frontend origin (not `*`) for security
- Explicit methods/headers prevent unexpected cross-origin behavior

---

### SQL Injection Prevention

**Decision**: ORM parameterized queries only (no raw SQL)

**Implementation**:
```python
# ✅ SAFE: SQLModel parameterized query
tasks = session.exec(
    select(Task).where(Task.user_id == current_user.id)
).all()

# ❌ UNSAFE: Never use f-strings for SQL
# tasks = session.exec(f"SELECT * FROM tasks WHERE user_id = {user_id}")
```

**Rationale**:
- SQLModel/SQLAlchemy automatically escapes parameters
- Eliminates SQL injection risk
- Type safety catches errors at development time

---

### XSS Prevention

**Decision**: Rely on Next.js automatic escaping + CSP headers

**Implementation**:
- Next.js escapes all user input in JSX by default
- Never use `dangerouslySetInnerHTML` for user-generated content
- Add Content-Security-Policy header in production

**Rationale**:
- Framework-level protection reduces human error
- CSP provides defense-in-depth

---

## Performance Considerations

### Database Query Optimization

**Decision**: Filter by user_id in all task queries

```python
# ✅ OPTIMIZED: Single query with user filter
tasks = session.exec(
    select(Task)
    .where(Task.user_id == current_user.id)
    .order_by(Task.created_at.desc())
).all()
```

**Rationale**:
- Index on `user_id` makes filtering fast
- Single query vs N+1 problem
- Enforces user isolation at database level

---

### Connection Pooling

**Decision**: SQLModel with connection pool limits

```python
from sqlmodel import create_engine

engine = create_engine(
    DATABASE_URL,
    echo=False,  # Disable SQL logging in production
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
)
```

**Rationale**:
- `pool_size=5` sufficient for hackathon scale
- `max_overflow=10` handles traffic spikes
- `pool_pre_ping` prevents stale connection errors with Neon

---

## Error Handling Strategy

### Decision: Consistent Error Response Format

**Error Response Schema**:
```json
{
  "error": "error_code",
  "message": "Human-readable error description",
  "details": {}  // Optional field-level validation errors
}
```

**Example**:
```json
{
  "error": "invalid_credentials",
  "message": "The email or password you entered is incorrect",
  "details": null
}
```

**Rationale**:
- `error` field enables programmatic error handling (frontend logic)
- `message` field provides user-friendly text for display
- `details` field supports field-level validation errors

---

## Development Workflow

### Decision: Environment Variables for Configuration

**Backend (.env)**:
```bash
DATABASE_URL=postgresql://user:pass@host/dbname
BETTER_AUTH_SECRET=<32-character-secret>
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env.local)**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<same-32-character-secret>
```

**Rationale**:
- Never commit secrets to git (.env in .gitignore)
- `NEXT_PUBLIC_` prefix exposes vars to browser (only use for non-secrets)
- Same `BETTER_AUTH_SECRET` in both environments enables JWT validation

---

## Testing Strategy (Optional for MVP)

### Decision: Focus on Manual Testing for Hackathon

**Rationale**:
- Automated tests add development time (not critical for hackathon MVP)
- Manual testing validates user stories directly
- If time permits: pytest for backend endpoints, Jest for frontend components

**Manual Test Scenarios**:
1. Sign up with new email → Verify JWT token received
2. Sign in with correct credentials → Verify dashboard access
3. Sign in with wrong password → Verify error message
4. Create task → Verify appears in list
5. Edit task → Verify changes saved
6. Delete task → Verify removed from list
7. Toggle completion → Verify status changes
8. Try accessing another user's task → Verify 403 Forbidden

---

## Deployment Considerations (Post-Hackathon)

### Recommended Deployment Stack

**Frontend**: Vercel (Next.js official platform)
- Automatic deployments from Git
- Edge network for fast page loads
- Environment variables in dashboard

**Backend**: Railway or Render (Python ASGI support)
- Free tier available
- Automatic HTTPS
- Environment variables in dashboard

**Database**: Neon (already serverless)
- Connection string in backend environment variables
- Automatic backups

**Domain**: Free subdomain from deployment platform or custom domain

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Frontend Auth | Better Auth | Next.js integration, JWT support, secure defaults |
| Backend Framework | FastAPI | Async, OpenAPI docs, Pydantic validation |
| ORM | SQLModel | Type safety, reduces boilerplate |
| Database | Neon PostgreSQL | Serverless, ACID guarantees, connection pooling |
| JWT Algorithm | HS256 | Standard, shared secret validation |
| Password Hashing | bcrypt (cost 12) | Industry standard, resistant to attacks |
| API Pattern | REST | Standard HTTP methods, resource-based URLs |
| Error Format | JSON with error/message/details | Consistent, user-friendly, programmatic handling |
| CORS | Whitelist frontend only | Security, allow credentials |
| SQL Injection Prevention | ORM only, no raw SQL | Automatic parameter escaping |
| XSS Prevention | Next.js escaping + CSP | Framework-level protection |

---

**Status**: Research complete. All technical unknowns resolved. Ready to proceed to Phase 1 (Data Model & Contracts).
