# Implementation Plan: Advanced Task Management Features

**Branch**: `005-advanced-features` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/005-advanced-features/spec.md`

## Summary

Transform basic todo functionality into a comprehensive task management system by adding priority levels, tags, search, filtering, sorting, due dates, recurring tasks, and reminder infrastructure. Implementation focuses exclusively on frontend (Next.js) and backend (FastAPI) without microservices, Kafka, or background workers.

**Primary Requirement**: Enable users to organize, categorize, search, and automate task management through intuitive UI components and robust backend APIs.

**Technical Approach**: Database-first design with SQLModel migrations, RESTful API layer with Pydantic validation, React UI components with Tailwind CSS, and synchronous recurring task logic.

## Technical Context

**Language/Version**:
- Backend: Python 3.11+ with FastAPI 0.100+
- Frontend: TypeScript 5.x with Next.js 16+ (App Router, React 19)

**Primary Dependencies**:
- Backend: FastAPI, SQLModel, Pydantic, PostgreSQL driver (psycopg2), python-dateutil
- Frontend: Next.js, React, Tailwind CSS, Better Auth client, date-fns

**Storage**: Neon Serverless PostgreSQL with connection pooling via pgbouncer

**Testing**:
- Backend: pytest with FastAPI TestClient
- Frontend: Jest + React Testing Library
- Integration: End-to-end API contract tests

**Target Platform**:
- Backend: Linux/Windows development, containerized deployment (future)
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge) - responsive design

**Project Type**: Web application (separate frontend/backend)

**Performance Goals**:
- Search response: <1s for 1,000 tasks
- Filter/sort response: <500ms
- Recurring task creation: <2s synchronous
- Page load: <2s initial, <500ms subsequent

**Constraints**:
- No microservices, Kafka, Dapr, or container orchestration
- No background workers or async task processing
- No real-time sync (WebSocket) in this phase
- Synchronous API responses only
- All features must work locally without cloud infrastructure

**Scale/Scope**:
- Target: 100-1,000 tasks per user
- Support: 10-100 concurrent users
- Database: Single PostgreSQL instance
- Complexity: 7 new frontend components, 15+ API endpoints, 5 database tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Security-First Development ✅
- **JWT Authentication**: All API endpoints require valid JWT tokens from Better Auth
- **User Isolation**: All queries filtered by authenticated user_id from JWT payload
- **Input Validation**: Pydantic schemas validate all inputs (priority enum, date formats, tag names)
- **No SQL Injection**: SQLModel ORM prevents direct SQL execution
- **No XSS**: Frontend sanitizes user input, backend returns JSON (no HTML rendering)

### Spec-Driven Implementation ✅
- **Specification Complete**: All 42 functional requirements documented in spec.md
- **API Contracts**: All endpoints defined with request/response schemas
- **Event Schemas**: N/A (no event-driven architecture in this phase)
- **No Ad-hoc Changes**: Implementation follows approved spec without deviation

### User Isolation and Data Integrity ✅
- **Task Ownership**: Every task linked to user_id via foreign key
- **Tag Ownership**: Every tag scoped to user_id (user-specific tags)
- **Filtered Queries**: All SELECT queries include WHERE user_id = :authenticated_user
- **No Cross-User Access**: API layer enforces ownership checks before all operations

### Cloud-Native Production Readiness ⚠️
- **Development Focus**: This phase prioritizes feature functionality over cloud deployment
- **Future-Ready Patterns**: Stateless API design, externalized configuration
- **Health Checks**: Not implemented in this phase (future)
- **Containerization**: Out of scope for this phase (Phase V requirement)
- **Note**: This phase focuses on application logic; cloud-native patterns deferred to Phase V

### Distributed Systems Clarity ✅
- **Monolithic Simplicity**: Single backend service, single frontend application
- **Clear Boundaries**: Backend handles data/logic, frontend handles UI/presentation
- **No Microservices**: Intentionally avoiding complexity until Phase V
- **Synchronous Communication**: Direct HTTP API calls (no event-driven messaging)

### Technology Stack Compliance ✅
- **Frontend**: Next.js 16+ with App Router ✅
- **Backend**: FastAPI with async endpoints ✅
- **ORM**: SQLModel for type-safe models ✅
- **Database**: Neon Serverless PostgreSQL ✅
- **Authentication**: Better Auth with JWT ✅
- **Phase V Stack**: N/A (Kubernetes, Dapr, Kafka deferred to future)

### Spec-Kit Process Compliance ✅
- **Specification Phase**: Completed (spec.md with 7 user stories, 42 requirements)
- **Planning Phase**: In progress (this document)
- **Implementation Phase**: Pending (tasks.md generation next)

## Project Structure

### Documentation (this feature)

```text
specs/005-advanced-features/
├── plan.md              # This file (implementation strategy)
├── spec.md              # Feature specification (input)
├── research.md          # Phase 0: Unknown investigation
├── data-model.md        # Phase 1: Database schema design
├── quickstart.md        # Phase 1: Developer onboarding guide
├── contracts/           # Phase 1: API contract definitions
│   ├── task-api.md      # Task CRUD endpoints
│   ├── tag-api.md       # Tag management endpoints
│   └── filter-api.md    # Search, filter, sort endpoints
├── checklists/          # Validation checklists
│   └── requirements.md  # Requirements validation (completed)
└── tasks.md             # Phase 2: Generated by /speckit.tasks (NOT created yet)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── task.py          # Task SQLModel (extended with new fields)
│   │   ├── tag.py           # Tag SQLModel (new)
│   │   └── task_tag.py      # TaskTag junction table (new)
│   ├── schemas/
│   │   ├── task.py          # Pydantic request/response schemas (extended)
│   │   ├── tag.py           # Tag schemas (new)
│   │   └── filter.py        # Filter/sort query schemas (new)
│   ├── api/
│   │   ├── tasks.py         # Task endpoints (extended with new operations)
│   │   ├── tags.py          # Tag management endpoints (new)
│   │   └── search.py        # Search/filter/sort endpoints (new)
│   ├── services/
│   │   ├── task_service.py       # Task business logic (extended)
│   │   ├── tag_service.py        # Tag management logic (new)
│   │   ├── recurring_service.py  # Recurring task creation (new)
│   │   └── search_service.py     # Search/filter logic (new)
│   └── migrations/
│       └── 005_advanced_features.py  # Alembic migration (new tables/columns)
│
└── tests/
    ├── unit/
    │   ├── test_recurring_logic.py   # Test date calculations
    │   ├── test_tag_service.py       # Test tag deduplication
    │   └── test_search_filters.py    # Test query building
    └── integration/
        ├── test_task_api.py          # Test extended endpoints
        ├── test_tag_api.py           # Test tag endpoints
        └── test_recurring_flow.py    # Test complete → create next

frontend/
├── src/
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── PrioritySelector.tsx   # Dropdown: low/medium/high (new)
│   │   │   ├── TagInput.tsx           # Multi-tag input with autocomplete (new)
│   │   │   ├── DatePicker.tsx         # Due date selector (new)
│   │   │   ├── RecurrenceSelector.tsx # Daily/Weekly/Monthly dropdown (new)
│   │   │   └── TaskCard.tsx           # Updated to display new fields
│   │   ├── filters/
│   │   │   ├── SearchBar.tsx          # Text search input (new)
│   │   │   ├── FilterPanel.tsx        # Status/Priority/Tag filters (new)
│   │   │   └── SortControls.tsx       # Sort by date/priority (new)
│   │   └── common/
│   │       └── OverdueBadge.tsx       # Visual indicator for overdue (new)
│   ├── services/
│   │   ├── taskApi.ts            # API client (extended with new endpoints)
│   │   └── tagApi.ts             # Tag API client (new)
│   ├── hooks/
│   │   ├── useTasks.ts           # Task fetching hook (extended with filters)
│   │   ├── useTags.ts            # Tag fetching hook (new)
│   │   └── useSearch.ts          # Debounced search hook (new)
│   └── types/
│       ├── task.ts               # Task TypeScript types (extended)
│       └── tag.ts                # Tag types (new)
│
└── tests/
    └── components/
        ├── PrioritySelector.test.tsx
        ├── TagInput.test.tsx
        └── SearchBar.test.tsx
```

**Structure Decision**: Web application structure (Option 2) selected because project has distinct frontend and backend layers. Backend handles data persistence and business logic via FastAPI APIs. Frontend handles presentation and user interaction via Next.js React components. This separation allows independent development, testing, and future scaling.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Cloud-Native Production Readiness (partial) | This phase focuses on feature development; cloud deployment patterns (health checks, containerization, observability) are deferred to Phase V microservices work | Implementing full cloud-native patterns now would add unnecessary complexity before features are validated. Phase V will refactor for production deployment. |

**Justification**: The constitution's Cloud-Native Production Readiness principle is partially deferred in this phase. We are implementing the feature logic first to validate user requirements, then will apply cloud-native patterns (containerization, Kubernetes, health checks, observability) in Phase V when decomposing into microservices. This pragmatic approach prevents premature optimization while maintaining production-ready code quality (security, user isolation, spec-driven development).

## Implementation Phases

### Phase 0: Research Unknowns

**Objective**: Investigate technical uncertainties before design decisions

**Deliverable**: `research.md` (separate document)

**Questions to Answer**:
1. How to handle recurring task date calculations for edge cases (month-end, leap years)?
2. What is the best PostgreSQL full-text search approach (LIKE vs GIN index vs pg_trgm)?
3. How to implement case-insensitive unique tag names in SQLModel?
4. How to efficiently query many-to-many relationships (tasks + tags) without N+1 queries?
5. How to implement multi-field sorting and filtering in SQLAlchemy?

**Time Estimate**: 4-8 hours

---

### Phase 1: Database & Data Models

**Objective**: Design and implement database schema, SQLModel models, and migrations

**Deliverables**:
- `data-model.md` (ERD and schema documentation)
- `contracts/` (API contract specifications)
- `quickstart.md` (setup guide)
- Backend code: SQLModel models, Alembic migration

**Tasks**:
1. Design ERD for Tag, TaskTag, and updated Task models
2. Create SQLModel models:
   - Extend `Task` model with new fields: priority, due_date, reminder_at, recurrence_rule, recurrence_parent_id
   - Create `Tag` model with unique constraint on (user_id, name_lower)
   - Create `TaskTag` junction table
3. Write Alembic migration script
4. Add database indexes:
   - Index on tasks.priority
   - Index on tasks.due_date
   - Index on tasks.reminder_at
   - GIN index on tasks.title and tasks.description (for search)
   - Index on tags.name_lower
5. Document all API contracts in `contracts/` folder
6. Write developer quickstart guide

**Acceptance Criteria**:
- Migration runs successfully against local PostgreSQL
- All foreign keys and constraints enforced
- Indexes created and validated with EXPLAIN queries
- API contracts define all request/response schemas

**Time Estimate**: 8-12 hours

---

### Phase 2: Backend Core Logic

**Objective**: Implement CRUD APIs, tag management, search, filter, and sort

**Deliverables**:
- Backend code: API endpoints, service layer, Pydantic schemas
- Unit tests for services
- Integration tests for APIs

**Tasks**:
1. **Extend Task CRUD Endpoints**:
   - Update `POST /api/tasks` to accept new fields
   - Update `GET /api/tasks/:id` to return new fields
   - Update `PUT /api/tasks/:id` to allow editing new fields
   - Add `PATCH /api/tasks/:id/complete` for task completion logic
2. **Tag Management Endpoints**:
   - `GET /api/tags` - List all user tags
   - `POST /api/tags` - Create new tag (case-insensitive uniqueness)
   - `DELETE /api/tags/:id` - Delete unused tags
   - `GET /api/tags/:id/tasks` - Get all tasks with specific tag
3. **Search, Filter, Sort**:
   - Extend `GET /api/tasks` with query parameters:
     - `?search=keyword` - Full-text search
     - `?status=pending|in_progress|completed` - Status filter
     - `?priority=low|medium|high` - Priority filter
     - `?tag=tag_name` - Tag filter (supports multiple)
     - `?due_range=overdue|today|this_week|this_month` - Due date filter
     - `?sort_by=created_at|due_date|priority` - Sort field
     - `?sort_order=asc|desc` - Sort direction
4. **Service Layer**:
   - Implement tag deduplication logic (case-insensitive lookup)
   - Implement search query builder with SQL LIKE or full-text search
   - Implement filter/sort query builder with SQLAlchemy
5. **Pydantic Schemas**:
   - Extend TaskCreate, TaskUpdate, TaskResponse schemas
   - Create TagCreate, TagResponse schemas
   - Create FilterParams schema for query validation
6. **Unit Tests**:
   - Test tag deduplication logic
   - Test date filter logic (overdue calculation)
   - Test query builder with various filter combinations
7. **Integration Tests**:
   - Test all CRUD operations with new fields
   - Test tag assignment and removal
   - Test search accuracy
   - Test filter combinations (AND logic)
   - Test sort correctness

**Acceptance Criteria**:
- All API endpoints return 200 OK with valid JWT
- All APIs return 401 Unauthorized without JWT
- Tags are deduplicated case-insensitively
- Search returns accurate results (case-insensitive, partial match)
- Filters combine with AND logic
- Sorting produces correct order (including null handling)
- All tests pass with >80% code coverage

**Time Estimate**: 16-20 hours

---

### Phase 3: Advanced Backend Logic

**Objective**: Implement due dates, recurring tasks, and reminders logic

**Deliverables**:
- Backend code: Recurring task service, reminder API
- Unit tests for date calculations
- Integration tests for recurring flow

**Tasks**:
1. **Due Date Handling**:
   - Add validation for due_date format (ISO-8601)
   - Implement "overdue" calculation logic (due_date < current_date AND status != completed)
   - Add query filter for overdue tasks
2. **Recurring Task Service**:
   - Implement `create_next_instance()` function:
     - Calculate next due_date based on recurrence_rule (daily/weekly/monthly)
     - Handle edge cases: month-end dates, leap years
     - Copy task fields: title, description, priority, tags, recurrence_rule
     - Set recurrence_parent_id to original task ID
     - Set status to "pending"
   - Integrate into `PATCH /api/tasks/:id/complete` endpoint:
     - Mark task as completed
     - Check if recurrence_rule is set
     - Call create_next_instance() synchronously
     - Return both original and new task in response
3. **Reminder API**:
   - `GET /api/tasks/reminders/pending` endpoint:
     - Query tasks where reminder_at <= now() AND status != 'completed'
     - Return tasks ordered by reminder_at ascending
   - Add validation: reminder_at requires due_date to be set
4. **Unit Tests**:
   - Test daily recurrence: due_date + 1 day
   - Test weekly recurrence: due_date + 7 days
   - Test monthly recurrence: same day next month, handle edge cases (Jan 31 → Feb 28)
   - Test recurring task field copying
   - Test reminder query logic
5. **Integration Tests**:
   - Complete recurring task → verify new instance created
   - Complete non-recurring task → verify no new instance
   - Complete task twice → verify only one new instance per completion
   - Query pending reminders → verify correct filtering

**Acceptance Criteria**:
- Recurring tasks create next instance correctly for all recurrence rules
- Edge cases handled: month-end dates (Jan 31 → Feb 28/29)
- Reminder API returns only tasks with passed reminder times
- All date calculations use UTC timestamps
- Synchronous response time <2 seconds for recurring task completion
- All tests pass

**Time Estimate**: 12-16 hours

---

### Phase 4: Frontend UI Components

**Objective**: Build React components for priority, tags, search, filters, sort, dates, recurrence

**Deliverables**:
- Frontend code: React components, TypeScript types, API client
- Component tests

**Tasks**:
1. **Priority Selector Component**:
   - Dropdown with 3 options: Low, Medium, High
   - Visual indicators (color coding: green/yellow/red)
   - Integrate into task creation and editing forms
2. **Tag Input Component**:
   - Multi-select input with autocomplete
   - Fetch existing tags from API as user types
   - Allow creating new tags inline
   - Display selected tags as removable chips
3. **Date Picker Component**:
   - Calendar UI for selecting due_date
   - Optional field (allow clearing)
   - Display selected date in user's timezone
   - Visual indicator for overdue dates (red text/icon)
4. **Recurrence Selector Component**:
   - Dropdown with 4 options: None, Daily, Weekly, Monthly
   - Conditional display based on due_date (only show if due_date is set)
5. **Search Bar Component**:
   - Text input with search icon
   - Debounced input (500ms delay before API call)
   - Clear button
   - Loading indicator during search
6. **Filter Panel Component**:
   - Status filter: checkboxes for Pending, In Progress, Completed
   - Priority filter: checkboxes for Low, Medium, High
   - Tag filter: multi-select dropdown
   - Due date filter: radio buttons for Overdue, Today, This Week, This Month, All
   - Clear all filters button
7. **Sort Controls Component**:
   - Dropdown for sort field: Created Date, Due Date, Priority
   - Toggle button for sort order: Ascending/Descending
8. **Overdue Badge Component**:
   - Display red "Overdue" badge if due_date < today AND status != completed
9. **Update Existing Components**:
   - TaskCard: display priority icon, tags chips, due date, recurrence indicator
   - TaskForm: integrate all new input components
   - TaskList: integrate search, filters, sort controls
10. **TypeScript Types**:
    - Extend Task interface with new fields
    - Create Tag interface
    - Create FilterParams type
11. **API Client**:
    - Extend taskApi.ts with new endpoints
    - Create tagApi.ts for tag management
12. **React Hooks**:
    - useTasks: add filter/sort parameters
    - useTags: fetch user tags
    - useSearch: debounced search with loading state
13. **Component Tests**:
    - Test priority selector state changes
    - Test tag input add/remove
    - Test search debounce timing
    - Test filter state management

**Acceptance Criteria**:
- All components render without errors
- Priority selector updates task priority
- Tag input creates new tags and assigns existing tags
- Date picker allows selecting and clearing dates
- Search triggers API call after debounce
- Filters combine correctly (AND logic)
- Sort controls change task order
- Overdue badge displays for overdue tasks
- Components are responsive (mobile, tablet, desktop)
- All component tests pass

**Time Estimate**: 20-24 hours

---

### Phase 5: Integration & Polish

**Objective**: Connect frontend to backend, handle edge cases, refine UX

**Deliverables**:
- Fully functional feature end-to-end
- Integration tests
- Edge case handling
- Performance optimizations

**Tasks**:
1. **API Integration**:
   - Connect all frontend components to backend APIs
   - Handle API errors gracefully (network errors, 401, 404, 500)
   - Display user-friendly error messages
   - Add loading states for all async operations
2. **Edge Case Handling**:
   - Empty search results: show "No tasks found" message
   - No filter matches: show "No tasks match your filters"
   - Null due dates: handle sorting correctly (nulls last)
   - Tag case sensitivity: test "Work" vs "work" deduplication
   - Month-end recurring tasks: verify correct next due date
   - Completing recurring task multiple times: verify single instance created
3. **UX Refinements**:
   - Add transitions and animations (smooth filtering, sorting)
   - Improve tag autocomplete performance (debounce, limit results)
   - Add keyboard shortcuts (Enter to submit, Escape to clear search)
   - Add success notifications (task created, tag added, etc.)
   - Responsive design testing (mobile, tablet, desktop)
4. **Performance Optimization**:
   - Add pagination to task list (50 tasks per page)
   - Optimize tag query (eager loading, avoid N+1)
   - Cache search results (client-side for 30 seconds)
   - Add debouncing to all text inputs
5. **End-to-End Testing**:
   - Create task with priority, tags, due date, recurrence
   - Search for task by keyword
   - Filter tasks by multiple criteria
   - Sort tasks by different fields
   - Complete recurring task and verify next instance
   - Edit task to remove/add tags
   - Verify overdue badge displays correctly
6. **Documentation**:
   - Update API documentation with new endpoints
   - Add code comments for complex logic
   - Update README with new features
7. **Code Review Checklist**:
   - Security: JWT authentication on all endpoints
   - User isolation: all queries filtered by user_id
   - Input validation: Pydantic schemas validate all inputs
   - Error handling: graceful degradation, user-friendly messages
   - Performance: indexes on all filtered fields, query optimization
   - Code quality: no duplication, clear naming, proper types

**Acceptance Criteria**:
- All user stories (1-7) pass acceptance scenarios
- All 42 functional requirements (FR-001 to FR-042) satisfied
- All 13 success criteria (SC-001 to SC-013) met
- End-to-end tests pass
- No console errors or warnings
- Performance targets met (search <1s, filter <500ms, recurring <2s)
- Code review checklist 100% complete

**Time Estimate**: 12-16 hours

---

## Total Estimated Time

| Phase | Estimate |
|-------|----------|
| Phase 0: Research | 4-8 hours |
| Phase 1: Database & Models | 8-12 hours |
| Phase 2: Backend Core Logic | 16-20 hours |
| Phase 3: Advanced Backend Logic | 12-16 hours |
| Phase 4: Frontend UI | 20-24 hours |
| Phase 5: Integration & Polish | 12-16 hours |
| **Total** | **72-96 hours** |

**Recommended Sprint Duration**: 2-3 weeks (assuming 40-hour work weeks)

## Next Steps

After plan approval:

1. **Generate Tasks**: Run `/speckit.tasks` to generate `tasks.md` with actionable implementation tasks
2. **Phase 0 Execution**: Complete `research.md` to resolve technical unknowns
3. **Phase 1 Execution**: Implement database schema and write API contracts
4. **Iterative Development**: Execute Phases 2-5 sequentially, testing incrementally
5. **Final Validation**: Run all tests, verify success criteria, perform manual QA
6. **Feature Branch Merge**: Create PR, pass code review, merge to main

## Risk Management

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Search performance degrades with 1K+ tasks | Medium | Medium | Add database GIN indexes, implement pagination, use EXPLAIN to optimize queries |
| Synchronous recurring task creation slows API | Medium | Low | Optimize database writes, keep logic simple, consider async in Phase V if needed |
| Tag autocomplete becomes slow with 100+ tags | Low | Low | Limit autocomplete results to 10, add debouncing, cache frequently used tags |
| Date edge cases cause incorrect recurrence | Low | High | Thorough unit tests for month-end, leap years; use python-dateutil library |
| Frontend/backend schema mismatch | Low | High | Generate TypeScript types from Pydantic schemas, validate with contract tests |

## Success Validation

Before marking this feature complete, verify:

- [ ] All 7 user stories have passing acceptance scenarios
- [ ] All 42 functional requirements (FR-001 to FR-042) implemented
- [ ] All 13 success criteria (SC-001 to SC-013) achieved
- [ ] Constitution checks pass (security, user isolation, spec-driven)
- [ ] All automated tests pass (unit, integration, E2E)
- [ ] Manual QA testing complete for all edge cases
- [ ] Code review approved by peer
- [ ] Documentation updated (API docs, README, code comments)
- [ ] No critical bugs or regressions
- [ ] Performance targets met (search <1s, filter <500ms, recurring <2s)
