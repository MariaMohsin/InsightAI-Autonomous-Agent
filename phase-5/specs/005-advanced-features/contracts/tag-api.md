# Tag Management API Contract

**Feature**: 005-advanced-features
**Service**: Backend FastAPI
**Base URL**: `/api/tags`
**Authentication**: JWT Bearer token (required for all endpoints)

## Overview

This document defines the HTTP API contract for tag management operations: creating, listing, deleting tags, and assigning tags to tasks.

## Data Types

### Schemas

```typescript
interface Tag {
  id: string;  // UUID
  name: string;  // Display name (preserves case, e.g., "Work")
  created_at: string;  // ISO-8601 datetime
  task_count?: number;  // Optional: number of tasks with this tag
}

interface TagCreate {
  name: string;  // Required, max 50 chars, case-insensitive uniqueness
}

interface TagUsage {
  tag: Tag;
  tasks: Task[];  // Simplified task objects
}
```

## Endpoints

### 1. List All Tags

**GET** `/api/tags`

Retrieve all tags for the authenticated user, ordered by creation date.

**Query Parameters**:
- `include_count` (boolean, optional): Include task count for each tag (default: false)
- `sort_by` (string, optional): Sort field (`name`, `created_at`, `task_count`) - default: `created_at`
- `sort_order` (string, optional): Sort order (`asc`, `desc`) - default: `desc`

**Request**:
```
GET /api/tags?include_count=true&sort_by=task_count&sort_order=desc
Authorization: Bearer <jwt_token>
```

**Response**: `200 OK`
```json
{
  "tags": [
    {
      "id": "tag-1-uuid",
      "name": "Work",
      "created_at": "2026-02-01T10:00:00Z",
      "task_count": 15
    },
    {
      "id": "tag-2-uuid",
      "name": "Personal",
      "created_at": "2026-02-05T14:30:00Z",
      "task_count": 8
    },
    {
      "id": "tag-3-uuid",
      "name": "Urgent",
      "created_at": "2026-02-07T09:00:00Z",
      "task_count": 3
    }
  ],
  "total": 3
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token

---

### 2. Create Tag

**POST** `/api/tags`

Create a new tag. If tag with same name (case-insensitive) already exists, returns existing tag.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Finance"
}
```

**Response** (new tag): `201 Created`
```json
{
  "id": "tag-4-uuid",
  "name": "Finance",
  "created_at": "2026-02-07T10:00:00Z"
}
```

**Response** (existing tag): `200 OK`
```json
{
  "id": "tag-2-uuid",
  "name": "finance",  // Original case preserved
  "created_at": "2026-02-05T08:00:00Z",
  "message": "Tag already exists (reused)"
}
```

**Errors**:
- `400 Bad Request`: Invalid data (empty name, exceeds 50 chars)
- `401 Unauthorized`: Missing or invalid JWT token

---

### 3. Get Tag by ID

**GET** `/api/tags/{tag_id}`

Retrieve a single tag by ID.

**Request**:
```
GET /api/tags/tag-1-uuid
Authorization: Bearer <jwt_token>
```

**Response**: `200 OK`
```json
{
  "id": "tag-1-uuid",
  "name": "Work",
  "created_at": "2026-02-01T10:00:00Z",
  "task_count": 15
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Tag not found or belongs to different user

---

### 4. Get Tasks with Specific Tag

**GET** `/api/tags/{tag_id}/tasks`

Retrieve all tasks that have the specified tag.

**Query Parameters**:
- `status` (string, optional): Filter by task status
- `sort_by` (string, optional): Sort field - default: `created_at`
- `sort_order` (string, optional): Sort order - default: `desc`

**Request**:
```
GET /api/tags/tag-1-uuid/tasks?status=pending
Authorization: Bearer <jwt_token>
```

**Response**: `200 OK`
```json
{
  "tag": {
    "id": "tag-1-uuid",
    "name": "Work"
  },
  "tasks": [
    {
      "id": "task-1-uuid",
      "title": "Prepare Q1 Report",
      "status": "pending",
      "priority": "high",
      "due_date": "2026-02-15",
      "tags": [
        {"id": "tag-1-uuid", "name": "Work"},
        {"id": "tag-2-uuid", "name": "Finance"}
      ],
      ...
    }
  ],
  "total": 15
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Tag not found or belongs to different user

---

### 5. Update Tag Name

**PUT** `/api/tags/{tag_id}`

Update tag name (all tasks using this tag will reflect the new name).

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Work Projects"
}
```

**Response**: `200 OK`
```json
{
  "id": "tag-1-uuid",
  "name": "Work Projects",
  "created_at": "2026-02-01T10:00:00Z",
  "task_count": 15
}
```

**Errors**:
- `400 Bad Request`: Invalid name (empty, too long)
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Tag not found or belongs to different user
- `409 Conflict`: Tag with same name (case-insensitive) already exists

---

### 6. Delete Tag

**DELETE** `/api/tags/{tag_id}`

Delete a tag. Removes tag from all tasks (does not delete tasks).

**Request**:
```
DELETE /api/tags/tag-1-uuid
Authorization: Bearer <jwt_token>
```

**Response**: `204 No Content`

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Tag not found or belongs to different user

---

### 7. Search Tags (Autocomplete)

**GET** `/api/tags/search`

Search tags by name for autocomplete functionality.

**Query Parameters**:
- `query` (string, required): Search term (case-insensitive, partial match)
- `limit` (int, optional): Max results (default: 10, max: 50)

**Request**:
```
GET /api/tags/search?query=wor&limit=5
Authorization: Bearer <jwt_token>
```

**Response**: `200 OK`
```json
{
  "tags": [
    {"id": "tag-1-uuid", "name": "Work"},
    {"id": "tag-4-uuid", "name": "Homework"},
    {"id": "tag-7-uuid", "name": "Networking"}
  ],
  "total": 3
}
```

**Behavior**:
- Case-insensitive search
- Partial matching (prefix and substring)
- Ordered by relevance (prefix matches first, then substring)
- Limited to user's own tags

**Errors**:
- `400 Bad Request`: Missing query parameter
- `401 Unauthorized`: Missing or invalid JWT token

---

### 8. Bulk Tag Operations

**POST** `/api/tags/bulk`

Perform bulk operations on multiple tags at once.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "operation": "delete",  // "delete" or "merge"
  "tag_ids": ["tag-2-uuid", "tag-3-uuid"],
  "target_tag_id": null  // Required for "merge" operation
}
```

**Response** (delete): `200 OK`
```json
{
  "deleted": 2,
  "affected_tasks": 12  // Number of tasks that had these tags removed
}
```

**Response** (merge): `200 OK`
```json
{
  "merged_into": {
    "id": "tag-1-uuid",
    "name": "Work"
  },
  "deleted_tags": ["tag-2-uuid", "tag-3-uuid"],
  "affected_tasks": 25  // Tasks now have target_tag instead
}
```

**Errors**:
- `400 Bad Request`: Invalid operation or missing required fields
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: One or more tags not found

---

## Validation Rules

### Tag Name
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 50 characters
- **Allowed Characters**: Any Unicode string
- **Uniqueness**: Case-insensitive per user (e.g., "Work" and "work" are the same)
- **Whitespace**: Leading/trailing whitespace trimmed automatically

### Tag ID
- **Format**: UUID v4
- **Ownership**: User can only access their own tags

## Business Rules

### Tag Creation
1. **Deduplication**: If tag "Work" exists and user creates "work", system returns existing tag (case-insensitive)
2. **Case Preservation**: Original case is preserved for display (first occurrence wins)
3. **Normalization**: Tag names are trimmed and normalized to lowercase for comparison

### Tag Deletion
1. **Cascade Behavior**: Deleting a tag removes it from all tasks (does not delete tasks)
2. **Orphan Tasks**: Tasks with deleted tag remain but lose that tag association
3. **No Confirmation**: Deletion is immediate (frontend should confirm)

### Tag Assignment
1. **Automatic Creation**: Assigning non-existent tag to task auto-creates the tag
2. **Case Reuse**: If task assigned "work" but "Work" exists, reuses "Work" tag
3. **Duplicate Prevention**: Cannot assign same tag to task twice

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Tag name must be between 1 and 50 characters"
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
  "detail": "Tag not found"
}
```

### 409 Conflict
```json
{
  "detail": "Tag with name 'Work' already exists"
}
```

## Performance Considerations

### Autocomplete Optimization
- Default limit: 10 tags
- Results cached for 30 seconds (client-side)
- Debounced queries recommended (500ms delay)

### Tag Count Calculation
- `include_count=true` performs JOIN query (slower)
- Cached for 5 minutes per user
- For large tag lists, pagination recommended

## Changelog

- **2026-02-07**: Initial API contract for tag management (005-advanced-features)
