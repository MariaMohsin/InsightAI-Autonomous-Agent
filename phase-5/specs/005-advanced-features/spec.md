# Feature Specification: Advanced Task Management Features

**Feature Branch**: `005-advanced-features`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Intermediate and Advanced Task Features: priorities, tags, search, filter, sort, due dates, recurring tasks, and reminders (frontend and backend only, no microservices)"

## Scope Constraints

**IN SCOPE**: Frontend (Next.js) and Backend (FastAPI) application-level features only
**OUT OF SCOPE**: Kafka, Dapr, Kubernetes, microservices, background workers, real-time sync, cloud deployment

## User Scenarios & Testing

### User Story 1 - Organize Tasks by Priority (Priority: P1)

As a user managing multiple tasks, I need to assign priority levels to tasks so I can focus on what's most important first.

**Why this priority**: Priority management is fundamental to task organization. Users need this to distinguish urgent from non-urgent work. This is the foundation for effective task management.

**Independent Test**: Can be fully tested by creating tasks with different priorities and verifying they can be filtered and sorted by priority level. Delivers immediate value by allowing users to identify high-priority work.

**Acceptance Scenarios**:

1. **Given** I am creating a new task, **When** I set the priority to "high", **Then** the task is saved with high priority
2. **Given** I have existing tasks with mixed priorities, **When** I filter by "high" priority, **Then** only high-priority tasks are displayed
3. **Given** I have multiple tasks, **When** I sort by priority descending, **Then** tasks are ordered: high, medium, low
4. **Given** I am editing a task, **When** I change priority from "low" to "high", **Then** the updated priority is saved and displayed

---

### User Story 2 - Categorize Tasks with Tags (Priority: P1)

As a user working on different projects, I need to tag tasks with multiple labels so I can organize and find related tasks easily.

**Why this priority**: Tags provide flexible categorization that priority alone cannot provide. Users can group tasks by project, context, or any custom criteria. Essential for users managing diverse responsibilities.

**Independent Test**: Can be fully tested by creating tags, assigning them to tasks, and filtering tasks by tags. Delivers immediate value by enabling multi-dimensional task organization.

**Acceptance Scenarios**:

1. **Given** I am creating a new task, **When** I add tags "work" and "urgent", **Then** the task is saved with both tags
2. **Given** I have tasks tagged with "personal", **When** I filter by "personal" tag, **Then** only tasks with that tag are displayed
3. **Given** I have a task with tag "project-a", **When** I remove the tag, **Then** the tag is no longer associated with the task
4. **Given** I have created a tag "urgent", **When** I reuse it on another task, **Then** the same tag entity is applied to both tasks (no duplicates)
5. **Given** I have tasks with multiple tags, **When** I filter by two tags simultaneously, **Then** only tasks containing both tags are shown

---

### User Story 3 - Search Tasks by Content (Priority: P2)

As a user with many tasks, I need to search tasks by title and description so I can quickly find specific tasks without scrolling through long lists.

**Why this priority**: As task lists grow, manual browsing becomes inefficient. Search enables instant access to specific tasks regardless of list size. P2 because users can still manage tasks without search initially.

**Independent Test**: Can be fully tested by creating tasks with specific keywords and verifying search returns correct results. Delivers immediate value by reducing time to find tasks.

**Acceptance Scenarios**:

1. **Given** I have a task titled "Buy groceries", **When** I search for "groceries", **Then** that task appears in search results
2. **Given** I have a task with description containing "urgent client meeting", **When** I search for "client", **Then** that task appears in results
3. **Given** I have a task titled "FINISH REPORT", **When** I search for "finish report" (lowercase), **Then** the task is found (case-insensitive)
4. **Given** I search for "nonexistent keyword", **When** no tasks match, **Then** an empty result set is returned with helpful message
5. **Given** I have 50 tasks and search for a keyword appearing in 3 tasks, **When** I execute the search, **Then** only those 3 tasks are returned

---

### User Story 4 - Filter and Sort Task Lists (Priority: P2)

As a user managing a large task list, I need to filter by status and sort by date/priority so I can view tasks in the most useful order for my current workflow.

**Why this priority**: Filtering and sorting transform a chaotic list into an actionable view. Users can focus on incomplete tasks, sort by urgency, or review what was completed. P2 because basic CRUD works without these.

**Independent Test**: Can be fully tested by creating diverse tasks and verifying filters and sorts produce expected results. Delivers value by making large task lists manageable.

**Acceptance Scenarios**:

1. **Given** I have tasks in "pending" and "completed" status, **When** I filter by "pending", **Then** only incomplete tasks are shown
2. **Given** I have tasks created on different dates, **When** I sort by "created date descending", **Then** newest tasks appear first
3. **Given** I have tasks with varying priorities, **When** I sort by "priority ascending", **Then** tasks are ordered: low, medium, high
4. **Given** I filter by "high priority" and "work" tag, **When** I apply both filters, **Then** only tasks matching both criteria are displayed (AND logic)
5. **Given** I have tasks with due dates, **When** I sort by "due date ascending", **Then** tasks with nearest due dates appear first, followed by tasks with no due date

---

### User Story 5 - Set Due Dates for Deadlines (Priority: P3)

As a user with time-sensitive tasks, I need to assign due dates so I can track deadlines and plan my schedule.

**Why this priority**: Due dates add temporal context to tasks. Critical for deadline-driven work. P3 because users can still note deadlines in task descriptions if needed temporarily.

**Independent Test**: Can be fully tested by setting due dates on tasks and verifying they are stored and displayed correctly. Delivers value by making deadlines explicit and sortable.

**Acceptance Scenarios**:

1. **Given** I am creating a task, **When** I set a due date of "2026-02-15", **Then** the task is saved with that due date
2. **Given** I have a task with no due date, **When** I edit it to add a due date, **Then** the due date is saved
3. **Given** I have a task with a due date, **When** I remove the due date, **Then** the task has no due date (optional field)
4. **Given** I have tasks with various due dates, **When** I view my task list, **Then** each task displays its due date clearly
5. **Given** I have tasks with due dates in the past, **When** I view them, **Then** overdue tasks are visually distinguished (e.g., red text indicator)

---

### User Story 6 - Create Recurring Tasks (Priority: P3)

As a user with repetitive responsibilities, I need to set tasks to recur daily, weekly, or monthly so I don't have to manually recreate the same task repeatedly.

**Why this priority**: Recurring tasks save time for routine work (daily standup notes, weekly reports, monthly bills). P3 because users can manually recreate tasks as a workaround initially.

**Independent Test**: Can be fully tested by creating a recurring task, marking it complete, and verifying a new instance is automatically created. Delivers value by automating repetitive task creation.

**Acceptance Scenarios**:

1. **Given** I create a task with recurrence rule "daily", **When** I mark it as complete, **Then** a new task with the same details is created for the next day
2. **Given** I create a task with recurrence rule "weekly", **When** I mark it as complete on Tuesday, **Then** a new task is created for next Tuesday
3. **Given** I create a task with recurrence rule "monthly", **When** I mark it as complete on the 15th, **Then** a new task is created for the 15th of next month
4. **Given** I have a recurring task, **When** the new instance is created, **Then** it copies title, description, priority, tags, and recurrence rule (but gets new due date)
5. **Given** I mark a recurring task as complete, **When** the next instance is created, **Then** the original task remains in completed state and the new task is in pending status
6. **Given** I edit a recurring task to remove recurrence rule, **When** I complete it, **Then** no new instance is created (recurrence stopped)

---

### User Story 7 - Set Reminders for Tasks (Priority: P4)

As a user who might forget important tasks, I need to set reminder times so I can be notified when tasks are approaching their due dates.

**Why this priority**: Reminders provide proactive notification for time-sensitive work. P4 because this spec only covers data modeling and APIs - actual notifications are out of scope (no background workers yet).

**Independent Test**: Can be fully tested by setting reminder times on tasks and verifying the API correctly returns tasks needing reminders. Delivers foundational value by preparing for future notification features.

**Acceptance Scenarios**:

1. **Given** I create a task with due date "2026-02-15 10:00", **When** I set reminder time to "2026-02-15 09:00", **Then** the reminder time is saved
2. **Given** I have tasks with various reminder times, **When** I call the "get pending reminders" API endpoint, **Then** it returns tasks whose reminder time has passed but are not yet complete
3. **Given** I have a task with a reminder set for tomorrow, **When** I view the task, **Then** the reminder time is displayed
4. **Given** I have a task with a reminder, **When** I complete the task, **Then** the task no longer appears in "pending reminders" results
5. **Given** I have a task with a reminder, **When** I edit to remove the reminder time, **Then** the task has no reminder (optional field)

---

### Edge Cases

- **Empty search query**: When user searches with empty string, should return all tasks (or show validation message)
- **Filter with no matches**: When applying filters that match zero tasks, show empty state with clear message "No tasks match your filters"
- **Sort with null values**: When sorting by due date and some tasks have no due date, nulls should appear last in ascending order, first in descending order
- **Tag case sensitivity**: Should "Work" and "work" be treated as the same tag? (Answer: Yes, tags are case-insensitive and normalized to lowercase)
- **Recurring task edge cases**:
  - Completing a recurring task on the last day of a month (e.g., January 31) with monthly recurrence - what date for February? (Answer: Use the last valid day of the month, e.g., February 28)
  - User creates daily recurring task and completes it multiple times in one day - should each completion create a new instance? (Answer: No, only one next instance should be created per completion, dated for the next occurrence)
- **Priority with recurring tasks**: When a recurring task generates the next instance, should the priority carry over? (Answer: Yes, priority is copied to new instance)
- **Multiple tags with same name**: System prevents duplicate tag entities - if "urgent" tag already exists, reuse it rather than create duplicate
- **Reminder without due date**: Can user set reminder time without due date? (Answer: No, reminder requires due date to provide context)
- **Task completion with past due date**: Completing an overdue task - should it be flagged differently? (Answer: Yes, track completion but note it was overdue for analytics)

## Requirements

### Functional Requirements

#### Core Data Management

- **FR-001**: System MUST allow users to assign priority to tasks with exactly three levels: "low", "medium", "high"
- **FR-002**: System MUST store task priority in the database and return it in all API responses
- **FR-003**: System MUST allow users to create tags with unique names (case-insensitive)
- **FR-004**: System MUST allow users to assign multiple tags to a single task
- **FR-005**: System MUST allow users to remove tags from tasks without deleting the tag entity
- **FR-006**: System MUST reuse existing tag entities when assigning tags by name (prevent duplicates)
- **FR-007**: System MUST store due dates as optional fields on tasks (nullable)
- **FR-008**: System MUST store reminder times as optional fields on tasks (nullable)
- **FR-009**: System MUST store recurrence rules as optional fields with values: null, "daily", "weekly", "monthly"
- **FR-010**: System MUST track the parent-child relationship for recurring tasks via recurrence_parent_id field

#### Search Functionality

- **FR-011**: System MUST provide backend-powered search across task title and description fields
- **FR-012**: Search MUST be case-insensitive
- **FR-013**: Search MUST support partial word matching (e.g., "groc" matches "groceries")
- **FR-014**: Search MUST return results ordered by relevance (exact title matches first, then description matches)

#### Filter Functionality

- **FR-015**: System MUST allow filtering tasks by completion status ("pending", "in_progress", "completed")
- **FR-016**: System MUST allow filtering tasks by priority level
- **FR-017**: System MUST allow filtering tasks by tag (single tag or multiple tags)
- **FR-018**: System MUST support combining multiple filters with AND logic (e.g., "high priority AND work tag AND pending status")
- **FR-019**: System MUST allow filtering tasks by due date ranges (e.g., "due this week", "overdue")

#### Sort Functionality

- **FR-020**: System MUST allow sorting tasks by created_at (ascending or descending)
- **FR-021**: System MUST allow sorting tasks by due_date (ascending or descending, nulls last/first)
- **FR-022**: System MUST allow sorting tasks by priority (ascending: low→medium→high, or descending: high→medium→low)
- **FR-023**: System MUST allow combining sort and filter operations

#### Recurring Tasks

- **FR-024**: System MUST automatically create the next task instance when a recurring task is marked complete
- **FR-025**: When creating next instance for "daily" recurrence, due date MUST be set to current_date + 1 day
- **FR-026**: When creating next instance for "weekly" recurrence, due date MUST be set to current_date + 7 days
- **FR-027**: When creating next instance for "monthly" recurrence, due date MUST be set to same day of next month (or last valid day if original date doesn't exist in next month)
- **FR-028**: Next instance MUST copy title, description, priority, tags, and recurrence rule from original task
- **FR-029**: Next instance MUST be created in "pending" status
- **FR-030**: Next instance MUST reference original task via recurrence_parent_id
- **FR-031**: Recurring task logic MUST execute synchronously (no background workers or async processing in this phase)

#### Reminders

- **FR-032**: System MUST provide an API endpoint to fetch tasks with pending reminders
- **FR-033**: A reminder is "pending" if: reminder_at time has passed AND task is not completed
- **FR-034**: Reminder times MUST be stored in UTC and converted to user's timezone in frontend
- **FR-035**: System MUST NOT send notifications (no email, SMS, or push) - this is data modeling only

#### API Standards

- **FR-036**: All task CRUD endpoints MUST accept and return priority, tags, due_date, reminder_at, recurrence_rule, and recurrence_parent_id fields
- **FR-037**: GET /api/tasks MUST support query parameters: search, status, priority, tag, sort_by, sort_order
- **FR-038**: POST /api/tasks MUST validate priority is one of: "low", "medium", "high"
- **FR-039**: POST /api/tasks MUST validate recurrence_rule is one of: null, "daily", "weekly", "monthly"
- **FR-040**: PUT /api/tasks/:id MUST allow updating priority, tags, due_date, reminder_at, and recurrence_rule independently
- **FR-041**: PATCH /api/tasks/:id/complete MUST trigger recurring task creation if recurrence_rule is set
- **FR-042**: GET /api/tasks/reminders/pending MUST return tasks where reminder_at ≤ now() AND status != 'completed'

### Key Entities

- **Task**: Represents a todo item with title, description, status, priority, due_date, reminder_at, recurrence_rule, and timestamps. Can be associated with multiple tags.
- **Tag**: Reusable label with unique name. Many-to-many relationship with tasks.
- **TaskTag** (junction table): Links tasks to tags for many-to-many relationship.
- **User**: Task owner (from existing authentication system). One-to-many relationship with tasks and tags.

### Database Relationships

- One user has many tasks (existing)
- One user has many tags (user-scoped tags)
- One task has many tags (via TaskTag junction table)
- One tag is used by many tasks
- One recurring task (parent) generates many child instances (via recurrence_parent_id foreign key)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can assign priority to tasks and filter/sort by priority in under 5 seconds
- **SC-002**: Users can create and assign tags to tasks, with tag suggestions appearing as they type (sub-second response)
- **SC-003**: Search returns relevant results in under 1 second for task lists up to 1,000 tasks
- **SC-004**: Users can apply multiple filters simultaneously (e.g., "high priority + work tag + pending status") and see results instantly
- **SC-005**: Sorting tasks by any field (created date, due date, priority) produces correctly ordered results
- **SC-006**: Users can set due dates and the system correctly identifies overdue tasks
- **SC-007**: Marking a recurring task as complete automatically creates the next instance within 2 seconds
- **SC-008**: Next recurring task instance correctly calculates due date for daily, weekly, and monthly recurrence rules
- **SC-009**: API endpoint for pending reminders returns accurate results (only tasks with passed reminder times that are incomplete)
- **SC-010**: 95% of users successfully create a recurring task and observe automatic next instance creation on first attempt

### User Experience Goals

- **SC-011**: Users report that task organization (priority + tags) significantly improves their workflow efficiency
- **SC-012**: Search feature reduces time spent manually browsing task lists by at least 50%
- **SC-013**: Users with recurring responsibilities (dailies, weeklies) report saving significant time by not manually recreating tasks

## Assumptions

1. **User Authentication**: Existing Better Auth JWT authentication is functional and provides user context for all API requests
2. **Database**: PostgreSQL (Neon or local) is available and supports required schema extensions
3. **Timezone Handling**: Backend stores all timestamps in UTC; frontend handles timezone conversion
4. **Tag Naming**: Tag names are case-insensitive and normalized to lowercase before storage (e.g., "Work" becomes "work")
5. **Recurring Task Limits**: No maximum limit on number of recurring task instances (business rule: users are responsible for managing their own recurring tasks)
6. **Search Performance**: For phase 1, simple SQL LIKE queries are acceptable; full-text search optimization is future work
7. **UI Framework**: Existing Next.js + Tailwind CSS setup is sufficient for new UI components
8. **No Real-time Sync**: Changes to tasks are reflected on page reload or manual refresh; WebSocket sync is future work (Phase V microservices)
9. **No Background Processing**: All recurring task creation happens synchronously when user marks task complete; background workers and event-driven architecture are future work (Phase V)

## Technical Constraints (Non-Functional)

- **TC-001**: All features MUST be implemented within existing Next.js frontend and FastAPI backend (no new microservices)
- **TC-002**: All features MUST work without Kafka, Dapr, or any message broker
- **TC-003**: Recurring task creation MUST be synchronous (no background workers or schedulers)
- **TC-004**: No real-time sync or WebSocket connections
- **TC-005**: All database changes MUST use SQLModel ORM (no raw SQL)
- **TC-006**: All APIs MUST follow RESTful conventions
- **TC-007**: All new database fields MUST have proper indexes for performance
- **TC-008**: Frontend components MUST be responsive (mobile, tablet, desktop)
- **TC-009**: No email, SMS, or push notification integrations (reminders are data-only)
- **TC-010**: Solution MUST work locally without cloud services (beyond existing Neon database)

## Out of Scope (Explicitly Excluded)

1. **Infrastructure**:
   - Kafka or any message broker
   - Dapr runtime or components
   - Kubernetes or any container orchestration
   - Docker containerization
   - Cloud deployment (AWS, GCP, Azure)

2. **Background Processing**:
   - Cron jobs or scheduled tasks
   - Background workers (Celery, RQ, etc.)
   - Async task queues
   - Event-driven architecture

3. **Real-time Features**:
   - WebSocket connections
   - Server-sent events
   - Real-time task sync across devices
   - Collaborative editing

4. **Notification Delivery**:
   - Email notifications
   - SMS notifications
   - Push notifications
   - In-app notification UI

5. **Advanced Features** (Future Phases):
   - AI-powered task suggestions
   - Natural language task creation (chatbot)
   - Task dependencies and subtasks
   - Team collaboration and task assignment
   - Calendar integration
   - Third-party integrations (Google Tasks, Todoist, etc.)

6. **Microservices Decomposition**:
   - Splitting into separate services
   - Service-to-service communication
   - Distributed tracing
   - Service mesh

## Dependencies

- **Existing Systems**: Better Auth JWT authentication (provides user context)
- **Database**: Neon Serverless PostgreSQL or local PostgreSQL instance
- **ORM**: SQLModel for database interactions
- **Frontend**: Next.js 16+ with App Router, TypeScript, Tailwind CSS
- **Backend**: FastAPI with Pydantic validation

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Synchronous recurring task creation causes slow API response | Medium | Keep creation logic simple; optimize database writes; consider async in Phase V |
| Search performance degrades with large task lists (10K+ tasks) | Medium | Add database indexes on title and description; implement pagination; full-text search in future |
| Tag management becomes complex with hundreds of tags | Low | Implement tag autocomplete; add tag usage count; tag cleanup tools in future |
| Users create recursive recurring tasks (daily task that creates daily task forever) | Low | No mitigation needed - business logic is correct; users manage their own tasks |
| Due date edge cases (month-end, leap years) | Low | Use standard date library functions (Python datetime); test edge cases thoroughly |

## Next Steps

After specification approval:

1. Run `/speckit.plan` to generate implementation plan
2. Create database migration for new schema fields (priority, tags, due_date, reminder_at, recurrence_rule, recurrence_parent_id)
3. Implement backend APIs with Pydantic schemas
4. Create frontend UI components (priority dropdown, tag input, date picker, recurrence selector, search bar, filter/sort controls)
5. Write integration tests for all user scenarios
6. Perform manual QA testing for edge cases
