# Data Model: Multi-User Todo Application

**Feature**: 001-todo-app-mvp
**Date**: 2026-01-12
**Phase**: 1 (Design)

## Overview

This document defines the database schema, entity relationships, validation rules, and state transitions for the Todo application. The data model enforces user isolation at the database level through foreign key constraints and supports all functional requirements from the feature specification.

## Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ password_hash       │
│ created_at          │
└──────────┬──────────┘
           │
           │ 1:N (one user has many tasks)
           │
           ▼
┌─────────────────────┐
│       Task          │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK) ───────┘
│ title               │
│ description         │
│ is_completed        │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

## Entities

### User

Represents an individual user account with authentication credentials.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the user |
| `email` | String(255) | UNIQUE, NOT NULL | User's email address (used for authentication) |
| `password_hash` | String(255) | NOT NULL | Bcrypt-hashed password (never store plaintext) |
| `created_at` | Timestamp | NOT NULL, DEFAULT NOW() | Account creation timestamp |

**Relationships**:
- **Has Many**: Tasks (via `Task.user_id` foreign key)
- **Cascade Delete**: When a user is deleted, all their tasks are automatically deleted

**Indexes**:
- Primary key on `id` (automatic)
- Unique index on `email` (ensures no duplicate accounts)

**Validation Rules**:
- `email` must match email format regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- `email` must be lowercase (normalized before storage)
- `password` (plaintext, before hashing) must be at least 8 characters
- `password_hash` must be bcrypt format (automatically handled by passlib)

**Security Notes**:
- Password is NEVER stored in plaintext
- Password is hashed with bcrypt (cost factor 12) before database insertion
- `password_hash` is NEVER returned in API responses

---

### Task

Represents a single todo item owned by a user.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the task |
| `user_id` | Integer | FOREIGN KEY(users.id), NOT NULL, ON DELETE CASCADE | Owner of the task |
| `title` | String(500) | NOT NULL | Task title/summary |
| `description` | Text | NULLABLE | Optional detailed description |
| `is_completed` | Boolean | NOT NULL, DEFAULT FALSE | Completion status |
| `created_at` | Timestamp | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| `updated_at` | Timestamp | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Last modification timestamp |

**Relationships**:
- **Belongs To**: User (via `user_id` foreign key)

**Indexes**:
- Primary key on `id` (automatic)
- Index on `user_id` (optimizes filtering by owner)
- Index on `created_at DESC` (optimizes sorting by creation date)

**Validation Rules**:
- `title` is required (cannot be empty or whitespace-only)
- `title` maximum length: 500 characters
- `description` maximum length: 10,000 characters (if provided)
- `is_completed` must be boolean (true/false)

**Business Rules**:
- Task MUST be associated with exactly one user
- User can only access tasks where `task.user_id == current_user.id`
- Deleting a user automatically deletes all their tasks (CASCADE)
- `updated_at` automatically updates on any field change

---

## SQLModel Schemas (Backend)

### User Model

```python
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship (optional, for convenience)
    tasks: List["Task"] = Relationship(back_populates="owner", cascade_delete=True)
```

### Task Model

```python
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None, max_length=10000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship (optional, for convenience)
    owner: Optional[User] = Relationship(back_populates="tasks")
```

---

## Pydantic Schemas (API Request/Response)

### User Schemas

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Request: Sign up
class UserCreate(BaseModel):
    email: EmailStr
    password: str  # Min 8 chars, validated in endpoint

# Request: Sign in
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response: User info (NEVER include password_hash)
class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode
```

### Task Schemas

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# Request: Create task
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=10000)

# Request: Update task
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    is_completed: Optional[bool] = None

# Response: Task info
class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode
```

---

## TypeScript Types (Frontend)

### User Types

```typescript
// types/user.ts

export interface User {
  id: number;
  email: string;
  created_at: string;  // ISO 8601 datetime string
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;  // JWT token
}
```

### Task Types

```typescript
// types/task.ts

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;  // ISO 8601 datetime string
  updated_at: string;  // ISO 8601 datetime string
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

export interface TaskListResponse {
  tasks: Task[];
  count: number;
}
```

---

## State Transitions

### Task Completion State

Tasks have a simple boolean completion state with two possible values:

```
┌─────────────────┐
│   Incomplete    │ (is_completed = false)
│  (default state)│
└────────┬────────┘
         │
         │ PATCH /tasks/{id}/toggle
         ▼
┌─────────────────┐
│    Completed    │ (is_completed = true)
└────────┬────────┘
         │
         │ PATCH /tasks/{id}/toggle
         ▼
     (back to Incomplete)
```

**State Transitions**:
1. **Create**: New tasks start in `Incomplete` state (`is_completed = false`)
2. **Toggle**: PATCH request flips boolean value
3. **Update**: PUT request can explicitly set `is_completed` to true or false

**No Complex Workflow**: Intentionally simple to meet hackathon MVP requirements. No "in progress", "archived", or other states.

---

## Data Integrity Constraints

### Database Level

**Foreign Key Constraint**:
```sql
ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_user_id
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
```

**Rationale**: Prevents orphaned tasks. If user deleted, all their tasks automatically deleted.

**Unique Email Constraint**:
```sql
ALTER TABLE users
ADD CONSTRAINT unique_user_email
UNIQUE (email);
```

**Rationale**: Prevents duplicate accounts with same email.

**Not Null Constraints**:
- `users.email`, `users.password_hash`
- `tasks.user_id`, `tasks.title`, `tasks.is_completed`

**Rationale**: Enforces required fields at database level (defense-in-depth with application validation).

---

### Application Level

**Ownership Validation** (enforced in every task endpoint):
```python
def verify_task_ownership(task: Task, current_user: User):
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this task"
        )
```

**Query Filtering** (always filter by authenticated user):
```python
# ✅ CORRECT: Filter by user_id
tasks = session.exec(
    select(Task).where(Task.user_id == current_user.id)
).all()

# ❌ WRONG: Never fetch all tasks without filtering
# tasks = session.exec(select(Task)).all()
```

---

## Database Migrations

### Initial Schema Creation

**Using SQLModel**:
```python
from sqlmodel import SQLModel, create_engine

# Create all tables
SQLModel.metadata.create_all(engine)
```

**Generated SQL** (equivalent):
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

### Future Migrations (Post-MVP)

For production, use Alembic (SQLAlchemy migration tool):
```bash
alembic init migrations
alembic revision --autogenerate -m "Add tasks table"
alembic upgrade head
```

**Hackathon MVP**: Direct `create_all()` is acceptable (no existing data to migrate).

---

## Query Patterns

### Common Queries

**List user's tasks (ordered by creation date)**:
```python
tasks = session.exec(
    select(Task)
    .where(Task.user_id == current_user.id)
    .order_by(Task.created_at.desc())
).all()
```

**Get single task with ownership verification**:
```python
task = session.get(Task, task_id)
if not task or task.user_id != current_user.id:
    raise HTTPException(status_code=404, detail="Task not found")
```

**Create task for authenticated user**:
```python
task = Task(
    user_id=current_user.id,
    title=task_data.title,
    description=task_data.description,
)
session.add(task)
session.commit()
session.refresh(task)
return task
```

**Update task (with ownership verification)**:
```python
task = session.get(Task, task_id)
if not task or task.user_id != current_user.id:
    raise HTTPException(status_code=404, detail="Task not found")

task.title = task_data.title
task.description = task_data.description
task.updated_at = datetime.utcnow()  # Trigger update timestamp
session.commit()
session.refresh(task)
return task
```

**Toggle task completion**:
```python
task = session.get(Task, task_id)
if not task or task.user_id != current_user.id:
    raise HTTPException(status_code=404, detail="Task not found")

task.is_completed = not task.is_completed
task.updated_at = datetime.utcnow()
session.commit()
session.refresh(task)
return task
```

**Delete task (with ownership verification)**:
```python
task = session.get(Task, task_id)
if not task or task.user_id != current_user.id:
    raise HTTPException(status_code=404, detail="Task not found")

session.delete(task)
session.commit()
return {"message": "Task deleted successfully"}
```

---

## Performance Considerations

### Indexes

**Primary Keys**: Automatic clustered index on `id` columns (fast lookups by ID)

**Foreign Key Index**: Index on `tasks.user_id` enables fast filtering:
```sql
EXPLAIN SELECT * FROM tasks WHERE user_id = 123;
-- Uses: Index Scan on idx_tasks_user_id
```

**Email Index**: Index on `users.email` enables fast authentication lookup:
```sql
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';
-- Uses: Index Scan on idx_users_email
```

**Sorting Index**: Index on `tasks.created_at DESC` enables fast chronological sorting:
```sql
EXPLAIN SELECT * FROM tasks WHERE user_id = 123 ORDER BY created_at DESC;
-- Uses: Index Scan on idx_tasks_created_at
```

### Query Optimization

**Single Query per Endpoint**: Avoid N+1 problem by fetching all tasks in one query
**Connection Pooling**: Reuse database connections (5-10 pool size sufficient for MVP)
**Lazy Loading**: Don't load task relationships unless explicitly needed

---

## Summary

**Entities**: 2 (User, Task)
**Relationships**: 1:N (User has many Tasks)
**Validation**: Application-level (Pydantic) + Database-level (constraints)
**Security**: User isolation enforced at query level + foreign key constraints
**Performance**: Indexed foreign keys, efficient query patterns

**Status**: Data model complete. Ready to generate API contracts (Phase 1 continuation).
