# Tasks: AI Todo Chatbot

**Input**: Design documents from `/specs/004-ai-todo-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification - tests are OPTIONAL and not included in this task breakdown.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This project uses web app structure:
- **Backend**: `backend/app/`
- **Frontend**: `frontend/`
- Phase II code already exists; Phase III extends it

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment setup for Phase III

- [X] T001 Create Phase III directory structure (backend/app/mcp/, backend/app/agent/, frontend/components/chat/)
- [X] T002 [P] Install backend dependencies (openai-swarm, mcp, python-jose) in backend/requirements.txt
- [X] T003 [P] Install frontend dependencies (@chatscope/chat-ui-kit-react, @chatscope/chat-ui-kit-styles) in frontend/package.json
- [X] T004 [P] Configure environment variables (OPENAI_API_KEY, MCP_SERVER_PORT) in backend/.env and frontend/.env.local
- [X] T005 [P] Create migration file backend/app/migrations/004_add_conversations_messages.sql from data-model.md

**Checkpoint**: Phase III project structure and dependencies ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Run database migration 004_add_conversations_messages.sql to create conversations and messages tables
- [X] T007 [P] Add Conversation and Message models to backend/app/models.py per data-model.md
- [X] T008 [P] Add conversations relationship to existing User model in backend/app/models.py
- [X] T009 [P] Create Pydantic schemas for chat requests/responses in backend/app/schemas.py (ChatRequest, ChatResponse, ConversationSchema, MessageSchema)
- [X] T010 [P] Create TypeScript types for chat in frontend/types/chat.ts (Message, Conversation, ChatRequest, ChatResponse)
- [X] T011 Implement MCP server initialization in backend/app/mcp/server.py using official MCP SDK
- [X] T012 Implement OpenAI Swarm agent configuration in backend/app/agent/config.py with system prompt for todo management
- [X] T013 Implement agent runner in backend/app/agent/runner.py for stateless conversation processing
- [X] T014 Create chat API client in frontend/lib/chat-api.ts for calling POST /api/chat endpoint
- [X] T015 Verify Phase II authentication (Better Auth JWT) is functional for protecting chat routes

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Todos via Natural Language (Priority: P1) 🎯 MVP

**Goal**: Users can create todo items by typing natural language instructions in a chat interface without filling forms

**Independent Test**: Send chat message "add a task to call the dentist" and verify new todo appears in user's todo list

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement add_task MCP tool in backend/app/mcp/tools/add_task.py per mcp-tools.json schema
- [X] T017 [P] [US1] Create ChatInterface component in frontend/components/chat/ChatInterface.tsx with @chatscope/chat-ui-kit-react
- [X] T018 [P] [US1] Create MessageInput component in frontend/components/chat/MessageInput.tsx for user input
- [X] T019 [P] [US1] Create MessageBubble component in frontend/components/chat/MessageBubble.tsx for rendering user/assistant messages
- [X] T020 [P] [US1] Create MessageList component in frontend/components/chat/MessageList.tsx for displaying conversation history
- [X] T021 [US1] Register add_task tool with MCP server in backend/app/mcp/server.py
- [X] T022 [US1] Connect agent to add_task MCP tool in backend/app/agent/config.py
- [X] T023 [US1] Implement POST /api/chat endpoint in backend/app/routers/chat.py with JWT authentication, conversation loading, agent execution, message persistence
- [X] T024 [US1] Create chat page in frontend/app/chat/page.tsx integrating ChatInterface component
- [X] T025 [US1] Add chat route to frontend navigation (link from dashboard/protected layout)
- [X] T026 [US1] Add error handling for AI service failures in backend/app/routers/chat.py
- [X] T027 [US1] Add loading states and optimistic updates to frontend/components/chat/MessageInput.tsx
- [ ] T028 [US1] Test natural language todo creation: "create a todo to finish the report by Friday" → verify todo created with title and due date
- [ ] T029 [US1] Test batch creation: "add three tasks: call mom, pay bills, and schedule dentist" → verify 3 todos created
- [ ] T030 [US1] Test conversation persistence: create todo, refresh page, verify message history preserved

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create todos via chat

---

## Phase 4: User Story 2 - Query and List Todos Conversationally (Priority: P2)

**Goal**: Users can ask questions about their todos in natural language and receive human-readable summaries

**Independent Test**: Ask "what are my tasks for today?" and verify chatbot returns accurate list of todos due today

### Implementation for User Story 2

- [X] T031 [P] [US2] Implement list_tasks MCP tool in backend/app/mcp/tools/list_tasks.py per mcp-tools.json schema with filtering support
- [X] T032 [US2] Register list_tasks tool with MCP server in backend/app/mcp/server.py
- [X] T033 [US2] Connect agent to list_tasks MCP tool in backend/app/agent/config.py
- [X] T034 [US2] Update agent system prompt in backend/app/agent/config.py with examples for listing/querying todos
- [ ] T035 [US2] Test natural language queries: "what do I need to do today?" → verify only today's todos returned
- [ ] T036 [US2] Test priority filtering: "show me my high priority tasks" → verify only high-priority todos returned
- [ ] T037 [US2] Test overdue detection: "do I have any overdue tasks?" → verify correct overdue todos or "all caught up" message
- [X] T038 [US2] Add conversational formatting to agent responses for todo lists in backend/app/agent/config.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can create AND query todos

---

## Phase 5: User Story 3 - Update Todos Through Conversation (Priority: P3)

**Goal**: Users can modify existing todos by describing changes conversationally

**Independent Test**: Create todo, then send "change the due date of the report task to next Monday" and verify todo updated

### Implementation for User Story 3

- [X] T039 [P] [US3] Implement update_task MCP tool in backend/app/mcp/tools/update_task.py per mcp-tools.json schema
- [X] T040 [US3] Register update_task tool with MCP server in backend/app/mcp/server.py
- [X] T041 [US3] Connect agent to update_task MCP tool in backend/app/agent/config.py
- [X] T042 [US3] Add fuzzy matching logic for todo identification in backend/app/mcp/tools/update_task.py (partial title matching)
- [X] T043 [US3] Update agent system prompt with examples for updating todos in backend/app/agent/config.py
- [ ] T044 [US3] Test due date changes: "set the grocery shopping task for tomorrow" → verify due date updated
- [ ] T045 [US3] Test priority changes: "make the report task high priority" → verify priority updated
- [ ] T046 [US3] Test title changes: "rename 'call dentist' to 'schedule dentist appointment'" → verify title updated
- [X] T047 [US3] Handle ambiguous references with clarifying questions from agent

**Checkpoint**: User Stories 1, 2, AND 3 should all work independently - users can create, query, AND update todos

---

## Phase 6: User Story 4 - Complete and Delete Todos via Chat (Priority: P4)

**Goal**: Users can mark todos as complete or remove them using conversational commands

**Independent Test**: Create todo, then say "mark the report task as done" and verify it's marked complete

### Implementation for User Story 4

- [X] T048 [P] [US4] Implement complete_task MCP tool in backend/app/mcp/tools/complete_task.py per mcp-tools.json schema
- [X] T049 [P] [US4] Implement delete_task MCP tool in backend/app/mcp/tools/delete_task.py per mcp-tools.json schema
- [X] T050 [US4] Register complete_task and delete_task tools with MCP server in backend/app/mcp/server.py
- [X] T051 [US4] Connect agent to complete_task and delete_task MCP tools in backend/app/agent/config.py
- [X] T052 [US4] Update agent system prompt with examples for completing/deleting todos in backend/app/agent/config.py
- [ ] T053 [US4] Test completion: "I bought the groceries" → verify todo marked complete with congratulatory message
- [ ] T054 [US4] Test deletion: "delete the dentist task" → verify todo removed with confirmation
- [ ] T055 [US4] Test batch completion: "I'm done with the report and the presentation" → verify both todos marked complete

**Checkpoint**: User Stories 1-4 all functional - full CRUD operations via chat (create, query, update, complete, delete)

---

## Phase 7: User Story 5 - Access Conversation History (Priority: P5)

**Goal**: Users can return to chat interface and see previous conversations with context preserved across sessions

**Independent Test**: Create todos in one session, logout, login, verify conversation history preserved

### Implementation for User Story 5

- [X] T056 [P] [US5] Implement GET /api/conversations endpoint in backend/app/routers/chat.py to list user's conversations
- [X] T057 [P] [US5] Implement GET /api/conversations/{id} endpoint in backend/app/routers/chat.py to retrieve conversation with messages
- [X] T058 [P] [US5] Implement DELETE /api/conversations/{id} endpoint in backend/app/routers/chat.py to delete conversation
- [X] T059 [P] [US5] Create ConversationList component in frontend/components/chat/ConversationList.tsx to display user's conversations
- [X] T060 [US5] Add conversation selection/switching to frontend/components/chat/ChatInterface.tsx
- [X] T061 [US5] Implement conversation title auto-generation from first message in backend/app/routers/chat.py
- [X] T062 [US5] Add "New Conversation" button to frontend chat interface
- [ ] T063 [US5] Test conversation persistence: create todos, logout, login → verify conversation history visible
- [ ] T064 [US5] Test conversation switching: create 2 conversations, switch between them → verify context preserved
- [ ] T065 [US5] Test conversation deletion: delete conversation → verify messages cascade deleted

**Checkpoint**: All 5 user stories fully functional - complete AI todo chatbot with conversation history

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and hardening that affect multiple user stories

- [X] T066 [P] Add comprehensive error handling for MCP tool failures in all tools (backend/app/mcp/tools/*.py)
- [X] T067 [P] Implement structured logging for agent operations in backend/app/agent/runner.py
- [X] T068 [P] Add rate limiting for chat API to prevent abuse in backend/app/routers/chat.py
- [X] T069 [P] Implement conversation pagination for very long histories (limit 50 messages) in backend/app/routers/chat.py
- [X] T070 [P] Add loading skeletons and empty states to frontend chat components
- [X] T071 [P] Implement optimistic UI updates for better UX in frontend/components/chat/MessageInput.tsx
- [X] T072 [P] Add conversation archival strategy for messages older than 90 days
- [ ] T073 [P] Implement agent prompt optimization based on testing feedback
- [X] T074 [P] Add input validation and sanitization for chat messages in backend/app/routers/chat.py
- [X] T075 [P] Add XSS prevention for AI-generated responses in frontend/components/chat/MessageBubble.tsx
- [X] T076 [P] Create comprehensive error messages in frontend for common failure scenarios
- [X] T077 [P] Add accessibility improvements to chat interface (ARIA labels, keyboard navigation)
- [X] T078 [P] Optimize database queries with proper indexes (already in migration, verify)
- [X] T079 [P] Add monitoring and metrics for AI service latency and costs
- [ ] T080 Run quickstart.md validation end-to-end (setup → chat flow → verification)
- [X] T081 Document deployment configuration (environment variables, secrets) in quickstart.md
- [X] T082 Create troubleshooting guide for common issues in quickstart.md

**Checkpoint**: Production-ready AI todo chatbot with all polish and hardening complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
  - **Recommended MVP**: Phase 3 (US1) only - users can create todos via chat
- **Polish (Phase 8)**: Depends on desired user stories being complete (minimum US1 for MVP)

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other user stories - can start after Foundational
- **User Story 2 (P2)**: No dependencies on other user stories - can start after Foundational (works independently)
- **User Story 3 (P3)**: No dependencies on other user stories - can start after Foundational (works independently)
- **User Story 4 (P4)**: No dependencies on other user stories - can start after Foundational (works independently)
- **User Story 5 (P5)**: No dependencies on other user stories - can start after Foundational (works independently)

**Key Insight**: All user stories are independently testable and can be implemented in parallel after Foundational phase completes.

### Within Each User Story

- MCP tools before agent integration
- Backend implementation before frontend integration
- Core functionality before error handling and polish

### Parallel Opportunities

- **Setup (Phase 1)**: Tasks T002, T003, T004, T005 can run in parallel
- **Foundational (Phase 2)**: Tasks T007, T008, T009, T010 can run in parallel (different files)
- **User Story 1 (Phase 3)**: Tasks T016-T020 can run in parallel (different files/components)
- **User Story 2 (Phase 4)**: Task T031 can run in parallel with agent updates
- **User Story 3 (Phase 5)**: Task T039 can run in parallel with agent updates
- **User Story 4 (Phase 6)**: Tasks T048, T049 can run in parallel
- **User Story 5 (Phase 7)**: Tasks T056, T057, T058, T059 can run in parallel
- **Polish (Phase 8)**: Most tasks (T066-T079) can run in parallel

**After Foundational (Phase 2) completes**: All user stories (Phases 3-7) can be worked on in parallel by different team members

---

## Parallel Example: User Story 1 (MVP)

```bash
# After Foundational phase completes, these tasks can run in parallel:

# Developer A: Backend MCP Tool
- [ ] T016 [P] [US1] Implement add_task MCP tool

# Developer B: Frontend Components (4 components in parallel)
- [ ] T017 [P] [US1] Create ChatInterface component
- [ ] T018 [P] [US1] Create MessageInput component
- [ ] T019 [P] [US1] Create MessageBubble component
- [ ] T020 [P] [US1] Create MessageList component

# Then sequentially:
# Developer A + B together: Integration
- [ ] T021 [US1] Register add_task tool with MCP server
- [ ] T022 [US1] Connect agent to add_task MCP tool
- [ ] T023 [US1] Implement POST /api/chat endpoint
- [ ] T024 [US1] Create chat page
- [ ] T025 [US1] Add chat route to navigation

# Then: Error handling and testing
- [ ] T026-T030 Error handling, testing, verification
```

---

## Implementation Strategy

### Minimum Viable Product (MVP)

**Recommended MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1)

This delivers:
- Working chat interface
- Natural language todo creation
- Conversation persistence
- Core AI agent functionality

**Estimated MVP Task Count**: 30 tasks (T001-T030)

### Incremental Delivery

After MVP (US1), deliver user stories in priority order:

1. **MVP**: US1 - Create todos via chat (Phase 3)
2. **Release 2**: US2 - Query todos conversationally (Phase 4) - adds 8 tasks
3. **Release 3**: US3 - Update todos via chat (Phase 5) - adds 9 tasks
4. **Release 4**: US4 - Complete/delete todos (Phase 6) - adds 8 tasks
5. **Release 5**: US5 - Conversation history management (Phase 7) - adds 10 tasks
6. **Release 6**: Polish and production hardening (Phase 8) - adds 17 tasks

Each release is independently testable and delivers incremental value.

### Testing Strategy

Tests are NOT explicitly requested in specification. Focus on:
- Manual testing using quickstart.md scenarios
- Acceptance scenario verification from spec.md
- Independent test criteria for each user story

If tests become needed later:
- Add contract tests for each MCP tool
- Add integration tests for chat flow
- Add E2E tests using Playwright

---

## Total Task Summary

- **Total Tasks**: 82 tasks
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 10 tasks (BLOCKS all user stories)
- **User Story 1 (MVP)**: 15 tasks
- **User Story 2**: 8 tasks
- **User Story 3**: 9 tasks
- **User Story 4**: 8 tasks
- **User Story 5**: 10 tasks
- **Polish Phase**: 17 tasks

**Parallelizable Tasks**: 38 tasks marked with [P]

**MVP Path**: Complete T001-T030 (30 tasks) for working AI todo chatbot with natural language creation

**User Story Independence**: All 5 user stories can be implemented independently after Foundational phase, enabling parallel development by multiple team members.