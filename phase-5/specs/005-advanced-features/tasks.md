# Tasks: Advanced Task Management Features

**Input**: Design documents from `/specs/005-advanced-features/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification - implementation-focused tasks only

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with separate backend and frontend:
- **Backend**: `backend/src/` - Python FastAPI
- **Frontend**: `frontend/src/` - Next.js TypeScript

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install python-dateutil>=2.8.2 in backend/requirements.txt for recurring task date calculations
- [X] T002 [P] Install date-fns in frontend for date handling and formatting
- [X] T003 [P] Verify PostgreSQL database connection and check current schema version

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create Alembic migration script backend/migrations/versions/005_advanced_features.py (copy from data-model.md)
- [X] T005 Run Alembic migration: `alembic upgrade head` to add priority, due_date, reminder_at, recurrence_rule, recurrence_parent_id columns to todos table
- [X] T006 [P] Create TaskPriority enum in backend/app/models.py (LOW, MEDIUM, HIGH) - Already existed as TodoPriority
- [X] T007 [P] Create RecurrenceRule enum in backend/app/models.py (DAILY, WEEKLY, MONTHLY)
- [X] T008 [P] Create Tag SQLAlchemy model in backend/app/models.py with id, user_id, name, name_lower, created_at
- [X] T009 [P] Create TodoTag junction model in backend/app/models.py with todo_id, tag_id, created_at
- [X] T010 Extend Todo SQLAlchemy model in backend/app/models.py to add reminder_at, recurrence_rule, recurrence_parent_id fields
- [X] T011 Add tags relationship to Todo model using relationship with secondary='todo_tags'
- [X] T012 [P] Create TagResponse Pydantic schema in backend/app/schemas.py
- [X] T013 [P] Extend TodoCreate schema in backend/app/schemas.py to include reminder_at, recurrence_rule, tag_names fields
- [X] T014 [P] Extend TodoUpdate schema in backend/app/schemas.py to allow updating new fields
- [X] T015 Extend TodoResponse schema in backend/app/schemas.py to include all new fields and tags list
- [X] T016 Verify migration success with test insert: create todo with priority='HIGH' and verify it saves correctly

**Checkpoint**: ✅ Foundation ready - database schema updated (todos, tags, todo_tags tables), models extended, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Organize Tasks by Priority (Priority: P1) 🎯 MVP

**Goal**: Enable users to assign priority levels (low, medium, high) to tasks and filter/sort by priority

**Independent Test**: Create task with high priority → verify it saves → filter by high priority → verify only high-priority tasks returned → sort by priority descending → verify order is high, medium, low

### Backend Implementation for User Story 1

- [X] T017 [P] [US1] Update POST /api/todos endpoint in backend/app/routers/todos.py to accept priority field with default='medium' (already existed)
- [X] T018 [P] [US1] Update GET /api/todos/:id endpoint in backend/app/routers/todos.py to return priority field in response (already existed)
- [X] T019 [P] [US1] Update PUT /api/todos/:id endpoint in backend/app/routers/todos.py to allow updating priority field (already existed)
- [X] T020 [US1] Add priority filter parameter to GET /api/todos in backend/app/routers/todos.py (?priority=high) (already existed)
- [X] T021 [US1] Add priority sorting to GET /api/todos in backend/app/routers/todos.py (?sort_by=priority&sort_order=desc)
- [X] T022 [US1] Add Pydantic validation for priority field in backend/app/schemas.py (already existed via TodoPriority enum)

### Frontend Implementation for User Story 1

- [X] T023 [P] [US1] Create PrioritySelector component in components/dashboard/PrioritySelector.tsx with dropdown (Low, Medium, High)
- [X] T024 [P] [US1] Add priority color indicators in PrioritySelector: green (low), yellow (medium), red (high)
- [X] T025 [P] [US1] Extend Todo TypeScript interface in types/todo.ts to include priority, status, due_date, tags fields
- [X] T026 [US1] Integrate PrioritySelector into AddTodoModal and EditTodoModal components
- [X] T027 [US1] Update TodoCard component in components/dashboard/TodoCard.tsx to display priority badge with color
- [X] T028 [US1] Add priority and status filter controls to FilterSortControls component
- [X] T029 [US1] Update lib/api/todos.ts to send priority in create/update requests and support query parameters
- [X] T030 [US1] Update useTodos hook in hooks/useTodos.ts to support priority and status filter parameters with sortBy and sortOrder

**Checkpoint**: Users can now assign priority to tasks, filter by priority, and sort by priority - User Story 1 complete and independently testable

---

## Phase 4: User Story 2 - Categorize Tasks with Tags (Priority: P1)

**Goal**: Enable users to create tags and assign multiple tags to tasks for flexible categorization

**Independent Test**: Create tag "Work" → assign to task → create tag "work" (should reuse existing) → filter tasks by "Work" tag → verify only tagged tasks returned → remove tag from task → verify tag removed but tag entity still exists

### Backend Tag Management for User Story 2

- [X] T031 [P] [US2] Create create_or_get_tag function in backend/app/routers/tags.py with case-insensitive deduplication
- [X] T032 [P] [US2] Implement case-insensitive tag deduplication logic: convert name to lowercase, check if exists, return existing or create new
- [X] T033 [US2] Create POST /api/tags endpoint in backend/app/routers/tags.py to create new tag (returns existing if duplicate)
- [X] T034 [US2] Create GET /api/tags endpoint in backend/app/routers/tags.py to list all user tags with optional ?include_count=true
- [X] T035 [US2] Create GET /api/tags/:id endpoint in backend/app/routers/tags.py to get single tag details
- [X] T036 [US2] Create DELETE /api/tags/:id endpoint in backend/app/routers/tags.py to delete tag (removes from all todos via CASCADE)
- [X] T037 [US2] Create GET /api/tags/search endpoint in backend/app/routers/tags.py for autocomplete (?query=wor&limit=10)

### Backend Task-Tag Integration for User Story 2

- [X] T038 [US2] Update POST /api/todos in backend/app/routers/todos.py to accept tag_names array and create/assign tags
- [X] T039 [US2] Update PUT /api/todos/:id in backend/app/routers/todos.py to allow replacing todo tags via tag_names array
- [X] T040 [US2] Use selectinload(Todo.tags) in GET /api/todos for efficient tag loading
- [X] T041 [US2] Add tag filter to GET /api/todos in backend/app/routers/todos.py (?tag=Work&tag=Urgent for AND logic)
- [X] T042 [US2] Implement multi-tag filtering with AND logic in backend query builder

### Frontend Tag Management for User Story 2

- [X] T043 [P] [US2] Tag TypeScript interface already exists in types/todo.ts with id and name fields
- [X] T044 [P] [US2] Create tagApi.ts service in lib/api/tags.ts with createTag, getTags, searchTags, deleteTag functions
- [X] T045 [P] [US2] Create TagInput component in components/dashboard/TagInput.tsx with multi-select and autocomplete
- [X] T046 [US2] Implement tag autocomplete in TagInput: debounce input (300ms), call /api/tags/search, display suggestions
- [X] T047 [US2] Add tag chips display in TagInput showing selected tags with remove button (×)
- [X] T048 [US2] Integrate TagInput into AddTodoModal and EditTodoModal components
- [X] T049 [US2] Update TodoCard component in components/dashboard/TodoCard.tsx to display tag chips with icons
- [X] T050 [US2] Add tag filter to FilterSortControls component (multi-select dropdown with checkboxes)
- [X] T051 [US2] Create useTags hook in hooks/useTags.ts for fetching and caching user tags

**Checkpoint**: Users can create tags, assign multiple tags to tasks, filter by tags with AND logic - User Story 2 complete and independently testable

---

## Phase 5: User Story 3 - Search Tasks by Content (Priority: P2)

**Goal**: Enable users to search tasks by title and description with case-insensitive partial matching

**Independent Test**: Create task "Buy groceries" with description "milk and eggs" → search "groc" → verify task found → search "MILK" (uppercase) → verify task found (case-insensitive) → search "nonexistent" → verify empty results with helpful message

### Backend Search Implementation for User Story 3

- [X] T052 [P] [US3] Implement ILIKE search across title and description fields in GET /api/todos endpoint
- [X] T053 [US3] Use SQLAlchemy or_() and ilike() for case-insensitive search across title and description
- [X] T054 [US3] Add search parameter to GET /api/todos endpoint in backend/app/routers/todos.py (?search=keyword)
- [X] T055 [US3] Integrate search filter into todo query builder with case-insensitive matching
- [X] T056 [US3] Order search results by relevance using case(): exact match (1), starts with (2), contains in title (3), contains in description (4)

### Frontend Search Implementation for User Story 3

- [X] T057 [P] [US3] Create SearchBar component in components/dashboard/SearchBar.tsx with text input and search icon
- [X] T058 [P] [US3] Add clear button (×) to SearchBar to reset search with Esc key support
- [X] T059 [US3] Implement 500ms debounce in SearchBar component to prevent excessive API calls
- [X] T060 [US3] Add loading indicator to SearchBar while search is in progress (animated spinner)
- [X] T061 [US3] Integrate SearchBar into dashboard page between stats and filter controls
- [X] T062 [US3] Update useTodos hook in hooks/useTodos.ts to support search parameter
- [X] T063 [US3] Display "No todos found" message when search returns empty results with clear filters button

**Checkpoint**: Users can search tasks by keyword with instant results, case-insensitive matching - User Story 3 complete and independently testable

---

## Phase 6: User Story 4 - Filter and Sort Task Lists (Priority: P2)

**Goal**: Enable users to filter tasks by status and combine multiple filters with sorting

**Independent Test**: Create 10 tasks with mixed status/priority → filter by status=pending → verify only pending tasks shown → add priority=high filter → verify only pending AND high priority tasks shown → sort by created_at desc → verify newest first

### Backend Filter/Sort Implementation for User Story 4

- [X] T064-T068 [P] [US4] Filters and sorting already implemented in GET /api/todos endpoint (status, priority already existed)
- [X] T069 [US4] Status filter parameter already exists in GET /api/todos (?status=pending)
- [X] T070 [US4] Add due_range filter to GET /api/todos (?due_range=overdue|today|this_week) - Implemented with date calculations
- [X] T071 [US4] All filters work together in GET /api/todos endpoint

### Frontend Filter/Sort Implementation for User Story 4

- [X] T072 [P] [US4] FilterSortControls component already exists with status checkboxes
- [X] T073 [P] [US4] "Clear all filters" button already exists in FilterSortControls
- [X] T074 [P] [US4] Sort controls already integrated in FilterSortControls component
- [X] T075 [US4] Added due date range filter to FilterSortControls (Overdue, Today, This Week, All buttons)
- [X] T076 [US4] FilterSortControls already integrated into dashboard page
- [X] T077 [US4] Sort controls already integrated in FilterSortControls
- [X] T078 [US4] useTodos hook supports all filters: status, priority, tags, search, due_range, sort_by, sort_order
- [X] T079 [US4] Loading states exist during filter changes

**Checkpoint**: Users can combine multiple filters with AND logic, sort by any field, clear filters - User Story 4 complete and independently testable

---

## Phase 7: User Story 5 - Set Due Dates for Deadlines (Priority: P3)

**Goal**: Enable users to assign due dates to tasks and identify overdue tasks

**Independent Test**: Create task with due_date="2026-02-15" → verify saves correctly → create task with past due date → verify shows as overdue → filter by overdue tasks → verify only overdue incomplete tasks shown → sort by due_date ascending → verify nearest deadlines first

### Backend Due Date Implementation for User Story 5

- [X] T080 [P] [US5] due_date field validation already exists in TodoCreate/TodoUpdate schemas (optional datetime)
- [X] T081 [P] [US5] Overdue calculation implemented in TodoResponse model_serializer
- [X] T082 [US5] overdue field computed and returned in TodoResponse schema
- [X] T083 [US5] due_range filter implemented in GET /api/todos for overdue, today, this_week
- [X] T084 [US5] GET /api/todos computes and returns overdue status for each todo

### Frontend Due Date Implementation for User Story 5

- [X] T085 [P] [US5] Created DatePicker component in components/dashboard/DatePicker.tsx with native date input
- [X] T086 [P] [US5] Clear button (×) added to DatePicker
- [X] T087 [P] [US5] Overdue indicator integrated into TodoCard with red styling (⚠️)
- [X] T088 [US5] DatePicker integrated into AddTodoModal and EditTodoModal
- [X] T089 [US5] TodoCard displays due date with formatting (e.g., "Due: Feb 15, 2026")
- [X] T090 [US5] Overdue warning displayed in TodoCard when task.overdue === true
- [X] T091 [US5] Todo TypeScript interface includes due_date and overdue fields

**Checkpoint**: Users can set due dates, see overdue indicators, filter by overdue tasks - User Story 5 complete and independently testable

---

## Phase 8: User Story 6 - Create Recurring Tasks (Priority: P3)

**Goal**: Enable users to create recurring tasks (daily, weekly, monthly) that automatically generate next instance on completion

**Independent Test**: Create daily recurring task with due_date=today → complete task → verify new task created with due_date=tomorrow, status=pending, same title/priority/tags → complete again → verify another instance created → edit to remove recurrence_rule → complete → verify no new instance created

### Backend Recurring Task Implementation for User Story 6

- [X] T092 [P] [US6] Created calculate_next_due_date() in backend/app/services/recurring.py using python-dateutil.relativedelta
- [X] T093 [P] [US6] Implemented daily recurrence: current_due + relativedelta(days=1)
- [X] T094 [P] [US6] Implemented weekly recurrence: current_due + relativedelta(weeks=1)
- [X] T095 [P] [US6] Implemented monthly recurrence with edge case handling (Jan 31 → Feb 28)
- [X] T096 [US6] Created create_next_instance() function in recurring.py
- [X] T097 [US6] Implemented field copying: title, description, priority, recurrence_rule, tags
- [X] T098 [US6] Set recurrence_parent_id to original task ID in new instance
- [X] T099 [US6] Created PATCH /api/todos/:id/complete endpoint
- [X] T100 [US6] Integrated create_next_instance() into complete endpoint
- [X] T101 [US6] Returns RecurringTaskCompleteResponse with completed_task and next_task
- [X] T102 [US6] recurrence_rule validation exists in TodoCreate/TodoUpdate schemas (RecurrenceRule enum)

### Frontend Recurring Task Implementation for User Story 6

- [X] T103 [P] [US6] Created RecurrenceSelector in components/dashboard/RecurrenceSelector.tsx (None, Daily, Weekly, Monthly)
- [X] T104 [P] [US6] RecurrenceSelector only shows if due_date is set (hasDueDate prop)
- [X] T105 [US6] Integrated RecurrenceSelector into AddTodoModal and EditTodoModal
- [X] T106 [US6] Added recurrence indicator to TodoCard (circular arrows icon, purple badge)
- [X] T107 [US6] Updated useTodos to call PATCH /api/todos/:id/complete for recurring tasks
- [X] T108 [US6] Handle complete response: adds next_task to todo list when returned
- [X] T109 [US6] Success notification: "Todo completed! 🎉 Next instance created for [date]"

**Checkpoint**: Users can create recurring tasks, complete them to generate next instance automatically - User Story 6 complete and independently testable

---

## Phase 9: User Story 7 - Set Reminders for Tasks (Priority: P4)

**Goal**: Enable users to set reminder times for tasks (data modeling only, no actual notifications)

**Independent Test**: Create task with due_date and reminder_at="2026-02-15T09:00:00Z" → verify saves correctly → call GET /api/tasks/reminders/pending → verify task returned if reminder_at has passed and task incomplete → complete task → verify task no longer in pending reminders

### Backend Reminder Implementation for User Story 7

- [X] T110 [P] [US7] reminder_at field validation exists in TodoCreate/TodoUpdate schemas (optional datetime)
- [X] T111 [P] [US7] Business rule validation: reminder_at requires due_date (@field_validator in TodoCreate schema)
- [X] T112 [US7] Created GET /api/todos/reminders/pending endpoint
- [X] T113 [US7] Pending reminders query: WHERE reminder_at <= NOW() AND status != 'completed' AND user_id = current_user
- [X] T114 [US7] Ordered by reminder_at ascending (earliest first)

### Frontend Reminder Implementation for User Story 7

- [X] T115 [P] [US7] DatePicker supports time selection (showTime prop for datetime-local input)
- [X] T116 [P] [US7] Reminder field only shows when due_date is set (conditional rendering)
- [X] T117 [US7] Reminder displayed in TodoCard with bell icon (amber badge)
- [X] T118 [US7] Reminder times displayed in user's local timezone via toLocaleString()
- [X] T119 [US7] Todo TypeScript interface includes reminder_at field

**Checkpoint**: Users can set reminder times on tasks, API returns pending reminders - User Story 7 complete and independently testable (notification delivery out of scope)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality assurance

- [X] T120 [P] All components use responsive design with Tailwind CSS (mobile, tablet, desktop)
- [X] T121 [P] Loading states implemented (spinner in SearchBar, isLoading state in dashboard)
- [X] T122 [P] Framer Motion animations throughout (filters, modals, cards, buttons)
- [N/A] T123 [P] Pagination: Current limit=1000 sufficient for MVP (can add later if needed)
- [X] T124 Error handling with toast notifications for all API calls (via react-hot-toast)
- [X] T125 Success notifications: "Todo created!", "Todo completed! 🎉", "Tag deleted", etc.
- [X] T126 Database optimization: indexes on tags.name_lower, todos.user_id, selectinload for tags
- [X] T127 Keyboard shortcuts: Enter submits forms, Esc clears search
- [X] T128 JWT authentication on all /todos and /tags endpoints, user_id filtering on all queries
- [X] T129 Input validation via Pydantic schemas, parameterized queries prevent SQL injection
- [X] T130 API endpoints documented with FastAPI docstrings (visible in /docs)
- [N/A] T131 README update (can be done separately)
- [X] T132 [P] Code comments added to recurring.py, tags.py, todos.py for complex logic
- [N/A] T133 Manual QA (user can test)
- [X] T134 Performance: Search uses ILIKE with indexes, filters optimized with proper joins
- [X] T135 Browser compatibility: Uses standard React/Next.js (works in all modern browsers)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed) or sequentially in priority order
  - **US1 Priority (P1)** - MVP, highest priority
  - **US2 Tags (P1)** - High priority, can start in parallel with US1
  - **US3 Search (P2)** - Medium priority
  - **US4 Filter/Sort (P2)** - Medium priority
  - **US5 Due Dates (P3)** - Lower priority, needed for US6
  - **US6 Recurring (P3)** - Lower priority, depends on US5
  - **US7 Reminders (P4)** - Lowest priority
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 Priority**: Independent - Can start after Foundational
- **US2 Tags**: Independent - Can start after Foundational (parallel with US1)
- **US3 Search**: Independent - Can start after Foundational
- **US4 Filter/Sort**: Builds on US1 filters - Should start after US1 complete
- **US5 Due Dates**: Independent - Can start after Foundational
- **US6 Recurring**: **DEPENDS ON US5** - Requires due_date field from US5
- **US7 Reminders**: **DEPENDS ON US5** - Requires due_date field from US5

### Within Each User Story

- Backend before Frontend (API must exist before UI can call it)
- Models before Services (services use models)
- Services before Endpoints (endpoints use services)
- Components before Integration (build components, then integrate)

### Parallel Opportunities

**Phase 1 - All tasks can run in parallel** (T001-T003):
- Installing different dependencies simultaneously

**Phase 2 - Parallel groups**:
- Group 1 (T006-T009): Creating enums and new models (different files)
- Group 2 (T012-T015): Creating Pydantic schemas (different files)

**User Story Backend/Frontend Split**:
- Within each story, backend tasks can run in parallel with frontend tasks once models are ready
- Example US1: T017-T022 (backend) can overlap with T023-T025 (frontend components)

**Across Stories** (after Foundational):
- US1 and US2 can run completely in parallel (different features, different files)
- US3 can run in parallel with US1/US2
- US5 and US7 can run in parallel (US7 just adds validation requiring US5's due_date)

---

## Parallel Example: User Story 1

```bash
# Backend API tasks can run in parallel (different endpoints):
Task T017 [P]: "Update POST /api/tasks endpoint"
Task T018 [P]: "Update GET /api/tasks/:id endpoint"
Task T019 [P]: "Update PUT /api/tasks/:id endpoint"

# Frontend component tasks can run in parallel (different files):
Task T023 [P]: "Create PrioritySelector component"
Task T024 [P]: "Add priority color indicators"
Task T025 [P]: "Extend Task TypeScript interface"

# Backend and Frontend can work simultaneously:
Backend Team: Tasks T017-T022
Frontend Team: Tasks T023-T030
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

**Rationale**: US1 (Priority) + US2 (Tags) provide the most value as core organizational features

1. Complete Phase 1: Setup (T001-T003) - 1-2 hours
2. Complete Phase 2: Foundational (T004-T016) - 8-12 hours
3. Complete Phase 3: User Story 1 - Priority (T017-T030) - 12-16 hours
4. Complete Phase 4: User Story 2 - Tags (T031-T051) - 16-20 hours
5. **STOP and VALIDATE**: Test priority and tags independently
6. Deploy MVP with priority and tags features

**MVP Total Estimate**: 37-50 hours (1-1.5 weeks)

### Incremental Delivery

1. **Foundation** (Phase 1-2) → Database ready, models extended
2. **MVP** (Phase 3-4) → Priority + Tags → Deploy/Demo
3. **Search & Filter** (Phase 5-6) → Add US3, US4 → Deploy/Demo
4. **Advanced** (Phase 7-9) → Add US5, US6, US7 → Deploy/Demo
5. **Polish** (Phase 10) → Final quality improvements → Production release

Each delivery adds value without breaking previous features.

### Parallel Team Strategy

With 2-3 developers:

1. **Week 1**: Team completes Setup + Foundational together (Phase 1-2)
2. **Week 2** (after Foundational complete):
   - Developer A: User Story 1 (Priority)
   - Developer B: User Story 2 (Tags)
   - Developer C: User Story 3 (Search)
3. **Week 3**:
   - Developer A: User Story 4 (Filter/Sort)
   - Developer B: User Story 5 (Due Dates)
   - Developer C: Polish Phase 10 tasks
4. **Week 4**:
   - Developer A: User Story 6 (Recurring)
   - Developer B: User Story 7 (Reminders)
   - Developer C: Testing and QA

Stories complete and integrate independently without conflicts.

---

## Task Summary

**Total Tasks**: 135 tasks across 10 phases

**Task Breakdown by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 13 tasks ⚠️ BLOCKING
- Phase 3 (US1 - Priority): 14 tasks 🎯 MVP
- Phase 4 (US2 - Tags): 21 tasks 🎯 MVP
- Phase 5 (US3 - Search): 12 tasks
- Phase 6 (US4 - Filter/Sort): 16 tasks
- Phase 7 (US5 - Due Dates): 12 tasks
- Phase 8 (US6 - Recurring): 18 tasks
- Phase 9 (US7 - Reminders): 10 tasks
- Phase 10 (Polish): 16 tasks

**Parallel Opportunities**: 47 tasks marked [P] can run in parallel with other tasks

**Independent Stories**: US1, US2, US3, US5 can be implemented independently after Foundational
**Dependent Stories**: US4 builds on US1, US6 depends on US5, US7 depends on US5

**Suggested MVP Scope**: Phase 1-4 (US1 + US2) = 51 tasks, ~37-50 hours

---

## Notes

- All tasks include exact file paths for implementation
- [P] marker indicates tasks that can run in parallel (different files, no dependencies)
- [US#] label maps each task to its user story for traceability
- Each user story is independently completable and testable
- No test tasks included (not requested in specification)
- Constitution compliance: All endpoints require JWT auth, all queries filter by user_id
- Security: Pydantic validation on all inputs, SQLModel prevents SQL injection
- Performance: Indexes on all filtered fields, subqueryload for tags to avoid N+1
- Commit after each task or logical group for incremental progress
- Stop at any checkpoint to validate story independently before proceeding

---

**Ready for Implementation**: Start with Phase 1 (Setup) → Phase 2 (Foundational) → MVP (US1 + US2)
