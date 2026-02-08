# Phase 1: Data Model - Advanced Task Management Features

**Feature**: 005-advanced-features
**Phase**: Phase 1 - Database & Data Models
**Date**: 2026-02-07
**Status**: Design Complete

## Overview

This document defines the database schema, entity relationships, SQLModel models, and migration scripts for implementing advanced task management features: priorities, tags, search, filter, sort, due dates, recurring tasks, and reminders.

## Entity Relationship Diagram

```
┌──────────────┐
│    Users     │
│  (existing)  │
└──────┬───────┘
       │
       │ 1:N
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│    Tasks     │      │     Tags     │
│  (extended)  │      │    (new)     │
├──────────────┤      ├──────────────┤
│ id (PK)      │      │ id (PK)      │
│ user_id (FK) │      │ user_id (FK) │
│ title        │      │ name         │
│ description  │      │ name_lower   │
│ status       │      │ created_at   │
│ PRIORITY ✨  │      └──────┬───────┘
│ DUE_DATE ✨  │             │
│ REMINDER_AT ✨│            │ N:M via TaskTag
│ RECUR_RULE ✨│             │
│ RECUR_PAR ✨ │             │
│ created_at   │             │
│ updated_at   │             │
└──────┬───────┘             │
       │                     │
       │ N:M                 │
       └─────────┬───────────┘
                 │
                 ▼
          ┌──────────────┐
          │   TaskTag    │
          │ (junction)   │
          ├──────────────┤
          │ task_id (FK) │
          │ tag_id (FK)  │
          └──────────────┘

Legend:
✨ = New field (this feature)
PK = Primary Key
FK = Foreign Key
1:N = One-to-Many
N:M = Many-to-Many
```

## Database Schema

### Updated Table: `tasks`

**Purpose**: Extended existing tasks table with advanced features

```sql
CREATE TABLE tasks (
    -- Existing fields (Phase I-III)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | in_progress | completed
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- NEW: Priority management
    priority VARCHAR(10) DEFAULT 'medium',  -- low | medium | high

    -- NEW: Due dates and reminders
    due_date DATE NULL,  -- Optional deadline
    reminder_at TIMESTAMP WITH TIME ZONE NULL,  -- Optional reminder time

    -- NEW: Recurring task support
    recurrence_rule VARCHAR(10) NULL,  -- NULL | daily | weekly | monthly
    recurrence_parent_id UUID NULL REFERENCES tasks(id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT chk_status CHECK (status IN ('pending', 'in_progress', 'completed')),
    CONSTRAINT chk_priority CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT chk_recurrence CHECK (recurrence_rule IN ('daily', 'weekly', 'monthly'))
);

-- Indexes (existing)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- NEW: Indexes for advanced features
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_reminder_at ON tasks(reminder_at);
CREATE INDEX idx_tasks_recurrence_parent ON tasks(recurrence_parent_id);

-- NEW: Search optimization (future: replace with GIN pg_trgm)
CREATE INDEX idx_tasks_title_lower ON tasks(LOWER(title));
CREATE INDEX idx_tasks_description_lower ON tasks(LOWER(description));
```

### New Table: `tags`

**Purpose**: Reusable labels for categorizing tasks

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,  -- Display name (preserves case)
    name_lower VARCHAR(50) NOT NULL,  -- Lowercase for uniqueness and queries
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Unique constraint: one tag name per user (case-insensitive)
    CONSTRAINT uq_user_tag_lower UNIQUE (user_id, name_lower)
);

-- Indexes
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_name_lower ON tags(name_lower);
```

### New Table: `task_tags`

**Purpose**: Junction table for many-to-many relationship between tasks and tags

```sql
CREATE TABLE task_tags (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Composite primary key (one tag per task, no duplicates)
    PRIMARY KEY (task_id, tag_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);
```

## SQLModel Models

### Extended Model: `Task`

```python
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import SQLModel, Field, Relationship

class TaskStatus(str, Enum):
    """Task completion status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TaskPriority(str, Enum):
    """Task priority level"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class RecurrenceRule(str, Enum):
    """Recurring task frequency"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class Task(SQLModel, table=True):
    """Task model with advanced features"""
    __tablename__ = "tasks"

    # Existing fields
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # NEW: Priority
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, index=True)

    # NEW: Due dates and reminders
    due_date: Optional[date] = Field(default=None, index=True)
    reminder_at: Optional[datetime] = Field(default=None, index=True)

    # NEW: Recurring tasks
    recurrence_rule: Optional[RecurrenceRule] = Field(default=None)
    recurrence_parent_id: Optional[UUID] = Field(
        default=None,
        foreign_key="tasks.id",
        index=True
    )

    # Relationships
    tags: List["Tag"] = Relationship(
        back_populates="tasks",
        link_model="TaskTag",
        sa_relationship_kwargs={"lazy": "select"}
    )
    recurrence_parent: Optional["Task"] = Relationship(
        sa_relationship_kwargs={
            "remote_side": "Task.id",
            "lazy": "select"
        }
    )
    recurrence_children: List["Task"] = Relationship(
        back_populates="recurrence_parent",
        sa_relationship_kwargs={
            "foreign_keys": "[Task.recurrence_parent_id]",
            "lazy": "select"
        }
    )
```

### New Model: `Tag`

```python
class Tag(SQLModel, table=True):
    """Reusable task label/category"""
    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=50)  # Display name (preserves case)
    name_lower: str = Field(max_length=50, index=True)  # For uniqueness
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: List["Task"] = Relationship(
        back_populates="tags",
        link_model="TaskTag"
    )

    __table_args__ = (
        UniqueConstraint('user_id', 'name_lower', name='uq_user_tag_lower'),
    )
```

### New Model: `TaskTag`

```python
class TaskTag(SQLModel, table=True):
    """Junction table: Tasks <-> Tags (many-to-many)"""
    __tablename__ = "task_tags"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## Alembic Migration Script

**File**: `backend/migrations/versions/005_advanced_features.py`

```python
"""Add advanced task features: priority, tags, due dates, recurrence

Revision ID: 005_advanced_features
Revises: 004_previous_migration
Create Date: 2026-02-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Revision identifiers
revision = '005_advanced_features'
down_revision = '004_previous_migration'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Add new columns to tasks and create tags tables"""

    # Add new columns to tasks table
    op.add_column('tasks', sa.Column('priority', sa.String(10), server_default='medium', nullable=False))
    op.add_column('tasks', sa.Column('due_date', sa.Date(), nullable=True))
    op.add_column('tasks', sa.Column('reminder_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('tasks', sa.Column('recurrence_rule', sa.String(10), nullable=True))
    op.add_column('tasks', sa.Column('recurrence_parent_id', postgresql.UUID(as_uuid=True), nullable=True))

    # Add check constraints
    op.create_check_constraint(
        'chk_priority',
        'tasks',
        "priority IN ('low', 'medium', 'high')"
    )
    op.create_check_constraint(
        'chk_recurrence',
        'tasks',
        "recurrence_rule IN ('daily', 'weekly', 'monthly')"
    )

    # Add foreign key for recurrence_parent_id
    op.create_foreign_key(
        'fk_tasks_recurrence_parent',
        'tasks',
        'tasks',
        ['recurrence_parent_id'],
        ['id'],
        ondelete='SET NULL'
    )

    # Add indexes on tasks
    op.create_index('idx_tasks_priority', 'tasks', ['priority'])
    op.create_index('idx_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('idx_tasks_reminder_at', 'tasks', ['reminder_at'])
    op.create_index('idx_tasks_recurrence_parent', 'tasks', ['recurrence_parent_id'])

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('name_lower', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'name_lower', name='uq_user_tag_lower')
    )

    # Add indexes on tags
    op.create_index('idx_tags_user_id', 'tags', ['user_id'])
    op.create_index('idx_tags_name_lower', 'tags', ['name_lower'])

    # Create task_tags junction table
    op.create_table(
        'task_tags',
        sa.Column('task_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tag_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('task_id', 'tag_id')
    )

    # Add indexes on task_tags
    op.create_index('idx_task_tags_task_id', 'task_tags', ['task_id'])
    op.create_index('idx_task_tags_tag_id', 'task_tags', ['tag_id'])

def downgrade() -> None:
    """Rollback: remove tags tables and task columns"""

    # Drop task_tags table
    op.drop_index('idx_task_tags_tag_id', 'task_tags')
    op.drop_index('idx_task_tags_task_id', 'task_tags')
    op.drop_table('task_tags')

    # Drop tags table
    op.drop_index('idx_tags_name_lower', 'tags')
    op.drop_index('idx_tags_user_id', 'tags')
    op.drop_table('tags')

    # Drop indexes on tasks
    op.drop_index('idx_tasks_recurrence_parent', 'tasks')
    op.drop_index('idx_tasks_reminder_at', 'tasks')
    op.drop_index('idx_tasks_due_date', 'tasks')
    op.drop_index('idx_tasks_priority', 'tasks')

    # Drop foreign key and constraints
    op.drop_constraint('fk_tasks_recurrence_parent', 'tasks', type_='foreignkey')
    op.drop_constraint('chk_recurrence', 'tasks', type_='check')
    op.drop_constraint('chk_priority', 'tasks', type_='check')

    # Drop columns from tasks
    op.drop_column('tasks', 'recurrence_parent_id')
    op.drop_column('tasks', 'recurrence_rule')
    op.drop_column('tasks', 'reminder_at')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
```

## Data Validation Rules

### Task Model Validation

1. **Priority**: Must be one of: `low`, `medium`, `high`
2. **Status**: Must be one of: `pending`, `in_progress`, `completed`
3. **Due Date**: Optional; if set, must be valid date (past dates allowed for overdue tasks)
4. **Reminder**: Optional; if set, must be valid datetime in future
5. **Recurrence Rule**: Optional; if set, must be one of: `daily`, `weekly`, `monthly`
6. **Recurrence Parent**: Optional; if set, must reference valid task ID

### Tag Model Validation

1. **Name**: Required; max 50 characters; Unicode allowed
2. **Name Lower**: Auto-generated from name (lowercase); enforces uniqueness
3. **User Scoping**: Tag names unique per user (case-insensitive)

### Business Rules

1. **Tag Deduplication**: If user creates tag "Work" and later tries "work", reuse existing tag
2. **Recurring Tasks**: Completing a recurring task creates next instance with same properties
3. **Reminder Requirement**: Reminder times require due_date to be set (frontend validation)
4. **Overdue Calculation**: Task is overdue if `due_date < today AND status != completed`
5. **Tag Assignment**: Users can only assign their own tags to their own tasks

## Index Strategy

### Performance Optimization

**High-Impact Indexes** (must have):
- `idx_tasks_user_id` - Isolates user data (security + performance)
- `idx_tasks_priority` - Fast filtering by priority
- `idx_tasks_due_date` - Fast filtering by due date range
- `idx_tags_name_lower` - Fast tag lookups (autocomplete)
- `idx_task_tags_task_id` - Efficient tag loading for tasks

**Medium-Impact Indexes** (recommended):
- `idx_tasks_reminder_at` - Periodic reminder queries
- `idx_tasks_recurrence_parent` - Query task chains

**Future Optimization** (if performance degrades):
```sql
-- Trigram indexes for fuzzy search (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tasks_title_trgm ON tasks USING GIN (title gin_trgm_ops);
CREATE INDEX idx_tasks_description_trgm ON tasks USING GIN (description gin_trgm_ops);
```

## Sample Data

### Example 1: High-priority task with tags and due date

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user-uuid-here",
  "title": "Prepare Q1 Financial Report",
  "description": "Compile sales data, create charts, write executive summary",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2026-02-15",
  "reminder_at": "2026-02-14T09:00:00Z",
  "recurrence_rule": null,
  "recurrence_parent_id": null,
  "tags": [
    {"id": "tag-1", "name": "Work"},
    {"id": "tag-2", "name": "Finance"}
  ],
  "created_at": "2026-02-07T10:00:00Z",
  "updated_at": "2026-02-07T14:30:00Z"
}
```

### Example 2: Recurring daily task

```json
{
  "id": "987f6543-e21c-34d5-b654-426614174001",
  "user_id": "user-uuid-here",
  "title": "Daily standup notes",
  "description": "Document progress, blockers, and plan for today",
  "status": "pending",
  "priority": "medium",
  "due_date": "2026-02-08",
  "reminder_at": "2026-02-08T09:00:00Z",
  "recurrence_rule": "daily",
  "recurrence_parent_id": null,
  "tags": [
    {"id": "tag-3", "name": "Work"},
    {"id": "tag-4", "name": "Scrum"}
  ],
  "created_at": "2026-02-07T08:00:00Z",
  "updated_at": "2026-02-07T08:00:00Z"
}
```

### Example 3: Task with multiple tags (personal)

```json
{
  "id": "456a7890-b12c-45d6-e789-426614174002",
  "user_id": "user-uuid-here",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, fruits",
  "status": "pending",
  "priority": "low",
  "due_date": "2026-02-10",
  "reminder_at": null,
  "recurrence_rule": null,
  "recurrence_parent_id": null,
  "tags": [
    {"id": "tag-5", "name": "Personal"},
    {"id": "tag-6", "name": "Shopping"}
  ],
  "created_at": "2026-02-07T12:00:00Z",
  "updated_at": "2026-02-07T12:00:00Z"
}
```

## Migration Testing Checklist

Before deploying migration to production:

- [ ] Run migration on local development database
- [ ] Verify all tables created successfully
- [ ] Verify all indexes created
- [ ] Verify foreign key constraints work (test ON DELETE CASCADE)
- [ ] Verify unique constraint on tags.name_lower (try creating duplicate tags)
- [ ] Test downgrade migration (rollback)
- [ ] Test upgrade again after rollback
- [ ] Run EXPLAIN on common queries to verify index usage
- [ ] Measure query performance with sample data (100 tasks, 20 tags)
- [ ] Backup production database before running migration

## Query Examples

### Find overdue tasks

```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND due_date < CURRENT_DATE
  AND status != 'completed'
ORDER BY due_date ASC;
```

### Search tasks by keyword

```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND (
    LOWER(title) LIKE '%keyword%'
    OR LOWER(description) LIKE '%keyword%'
  )
ORDER BY created_at DESC;
```

### Find tasks with specific tag

```sql
SELECT t.* FROM tasks t
JOIN task_tags tt ON t.id = tt.task_id
JOIN tags tag ON tt.tag_id = tag.id
WHERE t.user_id = :user_id
  AND tag.name_lower = 'work'
ORDER BY t.created_at DESC;
```

### Find tasks with multiple tags (AND logic)

```sql
SELECT t.* FROM tasks t
JOIN task_tags tt1 ON t.id = tt1.task_id
JOIN tags tag1 ON tt1.tag_id = tag1.id AND tag1.name_lower = 'work'
JOIN task_tags tt2 ON t.id = tt2.task_id
JOIN tags tag2 ON tt2.tag_id = tag2.id AND tag2.name_lower = 'urgent'
WHERE t.user_id = :user_id;
```

### Get pending reminders

```sql
SELECT * FROM tasks
WHERE user_id = :user_id
  AND reminder_at <= NOW()
  AND status != 'completed'
ORDER BY reminder_at ASC;
```

## Next Phase

After data model approved:

1. **Create API Contracts** (`contracts/` folder)
2. **Write Quickstart Guide** (`quickstart.md`)
3. **Implement SQLModel Models** (backend code)
4. **Write and Run Migration** (Alembic script)
5. **Verify Database Schema** (run test queries)
6. **Proceed to Phase 2**: Backend Core Logic (API endpoints, services)

**Status**: Ready for contracts and implementation
