# Implementation Plan: AI Todo Chatbot

**Branch**: `004-ai-todo-chatbot` | **Date**: 2026-01-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-ai-todo-chatbot/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a conversational AI chatbot that enables authenticated users to manage todos through natural language interactions. The system uses a stateless backend architecture where an AI agent interprets user intent from chat messages and executes todo operations through MCP (Model Context Protocol) tools. All conversations and messages persist in the database, enabling context reconstruction across sessions. The frontend provides a chat interface, the backend orchestrates the AI agent and MCP tools, and the database stores conversations, messages, and todos with strict user isolation.

**Primary Requirement**: Users can create, query, update, and complete todos using natural language in a chat interface without filling forms.

**Technical Approach**: Frontend chat UI (Next.js + ChatKit) → Backend API (FastAPI) → AI Agent (OpenAI Agents SDK) → MCP Tools (Official MCP SDK) → Database (Neon PostgreSQL with SQLModel ORM). Backend is stateless, rebuilding conversation context from database on each request.

## Technical Context

**Language/Version**:
- Backend: Python 3.11+
- Frontend: TypeScript 5.x with Next.js 16+ (App Router, React 19)

**Primary Dependencies**:
- Backend: FastAPI, SQLAlchemy (ORM), OpenAI Swarm (AI agent), Official MCP SDK, python-jose (JWT), psycopg2
- Frontend: Next.js 16+, React 19, @chatscope/chat-ui-kit-react (chat UI library), Better Auth (client)
- Database: Neon Serverless PostgreSQL with connection pooling via pgbouncer

**Storage**:
- Neon Serverless PostgreSQL (extends Phase II schema)
- New tables: `conversations`, `messages`
- Existing tables: `users`, `todos` (from Phase II)

**Testing**:
- Backend: pytest (unit, integration, MCP tool tests)
- Frontend: Jest + React Testing Library
- E2E: Playwright for chat flow testing

**Target Platform**:
- Backend: Linux server (containerized deployment)
- Frontend: Web browsers (desktop and mobile)
- Database: Neon cloud-hosted PostgreSQL

**Project Type**: Web (frontend + backend)

**Performance Goals**:
- Chat response latency: < 3 seconds under normal load (SC-003)
- Concurrent users: 50+ without degradation (SC-006)
- Intent recognition accuracy: 95% for common requests (SC-002)
- Todo creation time: < 30 seconds via chat (SC-001)

**Constraints**:
- Stateless backend: no in-memory session state
- Conversation persistence: 100% reliability (SC-004)
- User isolation: zero cross-user data leakage (SC-007)
- AI service dependency: graceful degradation on failures
- Context window limits: handle long conversation histories

**Scale/Scope**:
- Initial: 100 users, scaling to 10,000
- Conversation storage: unbounded growth, requires archival strategy
- Message history: 20+ messages per conversation (SC-008)
- Todo operations: all CRUD via natural language

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Security-First Development ✅

- **Authentication**: All chat API endpoints require valid JWT authentication (FR-011)
- **User Identity**: User ID extracted from verified JWT token, never from client data
- **Data Isolation**: Conversations and messages scoped to authenticated user (FR-010, FR-019)
- **MCP Tools**: All tools validate user_id parameter before database operations
- **Input Validation**: Natural language input sanitized; AI responses prevent XSS
- **JWT Validation**: Backend validates JWT signature using shared BETTER_AUTH_SECRET

### II. Spec-Driven Implementation ✅

- **API Behavior**: Chat endpoint POST /api/chat with request/response schemas defined in contracts/
- **MCP Tool Schemas**: Each tool (add_task, list_tasks, etc.) defined with input/output schemas
- **Agent Behavior**: Natural language intent interpretation and conversational responses specified
- **No Deviation**: Implementation follows spec FR-001 through FR-020 without ad-hoc changes
- **Spec Amendments**: Any behavior changes require spec updates first

### III. User Isolation and Data Integrity ✅

- **Conversation Ownership**: Each conversation belongs to exactly one user (user_id foreign key)
- **Message Scoping**: All messages linked to user-owned conversations
- **Todo Operations**: MCP tools enforce user_id filtering on all CRUD operations
- **Cross-User Prevention**: Database queries always include user_id WHERE clause
- **Enforcement Layers**: User isolation at API, MCP tool, and database levels

### IV. Production Realism ✅

- **No Shortcuts**: Real JWT validation, real database persistence, real AI service integration
- **Environment Variables**: OpenAI API key, BETTER_AUTH_SECRET, DATABASE_URL externalized
- **Error Handling**: Graceful handling of AI service failures, DB errors, invalid requests (FR-014)
- **Connection Pooling**: Neon pgbouncer for serverless-appropriate connection management
- **Logging**: Structured logging for debugging without exposing sensitive data

### V. Full-Stack Clarity ✅

- **Clear Boundaries**: Frontend (UI) → Backend (API + Agent orchestration) → MCP (Tools) → DB (Storage)
- **Explicit Contracts**: OpenAPI spec for chat API, JSON schemas for MCP tools
- **No Over-Engineering**: Direct implementation without unnecessary abstractions
- **Technology Layers**: Next.js frontend, FastAPI backend, MCP SDK for tools, SQLModel for ORM
- **API Documentation**: Auto-generated OpenAPI docs from FastAPI

### Gate Evaluation

**Status**: ✅ PASS

All constitution principles satisfied:
- Security enforced at every layer with JWT authentication and user isolation
- Spec-driven with defined contracts and no implementation deviations
- User data isolation through foreign keys and scoped queries
- Production-ready patterns (env vars, error handling, connection pooling)
- Clear layer separation with explicit contracts

**Complexity Violations**: None

## Project Structure

### Documentation (this feature)

```text
specs/004-ai-todo-chatbot/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── chat-api.yaml    # OpenAPI spec for chat endpoint
│   └── mcp-tools.json   # MCP tool schemas
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Note**: Paths below reflect actual project structure. Phase II uses `backend/app/` instead of `backend/src/`, and SQLAlchemy ORM instead of SQLModel.

```text
backend/
├── app/
│   ├── models.py              # SQLAlchemy models: User, Todo (Phase II)
│   ├── schemas.py             # Pydantic schemas for API validation (Phase II)
│   ├── auth.py                # JWT token generation/validation (Phase II)
│   ├── database.py            # Database connection and session (Phase II)
│   ├── config.py              # Environment configuration (Phase II)
│   ├── main.py                # FastAPI app initialization (Phase II)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py            # Auth endpoints: signup, signin (Phase II)
│   │   ├── todos.py           # Todo CRUD endpoints (Phase II)
│   │   └── chat.py            # Chat endpoint (Phase III - NEW)
│   ├── mcp/                   # Phase III - NEW
│   │   ├── __init__.py
│   │   ├── server.py          # MCP server initialization
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── update_task.py
│   │       ├── complete_task.py
│   │       └── delete_task.py
│   ├── agent/                 # Phase III - NEW
│   │   ├── __init__.py
│   │   ├── runner.py          # OpenAI Swarm agent orchestration
│   │   └── config.py          # Agent behavior configuration
│   └── migrations/            # Phase III - NEW
│       └── 004_add_conversations_messages.sql
├── setup_tables.py            # Database initialization script (Phase II)
├── run_server.py              # Server startup script (Phase II)
├── test_app.py                # Test suite (Phase II)
└── requirements.txt           # Python dependencies

frontend/
├── app/
│   ├── (auth)/                # Auth routes: signin, signup (Phase II)
│   ├── (protected)/           # Protected routes: dashboard, todos (Phase II)
│   ├── chat/                  # Chat interface page (Phase III - NEW)
│   │   └── page.tsx
│   ├── globals.css            # Global styles (Phase II)
│   ├── layout.tsx             # Root layout with auth provider (Phase II)
│   └── page.tsx               # Home page (Phase II)
├── components/
│   ├── auth/                  # Auth components: SignInForm, SignUpForm (Phase II)
│   ├── dashboard/             # Dashboard components (Phase II)
│   ├── todos/                 # Todo CRUD components (Phase II)
│   ├── ui/                    # Shared UI components: Button, Input, etc. (Phase II)
│   └── chat/                  # Chat UI components (Phase III - NEW)
│       ├── ChatInterface.tsx  # Main chat container
│       ├── MessageList.tsx    # Message history display
│       ├── MessageInput.tsx   # User input field
│       └── MessageBubble.tsx  # Individual message component
├── lib/
│   ├── auth.ts                # Better Auth client (Phase II)
│   ├── api.ts                 # API client utilities (Phase II)
│   └── chat-api.ts            # Chat API client (Phase III - NEW)
├── types/
│   ├── auth.ts                # Auth types (Phase II)
│   ├── todo.ts                # Todo types (Phase II)
│   └── chat.ts                # Chat types: Message, Conversation (Phase III - NEW)
├── hooks/                     # React hooks (Phase II + III)
├── styles/                    # Additional styles (Phase II)
├── middleware.ts              # Auth middleware (Phase II)
└── package.json               # Node dependencies
```

**Structure Decision**: Web application structure with separate `backend/` and `frontend/` directories. Backend uses `app/` subdirectory (existing from Phase II) with FastAPI and SQLAlchemy ORM. Frontend uses Next.js App Router with route groups for auth/protected routes. Phase III extends Phase II structure by adding `app/mcp/`, `app/agent/`, and `app/routers/chat.py` in backend, and `chat/` components in frontend. This maintains consistency with Phase II and follows constitution principle V (Full-Stack Clarity).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All complexity is justified by functional requirements and constitutional principles.

## Phase 0: Research & Technology Decisions

**Status**: Ready for research tasks

### Research Tasks

The following research tasks will be executed to resolve technical unknowns and inform Phase 1 design:

1. **OpenAI Agents SDK Integration**
   - Research: How to configure OpenAI Agents SDK for tool calling with MCP tools
   - Context: Need to understand agent initialization, tool registration, and conversation context management
   - Output: Agent configuration patterns, best practices for stateless operation

2. **Official MCP SDK Implementation**
   - Research: Official MCP SDK structure for Python backend
   - Context: Need to define MCP server setup and tool schemas following official standards
   - Output: MCP server initialization pattern, tool schema format, error handling

3. **Conversation Context Management**
   - Research: Strategies for rebuilding conversation context from database messages
   - Context: Stateless backend must reconstruct full conversation on each request
   - Output: Message serialization format, context window management, pagination strategy

4. **ChatKit Integration**
   - Research: ChatKit library for Next.js chat interface (or alternatives: react-chat-elements, stream-chat-react)
   - Context: Need real-time message rendering with loading states and error handling
   - Output: Component architecture, WebSocket vs polling, message optimistic updates

5. **Natural Language Intent Recognition**
   - Research: Best practices for intent extraction from natural language with OpenAI models
   - Context: Agent must determine CRUD operation from user messages with 95% accuracy
   - Output: Prompt engineering patterns, few-shot examples, ambiguity handling

6. **Database Schema for Conversations**
   - Research: Schema design patterns for chat applications with message history
   - Context: Need efficient storage and retrieval of conversations and messages
   - Output: Table structure, indexing strategy, conversation archival approach

7. **JWT Validation in FastAPI**
   - Research: Integrating Better Auth JWT validation in FastAPI middleware
   - Context: Backend must validate JWT tokens issued by Better Auth frontend
   - Output: Middleware pattern, BETTER_AUTH_SECRET sharing, token extraction

8. **MCP Tool Error Handling**
   - Research: Error propagation from MCP tools to AI agent to user
   - Context: Tools may fail (todo not found, DB error); agent must provide friendly messages
   - Output: Error type design, agent response templates, retry strategies

**Execution**: Research tasks will be dispatched and findings consolidated in `research.md`.

## Phase 1: Design Artifacts

**Status**: Pending completion of Phase 0 research

### Artifacts to Generate

1. **data-model.md**: Entity definitions for Conversation and Message with relationships to User and Todo
2. **contracts/chat-api.yaml**: OpenAPI specification for POST /api/chat endpoint
3. **contracts/mcp-tools.json**: JSON schemas for all 5 MCP tools (add_task, list_tasks, update_task, complete_task, delete_task)
4. **quickstart.md**: Step-by-step guide for running the chat feature locally

### Agent Context Update

After Phase 1 design, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will add Phase III technologies to the agent context file:
- OpenAI Agents SDK
- Official MCP SDK
- ChatKit (or selected alternative)
- Conversation/Message entities

## Phase 2: Task Breakdown

**Status**: Not started (requires /speckit.tasks command)

Phase 2 will generate `tasks.md` with dependency-ordered implementation tasks based on the design artifacts from Phase 1.

## Constitution Check Re-Evaluation (Post-Design)

*Re-evaluated after Phase 0 research and Phase 1 design completion.*

### Design Artifact Review

**Research Decisions** (from research.md):
- OpenAI Swarm for stateless agent orchestration ✅
- Official MCP SDK for tool definitions ✅
- SQLAlchemy ORM (existing from Phase II) ✅
- @chatscope/chat-ui-kit-react for chat UI ✅
- Database serialization for conversation context ✅
- FastAPI dependency injection for JWT validation ✅
- Structured error objects with user-friendly messages ✅

**Data Model** (from data-model.md):
- Conversation and Message entities with user_id foreign keys ✅
- Cascade deletion for data integrity ✅
- Indexed columns for efficient queries ✅
- JSON columns for tool_calls and tool_results ✅

**API Contracts** (from contracts/):
- POST /api/chat with JWT authentication requirement ✅
- OpenAPI spec with error responses (401, 403, 404) ✅
- MCP tool schemas with user_id parameter validation ✅
- Structured error codes and user messages ✅

### Constitution Compliance Verification

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Security-First Development** | ✅ PASS | JWT authentication in chat-api.yaml, user_id validation in MCP tools, cascade deletion prevents orphaned data |
| **II. Spec-Driven Implementation** | ✅ PASS | OpenAPI spec (chat-api.yaml), MCP tool schemas (mcp-tools.json), no implementation details in spec |
| **III. User Isolation and Data Integrity** | ✅ PASS | Foreign keys enforce ownership, all queries filter by user_id, conversation/message scoped to users |
| **IV. Production Realism** | ✅ PASS | Environment variables, error handling patterns, connection pooling, stateless design |
| **V. Full-Stack Clarity** | ✅ PASS | Clear layer boundaries (UI → API → Agent → MCP → DB), explicit contracts, no over-engineering |

### Re-Evaluation Result

**Status**: ✅ PASS

All constitution principles remain satisfied after design phase. No new complexity violations introduced. Design artifacts provide implementation-ready specifications that enforce security, user isolation, and production patterns.

**Gate Status**: Cleared for Phase 2 (Task Breakdown via /speckit.tasks)

---

## Next Steps

1. ✅ Constitution Check passed (initial)
2. ✅ Phase 0: Research completed (8 tasks, findings in research.md)
3. ✅ Phase 1: Design artifacts generated (data-model.md, contracts/, quickstart.md)
4. ✅ Agent context updated (CLAUDE.md)
5. ✅ Constitution Check re-evaluated post-design - PASS
6. ⏳ **Ready for Phase 2**: Run `/speckit.tasks` to generate dependency-ordered implementation task breakdown
