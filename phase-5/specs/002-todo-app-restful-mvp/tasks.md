---
description: "Task list for Todo RESTful API MVP"
---

# Tasks: Todo RESTful API MVP

**Input**: Design documents from `/specs/002-todo-app-restful-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Manual testing focused on user stories and edge cases

**Organization**: Tasks are grouped by implementation phase following the plan.md execution workflow

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/`, `backend/app/auth/`, `backend/app/routers/`
- **Frontend**: `frontend/app/`, `frontend/components/`, `frontend/lib/`, `frontend/types/`

---

## Progress Summary

**Status**: Not Started
**Total Tasks**: 65
**Completed**: 0/65 (0%)

---

## Phase 1: Project Initialization (8 tasks) ✅ 7/8 Complete

**Purpose**: Setup project structure and dependencies

- [x] T001 Create backend directory structure (backend/app, backend/app/auth, backend/app/routers)
- [x] T002 Create frontend directory structure (frontend/app, frontend/components, frontend/lib, frontend/types)
- [x] T003 [P] Create Python virtual environment in backend directory
- [x] T004 [P] Create backend/requirements.txt with FastAPI, SQLAlchemy, PyJWT, passlib, python-jose, uvicorn, python-dotenv, pydantic
- [x] T005 [P] Install backend Python dependencies from requirements.txt
- [ ] T006 [P] Initialize frontend project with Next.js or React + TypeScript (DEFERRED - requires framework choice)
- [x] T007 [P] Create backend/.env.example with DATABASE_URL, JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, CORS_ORIGINS
- [x] T008 [P] Create frontend/.env.local.example with NEXT_PUBLIC_API_URL or VITE_API_URL

**✅ Checkpoint**: Backend structure ready, dependencies installed, environment configured

---

## Phase 2: Backend Core Setup (9 tasks)

**Purpose**: Initialize FastAPI application and database connection

- [ ] T009 Create backend/app/config.py with Pydantic BaseSettings for environment variables
- [ ] T010 Create backend/app/database.py with SQLAlchemy engine, SessionLocal, Base, and get_db dependency
- [ ] T011 Create backend/app/models.py with empty file (will add models in Phase 3)
- [ ] T012 Create backend/app/schemas.py with empty file (will add schemas in Phase 6)
- [ ] T013 Create backend/app/main.py with FastAPI app initialization
- [ ] T014 Add CORS middleware to backend/app/main.py with settings.CORS_ORIGINS
- [ ] T015 Add root endpoint (GET /) to backend/app/main.py returning API status
- [ ] T016 Create backend/.env file from .env.example and set actual values (DATABASE_URL=sqlite:///./todos.db, generate JWT_SECRET_KEY)
- [ ] T017 Verify backend starts with: uvicorn app.main:app --reload, check http://localhost:8000 and http://localhost:8000/docs

**Checkpoint**: FastAPI application running, OpenAPI docs accessible

---

## Phase 3: Database Models (6 tasks)

**Purpose**: Define SQLAlchemy ORM models for User and Todo

- [ ] T018 Define User model in backend/app/models.py (id, email unique/indexed, password_hash, created_at with server_default)
- [ ] T019 Define Todo model in backend/app/models.py (id, user_id FK, title, description nullable, is_completed default False, created_at, updated_at with onupdate)
- [ ] T020 Add relationship in User model: todos = relationship("Todo", back_populates="owner", cascade="all, delete-orphan")
- [ ] T021 Add relationship in Todo model: owner = relationship("User", back_populates="todos")
- [ ] T022 Update backend/app/main.py to call Base.metadata.create_all(bind=engine) before app initialization
- [ ] T023 Verify database tables created: Run backend, check todos.db file exists, verify users and todos tables

**Checkpoint**: Database models defined, tables auto-created

---

## Phase 4: Authentication Utilities (7 tasks)

**Purpose**: Implement password hashing and JWT token management

- [ ] T024 Create backend/app/auth/__init__.py (empty file)
- [ ] T025 Create backend/app/auth/utils.py with password hashing functions (hash_password using passlib bcrypt, verify_password)
- [ ] T026 Add create_access_token function to backend/app/auth/utils.py (uses jwt.encode with settings.JWT_SECRET_KEY, includes exp claim)
- [ ] T027 Add decode_token function to backend/app/auth/utils.py (uses jwt.decode, returns payload or None on JWTError)
- [ ] T028 Create backend/app/auth/dependencies.py with HTTPBearer security scheme
- [ ] T029 Implement get_current_user dependency in backend/app/auth/dependencies.py (extracts token, decodes, fetches user from DB, raises 401 if invalid)
- [ ] T030 Test auth utilities: Create test script to hash password, create token, decode token, verify functions work

**Checkpoint**: Auth utilities ready for use in endpoints

---

## Phase 5: Authentication Endpoints (5 tasks)

**Purpose**: Implement user registration and login API endpoints

- [ ] T031 Create backend/app/routers/__init__.py (empty file)
- [ ] T032 Create backend/app/routers/auth.py with APIRouter initialization
- [ ] T033 Implement POST /auth/register endpoint in auth.py (validate email unique, hash password, create user, return JWT + user data, status 201)
- [ ] T034 Implement POST /auth/login endpoint in auth.py (find user by email, verify password, return JWT + user data, status 200 or 401)
- [ ] T035 Register auth router in backend/app/main.py with prefix="/auth" and tags=["Authentication"]

**Checkpoint**: Registration and login working via /docs

---

## Phase 6: Request/Response Schemas (6 tasks)

**Purpose**: Define Pydantic schemas for request validation and response serialization

- [ ] T036 Define UserCreate schema in backend/app/schemas.py (email: EmailStr, password: str min 8 chars)
- [ ] T037 Define UserLogin schema in backend/app/schemas.py (email: EmailStr, password: str)
- [ ] T038 Define UserResponse schema in backend/app/schemas.py (id, email, created_at, with from_attributes=True)
- [ ] T039 Define AuthResponse schema in backend/app/schemas.py (access_token, token_type="bearer", user: UserResponse)
- [ ] T040 Define TodoCreate schema in backend/app/schemas.py (title: str 1-255 chars, description: Optional[str] max 1000 chars)
- [ ] T041 Define TodoUpdate and TodoResponse schemas in backend/app/schemas.py (TodoUpdate with optional fields, TodoResponse with all fields from_attributes=True)

**Checkpoint**: All schemas defined and importable

---

## Phase 7: Todo CRUD Endpoints (8 tasks)

**Purpose**: Implement full CRUD operations for todos with user-scoped filtering

- [ ] T042 Create backend/app/routers/todos.py with APIRouter initialization
- [ ] T043 Implement POST /todos endpoint (create todo for current_user, return TodoResponse, status 201)
- [ ] T044 Implement GET /todos endpoint (list todos filtered by current_user.id, ordered by created_at desc, return List[TodoResponse])
- [ ] T045 Implement GET /todos/{todo_id} endpoint (fetch single todo, verify ownership, return TodoResponse or 404)
- [ ] T046 Implement PUT /todos/{todo_id} endpoint (update todo title/description/is_completed, verify ownership, return TodoResponse)
- [ ] T047 Implement PATCH /todos/{todo_id}/toggle endpoint (toggle is_completed, verify ownership, return TodoResponse)
- [ ] T048 Implement DELETE /todos/{todo_id} endpoint (delete todo, verify ownership, return 204 No Content)
- [ ] T049 Register todos router in backend/app/main.py with prefix="/todos" and tags=["Todos"]

**Checkpoint**: All todo endpoints working via /docs, user isolation enforced

---

## Phase 8: Frontend Core Setup (6 tasks)

**Purpose**: Initialize frontend project and API client

- [ ] T050 Create frontend/.env.local from .env.local.example with actual API URL
- [ ] T051 Create frontend/types/index.ts with User interface (id, email, created_at) and Todo interface (id, user_id, title, description, is_completed, created_at, updated_at)
- [ ] T052 Create frontend/lib/api.ts with APIClient class (getToken, request method with error handling, 401 redirect)
- [ ] T053 Add auth methods to APIClient: register(email, password), login(email, password), logout()
- [ ] T054 Add todo methods to APIClient: getTodos(), createTodo(title, description), updateTodo(id, data), toggleTodo(id), deleteTodo(id)
- [ ] T055 Export singleton instance: export const api = new APIClient()

**Checkpoint**: API client ready for use in components

---

## Phase 9: Frontend Authentication UI (7 tasks)

**Purpose**: Build registration and login pages

- [ ] T056 Create frontend/app/register/page.tsx with registration form (email input, password input min 8 chars, submit button)
- [ ] T057 Add form state management to register page (useState for email, password, error)
- [ ] T058 Add handleSubmit to register page (call api.register, redirect to /todos on success, display error on failure)
- [ ] T059 Create frontend/app/login/page.tsx with login form (similar structure to register)
- [ ] T060 Add form state and handleSubmit to login page (call api.login, redirect to /todos)
- [ ] T061 Create frontend/app/layout.tsx with basic HTML structure and metadata
- [ ] T062 Create frontend/app/page.tsx as landing page (check if authenticated, redirect to /todos or /login)

**Checkpoint**: Users can register and login via frontend

---

## Phase 10: Frontend Todo UI (8 tasks)

**Purpose**: Build todo dashboard with CRUD operations

- [ ] T063 Create frontend/app/todos/page.tsx with todo dashboard layout
- [ ] T064 Add state management to todos page (todos array, loading boolean, form inputs for title/description)
- [ ] T065 Add useEffect to load todos on mount (call api.getTodos, set todos state)
- [ ] T066 Add create todo form to todos page (title input required, description textarea optional, handleCreate function)
- [ ] T067 Implement handleCreate function (call api.createTodo, refresh todo list, reset form)
- [ ] T068 Render todo list with map (checkbox for completion, title, description, delete button for each todo)
- [ ] T069 Implement handleToggle function (call api.toggleTodo, refresh list)
- [ ] T070 Implement handleDelete function (confirm dialog, call api.deleteTodo, refresh list)

**Checkpoint**: Full todo CRUD workflow working in frontend

---

## Phase 11: Frontend Polish & Error Handling (5 tasks)

**Purpose**: Improve UX with loading states and error messages

- [ ] T071 Add loading state display to todos page (show "Loading..." while fetching todos)
- [ ] T072 Add error state to todos page (catch errors, display user-friendly messages)
- [ ] T073 Add empty state to todos page (show "No todos yet. Create your first one!" when todos array is empty)
- [ ] T074 Add form validation to create todo form (disable submit if title is empty, show validation errors)
- [ ] T075 Add success feedback after todo operations (optional: toast notifications or simple messages)

**Checkpoint**: UX improved, all states handled gracefully

---

## Phase 12: Security & Validation (5 tasks)

**Purpose**: Ensure all security requirements are met

- [ ] T076 Verify all todo endpoints require authentication (test without token, expect 401)
- [ ] T077 Verify user isolation: Create 2 users, create todos for each, confirm User A cannot access User B's todos via API
- [ ] T078 Verify password hashing: Check database, confirm passwords are bcrypt hashed, not plaintext
- [ ] T079 Verify JWT validation: Test with invalid/expired token, confirm 401 response
- [ ] T080 Verify input validation: Test with empty title, oversized description, invalid email format, confirm proper error responses

**Checkpoint**: Security requirements met, system is secure

---

## Phase 13: Testing & Documentation (5 tasks)

**Purpose**: Validate all user stories and document setup

- [ ] T081 Manual test User Story 1 (Registration): Register new user, verify success
- [ ] T082 Manual test User Story 2 (Login): Login with valid credentials, verify JWT returned
- [ ] T083 Manual test User Stories 3-7 (Todo CRUD): Create, list, update, toggle, delete todos, verify all operations
- [ ] T084 Create backend/README.md with setup instructions (venv setup, install deps, configure .env, run server)
- [ ] T085 Create frontend/README.md with setup instructions (install deps, configure .env.local, run dev server)

**Checkpoint**: All user stories validated, documentation complete

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 1 (Project Init)**: Start here - no dependencies
2. **Phase 2 (Backend Core)**: Depends on Phase 1 (T001-T008 complete)
3. **Phase 3 (Database Models)**: Depends on Phase 2 (T009-T017 complete)
4. **Phase 4 (Auth Utilities)**: Depends on Phase 2 (can run parallel with Phase 3)
5. **Phase 5 (Auth Endpoints)**: Depends on Phases 3, 4, 6 (models, utilities, schemas)
6. **Phase 6 (Schemas)**: Depends on Phase 3 (models defined) - can run parallel with Phase 4
7. **Phase 7 (Todo Endpoints)**: Depends on Phases 3, 4, 6 (models, auth, schemas)
8. **Phase 8 (Frontend Core)**: Depends on Phase 1 (T006 frontend init) - can start after backend API is partially complete
9. **Phase 9 (Auth UI)**: Depends on Phases 5, 8 (auth endpoints, API client)
10. **Phase 10 (Todo UI)**: Depends on Phases 7, 8 (todo endpoints, API client)
11. **Phase 11 (Polish)**: Depends on Phases 9, 10 (UI built)
12. **Phase 12 (Security)**: Depends on all implementation phases (T001-T075)
13. **Phase 13 (Testing)**: Depends on Phase 12 (security validated)

### Critical Path

**Minimum viable product (MVP) path**:
1. Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 6 → Phase 5
   - Backend foundation + authentication
2. Phase 7 → Phase 8 → Phase 9
   - Todo API + Frontend core + Auth UI
3. Phase 10
   - Todo UI (complete CRUD)

**Full completion**: All 13 phases (85 tasks)

### Parallel Opportunities

- **Phase 1**: T003-T008 can all run in parallel (backend and frontend setup independent)
- **Phase 2**: T009-T017 mostly sequential, but T016-T017 (env setup and verification) can be done by different team members
- **Phase 3**: T018-T021 (model definitions) can be written in parallel if coordinated
- **Phase 4 + Phase 6**: Auth utilities and schemas can be developed in parallel
- **Phase 8-10**: Once backend APIs are ready, frontend work can proceed rapidly
- **Phase 11**: All polish tasks (T071-T075) can be done in parallel across components

---

## Task Estimation

**Time Estimates by Phase**:
- Phase 1: 1-2 hours (project setup)
- Phase 2: 1-2 hours (backend core)
- Phase 3: 1-2 hours (models)
- Phase 4: 2-3 hours (auth utilities)
- Phase 5: 1-2 hours (auth endpoints)
- Phase 6: 1 hour (schemas)
- Phase 7: 2-3 hours (todo endpoints)
- Phase 8: 1-2 hours (frontend core)
- Phase 9: 2-3 hours (auth UI)
- Phase 10: 3-4 hours (todo UI)
- Phase 11: 1-2 hours (polish)
- Phase 12: 1-2 hours (security testing)
- Phase 13: 2-3 hours (testing and docs)

**Total Estimated Time**: 20-31 hours (solo developer)
**Parallelized Time**: 12-18 hours (with 2-3 developers)

---

## Notes

- Tasks are designed to be atomic (completable in one sitting)
- Each task has clear acceptance criteria in the description
- Checkpoint after each phase ensures progress is validated
- Use backend/app/main.py to import and register routers as they're created
- SQLite database file (todos.db) will be auto-created on first run
- For production, change DATABASE_URL to PostgreSQL connection string
- All code examples are available in plan.md for reference

---

**Total Tasks**: 85
**Phases**: 13
**MVP Scope**: Phases 1-10 (70 tasks)
**Full Scope**: All phases (85 tasks)

**Status**: Ready to implement
**Branch**: `002-todo-app-restful-mvp`
**Last Updated**: 2026-01-14
