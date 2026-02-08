# API Contracts

**Feature**: 001-todo-app-mvp
**Date**: 2026-01-12
**Phase**: 1 (Design)

## Overview

This directory contains the RESTful API contract definitions for the Todo Application. All backend endpoints are documented in OpenAPI 3.1 format to ensure frontend and backend teams have a shared understanding of the API interface.

## Files

- **`openapi.yaml`**: Complete OpenAPI 3.1 specification with all endpoints, schemas, and examples

## API Endpoints Summary

### Authentication Endpoints (Public)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new user account | No |
| POST | `/api/auth/signin` | Authenticate existing user | No |

### Task Endpoints (Protected)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | List current user's tasks | Yes (JWT) |
| POST | `/api/tasks` | Create new task | Yes (JWT) |
| GET | `/api/tasks/{id}` | Get task details | Yes (JWT) |
| PUT | `/api/tasks/{id}` | Update task | Yes (JWT) |
| DELETE | `/api/tasks/{id}` | Delete task | Yes (JWT) |
| PATCH | `/api/tasks/{id}/toggle` | Toggle completion status | Yes (JWT) |

## Authentication Flow

1. **Sign Up**: POST `/api/auth/signup` with email and password
   - Response includes JWT token and user info
2. **Sign In**: POST `/api/auth/signin` with email and password
   - Response includes JWT token and user info
3. **API Calls**: Include JWT token in `Authorization: Bearer <token>` header for all protected endpoints

## Request/Response Examples

### Sign Up

**Request**:
```http
POST /api/auth/signup HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created)**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-01-12T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Create Task

**Request**:
```http
POST /api/tasks HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs"
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "is_completed": false,
  "created_at": "2026-01-12T10:30:00Z",
  "updated_at": "2026-01-12T10:30:00Z"
}
```

### List Tasks

**Request**:
```http
GET /api/tasks HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive README and API docs",
      "is_completed": false,
      "created_at": "2026-01-12T10:30:00Z",
      "updated_at": "2026-01-12T10:30:00Z"
    }
  ],
  "count": 1
}
```

### Toggle Task Completion

**Request**:
```http
PATCH /api/tasks/1/toggle HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "is_completed": true,
  "created_at": "2026-01-12T10:30:00Z",
  "updated_at": "2026-01-12T14:00:00Z"
}
```

## HTTP Status Codes

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| 200 OK | Success (GET, PUT, PATCH) | Resource retrieved or updated successfully |
| 201 Created | Success (POST) | Resource created successfully |
| 204 No Content | Success (DELETE) | Resource deleted successfully (no response body) |
| 400 Bad Request | Client error | Validation failed, malformed request |
| 401 Unauthorized | Authentication error | Missing or invalid JWT token |
| 403 Forbidden | Authorization error | Valid token but insufficient permissions |
| 404 Not Found | Resource error | Resource doesn't exist or user doesn't have access |
| 409 Conflict | State error | Email already registered (signup) |
| 500 Internal Server Error | Server error | Unexpected server-side error |

## Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "error": "error_code",
  "message": "Human-readable error description",
  "details": {
    "field": "fieldName",
    "issue": "specific_issue"
  }
}
```

**Examples**:

**Validation Error (400)**:
```json
{
  "error": "validation_error",
  "message": "Title is required",
  "details": {
    "field": "title",
    "issue": "required"
  }
}
```

**Unauthorized (401)**:
```json
{
  "error": "unauthorized",
  "message": "Authentication required. Please sign in.",
  "details": null
}
```

**Forbidden (403)**:
```json
{
  "error": "forbidden",
  "message": "You don't have permission to access this task",
  "details": null
}
```

**Not Found (404)**:
```json
{
  "error": "not_found",
  "message": "Task not found",
  "details": null
}
```

## Security Requirements

### JWT Token

- **Format**: `Authorization: Bearer <token>`
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret**: Shared `BETTER_AUTH_SECRET` between frontend and backend
- **Expiration**: 24 hours (configurable)
- **Payload**:
  ```json
  {
    "sub": "user_id",
    "email": "user@example.com",
    "exp": 1234567890,
    "iat": 1234567800
  }
  ```

### User Isolation

- **Query Filtering**: All task queries automatically filtered by `user_id` from JWT
- **Ownership Verification**: Update/delete operations verify `task.user_id == jwt.sub`
- **Error Handling**: Return 404 (not 403) for non-existent tasks to avoid information leakage

### CORS

- **Allowed Origins**: Frontend URL only (e.g., `http://localhost:3000`)
- **Allow Credentials**: `true` (required for Authorization header)
- **Allowed Methods**: GET, POST, PUT, DELETE, PATCH
- **Allowed Headers**: Authorization, Content-Type

## Validation Rules

### Email
- Must be valid email format (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
- Must be unique (signup only)
- Maximum length: 255 characters

### Password
- Minimum length: 8 characters
- Maximum length: 100 characters
- Hashed with bcrypt before storage (never stored as plaintext)

### Task Title
- Required (cannot be empty or whitespace-only)
- Minimum length: 1 character
- Maximum length: 500 characters

### Task Description
- Optional (can be null)
- Maximum length: 10,000 characters

## Frontend Integration

### API Client Setup

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token'); // Or from Better Auth

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Redirect to sign in
    window.location.href = '/signin';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
```

### Example Usage

```typescript
// Create task
const newTask = await fetchWithAuth('/tasks', {
  method: 'POST',
  body: JSON.stringify({
    title: 'My new task',
    description: 'Task description',
  }),
});

// List tasks
const { tasks, count } = await fetchWithAuth('/tasks');

// Toggle completion
const updatedTask = await fetchWithAuth(`/tasks/${taskId}/toggle`, {
  method: 'PATCH',
});
```

## Backend Implementation Notes

### FastAPI Route Structure

```python
# app/routers/auth.py
@router.post("/auth/signup", response_model=AuthResponse, status_code=201)
async def signup(user_data: UserCreate, session: Session = Depends(get_session)):
    # Implementation

# app/routers/tasks.py
@router.get("/tasks", response_model=TaskListResponse)
async def list_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Implementation
```

### Dependency Injection

```python
from fastapi import Depends, HTTPException
from sqlmodel import Session, select

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    # Verify JWT token
    # Extract user_id from token
    # Fetch user from database
    # Return user or raise 401
```

## Testing the API

### Using curl

**Sign Up**:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Create Task**:
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"Test description"}'
```

### Using Postman/Insomnia

1. Import `openapi.yaml` file
2. Set environment variable for `API_BASE_URL`
3. After sign up/sign in, copy JWT token
4. Add token to Authorization header for protected endpoints

## OpenAPI Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

These docs are generated from the same OpenAPI specification in `openapi.yaml` and provide interactive testing capabilities.

---

**Status**: API contracts complete. Ready to generate quickstart.md (Phase 1 continuation).
