---

description: "Task list for Multi-User Todo Application with JWT Authentication"
---

# Tasks: Multi-User Todo Application with JWT Authentication

**Input**: Design documents from `/specs/001-todo-app-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not included in this task list (hackathon MVP focus on functionality)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## 🎯 Progress Summary

**Completed**: 23/80 tasks (28.75%)
- ✅ Phase 1: Setup (8 tasks) - COMPLETED
- ✅ Phase 2: Foundational Infrastructure (15 tasks) - COMPLETED
- ⏳ Phase 3: User Story 1 - Authentication (0/14 tasks)
- ⏳ Phase 4: User Story 2 - Task Creation (0/11 tasks)
- ⏳ Phase 5: User Story 3 - Task Management (0/12 tasks)
- ⏳ Phase 6: Polish & Testing (0/20 tasks)

**Additional Setup Completed**:
- ✅ Python virtual environment created
- ✅ All Python dependencies installed
- ✅ Backend .env file configured with Neon PostgreSQL
- ✅ Database tables created in Neon (users, tasks)
- ✅ .gitignore files added for backend and frontend

**Current Status**: Foundation complete! Ready to implement User Story 1 (Authentication)

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/app/`, `frontend/components/`, `frontend/lib/`
- Paths shown below follow plan.md structure (frontend/backend separation)

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETED

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure (backend/app, backend/tests)
- [x] T002 Create frontend directory structure (frontend/app, frontend/components, frontend/lib, frontend/types)
- [x] T003 [P] Initialize backend Python project with requirements.txt (FastAPI, SQLModel, PyJWT, passlib, python-jose, psycopg2-binary, uvicorn)
- [x] T004 [P] Initialize frontend Next.js project with package.json (Next.js 16+, React 19+, TypeScript, Better Auth)
- [x] T005 [P] Create backend/.env.example with DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS
- [x] T006 [P] Create frontend/.env.local.example with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET
- [x] T007 [P] Create backend/README.md with setup instructions
- [x] T008 [P] Create frontend/README.md with setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETED

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Configure Neon PostgreSQL database connection in backend/app/database.py (SQLModel engine, session management, connection pooling)
- [x] T010 Create User SQLModel schema in backend/app/models/user.py (id, email, password_hash, created_at)
- [x] T011 Create Task SQLModel schema in backend/app/models/task.py (id, user_id FK, title, description, is_completed, timestamps)
- [x] T012 Create database initialization script to create all tables (SQLModel.metadata.create_all)
- [x] T013 Create User Pydantic schemas in backend/app/schemas/user.py (UserCreate, UserLogin, UserResponse)
- [x] T014 Create Task Pydantic schemas in backend/app/schemas/task.py (TaskCreate, TaskUpdate, TaskResponse)
- [x] T015 Implement password hashing utilities in backend/app/auth/utils.py (bcrypt with cost 12)
- [x] T016 Implement JWT token creation and verification in backend/app/auth/utils.py (PyJWT with HS256, BETTER_AUTH_SECRET)
- [x] T017 Create JWT authentication middleware in backend/app/auth/middleware.py (extract Authorization header, verify token)
- [x] T018 Create get_current_user dependency in backend/app/auth/dependencies.py (decode JWT, fetch user from database)
- [x] T019 Initialize FastAPI app in backend/app/main.py (CORS middleware, router registration)
- [x] T020 [P] Configure Better Auth in frontend/lib/auth.ts (JWT provider, sign up/sign in functions)
- [x] T021 [P] Create API client with JWT handling in frontend/lib/api.ts (fetch wrapper with Authorization header, 401 redirect)
- [x] T022 [P] Create TypeScript User types in frontend/types/user.ts (User, SignUpRequest, SignInRequest, AuthResponse)
- [x] T023 [P] Create TypeScript Task types in frontend/types/task.ts (Task, CreateTaskRequest, UpdateTaskRequest)

**✅ Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to sign up, sign in, and authenticate with JWT tokens

**Independent Test**: Register new account, sign out, sign in, verify dashboard access. Unauthorized users redirected to signin.

### Implementation for User Story 1

- [ ] T024 [US1] Create auth router in backend/app/routers/auth.py (POST /auth/signup, POST /auth/signin)
- [ ] T025 [US1] Implement signup endpoint in backend/app/routers/auth.py (validate email, hash password, create user, return JWT)
- [ ] T026 [US1] Implement signin endpoint in backend/app/routers/auth.py (verify password, return JWT)
- [ ] T027 [US1] Register auth router in backend/app/main.py
- [ ] T028 [P] [US1] Create signup page UI in frontend/app/(auth)/signup/page.tsx (email/password form)
- [ ] T029 [P] [US1] Create signin page UI in frontend/app/(auth)/signin/page.tsx (email/password form)
- [ ] T030 [P] [US1] Create SignUpForm component in frontend/components/auth/SignUpForm.tsx (form validation, API call, redirect)
- [ ] T031 [P] [US1] Create SignInForm component in frontend/components/auth/SignInForm.tsx (form validation, API call, redirect)
- [ ] T032 [P] [US1] Create reusable Input component in frontend/components/ui/Input.tsx
- [ ] T033 [P] [US1] Create reusable Button component in frontend/components/ui/Button.tsx
- [ ] T034 [P] [US1] Create ErrorMessage component in frontend/components/ui/ErrorMessage.tsx
- [ ] T035 [US1] Create root layout with authentication check in frontend/app/layout.tsx
- [ ] T036 [US1] Create landing page with redirect logic in frontend/app/page.tsx (redirect to /tasks if authenticated, /signin otherwise)
- [ ] T037 [US1] Add protected route middleware to redirect unauthenticated users to /signin

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Task Creation and Listing (Priority: P2)

**Goal**: Authenticated users can create tasks and view their task list

**Independent Test**: Sign in, create multiple tasks with titles/descriptions, verify all appear in list ordered by creation date

### Implementation for User Story 2

- [ ] T038 [US2] Create tasks router in backend/app/routers/tasks.py (GET /tasks, POST /tasks with authentication)
- [ ] T039 [US2] Implement list tasks endpoint in backend/app/routers/tasks.py (filter by current_user.id, order by created_at DESC)
- [ ] T040 [US2] Implement create task endpoint in backend/app/routers/tasks.py (associate with current_user.id, validate title)
- [ ] T041 [US2] Register tasks router in backend/app/main.py
- [ ] T042 [P] [US2] Create task dashboard page in frontend/app/(dashboard)/tasks/page.tsx (list view, create button)
- [ ] T043 [P] [US2] Create TaskList component in frontend/components/tasks/TaskList.tsx (display tasks, empty state)
- [ ] T044 [P] [US2] Create TaskItem component in frontend/components/tasks/TaskItem.tsx (display single task, completion checkbox)
- [ ] T045 [P] [US2] Create new task page in frontend/app/(dashboard)/tasks/new/page.tsx (creation form)
- [ ] T046 [P] [US2] Create TaskForm component in frontend/components/tasks/TaskForm.tsx (title/description inputs, validation, submit)
- [ ] T047 [US2] Integrate task creation API call in TaskForm component (POST /api/tasks with JWT token)
- [ ] T048 [US2] Integrate task listing API call in task dashboard page (GET /api/tasks with JWT token)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Task Management (Priority: P3)

**Goal**: Users can view task details, edit tasks, toggle completion, and delete tasks

**Independent Test**: Sign in, create task, view details, edit title/description, toggle completion, delete task. Verify all operations work.

### Implementation for User Story 3

- [ ] T049 [US3] Implement get task by ID endpoint in backend/app/routers/tasks.py (GET /tasks/{id}, verify ownership)
- [ ] T050 [US3] Implement update task endpoint in backend/app/routers/tasks.py (PUT /tasks/{id}, verify ownership, update timestamps)
- [ ] T051 [US3] Implement delete task endpoint in backend/app/routers/tasks.py (DELETE /tasks/{id}, verify ownership)
- [ ] T052 [US3] Implement toggle completion endpoint in backend/app/routers/tasks.py (PATCH /tasks/{id}/toggle, flip is_completed boolean)
- [ ] T053 [P] [US3] Create task detail/edit page in frontend/app/(dashboard)/tasks/[id]/page.tsx (display and edit task)
- [ ] T054 [P] [US3] Create TaskActions component in frontend/components/tasks/TaskActions.tsx (edit/delete/toggle buttons)
- [ ] T055 [US3] Add edit functionality to TaskForm component (pre-fill values, PUT request)
- [ ] T056 [US3] Integrate get task API call in task detail page (GET /api/tasks/{id})
- [ ] T057 [US3] Integrate update task API call in TaskForm (PUT /api/tasks/{id})
- [ ] T058 [US3] Integrate delete task API call in TaskActions component (DELETE /api/tasks/{id}, confirmation dialog)
- [ ] T059 [US3] Integrate toggle completion API call in TaskItem component (PATCH /api/tasks/{id}/toggle)
- [ ] T060 [US3] Add optimistic UI updates for toggle completion (immediate visual feedback)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T061 [P] Add loading states to all API calls (spinner, skeleton screens)
- [ ] T062 [P] Add error handling for all API endpoints (display user-friendly messages)
- [ ] T063 [P] Implement 401 Unauthorized handling (redirect to signin, clear token)
- [ ] T064 [P] Implement 403 Forbidden handling (show permission error message)
- [ ] T065 [P] Add form validation on frontend (email format, password length, title required)
- [ ] T066 [P] Add toast notifications for success/error messages
- [ ] T067 [P] Improve responsive design for mobile devices (task list, forms)
- [ ] T068 [P] Add empty state UI when user has no tasks
- [ ] T069 [P] Add loading animation during authentication
- [ ] T070 [P] Add signout functionality (clear token, redirect to signin)
- [ ] T071 Add CORS configuration in backend/app/main.py (allow frontend origin)
- [ ] T072 Add environment variable validation on backend startup
- [ ] T073 Add environment variable validation on frontend build
- [ ] T074 Create .gitignore files for backend (.env, venv, __pycache__) and frontend (.env.local, node_modules, .next)
- [ ] T075 Test end-to-end authentication flow (signup → signin → access protected pages)
- [ ] T076 Test user isolation (User A cannot see User B's tasks)
- [ ] T077 Test unauthorized access attempts (missing JWT, invalid JWT, expired JWT)
- [ ] T078 Test task ownership enforcement (User A cannot edit/delete User B's tasks)
- [ ] T079 Verify all API responses match OpenAPI specification (status codes, schemas)
- [ ] T080 Run manual hackathon readiness review per quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 authentication for testing but code is independent
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US2 task creation for testing but code is independent

### Within Each User Story

- Backend endpoints before frontend components
- Models/schemas (done in Foundational) before services/endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T008)
- Foundational backend tasks (T010-T019) can run in parallel with foundational frontend tasks (T020-T023)
- Within User Story 1: Frontend components (T028-T034) can be built in parallel
- Within User Story 2: Backend endpoints (T038-T040) separate from frontend components (T042-T046)
- Within User Story 3: Backend endpoints (T049-T052) separate from frontend components (T053-T055)
- All Polish phase tasks marked [P] can run in parallel (T061-T070)

---

## Parallel Example: User Story 1

```bash
# Backend team:
Task T024: Create auth router
Task T025: Implement signup endpoint
Task T026: Implement signin endpoint
Task T027: Register router

# Frontend team (in parallel):
Task T028-T034: All UI components (signup page, signin page, forms, Input, Button, ErrorMessage)
Task T035: Root layout
Task T036: Landing page
Task T037: Protected route middleware
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. **STOP and VALIDATE**: Test signup, signin, protected routes
5. Deploy/demo if ready (minimal MVP with just authentication)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Auth) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Task Creation/Listing) → Test independently → Deploy/Demo
4. Add User Story 3 (Task Management) → Test independently → Deploy/Demo
5. Add Polish → Final deployment
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth)
   - Developer B: User Story 2 (Task Creation) - starts after US1 auth is testable
   - Developer C: User Story 3 (Task Management) - starts after US2 creation is testable
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on incomplete work
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are OPTIONAL for hackathon MVP - focus on functionality delivery
- Follow quickstart.md for setup and testing instructions
- All endpoints must follow contracts/openapi.yaml specification
- All database operations must follow data-model.md schema

---

**Total Tasks**: 80
**Setup**: 8 tasks
**Foundational**: 15 tasks (BLOCKING)
**User Story 1 (P1)**: 14 tasks (Authentication - MVP)
**User Story 2 (P2)**: 11 tasks (Task Creation/Listing)
**User Story 3 (P3)**: 12 tasks (Task Management - Full CRUD)
**Polish**: 20 tasks (Error handling, UX improvements, validation)

**Parallel Opportunities**: 40+ tasks can be parallelized across frontend/backend teams

**Suggested MVP Scope**: Phases 1, 2, and 3 (Setup + Foundational + User Story 1) = 37 tasks for basic authentication MVP

**Full Feature Scope**: All 80 tasks for complete multi-user todo application with JWT auth and full CRUD operations
