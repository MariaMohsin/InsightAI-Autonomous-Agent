# Search, Filter, and Sort API Contract

**Feature**: 005-advanced-features
**Service**: Backend FastAPI
**Base URL**: `/api/tasks`
**Authentication**: JWT Bearer token (required for all endpoints)

## Overview

This document defines the HTTP API contract for advanced task querying capabilities: full-text search, multi-dimensional filtering, and flexible sorting. All query operations are integrated into the main GET /api/tasks endpoint.

## Query Parameters

### Search Parameter

**Parameter**: `search`
**Type**: `string`
**Required**: No
**Description**: Keyword to search across task title and description fields

**Example**:
```
GET /api/tasks?search=groceries
GET /api/tasks?search=urgent+meeting
```

**Behavior**:
- Case-insensitive matching
- Partial word matching supported (e.g., "groc" matches "groceries")
- Searches both `title` and `description` fields
- Returns results ordered by relevance (title matches first, then description matches)
- Empty string returns all tasks (no filtering)

**Implementation**: Uses SQL ILIKE with lowercase conversion
```sql
WHERE (LOWER(title) LIKE '%keyword%' OR LOWER(description) LIKE '%keyword%')
```

---

### Filter Parameters

#### Status Filter

**Parameter**: `status`
**Type**: `string`
**Required**: No
**Allowed Values**: `pending`, `in_progress`, `completed`

**Example**:
```
GET /api/tasks?status=pending
GET /api/tasks?status=completed
```

**Behavior**:
- Filters tasks by completion status
- Only one status value allowed per request
- Omitting parameter returns tasks of all statuses

---

#### Priority Filter

**Parameter**: `priority`
**Type**: `string`
**Required**: No
**Allowed Values**: `low`, `medium`, `high`

**Example**:
```
GET /api/tasks?priority=high
GET /api/tasks?priority=medium
```

**Behavior**:
- Filters tasks by priority level
- Only one priority value allowed per request
- Omitting parameter returns tasks of all priorities

---

#### Tag Filter

**Parameter**: `tag`
**Type**: `string[]` (array, supports multiple values)
**Required**: No

**Example**:
```
GET /api/tasks?tag=Work
GET /api/tasks?tag=Work&tag=Urgent    # Multiple tags (AND logic)
```

**Behavior**:
- Filters tasks by tag names (case-insensitive)
- Multiple `tag` parameters use **AND logic** (task must have ALL specified tags)
- Tag names matched against `name_lower` column for case-insensitive comparison
- Returns only tasks that have all specified tags assigned

**Implementation**: JOIN query for each tag
```sql
JOIN task_tags tt1 ON tasks.id = tt1.task_id
JOIN tags tag1 ON tt1.tag_id = tag1.id AND tag1.name_lower = 'work'
JOIN task_tags tt2 ON tasks.id = tt2.task_id
JOIN tags tag2 ON tt2.tag_id = tag2.id AND tag2.name_lower = 'urgent'
```

---

#### Due Date Range Filter

**Parameter**: `due_range`
**Type**: `string`
**Required**: No
**Allowed Values**: `overdue`, `today`, `this_week`, `this_month`, `all`

**Example**:
```
GET /api/tasks?due_range=overdue
GET /api/tasks?due_range=this_week
```

**Behavior**:

- **`overdue`**: Tasks where `due_date < current_date` AND `status != 'completed'`
- **`today`**: Tasks where `due_date = current_date`
- **`this_week`**: Tasks where `due_date` is between today and 7 days from now
- **`this_month`**: Tasks where `due_date` is in the current calendar month
- **`all`**: No filtering (default)

**Timezone**: All date comparisons use server timezone (UTC). Frontend converts to user's local timezone.

---

### Sort Parameters

#### Sort By Field

**Parameter**: `sort_by`
**Type**: `string`
**Required**: No (default: `created_at`)
**Allowed Values**: `created_at`, `updated_at`, `due_date`, `priority`, `title`

**Example**:
```
GET /api/tasks?sort_by=due_date
GET /api/tasks?sort_by=priority
```

**Behavior**:
- Specifies which field to sort results by
- Default sorting: `created_at` descending (newest first)

---

#### Sort Order

**Parameter**: `sort_order`
**Type**: `string`
**Required**: No (default: `desc`)
**Allowed Values**: `asc`, `desc`

**Example**:
```
GET /api/tasks?sort_by=due_date&sort_order=asc
GET /api/tasks?sort_by=priority&sort_order=desc
```

**Behavior**:
- **`asc`**: Ascending order (oldest/lowest first)
- **`desc`**: Descending order (newest/highest first)

**Priority Sorting**:
- Ascending: low → medium → high
- Descending: high → medium → low

**Null Handling**:
- Ascending: nulls appear LAST
- Descending: nulls appear FIRST
- Applies to `due_date`, `reminder_at`, `updated_at` fields

---

### Pagination Parameters

#### Limit

**Parameter**: `limit`
**Type**: `integer`
**Required**: No (default: `50`)
**Range**: 1-100

**Example**:
```
GET /api/tasks?limit=20
GET /api/tasks?limit=100
```

**Behavior**:
- Maximum number of tasks to return per request
- Default: 50 tasks
- Maximum: 100 tasks (enforced server-side)

---

#### Offset

**Parameter**: `offset`
**Type**: `integer`
**Required**: No (default: `0`)
**Range**: 0-∞

**Example**:
```
GET /api/tasks?offset=0&limit=50     # First page
GET /api/tasks?offset=50&limit=50    # Second page
GET /api/tasks?offset=100&limit=50   # Third page
```

**Behavior**:
- Number of tasks to skip before returning results
- Used for pagination
- Default: 0 (start from first result)

---

## Combined Query Examples

### Example 1: Search with Filters

**Request**:
```
GET /api/tasks?search=meeting&status=pending&priority=high&sort_by=due_date&sort_order=asc
Authorization: Bearer <jwt_token>
```

**Interpretation**: Find all pending high-priority tasks containing "meeting" in title/description, sorted by nearest due date first

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": "task-1-uuid",
      "title": "Prepare for client meeting",
      "description": "Create slide deck and review proposal",
      "status": "pending",
      "priority": "high",
      "due_date": "2026-02-10",
      "tags": [{"id": "tag-1", "name": "Work"}],
      ...
    },
    {
      "id": "task-2-uuid",
      "title": "Team meeting agenda",
      "status": "pending",
      "priority": "high",
      "due_date": "2026-02-15",
      ...
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

---

### Example 2: Multi-Tag Filter with Sort

**Request**:
```
GET /api/tasks?tag=Work&tag=Urgent&sort_by=priority&sort_order=desc
Authorization: Bearer <jwt_token>
```

**Interpretation**: Find all tasks that have BOTH "Work" AND "Urgent" tags, sorted by priority (high to low)

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": "task-1-uuid",
      "title": "Fix production bug",
      "priority": "high",
      "tags": [
        {"id": "tag-1", "name": "Work"},
        {"id": "tag-2", "name": "Urgent"}
      ],
      ...
    },
    {
      "id": "task-2-uuid",
      "title": "Review security patch",
      "priority": "medium",
      "tags": [
        {"id": "tag-1", "name": "Work"},
        {"id": "tag-2", "name": "Urgent"}
      ],
      ...
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

---

### Example 3: Overdue Tasks

**Request**:
```
GET /api/tasks?due_range=overdue&sort_by=due_date&sort_order=asc
Authorization: Bearer <jwt_token>
```

**Interpretation**: Find all incomplete tasks with past due dates, sorted by oldest deadline first

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": "task-1-uuid",
      "title": "Submit expense report",
      "status": "pending",
      "due_date": "2026-01-15",
      "overdue": true,
      ...
    },
    {
      "id": "task-2-uuid",
      "title": "Complete training module",
      "status": "in_progress",
      "due_date": "2026-02-01",
      "overdue": true,
      ...
    }
  ],
  "total": 12,
  "limit": 50,
  "offset": 0
}
```

---

### Example 4: Paginated Results

**Request**:
```
GET /api/tasks?status=completed&limit=10&offset=20&sort_by=updated_at&sort_order=desc
Authorization: Bearer <jwt_token>
```

**Interpretation**: Get page 3 of completed tasks (10 per page), sorted by most recently updated

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": "task-21-uuid",
      "title": "Task 21",
      "status": "completed",
      "updated_at": "2026-02-05T14:30:00Z",
      ...
    },
    ...
  ],
  "total": 150,
  "limit": 10,
  "offset": 20
}
```

---

### Example 5: All Filters Combined

**Request**:
```
GET /api/tasks?search=report&status=pending&priority=high&tag=Work&due_range=this_week&sort_by=due_date&sort_order=asc&limit=25&offset=0
Authorization: Bearer <jwt_token>
```

**Interpretation**: Find pending high-priority tasks with "Work" tag, containing "report", due this week, sorted by nearest deadline, first 25 results

**Logic**: ALL filters combined with AND logic:
- `title LIKE '%report%' OR description LIKE '%report%'` **AND**
- `status = 'pending'` **AND**
- `priority = 'high'` **AND**
- `task has tag 'Work'` **AND**
- `due_date BETWEEN today AND today+7 days`

---

## Response Schema

### Success Response

```typescript
interface TaskListResponse {
  tasks: Task[];           // Array of task objects
  total: number;           // Total matching tasks (before pagination)
  limit: number;           // Limit used (for pagination)
  offset: number;          // Offset used (for pagination)
}
```

### Empty Results

When no tasks match the query:

```json
{
  "tasks": [],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

**Frontend Behavior**: Display "No tasks found matching your filters" message

---

## Error Responses

### 400 Bad Request - Invalid Query Parameter

**Scenario**: Invalid enum value for filter

**Request**:
```
GET /api/tasks?priority=super-high
```

**Response**: `400 Bad Request`
```json
{
  "detail": "Invalid priority value. Must be one of: low, medium, high"
}
```

---

### 400 Bad Request - Invalid Pagination

**Scenario**: Limit exceeds maximum

**Request**:
```
GET /api/tasks?limit=500
```

**Response**: `400 Bad Request`
```json
{
  "detail": "Limit must be between 1 and 100"
}
```

---

### 400 Bad Request - Invalid Sort Field

**Scenario**: Sort field not supported

**Request**:
```
GET /api/tasks?sort_by=user_id
```

**Response**: `400 Bad Request`
```json
{
  "detail": "Invalid sort_by value. Must be one of: created_at, updated_at, due_date, priority, title"
}
```

---

### 401 Unauthorized

**Scenario**: Missing or invalid JWT token

**Response**: `401 Unauthorized`
```json
{
  "detail": "Could not validate credentials"
}
```

---

## Performance Considerations

### Database Indexes

Required indexes for optimal performance:

```sql
-- Search optimization (future: replace with GIN pg_trgm)
CREATE INDEX idx_tasks_title_lower ON tasks(LOWER(title));
CREATE INDEX idx_tasks_description_lower ON tasks(LOWER(description));

-- Filter optimization
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Tag filtering
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);
CREATE INDEX idx_tags_name_lower ON tags(name_lower);

-- Sorting
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);
```

### Query Optimization

**Avoid N+1 Queries**: Use `subqueryload(Task.tags)` to eager load tags

```python
from sqlalchemy.orm import subqueryload

tasks = db.query(Task).options(
    subqueryload(Task.tags)
).filter(...).all()
```

**Pagination**: Always use LIMIT and OFFSET to prevent large result sets

**Filter Order**: Apply most selective filters first (user_id, status, priority, then search)

### Performance Targets

- **Search**: <1 second for 1,000 tasks per user
- **Filter/Sort**: <500ms for all filter combinations
- **Pagination**: <200ms for fetching page

### Future Optimization (Phase V)

For search performance with 10K+ tasks:

```sql
-- Add trigram indexes for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tasks_title_trgm ON tasks USING GIN (title gin_trgm_ops);
CREATE INDEX idx_tasks_description_trgm ON tasks USING GIN (description gin_trgm_ops);
```

No code changes needed - ILIKE queries automatically use trigram indexes when available.

---

## Filter Logic Summary

### AND Logic (All filters must match)

When multiple filters are specified, tasks must match **ALL** conditions:

```
search=meeting
  AND status=pending
  AND priority=high
  AND tag=Work
  AND tag=Urgent
  AND due_range=this_week
```

### OR Logic (Not Supported)

Currently, there is no OR logic for filters. Each parameter type uses AND.

**Workaround**: Make multiple API calls and merge results client-side if OR logic needed.

**Example**: To get tasks with priority=high OR priority=medium:
```javascript
// Client-side workaround
const highPriority = await fetch('/api/tasks?priority=high');
const mediumPriority = await fetch('/api/tasks?priority=medium');
const combined = [...highPriority.tasks, ...mediumPriority.tasks];
```

---

## Caching Recommendations

### Client-Side Caching

- Cache search results for 30 seconds
- Invalidate cache on task create/update/delete
- Cache tag list for 5 minutes (rarely changes)

### Debouncing

- Search input: 500ms debounce to reduce API calls
- Filter changes: Apply immediately (no debounce)
- Sort changes: Apply immediately

---

## Testing Checklist

- [ ] Search: case-insensitive, partial matching works
- [ ] Search: empty query returns all tasks
- [ ] Search: special characters handled correctly
- [ ] Filter: status filter returns only matching tasks
- [ ] Filter: priority filter returns only matching tasks
- [ ] Filter: tag filter with multiple tags uses AND logic
- [ ] Filter: due_range=overdue excludes completed tasks
- [ ] Filter: combine all filters - verify AND logic
- [ ] Sort: ascending and descending work correctly
- [ ] Sort: null handling (nulls last/first) works
- [ ] Sort: priority order (low/medium/high) correct
- [ ] Pagination: limit enforced (max 100)
- [ ] Pagination: offset works correctly
- [ ] Pagination: total count accurate
- [ ] Performance: search <1s for 1000 tasks
- [ ] Performance: filter/sort <500ms
- [ ] Error: invalid enum values rejected with 400
- [ ] Error: missing auth token rejected with 401

---

## Changelog

- **2026-02-07**: Initial API contract for search, filter, and sort operations (005-advanced-features)
