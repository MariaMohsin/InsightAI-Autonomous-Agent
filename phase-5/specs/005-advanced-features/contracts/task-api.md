# Task API Contract

**Feature**: 005-advanced-features
**Service**: Backend FastAPI
**Base URL**: `/api/tasks`
**Authentication**: JWT Bearer token (required for all endpoints)

## Overview

This document defines the HTTP API contract for task CRUD operations with advanced features: priorities, tags, due dates, recurring tasks, and reminders.

## Data Types

### Enums

```typescript
enum TaskStatus {
  PENDING = "pending"
  IN_PROGRESS = "in_progress"
  COMPLETED = "completed"
}

enum TaskPriority {
  LOW = "low"
  MEDIUM = "medium"
  HIGH = "high"
}

enum RecurrenceRule {
  DAILY = "daily"
  WEEKLY = "weekly"
  MONTHLY = "monthly"
}
```

### Schemas

```typescript
interface Tag {
  id: string;  // UUID
  name: string;  // Display name (preserves case)
}

interface Task {
  id: string;  // UUID
  user_id: string;  // UUID (read-only)
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;  // ISO-8601 date (YYYY-MM-DD)
  reminder_at: string | null;  // ISO-8601 datetime (with timezone)
  recurrence_rule: RecurrenceRule | null;
  recurrence_parent_id: string | null;  // UUID
  tags: Tag[];
  created_at: string;  // ISO-8601 datetime
  updated_at: string;  // ISO-8601 datetime
}

interface TaskCreate {
  title: string;  // Required, max 200 chars
  description?: string;  // Optional
  priority?: TaskPriority;  // Default: "medium"
  due_date?: string;  // Optional, ISO-8601 date
  reminder_at?: string;  // Optional, ISO-8601 datetime
  recurrence_rule?: RecurrenceRule;  // Optional
  tag_names?: string[];  // Optional, array of tag names
}

interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;  // Null to clear
  reminder_at?: string | null;  // Null to clear
  recurrence_rule?: RecurrenceRule | null;  // Null to clear
  tag_names?: string[];  // Replaces all tags
}
```

## Endpoints

### 1. Create Task

**POST** `/api/tasks`

Create a new task with optional advanced features.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Prepare Q1 Financial Report",
  "description": "Compile sales data and create executive summary",
  "priority": "high",
  "due_date": "2026-02-15",
  "reminder_at": "2026-02-14T09:00:00Z",
  "recurrence_rule": null,
  "tag_names": ["Work", "Finance"]
}
```

**Response**: `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user-uuid",
  "title": "Prepare Q1 Financial Report",
  "description": "Compile sales data and create executive summary",
  "status": "pending",
  "priority": "high",
  "due_date": "2026-02-15",
  "reminder_at": "2026-02-14T09:00:00Z",
  "recurrence_rule": null,
  "recurrence_parent_id": null,
  "tags": [
    {"id": "tag-1-uuid", "name": "Work"},
    {"id": "tag-2-uuid", "name": "Finance"}
  ],
  "created_at": "2026-02-07T10:00:00Z",
  "updated_at": "2026-02-07T10:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid data (missing title, invalid priority, invalid date format)
- `401 Unauthorized`: Missing or invalid JWT token
- `422 Unprocessable Entity`: Validation errors (e.g., reminder_at without due_date)

---

### 2. List Tasks (with filters and search)

**GET** `/api/tasks`

Retrieve tasks for authenticated user with optional filters, search, and sorting.

**Query Parameters**:
- `search` (string, optional): Keyword to search in title and description
- `status` (string, optional): Filter by status (`pending`, `in_progress`, `completed`)
- `priority` (string, optional): Filter by priority (`low`, `medium`, `high`)
- `tag` (string[], optional): Filter by tag names (multiple allowed, AND logic)
- `due_range` (string, optional): Filter by due date (`overdue`, `today`, `this_week`, `this_month`)
- `sort_by` (string, optional): Sort field (`created_at`, `due_date`, `priority`) - default: `created_at`
- `sort_order` (string, optional): Sort order (`asc`, `desc`) - default: `desc`
- `limit` (int, optional): Max results per page (default: 50, max: 100)
- `offset` (int, optional): Pagination offset (default: 0)

**Request**:
```
GET /api/tasks?status=pending&priority=high&tag=Work&sort_by=due_date&sort_order=asc
Authorization: Bearer <jwt_token>
```

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": "task-1-uuid",
      "title": "Prepare Q1 Financial Report",
      "status": "pending",
      "priority": "high",
      "due_date": "2026-02-15",
      "tags": [{"id": "tag-1", "name": "Work"}],
      ...
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

**Errors**:
- `400 Bad Request`: Invalid query parameters (invalid enum values)
- `401 Unauthorized`: Missing or invalid JWT token

---

### 3. Get Task by ID

**GET** `/api/tasks/{task_id}`

Retrieve a single task by ID.

**Request**:
```
GET /api/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <jwt_token>
```

**Response**: `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user-uuid",
  "title": "Prepare Q1 Financial Report",
  "description": "Compile sales data and create executive summary",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2026-02-15",
  "reminder_at": "2026-02-14T09:00:00Z",
  "recurrence_rule": null,
  "recurrence_parent_id": null,
  "tags": [
    {"id": "tag-1-uuid", "name": "Work"},
    {"id": "tag-2-uuid", "name": "Finance"}
  ],
  "created_at": "2026-02-07T10:00:00Z",
  "updated_at": "2026-02-07T14:30:00Z"
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Task not found or belongs to different user

---

### 4. Update Task

**PUT** `/api/tasks/{task_id}`

Update an existing task (full or partial update).

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "title": "Prepare Q1 Financial Report (Updated)",
  "priority": "medium",
  "status": "in_progress",
  "due_date": "2026-02-20",
  "tag_names": ["Work", "Finance", "Urgent"]
}
```

**Response**: `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Prepare Q1 Financial Report (Updated)",
  "status": "in_progress",
  "priority": "medium",
  "due_date": "2026-02-20",
  "tags": [
    {"id": "tag-1-uuid", "name": "Work"},
    {"id": "tag-2-uuid", "name": "Finance"},
    {"id": "tag-3-uuid", "name": "Urgent"}
  ],
  "updated_at": "2026-02-07T15:00:00Z",
  ...
}
```

**Errors**:
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Task not found or belongs to different user
- `422 Unprocessable Entity`: Validation errors

---

### 5. Complete Task (with recurring logic)

**PATCH** `/api/tasks/{task_id}/complete`

Mark task as completed. If task has recurrence_rule, automatically creates next instance.

**Request**:
```
PATCH /api/tasks/123e4567-e89b-12d3-a456-426614174000/complete
Authorization: Bearer <jwt_token>
```

**Response** (non-recurring task): `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "updated_at": "2026-02-07T16:00:00Z",
  ...
}
```

**Response** (recurring task): `200 OK`
```json
{
  "completed_task": {
    "id": "original-task-uuid",
    "status": "completed",
    "recurrence_rule": "daily",
    ...
  },
  "next_task": {
    "id": "new-task-uuid",
    "title": "Daily standup notes",
    "status": "pending",
    "due_date": "2026-02-08",  // +1 day
    "recurrence_rule": "daily",
    "recurrence_parent_id": "original-task-uuid",
    "tags": [...],  // Copied from original
    "created_at": "2026-02-07T16:00:00Z",
    ...
  }
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Task not found or belongs to different user
- `409 Conflict`: Task already completed

---

### 6. Delete Task

**DELETE** `/api/tasks/{task_id}`

Permanently delete a task.

**Request**:
```
DELETE /api/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <jwt_token>
```

**Response**: `204 No Content`

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Task not found or belongs to different user

---

### 7. Get Pending Reminders

**GET** `/api/tasks/reminders/pending`

Retrieve tasks with reminders that have passed and are not yet completed.

**Request**:
```
GET /api/tasks/reminders/pending
Authorization: Bearer <jwt_token>
```

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": "task-1-uuid",
      "title": "Important meeting preparation",
      "due_date": "2026-02-08",
      "reminder_at": "2026-02-07T14:00:00Z",  // Already passed
      "status": "pending",
      ...
    }
  ],
  "count": 3
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token

---

## Validation Rules

### Title
- **Required**: Yes
- **Max Length**: 200 characters
- **Allowed**: Any Unicode string

### Priority
- **Required**: No (default: `medium`)
- **Allowed Values**: `low`, `medium`, `high`

### Status
- **Required**: No (default: `pending`)
- **Allowed Values**: `pending`, `in_progress`, `completed`

### Due Date
- **Required**: No
- **Format**: ISO-8601 date (`YYYY-MM-DD`)
- **Validation**: Must be valid date (past dates allowed)

### Reminder Time
- **Required**: No
- **Format**: ISO-8601 datetime with timezone
- **Validation**: Requires `due_date` to be set (business rule)

### Recurrence Rule
- **Required**: No
- **Allowed Values**: `daily`, `weekly`, `monthly`, `null`

### Tag Names
- **Required**: No
- **Format**: Array of strings
- **Max Length**: 50 characters per tag
- **Behavior**: Case-insensitive (creates or reuses existing tags)

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid priority value. Must be one of: low, medium, high"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "reminder_at"],
      "msg": "reminder_at requires due_date to be set",
      "type": "value_error"
    }
  ]
}
```

## Rate Limiting

- **Default**: 100 requests per minute per user
- **Burst**: 200 requests per minute (temporary spike)
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Changelog

- **2026-02-07**: Initial API contract for 005-advanced-features
