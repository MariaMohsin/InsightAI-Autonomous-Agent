---
id: 0004
title: Create Implementation Plan for Todo App MVP
stage: plan
date: 2026-01-12
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-todo-app-mvp
branch: 001-todo-app-mvp
user: User
command: /sp.plan
labels: ["planning", "spec-kit", "todo-app", "architecture", "design"]
links:
  spec: specs/001-todo-app-mvp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-app-mvp/plan.md
  - specs/001-todo-app-mvp/research.md
  - specs/001-todo-app-mvp/data-model.md
  - specs/001-todo-app-mvp/contracts/openapi.yaml
  - specs/001-todo-app-mvp/contracts/README.md
  - specs/001-todo-app-mvp/quickstart.md
  - Claude.md (updated with Neon PostgreSQL)
tests:

---

## Prompt

```text
/sp.plan

Objective:
Deliver a secure, spec-compliant full-stack Todo web application using spec-driven development within hackathon constraints.

Phase 1: Authentication & Security Foundation
- Configure Better Auth in Next.js
- Enable JWT issuance on user login
- Define JWT payload structure (user id, email, expiry)
- Configure shared secret via BETTER_AUTH_SECRET
- Implement FastAPI middleware to:
  - Extract Authorization header
  - Verify JWT signature
  - Decode user identity
  - Reject invalid or expired tokens
- Enforce authentication on all API routes

Phase 2: Backend API & Database
- Design SQLModel schemas for User and Task
- Configure Neon Serverless PostgreSQL connection
- Implement RESTful task endpoints:
  - List tasks for authenticated user
  - Create new task
  - Retrieve task by ID
  - Update task
  - Delete task
  - Toggle task completion
- Enforce task ownership at query level
- Return appropriate HTTP status codes
- Validate request and response schemas

Phase 3: Frontend Application
- Build responsive UI using Next.js App Router
- Implement authentication flows (signup/signin)
- Create authenticated API client
- Attach JWT token to all backend requests
- Build task UI:
  - Task list view
  - Task creation form
  - Task edit and delete actions
  - Completion toggle
- Handle loading, error, and unauthorized states

Phase 4: Integration & Validation
- Verify end-to-end auth flow
- Confirm user isolation across all endpoints
- Test unauthorized and cross-user access attempts
- Validate API responses against specs
- Ensure frontend behavior matches backend state
- Perform manual hackathon readiness review

Deliverables:
- Working full-stack Todo application
- Secure JWT-based authentication
- Spec-compliant REST API
- Responsive frontend UI
- Clean, readable, and spec-aligned codebase
```

## Response snapshot

Successfully created comprehensive implementation plan with all Phase 0 and Phase 1 artifacts:

**Technical Context**:
- Languages: TypeScript (frontend), Python 3.11+ (backend)
- Dependencies: Next.js 16+, FastAPI 0.100+, SQLModel 0.14+, PyJWT, Better Auth
- Database: Neon Serverless PostgreSQL with connection pooling
- Project Type: Web application (frontend/backend separation)
- Performance Goals: <5s signup, <3s task operations, <500ms API p95
- Scale: 10-100 users, ~100 tasks per user, 2000-3000 LOC

**Constitution Check**: ✅ ALL PASSED
- Security-First Development: JWT validation, password hashing, query filtering
- Spec-Driven Implementation: API contracts before code, Pydantic validation
- User Isolation: Foreign keys, ownership verification, filtered queries
- Production Realism: Environment variables, connection pooling, proper error handling
- Full-Stack Clarity: Clear layer separation, explicit patterns, OpenAPI docs

**Phase 0 - Research** (research.md):
- Better Auth for frontend authentication (JWT, httpOnly cookies, Next.js integration)
- FastAPI with PyJWT for backend (async, OpenAPI docs, dependency injection)
- SQLModel ORM (type safety, reduces boilerplate, Pydantic integration)
- Neon Serverless PostgreSQL (ACID, connection pooling, auto-scaling)
- JWT structure: HS256 algorithm, 24-hour expiration, standard claims
- Password hashing: bcrypt with cost factor 12
- RESTful API design with standard HTTP methods and status codes
- Security patterns: CORS whitelisting, SQL injection prevention, XSS protection

**Phase 1 - Design Artifacts**:

1. **data-model.md**: Complete database schema with SQLModel and Pydantic schemas
   - User entity: id, email, password_hash, created_at
   - Task entity: id, user_id (FK), title, description, is_completed, timestamps
   - Relationships: 1:N (User has many Tasks) with CASCADE delete
   - Indexes on email, user_id, created_at for performance
   - Query patterns for all CRUD operations with ownership verification

2. **contracts/openapi.yaml**: Full OpenAPI 3.1 specification
   - 2 public endpoints: /auth/signup, /auth/signin
   - 6 protected endpoints: /tasks (GET, POST), /tasks/{id} (GET, PUT, DELETE, PATCH)
   - Request/response schemas for all endpoints
   - Error response formats (401, 403, 404, 400, 500)
   - JWT Bearer authentication scheme
   - Example requests and responses

3. **contracts/README.md**: API documentation and integration guide
   - Endpoint summary table
   - Authentication flow diagram
   - Request/response examples with curl commands
   - HTTP status code reference
   - Error format documentation
   - Frontend integration patterns (TypeScript API client)
   - Backend implementation notes (FastAPI route structure)

4. **quickstart.md**: Developer onboarding guide
   - Prerequisites (Node.js 18+, Python 3.11+)
   - Step-by-step setup for database, backend, frontend
   - Testing instructions (signup, create task, toggle, edit, delete)
   - Development workflow (running both servers)
   - Troubleshooting common issues
   - Environment variables reference
   - API testing with curl examples

5. **Claude.md updated**: Added Neon PostgreSQL to active technologies

**Project Structure**: Web application with backend/ and frontend/ separation
- Backend: app/auth, app/models, app/schemas, app/routers
- Frontend: app/(auth), app/(dashboard), components, lib, types
- Clear boundaries: Frontend ↔ API ↔ Database

## Outcome

- ✅ Impact: Complete implementation plan ready for `/sp.tasks` generation
- 🧪 Tests: Constitution gates validated (all passed), no violations
- 📁 Files: 6 design documents created (plan, research, data-model, contracts, quickstart)
- 🔁 Next prompts: Ready for `/sp.tasks` to generate actionable task list
- 🧠 Reflection: Successfully translated user objectives into detailed technical plan with research-backed decisions, comprehensive data model, and production-ready API contracts

## Evaluation notes (flywheel)

- Failure modes observed: None - planning workflow completed successfully
- Graders run and results (PASS/FAIL): Constitution Check PASSED (all 5 principles)
- Prompt variant (if applicable): User provided phased objectives which aligned well with Spec-Kit Plus workflow
- Next experiment (smallest change to try): Consider adding ADRs during planning phase to document major architectural decisions (e.g., Better Auth choice, Neon PostgreSQL selection)

---

## Key Planning Decisions

**Authentication Architecture**:
- Better Auth (frontend) + PyJWT (backend) with shared BETTER_AUTH_SECRET
- JWT tokens in httpOnly cookies (XSS protection)
- HS256 algorithm, 24-hour expiration
- User identity extracted exclusively from verified tokens

**Database Architecture**:
- Neon Serverless PostgreSQL (ACID guarantees, connection pooling)
- SQLModel for type-safe ORM with Pydantic integration
- Foreign key constraints with CASCADE delete
- Indexes on email, user_id, created_at for query performance

**API Architecture**:
- RESTful conventions (GET/POST/PUT/DELETE/PATCH)
- Resource-based URLs (/tasks/{id})
- Consistent error response format (error/message/details)
- OpenAPI 3.1 documentation with examples

**Security Patterns**:
- JWT validation on every protected endpoint (no exceptions)
- User isolation enforced at database query level
- Password hashing with bcrypt (cost 12)
- CORS whitelisting (frontend origin only)
- SQL injection prevention (ORM only, no raw SQL)
- XSS prevention (Next.js automatic escaping)

**Development Workflow**:
- Frontend: Next.js App Router with TypeScript
- Backend: FastAPI with Python 3.11+
- Database: Neon (managed, serverless)
- Environment variables for secrets (never committed)
- Separate .env files for frontend and backend

## Spec-Kit Plus Workflow Observations

**What Worked Well**:
- Phased user input (Phase 1-4) mapped naturally to Spec-Kit Plus structure
- Constitution Check caught no violations (architecture aligned from start)
- Research phase resolved all technical unknowns before design
- OpenAPI contracts provide single source of truth for frontend/backend teams
- Quickstart guide enables immediate development

**Improvements for Next Time**:
- Consider creating ADRs during planning (e.g., ADR-001: Choose Better Auth over NextAuth)
- Add performance benchmarking criteria to success metrics
- Include deployment architecture diagram in plan.md

**Horizontal Intelligence Gained**:
- Detailed planning prompts with phases (Phase 1-4) produce more structured responses
- Explicitly stating "Deliverables" helps AI understand completion criteria
- Including constraints (hackathon timeline, production-grade patterns) focuses design decisions
- Better Auth + FastAPI pattern works well for JWT-based full-stack apps
