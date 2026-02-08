# Phase 0: Research - Advanced Task Management Features

**Feature**: 005-advanced-features
**Phase**: Phase 0 - Research Unknowns
**Date**: 2026-02-07
**Status**: Pending Investigation

## Overview

This document addresses technical uncertainties that must be resolved before implementing the Advanced Task Management Features. Questions relate to date calculations, database search strategies, unique constraints, ORM query optimization, and multi-field filtering.

## Research Questions

### Q1: Recurring Task Date Calculations for Edge Cases

**Question**: How should we handle recurring task date calculations for edge cases like month-end dates and leap years?

**Context**:
- User creates recurring task with due date January 31 and monthly recurrence
- Next month (February) only has 28/29 days
- What should the next due date be?

**Options**:

**Option A**: Use last valid day of target month
- Jan 31 → Feb 28 (non-leap year)
- Jan 31 → Feb 29 (leap year)
- **Pros**: Predictable behavior, matches user intent ("end of month")
- **Cons**: Subsequent months shift (Feb 28 → Mar 28, not Mar 31)

**Option B**: Skip invalid dates, use same day next valid month
- Jan 31 → Mar 31 (skip February entirely)
- **Pros**: Maintains consistent day-of-month
- **Cons**: Violates monthly recurrence contract (skips February)

**Option C**: Use Python's `dateutil.relativedelta`
- Handles month arithmetic automatically
- Jan 31 + 1 month → Feb 28/29
- **Pros**: Standard library solution, well-tested
- **Cons**: Requires additional dependency

**Recommendation**: **Option C** - Use `python-dateutil.relativedelta`

**Rationale**:
- Standard library solution with extensive testing for edge cases
- Handles leap years automatically
- Aligns with Option A behavior (last valid day) but with robust implementation
- Minimal code complexity (3-line function vs complex date logic)

**Implementation**:
```python
from dateutil.relativedelta import relativedelta
from datetime import date

def calculate_next_due_date(current_due: date, recurrence: str) -> date:
    if recurrence == "daily":
        return current_due + relativedelta(days=1)
    elif recurrence == "weekly":
        return current_due + relativedelta(weeks=1)
    elif recurrence == "monthly":
        return current_due + relativedelta(months=1)
    else:
        raise ValueError(f"Invalid recurrence rule: {recurrence}")

# Test cases:
# Jan 31 + 1 month → Feb 28 (non-leap) / Feb 29 (leap)
# Feb 28 + 1 month → Mar 28
# Dec 31 + 1 month → Jan 31 (next year)
```

**Test Coverage Required**:
- Monthly recurrence from Jan 31 (edge case)
- Monthly recurrence from Feb 29 in leap year (rare edge case)
- Weekly recurrence across month boundaries
- Daily recurrence across year boundaries (Dec 31 → Jan 1)

**Decision**: Use `python-dateutil` library for all date arithmetic

---

### Q2: PostgreSQL Full-Text Search Strategy

**Question**: What is the best approach for implementing search across task title and description?

**Context**:
- Need case-insensitive, partial word matching
- Target: <1 second for 1,000 tasks per user
- Search across two text fields: title, description

**Options**:

**Option A**: SQL `ILIKE` (Pattern Matching)
```sql
SELECT * FROM tasks
WHERE (title ILIKE '%keyword%' OR description ILIKE '%keyword%')
AND user_id = :user_id;
```
- **Pros**: Simple, no indexes needed, works immediately
- **Cons**: Slow for large datasets (full table scan), cannot optimize with indexes
- **Performance**: ~100ms for 1,000 rows (acceptable for MVP)

**Option B**: PostgreSQL GIN Index with `pg_trgm` (Trigram Matching)
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tasks_title_trgm ON tasks USING GIN (title gin_trgm_ops);
CREATE INDEX idx_tasks_description_trgm ON tasks USING GIN (description gin_trgm_ops);

SELECT * FROM tasks
WHERE (title ILIKE '%keyword%' OR description ILIKE '%keyword%')
AND user_id = :user_id;
```
- **Pros**: Fast even with large datasets, supports LIKE/ILIKE queries
- **Cons**: Requires PostgreSQL extension, larger index size
- **Performance**: ~10-20ms for 10,000 rows (excellent for scale)

**Option C**: PostgreSQL Full-Text Search (tsvector)
```sql
ALTER TABLE tasks ADD COLUMN search_vector tsvector;
CREATE INDEX idx_tasks_search ON tasks USING GIN (search_vector);

UPDATE tasks SET search_vector =
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''));

SELECT * FROM tasks
WHERE search_vector @@ to_tsquery('keyword')
AND user_id = :user_id;
```
- **Pros**: Most powerful (relevance ranking, stemming, stop words)
- **Cons**: Complex setup, requires maintaining search_vector column
- **Performance**: ~5-10ms for 10,000 rows (best for advanced use cases)

**Recommendation**: **Option A for MVP, Option B for Scale**

**Rationale**:
- **Phase 1 (This Feature)**: Use ILIKE for simplicity
  - Sufficient for 100-1,000 tasks per user
  - No setup complexity, works immediately
  - Can migrate later without API changes
- **Future (If Performance Degrades)**: Migrate to pg_trgm GIN indexes
  - Add indexes without changing queries
  - Backward compatible with existing ILIKE queries
  - Performance boost without code changes

**Implementation (Phase 1)**:
```python
# SQLAlchemy query
from sqlalchemy import or_, func

def search_tasks(db: Session, user_id: str, keyword: str):
    return db.query(Task).filter(
        Task.user_id == user_id,
        or_(
            func.lower(Task.title).contains(keyword.lower()),
            func.lower(Task.description).contains(keyword.lower())
        )
    ).all()
```

**Migration Path**:
```sql
-- Run this if performance becomes an issue (future)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tasks_title_trgm ON tasks USING GIN (title gin_trgm_ops);
CREATE INDEX idx_tasks_description_trgm ON tasks USING GIN (description gin_trgm_ops);
-- Queries remain unchanged!
```

**Decision**: Use ILIKE for MVP, document pg_trgm migration path for future

---

### Q3: Case-Insensitive Unique Tag Names in SQLModel

**Question**: How to enforce unique tag names per user while treating "Work" and "work" as the same tag?

**Context**:
- Tags must be unique per user (user_id, tag_name)
- Case-insensitive: "Work", "work", "WORK" should all map to same tag
- SQLModel/SQLAlchemy must enforce this at database level

**Options**:

**Option A**: Store lowercase, enforce at application layer
```python
class Tag(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name: str  # Original case for display
    name_lower: str  # Lowercase for uniqueness

    __table_args__ = (
        UniqueConstraint('user_id', 'name_lower', name='uq_user_tag_lower'),
    )

# Application logic
def create_tag(db: Session, user_id: uuid.UUID, name: str):
    name_lower = name.lower()
    existing = db.query(Tag).filter(
        Tag.user_id == user_id,
        Tag.name_lower == name_lower
    ).first()

    if existing:
        return existing  # Reuse existing tag

    return Tag(user_id=user_id, name=name, name_lower=name_lower)
```
- **Pros**: Preserves original case for display, database enforces uniqueness
- **Cons**: Requires two columns (name + name_lower)

**Option B**: Store lowercase only
```python
class Tag(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name: str  # Always lowercase

    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='uq_user_tag'),
    )

# Application logic
def create_tag(db: Session, user_id: uuid.UUID, name: str):
    name_lower = name.lower()
    # ... rest of logic
```
- **Pros**: Single column, simpler schema
- **Cons**: Loses original case (displays "work" even if user typed "Work")

**Option C**: Use PostgreSQL CITEXT column type
```python
from sqlalchemy.dialects.postgresql import CITEXT

class Tag(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(sa_column=Column(CITEXT))  # Case-insensitive text

    __table_args__ = (
        UniqueConstraint('user_id', 'name', name='uq_user_tag'),
    )
```
- **Pros**: Database handles case-insensitivity, preserves original case
- **Cons**: PostgreSQL-specific (not portable to MySQL/SQLite)

**Recommendation**: **Option A** - Store lowercase in separate column

**Rationale**:
- Preserves user input ("Work" displays as "Work", not "work")
- Database enforces uniqueness via unique constraint
- Application logic is explicit (convert to lowercase, check duplicate)
- Portable across databases (no PostgreSQL-specific types)
- Recommended pattern for case-insensitive uniqueness

**Implementation**:
```python
class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: uuid.UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=50)  # Original case for display
    name_lower: str = Field(max_length=50, index=True)  # Lowercase for queries
    created_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'name_lower', name='uq_user_tag_lower'),
    )
```

**Decision**: Use separate `name_lower` column with unique constraint

---

### Q4: Efficient Many-to-Many Queries (Tasks + Tags)

**Question**: How to query tasks with their tags without N+1 query problems?

**Context**:
- User fetches list of 50 tasks
- Each task may have 0-5 tags
- Naïve approach: 1 query for tasks + 50 queries for tags = 51 queries (N+1 problem)
- Need: Single query or minimal queries

**Options**:

**Option A**: SQLAlchemy `joinedload` (Eager Loading)
```python
from sqlalchemy.orm import joinedload

def get_tasks_with_tags(db: Session, user_id: uuid.UUID):
    return db.query(Task).options(
        joinedload(Task.tags)
    ).filter(Task.user_id == user_id).all()
```
- **Pros**: Single query with LEFT JOIN, automatic ORM relationship loading
- **Cons**: Large result set if many tags (Cartesian product)
- **Performance**: ~50ms for 50 tasks with 3 tags each

**Option B**: SQLAlchemy `subqueryload` (Separate Query)
```python
from sqlalchemy.orm import subqueryload

def get_tasks_with_tags(db: Session, user_id: uuid.UUID):
    return db.query(Task).options(
        subqueryload(Task.tags)
    ).filter(Task.user_id == user_id).all()
```
- **Pros**: Two queries (tasks, then tags), avoids Cartesian product
- **Cons**: Two roundtrips to database
- **Performance**: ~30-40ms for 50 tasks (better for many tags per task)

**Option C**: Manual JOIN with GROUP BY
```python
from sqlalchemy import func

def get_tasks_with_tags(db: Session, user_id: uuid.UUID):
    results = db.query(
        Task,
        func.array_agg(Tag.name).label('tag_names')
    ).outerjoin(TaskTag).outerjoin(Tag)\
     .filter(Task.user_id == user_id)\
     .group_by(Task.id).all()

    # Map results to Pydantic schema
```
- **Pros**: Single query, aggregates tags into array
- **Cons**: Manual result mapping, more complex query
- **Performance**: ~40-50ms (similar to Option A)

**Recommendation**: **Option B** - Use `subqueryload`

**Rationale**:
- Best performance for tasks with multiple tags (avoids Cartesian product)
- Simple ORM usage (no manual mapping)
- Two queries are negligible overhead (~10ms difference)
- Scales better than joinedload for 5+ tags per task

**Implementation**:
```python
from sqlalchemy.orm import subqueryload

class TaskService:
    def get_user_tasks(
        self,
        db: Session,
        user_id: uuid.UUID,
        filters: Optional[TaskFilters] = None
    ) -> List[Task]:
        query = db.query(Task).options(
            subqueryload(Task.tags)  # Eager load tags
        ).filter(Task.user_id == user_id)

        # Apply filters...

        return query.all()
```

**SQLModel Relationship Definition**:
```python
class Task(SQLModel, table=True):
    # ... other fields ...
    tags: List["Tag"] = Relationship(
        back_populates="tasks",
        link_model=TaskTag,
        sa_relationship_kwargs={"lazy": "select"}  # Default lazy loading
    )

class Tag(SQLModel, table=True):
    # ... other fields ...
    tasks: List["Task"] = Relationship(
        back_populates="tags",
        link_model=TaskTag
    )
```

**Decision**: Use `subqueryload` for eager loading tags with tasks

---

### Q5: Multi-Field Filtering and Sorting in SQLAlchemy

**Question**: How to implement clean, maintainable code for combining multiple filters and sorts?

**Context**:
- API accepts query params: `?status=pending&priority=high&tag=work&sort_by=due_date&sort_order=desc`
- Need to build dynamic SQLAlchemy query
- Avoid messy if/else chains

**Options**:

**Option A**: Conditional query building
```python
def get_tasks(db, user_id, status=None, priority=None, tag=None, sort_by=None):
    query = db.query(Task).filter(Task.user_id == user_id)

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if tag:
        query = query.join(TaskTag).join(Tag).filter(Tag.name_lower == tag.lower())
    if sort_by == "due_date":
        query = query.order_by(Task.due_date.desc() if sort_order == "desc" else Task.due_date.asc())
    # ... more conditions ...

    return query.all()
```
- **Pros**: Simple, explicit
- **Cons**: Repetitive, hard to maintain with many filters

**Option B**: Filter builder pattern
```python
class TaskQueryBuilder:
    def __init__(self, db: Session, user_id: uuid.UUID):
        self.query = db.query(Task).filter(Task.user_id == user_id)

    def filter_by_status(self, status: str):
        if status:
            self.query = self.query.filter(Task.status == status)
        return self

    def filter_by_priority(self, priority: str):
        if priority:
            self.query = self.query.filter(Task.priority == priority)
        return self

    def filter_by_tag(self, tag: str):
        if tag:
            self.query = self.query.join(TaskTag).join(Tag)\
                .filter(Tag.name_lower == tag.lower())
        return self

    def sort_by(self, field: str, order: str = "asc"):
        col = getattr(Task, field, None)
        if col:
            self.query = self.query.order_by(
                col.desc() if order == "desc" else col.asc()
            )
        return self

    def execute(self):
        return self.query.all()

# Usage
tasks = TaskQueryBuilder(db, user_id)\
    .filter_by_status("pending")\
    .filter_by_priority("high")\
    .filter_by_tag("work")\
    .sort_by("due_date", "desc")\
    .execute()
```
- **Pros**: Clean, chainable, testable, extensible
- **Cons**: More boilerplate code

**Option C**: List comprehension with filters
```python
def get_tasks(db, user_id, filters: TaskFilters):
    query = db.query(Task).filter(Task.user_id == user_id)

    conditions = []
    if filters.status:
        conditions.append(Task.status == filters.status)
    if filters.priority:
        conditions.append(Task.priority == filters.priority)
    # ... more conditions

    if conditions:
        query = query.filter(*conditions)  # Unpack all conditions

    # Sort
    if filters.sort_by:
        col = getattr(Task, filters.sort_by)
        query = query.order_by(
            col.desc() if filters.sort_order == "desc" else col.asc()
        )

    return query.all()
```
- **Pros**: Concise, uses list comprehension
- **Cons**: Still somewhat repetitive

**Recommendation**: **Option B** - Filter builder pattern

**Rationale**:
- Most maintainable for complex filtering logic
- Easy to add new filters without modifying existing code
- Chainable API is intuitive and readable
- Each filter method is independently testable
- Follows OOP best practices (single responsibility)

**Implementation Sketch**:
```python
class TaskQueryBuilder:
    def __init__(self, db: Session, user_id: uuid.UUID):
        self.db = db
        self.user_id = user_id
        self.query = db.query(Task).options(
            subqueryload(Task.tags)
        ).filter(Task.user_id == user_id)

    def search(self, keyword: str):
        if keyword:
            self.query = self.query.filter(
                or_(
                    func.lower(Task.title).contains(keyword.lower()),
                    func.lower(Task.description).contains(keyword.lower())
                )
            )
        return self

    def filter_by_status(self, status: TaskStatus):
        if status:
            self.query = self.query.filter(Task.status == status)
        return self

    def filter_by_priority(self, priority: TaskPriority):
        if priority:
            self.query = self.query.filter(Task.priority == priority)
        return self

    def filter_by_tags(self, tag_names: List[str]):
        if tag_names:
            # Multiple tags = AND logic (task must have all tags)
            for tag_name in tag_names:
                self.query = self.query.join(TaskTag).join(Tag)\
                    .filter(Tag.name_lower == tag_name.lower())
        return self

    def filter_by_due_range(self, range: str):
        now = datetime.utcnow().date()
        if range == "overdue":
            self.query = self.query.filter(
                Task.due_date < now,
                Task.status != TaskStatus.completed
            )
        elif range == "today":
            self.query = self.query.filter(Task.due_date == now)
        # ... other ranges
        return self

    def sort_by(self, field: str, order: str = "asc"):
        col = getattr(Task, field, None)
        if col:
            if order == "desc":
                self.query = self.query.order_by(col.desc().nullslast())
            else:
                self.query = self.query.order_by(col.asc().nullslast())
        return self

    def execute(self) -> List[Task]:
        return self.query.all()
```

**Decision**: Implement filter builder pattern for query construction

---

## Summary of Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Q1: Date Calculations** | Use `python-dateutil.relativedelta` | Standard library, handles edge cases, minimal code |
| **Q2: Search Strategy** | ILIKE for MVP, document pg_trgm for future | Simple now, scalable later without code changes |
| **Q3: Tag Uniqueness** | Separate `name_lower` column with unique constraint | Preserves case, enforces uniqueness, portable |
| **Q4: Many-to-Many Queries** | SQLAlchemy `subqueryload` | Best performance, avoids N+1, simple ORM usage |
| **Q5: Filter/Sort Code** | Filter builder pattern | Maintainable, testable, extensible, clean API |

## Action Items

Before moving to Phase 1 implementation:

- [ ] Install `python-dateutil` dependency (add to requirements.txt)
- [ ] Test `relativedelta` with edge case dates (Jan 31, Feb 29)
- [ ] Confirm Neon PostgreSQL supports ILIKE queries (should be default)
- [ ] Design Tag model with `name_lower` column (see Q3 implementation)
- [ ] Plan TaskQueryBuilder class structure (see Q5 implementation)
- [ ] Document migration path to pg_trgm if needed (future optimization)

## Dependencies Added

```
# requirements.txt additions
python-dateutil>=2.8.2
```

## Next Phase

After decisions finalized, proceed to **Phase 1: Database & Data Models** to implement:
- SQLModel models with decided schema
- Alembic migration scripts
- API contract definitions
- Quickstart guide

**Status**: Ready for Phase 1 implementation
