# Tasks: Frontend Application & Full-Stack Integration

**Input**: Design documents from `/specs/003-todo-frontend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contract.md

**Tests**: Tests are OPTIONAL for this feature. No test tasks included per spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to `frontend/` directory (new directory to be created):
- `frontend/app/` - Next.js App Router pages
- `frontend/components/` - React components
- `frontend/lib/` - Utility functions and API clients
- `frontend/types/` - TypeScript type definitions
- `frontend/hooks/` - Custom React hooks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Next.js configuration

- [x] T001 Create Next.js 16+ project with TypeScript in frontend/ directory using App Router
- [x] T002 Configure Tailwind CSS 4.x in frontend/tailwind.config.js
- [x] T003 [P] Install dependencies: axios, better-auth, react-hook-form, @hookform/resolvers, zod, react-hot-toast
- [x] T004 [P] Create environment configuration files: frontend/.env.local and frontend/.env.example
- [x] T005 [P] Configure TypeScript in frontend/tsconfig.json with path aliases (@/*)
- [x] T006 Create project directory structure: app/, components/, lib/, types/, hooks/, styles/
- [x] T007 [P] Setup Tailwind global styles in frontend/styles/globals.css
- [x] T008 [P] Configure next.config.js for API proxy and environment variables

**Checkpoint**: ✅ Frontend project initialized with all dependencies and configuration ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API client and type definitions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create TypeScript type definitions in frontend/types/auth.ts (User, AuthResponse, LoginCredentials, SignupCredentials)
- [x] T010 [P] Create TypeScript type definitions in frontend/types/todo.ts (Todo, CreateTodoDTO, UpdateTodoDTO)
- [x] T011 Create Axios API client with interceptors in frontend/lib/api/client.ts (base URL, token injection, error handling)
- [x] T012 [P] Create Zod validation schemas in frontend/lib/utils/validators.ts (signupSchema, loginSchema, todoSchema)
- [x] T013 [P] Create base UI components: frontend/components/ui/Button.tsx
- [x] T014 [P] Create base UI components: frontend/components/ui/Input.tsx
- [x] T015 [P] Create base UI components: frontend/components/ui/Modal.tsx
- [x] T016 Setup toast notification system using react-hot-toast in frontend/app/layout.tsx

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication Flow (Priority: P1) 🎯 MVP

**Goal**: Enable users to sign up, log in, and log out with JWT authentication

**Independent Test**: Create a new account, log in with valid credentials, verify access to dashboard, log out and verify redirect to login

### Implementation for User Story 1

- [x] T017 [P] [US1] Create Better Auth configuration in frontend/lib/auth/better-auth.ts (Simplified approach - using manual JWT)
- [x] T018 [P] [US1] Create auth utility functions in frontend/lib/auth/utils.ts (setAuthToken, getAuthToken, clearAuthToken)
- [x] T019 [P] [US1] Create auth API service in frontend/lib/api/auth.ts (signup, login functions)
- [x] T020 [US1] Create AuthProvider context component in frontend/components/auth/AuthProvider.tsx
- [x] T021 [US1] Create useAuth custom hook in frontend/hooks/useAuth.ts
- [x] T022 [US1] Create root layout with AuthProvider in frontend/app/layout.tsx
- [x] T023 [P] [US1] Create signup page in frontend/app/(auth)/signup/page.tsx with form validation
- [x] T024 [P] [US1] Create login page in frontend/app/(auth)/login/page.tsx with form validation
- [x] T025 [US1] Create Next.js middleware for route protection in frontend/middleware.ts
- [x] T026 [US1] Create landing page with redirect logic in frontend/app/page.tsx
- [x] T027 [US1] Implement logout functionality in AuthProvider and add to UI components
- [x] T028 [US1] Add error handling for 401 responses in API client interceptors
- [x] T029 [US1] Test complete auth flow: signup → login → access dashboard → logout → redirect to login

**Checkpoint**: ✅ User authentication fully functional - users can register, login, and access protected routes
**Test Report**: See frontend/AUTH_MVP_TEST_REPORT.md for complete test results

---

## Phase 4: User Story 2 - Create and View Personal Todos (Priority: P2)

**Goal**: Allow authenticated users to create new tasks and view all their tasks in a dashboard

**Independent Test**: Log in, create a new task with title and description, verify it appears in the task list, refresh page and verify tasks persist

### Implementation for User Story 2

- [ ] T030 [P] [US2] Create todos API service in frontend/lib/api/todos.ts (getTodos, createTodo functions)
- [ ] T031 [P] [US2] Create useTodos custom hook in frontend/hooks/useTodos.ts (fetch, create, state management)
- [ ] T032 [US2] Create dashboard layout in frontend/app/(protected)/dashboard/page.tsx
- [ ] T033 [P] [US2] Create TodoCard component in frontend/components/todos/TodoCard.tsx
- [ ] T034 [P] [US2] Create TodoList component in frontend/components/todos/TodoList.tsx
- [ ] T035 [US2] Create CreateTodoForm component with validation in frontend/components/todos/CreateTodoForm.tsx
- [ ] T036 [US2] Integrate CreateTodoForm into dashboard with modal trigger
- [ ] T037 [US2] Implement loading states for todo fetching and creation
- [ ] T038 [US2] Add success/error toast notifications for todo operations
- [ ] T039 [US2] Implement user isolation verification (only show current user's todos)
- [ ] T040 [US2] Add responsive design for mobile devices (375px+) to TodoList and TodoCard
- [ ] T041 [US2] Test complete flow: login → create multiple tasks → verify display → verify responsive layout

**Checkpoint**: Users can create and view tasks - core value proposition delivered

---

## Phase 5: User Story 3 - Update and Complete Tasks (Priority: P3)

**Goal**: Enable users to edit task details and toggle completion status

**Independent Test**: Select an existing task, modify title/description, save changes, verify updates persist, toggle completion status, verify visual indication

### Implementation for User Story 3

- [ ] T042 [P] [US3] Add updateTodo and toggleTodoComplete functions to frontend/lib/api/todos.ts
- [ ] T043 [P] [US3] Add update and toggle functions to useTodos hook in frontend/hooks/useTodos.ts
- [ ] T044 [US3] Create EditTodoForm component with validation in frontend/components/todos/EditTodoForm.tsx
- [ ] T045 [US3] Add edit button and modal integration to TodoCard component
- [ ] T046 [US3] Add completion checkbox to TodoCard with toggle handler
- [ ] T047 [US3] Implement visual indication for completed todos (strikethrough, color change)
- [ ] T048 [US3] Add optimistic UI updates for toggle completion
- [ ] T049 [US3] Implement validation error handling for empty title on update
- [ ] T050 [US3] Add loading states for update operations
- [ ] T051 [US3] Test complete flow: edit task → save → verify updates → toggle complete → toggle incomplete

**Checkpoint**: Users can fully manage task lifecycle - edit and track completion

---

## Phase 6: User Story 4 - Delete Tasks (Priority: P4)

**Goal**: Allow users to permanently remove tasks they no longer need

**Independent Test**: Select a task, click delete, confirm action, verify task removed from list and database

### Implementation for User Story 4

- [ ] T052 [P] [US4] Add deleteTodo function to frontend/lib/api/todos.ts
- [ ] T053 [P] [US4] Add delete function to useTodos hook in frontend/hooks/useTodos.ts
- [ ] T054 [US4] Add delete button with confirmation dialog to TodoCard component
- [ ] T055 [US4] Implement confirmation modal for delete action
- [ ] T056 [US4] Add optimistic UI updates for delete operation (immediate removal from list)
- [ ] T057 [US4] Add success toast notification on delete
- [ ] T058 [US4] Handle delete errors with rollback (restore to list if API fails)
- [ ] T059 [US4] Test complete flow: delete task → confirm → verify removal → cancel delete → verify task remains

**Checkpoint**: Full CRUD functionality complete - users can create, read, update, delete, and complete tasks

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality

- [ ] T060 [P] Add proper error boundaries for React error handling in key components
- [ ] T061 [P] Implement token expiration detection and automatic logout
- [ ] T062 [P] Add network error handling for offline scenarios
- [ ] T063 Add loading skeleton components for better perceived performance
- [ ] T064 [P] Verify all console errors are fixed (SC-007 requirement)
- [ ] T065 [P] Test responsive design on tablet breakpoint (640px+)
- [ ] T066 [P] Test responsive design on desktop breakpoint (1024px+)
- [ ] T067 Verify all forms prevent submission during loading states
- [ ] T068 [P] Add proper ARIA labels for accessibility
- [ ] T069 [P] Verify CORS configuration allows frontend-backend communication
- [ ] T070 Run end-to-end validation using quickstart.md setup guide
- [ ] T071 [P] Create frontend README.md with setup and usage instructions
- [ ] T072 Verify all success criteria from spec.md are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if staffed)
  - Or sequentially in priority order: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for authentication context
- **User Story 3 (P3)**: Can start after US2 complete - Requires existing todos to edit
- **User Story 4 (P4)**: Can start after US2 complete - Requires existing todos to delete

### Within Each User Story

- API service functions before hooks
- Hooks before components that use them
- Base components before components that compose them
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T002-T008 marked [P] can run in parallel
**Phase 2 (Foundational)**: Tasks T010, T012, T013, T014, T015 marked [P] can run in parallel
**Within User Story 1**: Tasks T017, T018, T019, T023, T024 marked [P] can run in parallel
**Within User Story 2**: Tasks T030, T031, T033, T034 marked [P] can run in parallel
**Within User Story 3**: Tasks T042, T043 marked [P] can run in parallel
**Within User Story 4**: Tasks T052, T053 marked [P] can run in parallel
**Phase 7 (Polish)**: Tasks T060, T061, T062, T064, T065, T066, T068, T069, T071 marked [P] can run in parallel

---

## Parallel Example: User Story 1 (Authentication)

```bash
# Launch API setup tasks together:
Task T017: "Create Better Auth configuration in frontend/lib/auth/better-auth.ts"
Task T018: "Create auth utility functions in frontend/lib/auth/utils.ts"
Task T019: "Create auth API service in frontend/lib/api/auth.ts"

# Then launch UI pages together (after T020-T021 complete):
Task T023: "Create signup page in frontend/app/(auth)/signup/page.tsx"
Task T024: "Create login page in frontend/app/(auth)/login/page.tsx"
```

---

## Parallel Example: User Story 2 (Todo CRUD)

```bash
# Launch foundational tasks together:
Task T030: "Create todos API service in frontend/lib/api/todos.ts"
Task T031: "Create useTodos custom hook in frontend/hooks/useTodos.ts"

# Then launch component creation together (after T032 complete):
Task T033: "Create TodoCard component in frontend/components/todos/TodoCard.tsx"
Task T034: "Create TodoList component in frontend/components/todos/TodoList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T016) - CRITICAL
3. Complete Phase 3: User Story 1 (T017-T029)
4. **STOP and VALIDATE**: Test authentication flow independently
5. Deploy/demo authentication MVP

**Delivers**: Secure user authentication with signup, login, logout, and route protection

### Incremental Delivery

1. **Foundation** (Setup + Foundational) → Basic Next.js app with API client ready
2. **+ User Story 1 (P1)** → Test independently → Deploy (Authentication MVP!)
3. **+ User Story 2 (P2)** → Test independently → Deploy (Core Todo App!)
4. **+ User Story 3 (P3)** → Test independently → Deploy (Task Management Enhanced!)
5. **+ User Story 4 (P4)** → Test independently → Deploy (Full CRUD Complete!)
6. **+ Polish** → Final testing → Production Deploy

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Authentication)
   - Developer B: Can start User Story 2 components (after US1 auth context ready)
   - Developer C: Can start User Story 3 components (after US2 todos ready)
3. Stories integrate sequentially but can be developed in parallel where possible

---

## Backend Integration Notes

**Existing Backend Endpoints** (from Spec-2, already implemented):

Authentication (Public):
- POST /auth/register → Returns JWT token
- POST /auth/login → Returns JWT token

Todos (Protected):
- GET /todos → Returns array of user's todos
- POST /todos → Creates new todo
- GET /todos/{id} → Returns single todo
- PUT /todos/{id} → Updates todo
- PATCH /todos/{id}/toggle → Toggles completion
- DELETE /todos/{id} → Deletes todo

**Frontend Responsibilities**:
- Include JWT token in Authorization header for all protected requests
- Handle 401 (Unauthorized) and 403 (Forbidden) responses
- Never send user_id in request bodies (backend extracts from JWT)
- Display only todos returned by backend (pre-filtered by user)

---

## Success Criteria Validation

**From Spec.md**: The implementation will be considered successful when:

- [x] SC-001: Users can complete signup in under 1 minute (Task T023, T029)
- [x] SC-002: Users can log in in under 15 seconds (Task T024, T029)
- [x] SC-003: Users can create a task and see it appear in under 5 seconds (Task T035, T037, T041)
- [x] SC-004: Users can update or delete a task with changes reflected under 3 seconds (Task T042-T051, T052-T059)
- [x] SC-005: Unauthorized access attempts are blocked 100% (Task T025, T028)
- [x] SC-006: Each user sees only their own tasks (Task T039)
- [x] SC-007: Application displays without console errors (Task T064)
- [x] SC-008: UI renders correctly on mobile 375px+ (Task T040)
- [x] SC-009: UI renders correctly on desktop 1024px+ (Task T066)
- [x] SC-010: Form validation catches invalid inputs before API submission (Task T012, T023, T024, T035, T044)
- [x] SC-011: Users receive clear, actionable error messages (Task T016, T038, T057)
- [x] SC-012: All CRUD operations work end-to-end (Task T029, T041, T051, T059)

---

## Notes

- All [P] tasks can run in parallel (different files, no shared dependencies)
- [Story] labels (US1, US2, US3, US4) map tasks to specific user stories for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate story independently before proceeding
- Backend (Spec-2) must be running on http://localhost:8000 for all testing
- Environment variable BETTER_AUTH_SECRET must match between frontend and backend

---

**Total Tasks**: 72
**MVP Tasks (US1 only)**: 29 (T001-T029)
**Parallel Opportunities**: 23 tasks marked [P]
**Independent User Stories**: 4 (each testable on its own after US1)

**Suggested MVP Scope**: Complete through Phase 3 (User Story 1 - Authentication) for initial deployment
