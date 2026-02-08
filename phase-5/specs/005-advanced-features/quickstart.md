# Quickstart Guide: Advanced Task Management Features

**Feature**: 005-advanced-features
**Last Updated**: 2026-02-07
**Prerequisites**: Basic todo app (Phases I-III) functional with authentication

## Overview

This guide helps developers set up, implement, and test the advanced task management features. Follow these steps to add priorities, tags, search, filtering, sorting, due dates, recurring tasks, and reminders to the existing todo application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Database Migration](#database-migration)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Python**: 3.11+ with pip
- **Node.js**: 18+ with npm/yarn/pnpm
- **PostgreSQL**: 14+ (or Neon Serverless)
- **Git**: For version control

### Existing Application
Ensure the following are working:
- ✅ User authentication (Better Auth with JWT)
- ✅ Basic task CRUD (create, read, update, delete)
- ✅ Database connection to PostgreSQL/Neon
- ✅ Backend API running on port 8000
- ✅ Frontend running on port 3000

### Verify Prerequisites

```bash
# Check Python version
python --version  # Should be 3.11+

# Check Node version
node --version  # Should be 18+

# Check database connection
psql $DATABASE_URL -c "SELECT version();"

# Verify backend is running
curl http://localhost:8000/health

# Verify frontend is running
curl http://localhost:3000
```

---

## Development Environment Setup

### 1. Install Backend Dependencies

Add new Python packages for date handling and database operations:

```bash
cd backend

# Add to requirements.txt
echo "python-dateutil>=2.8.2" >> requirements.txt
echo "alembic>=1.12.0" >> requirements.txt

# Install dependencies
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

Add date picker and utility libraries (if not already present):

```bash
cd frontend

# Install date utilities
npm install date-fns

# Install UI components (if using)
npm install @headlessui/react @heroicons/react

# Or with yarn
yarn add date-fns @headlessui/react @heroicons/react
```

### 3. Environment Variables

Update your `.env` files with any new configuration:

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
# Or Neon: postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Database Migration

### 1. Generate Migration Script

The migration script is provided in [`data-model.md`](./data-model.md). Create the file:

```bash
cd backend

# Create migration file
alembic revision -m "add_advanced_task_features"

# Copy the migration code from data-model.md into:
# backend/migrations/versions/XXX_add_advanced_task_features.py
```

### 2. Review Migration

Open the generated migration file and verify it includes:
- [ ] New columns on `tasks` table (priority, due_date, reminder_at, recurrence_rule, recurrence_parent_id)
- [ ] New `tags` table
- [ ] New `task_tags` junction table
- [ ] All indexes created
- [ ] All constraints added
- [ ] Downgrade function implemented

### 3. Run Migration

```bash
# Apply migration to database
alembic upgrade head

# Verify migration was successful
alembic current
```

### 4. Verify Schema

Connect to your database and verify the changes:

```sql
-- Check tasks table columns
\d tasks

-- Check new tables exist
\dt

-- Verify indexes
\di

-- Test constraints
INSERT INTO tasks (user_id, title, priority)
VALUES ('some-uuid', 'Test', 'invalid');  -- Should fail

INSERT INTO tasks (user_id, title, priority)
VALUES ('some-uuid', 'Test', 'high');  -- Should succeed
```

---

## Backend Implementation

### Phase 2A: Update SQLModel Models

**File**: `backend/src/models/task.py`

Extend the existing `Task` model with new fields:

```python
from datetime import datetime, date
from typing import Optional
from uuid import UUID
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class RecurrenceRule(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class Task(SQLModel, table=True):
    # ... existing fields ...

    # NEW FIELDS
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, index=True)
    due_date: Optional[date] = Field(default=None, index=True)
    reminder_at: Optional[datetime] = Field(default=None, index=True)
    recurrence_rule: Optional[RecurrenceRule] = Field(default=None)
    recurrence_parent_id: Optional[UUID] = Field(default=None, foreign_key="tasks.id", index=True)

    # Relationships
    tags: List["Tag"] = Relationship(back_populates="tasks", link_model=TaskTag)
```

**New Files**:
- `backend/src/models/tag.py` - Tag model (see data-model.md)
- `backend/src/models/task_tag.py` - TaskTag junction model

### Phase 2B: Create Pydantic Schemas

**File**: `backend/src/schemas/task.py`

Extend request/response schemas:

```python
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List

class TaskCreate(BaseModel):
    title: str = Field(max_length=200)
    description: Optional[str] = None
    priority: Optional[TaskPriority] = TaskPriority.MEDIUM
    due_date: Optional[date] = None
    reminder_at: Optional[datetime] = None
    recurrence_rule: Optional[RecurrenceRule] = None
    tag_names: Optional[List[str]] = []

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[date]
    reminder_at: Optional[datetime]
    recurrence_rule: Optional[RecurrenceRule]
    recurrence_parent_id: Optional[UUID]
    tags: List[TagResponse]
    created_at: datetime
    updated_at: datetime
```

### Phase 2C: Implement Services

**File**: `backend/src/services/recurring_service.py`

```python
from dateutil.relativedelta import relativedelta
from datetime import date

def calculate_next_due_date(current_due: date, recurrence: RecurrenceRule) -> date:
    """Calculate next due date based on recurrence rule"""
    if recurrence == RecurrenceRule.DAILY:
        return current_due + relativedelta(days=1)
    elif recurrence == RecurrenceRule.WEEKLY:
        return current_due + relativedelta(weeks=1)
    elif recurrence == RecurrenceRule.MONTHLY:
        return current_due + relativedelta(months=1)
    else:
        raise ValueError(f"Invalid recurrence rule: {recurrence}")

def create_next_instance(db: Session, original_task: Task) -> Task:
    """Create next recurring task instance"""
    if not original_task.recurrence_rule:
        return None

    next_due = calculate_next_due_date(original_task.due_date, original_task.recurrence_rule)

    new_task = Task(
        user_id=original_task.user_id,
        title=original_task.title,
        description=original_task.description,
        priority=original_task.priority,
        due_date=next_due,
        recurrence_rule=original_task.recurrence_rule,
        recurrence_parent_id=original_task.id,
        status=TaskStatus.PENDING
    )

    db.add(new_task)
    db.flush()  # Get new task ID

    # Copy tags
    for tag in original_task.tags:
        task_tag = TaskTag(task_id=new_task.id, tag_id=tag.id)
        db.add(task_tag)

    db.commit()
    db.refresh(new_task)

    return new_task
```

### Phase 2D: Implement API Endpoints

**File**: `backend/src/api/tasks.py`

```python
@router.patch("/{task_id}/complete")
async def complete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark task as completed. Create next instance if recurring."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status == TaskStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="Task already completed")

    # Mark as completed
    task.status = TaskStatus.COMPLETED
    task.updated_at = datetime.utcnow()
    db.commit()

    # Create next instance if recurring
    next_task = None
    if task.recurrence_rule:
        next_task = create_next_instance(db, task)

    if next_task:
        return {
            "completed_task": TaskResponse.from_orm(task),
            "next_task": TaskResponse.from_orm(next_task)
        }
    else:
        return TaskResponse.from_orm(task)
```

See [`contracts/task-api.md`](./contracts/task-api.md) for all endpoint implementations.

---

## Frontend Implementation

### Phase 4A: Create UI Components

**Priority Selector** (`frontend/src/components/tasks/PrioritySelector.tsx`):

```typescript
export function PrioritySelector({ value, onChange }) {
  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-3 py-2"
    >
      {priorities.map(p => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
```

**Tag Input** (`frontend/src/components/tasks/TagInput.tsx`):

```typescript
export function TagInput({ value, onChange }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      onChange([...value, input.trim()]);
      setInput('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <span key={tag} className="bg-blue-100 px-2 py-1 rounded">
            {tag}
            <button onClick={() => onChange(value.filter(t => t !== tag))}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag (press Enter)"
        className="border rounded px-3 py-2 w-full"
      />
    </div>
  );
}
```

### Phase 4B: Update Task Form

Integrate new components into task creation/editing form:

```typescript
export function TaskForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    priority: initialData?.priority || 'medium',
    due_date: initialData?.due_date || null,
    tag_names: initialData?.tags?.map(t => t.name) || []
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      <input name="title" value={formData.title} onChange={...} />
      <PrioritySelector value={formData.priority} onChange={...} />
      <DatePicker value={formData.due_date} onChange={...} />
      <TagInput value={formData.tag_names} onChange={...} />
      <button type="submit">Save Task</button>
    </form>
  );
}
```

### Phase 4C: Add Filters and Search

```typescript
export function TaskFilters({ filters, onChange }) {
  return (
    <div className="flex gap-4">
      <SearchBar
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
      />
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
      >
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}
```

---

## Testing

### Unit Tests

**Backend** (`backend/tests/unit/test_recurring_logic.py`):

```python
def test_daily_recurrence():
    from datetime import date
    current = date(2026, 2, 7)
    next_date = calculate_next_due_date(current, RecurrenceRule.DAILY)
    assert next_date == date(2026, 2, 8)

def test_monthly_recurrence_edge_case():
    # Jan 31 + 1 month = Feb 28/29
    current = date(2026, 1, 31)
    next_date = calculate_next_due_date(current, RecurrenceRule.MONTHLY)
    assert next_date == date(2026, 2, 28)  # Non-leap year
```

**Frontend** (`frontend/tests/components/PrioritySelector.test.tsx`):

```typescript
import { render, fireEvent } from '@testing-library/react';
import { PrioritySelector } from '@/components/tasks/PrioritySelector';

test('changes priority when option selected', () => {
  const onChange = jest.fn();
  const { getByRole } = render(<PrioritySelector value="medium" onChange={onChange} />);

  fireEvent.change(getByRole('combobox'), { target: { value: 'high' } });

  expect(onChange).toHaveBeenCalledWith('high');
});
```

### Integration Tests

```python
def test_create_task_with_tags(client, auth_headers):
    response = client.post('/api/tasks', json={
        'title': 'Test Task',
        'priority': 'high',
        'tag_names': ['Work', 'Urgent']
    }, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert len(data['tags']) == 2
    assert data['tags'][0]['name'] in ['Work', 'Urgent']
```

### Manual Testing Checklist

- [ ] Create task with priority, tags, due date
- [ ] Search tasks by keyword
- [ ] Filter tasks by priority and tag
- [ ] Sort tasks by due date
- [ ] Complete recurring task and verify next instance created
- [ ] Edit task to add/remove tags
- [ ] Verify overdue badge displays for overdue tasks
- [ ] Test on mobile device (responsive design)

---

## Troubleshooting

### Migration Issues

**Problem**: `alembic upgrade head` fails with constraint error

**Solution**: Check if old data conflicts with new constraints
```sql
-- Find tasks with invalid priorities
SELECT * FROM tasks WHERE priority NOT IN ('low', 'medium', 'high');

-- Fix invalid data before migration
UPDATE tasks SET priority = 'medium' WHERE priority IS NULL;
```

### Tag Deduplication Not Working

**Problem**: Creating "Work" and "work" creates two separate tags

**Solution**: Verify `name_lower` column is populated and unique constraint exists
```sql
-- Check for duplicate tags
SELECT name_lower, COUNT(*) FROM tags GROUP BY name_lower HAVING COUNT(*) > 1;

-- Manually deduplicate
DELETE FROM tags WHERE id NOT IN (
    SELECT MIN(id) FROM tags GROUP BY user_id, name_lower
);
```

### Recurring Tasks Not Creating Next Instance

**Problem**: Completing recurring task doesn't create new task

**Solution**: Check logs for errors in `create_next_instance()` function
```bash
# Check backend logs
tail -f backend/logs/app.log | grep "recurring"

# Test manually in Python shell
from backend.src.services.recurring_service import calculate_next_due_date
from datetime import date
calculate_next_due_date(date(2026, 2, 7), "daily")  # Should return 2026-02-08
```

### Frontend Not Displaying Tags

**Problem**: Tags array is empty in API response

**Solution**: Ensure SQLModel relationship is using `subqueryload`
```python
from sqlalchemy.orm import subqueryload

tasks = db.query(Task).options(
    subqueryload(Task.tags)
).filter(Task.user_id == user_id).all()
```

---

## Next Steps

After completing quickstart:

1. ✅ Run full test suite (`pytest` and `npm test`)
2. ✅ Deploy to staging environment
3. ✅ Perform QA testing with real users
4. ✅ Monitor performance (search response times, database query counts)
5. ✅ Iterate based on feedback

## Additional Resources

- [API Contracts](./contracts/) - Full endpoint documentation
- [Data Model](./data-model.md) - Database schema details
- [Research Notes](./research.md) - Technical decisions explained
- [Implementation Plan](./plan.md) - Full implementation strategy

---

**Last Updated**: 2026-02-07
**Version**: 1.0.0
