# Constitution History Prompt - Phase V Evolution

## Overview

This document captures the complete evolution of the Todo Chatbot System Constitution from Phase I (Basic Web App) through Phase V (Cloud-Native Event-Driven Microservices). Each phase represents a major architectural transformation.

---

## Phase I: Foundation (v1.0.0)

**Date**: 2026-01-12
**Status**: SUPERSEDED
**Scope**: Basic Todo Full-Stack Web Application

### Architecture
- **Monolithic Architecture**: Single Next.js app with integrated backend
- **Technology**: Next.js 16+ (App Router), FastAPI, PostgreSQL
- **Authentication**: Better Auth with JWT
- **Deployment**: Traditional web hosting

### Core Principles Established (5 Principles)

1. **Security-First Development**
   - JWT authentication required
   - User isolation enforced
   - No security vulnerabilities

2. **Spec-Driven Implementation**
   - All features defined in specs before coding
   - No ad-hoc changes

3. **User Isolation and Data Integrity**
   - Every todo belongs to one user
   - Cross-user access forbidden

4. **Production Realism**
   - Production-ready patterns only
   - No shortcuts or mocks
   - Environment variables for config

5. **Full-Stack Clarity**
   - Clear layer boundaries (Frontend, Backend, Database)
   - Simple, understandable code

### Key Constraints
- RESTful JSON over HTTPS
- Backend-only database access
- Better Auth secret shared between frontend/backend
- SQLModel ORM for type safety

### Success Criteria
- User signup/signin working
- CRUD operations on todos
- User isolation verified
- JWT authentication functional

---

## Phase II: Database Enhancement (v1.1.0 - IMPLIED)

**Date**: 2026-01-15 (estimated)
**Status**: SUPERSEDED
**Scope**: Enhanced database schema and features

### Architecture Changes
- **Database Evolution**: Extended schema for categories and tags
- **Technology**: Added Neon Serverless PostgreSQL
- **Features**: Priorities, due dates, search, filtering

### Database Schema
```
users → todos (one-to-many)
users → categories (one-to-many)
users → tags (one-to-many)
todos ↔ tags (many-to-many via junction table)
```

### Key Additions
- Categories for organization
- Tags for flexible labeling
- Soft delete mechanism
- Indexes for performance

### Retained Principles
- All Phase I principles maintained
- Extended user isolation to categories and tags

---

## Phase III: AI-Powered Chatbot (v2.0.0)

**Date**: 2026-01-22
**Status**: SUPERSEDED
**Scope**: Natural language todo management via AI agents

### Architecture Transformation
- **AI Integration**: OpenAI Agents SDK for natural language processing
- **MCP Tools**: Model Context Protocol for tool-based interactions
- **Chat Interface**: ChatKit for conversational UI
- **Stateless Design**: All state in database, no in-memory sessions

### Technology Stack Additions
- **Agent Framework**: OpenAI Agents SDK
- **Tool Protocol**: MCP SDK
- **Chat UI**: ChatKit
- **Database Extensions**: Conversations and messages tables

### New Architecture Layers
```
UI Layer (ChatKit)
    ↓
Backend Layer (FastAPI + Agents SDK)
    ↓
MCP Layer (Tool definitions)
    ↓
Database Layer (PostgreSQL)
```

### Core Principles Extended
- **Security-First**: Extended to conversations and messages
- **User Isolation**: Now includes conversation history
- **Statelessness**: Context rebuilt from DB on every request

### Key Innovations
1. **Tool-Based Agent Interaction**
   - AI agents use MCP tools exclusively
   - No direct database access
   - Tools: create_todo, list_todos, get_todo, update_todo, delete_todo, search_todos

2. **Conversation Management**
   - Conversations table (user-scoped)
   - Messages table (with tool calls/results)
   - Full context rebuilding per request

3. **Agent Behavior Standards**
   - Intent inference from natural language
   - Tool selection based on intent
   - Conversational responses
   - Graceful error handling

### Database Schema Extensions
```
users → conversations (one-to-many)
conversations → messages (one-to-many)
messages store: role, content, tool_calls, tool_results
```

### API Endpoints Added
- `POST /api/conversations` - Create conversation
- `GET /api/conversations` - List conversations
- `GET /api/conversations/{id}` - Get conversation with history
- `POST /api/chat` - Send message, receive agent response
- `DELETE /api/conversations/{id}` - Delete conversation

### Success Criteria
- Natural language todo management working
- AI agent correctly interprets intent
- MCP tools execute successfully
- Conversations persisted to database
- Stateless architecture verified

---

## Phase IV: Advanced Features (v2.5.0 - IMPLIED)

**Date**: 2026-01-30 (estimated)
**Status**: SUPERSEDED
**Scope**: Feature enhancements and optimizations

### Feature Additions
- Recurring tasks (daily, weekly, monthly)
- Due date reminders
- Enhanced search and filtering
- Tag-based organization
- Priority management

### Database Enhancements
- Recurring task fields (pattern, next_occurrence)
- Reminder timestamps
- Full-text search indexes

### Retained Architecture
- Monolithic deployment
- Stateless AI agents
- MCP tool layer
- Single database

---

## Phase V: Cloud-Native Microservices (v3.0.0)

**Date**: 2026-02-07
**Status**: CURRENT
**Scope**: Event-driven distributed system on Kubernetes

### Architectural Revolution
This is the most significant transformation, moving from a monolithic application to a fully distributed, event-driven microservices architecture deployed on Kubernetes.

### Microservices Decomposition (5 Services)

#### 1. Chat API / Backend Service
- **Responsibility**: User requests, AI orchestration, event publishing
- **Technology**: FastAPI + OpenAI Agents SDK + MCP
- **Publishes**: `task-events`, `task-updates`, `reminders`
- **Consumes**: None (synchronous only)
- **Dapr Blocks**: Pub/Sub, State, Secrets, Invocation

#### 2. Notification Service
- **Responsibility**: Send scheduled reminders
- **Technology**: Python (FastAPI or standalone)
- **Publishes**: None
- **Consumes**: `reminders`
- **Dapr Blocks**: Pub/Sub, Bindings (cron), Secrets

#### 3. Recurring Task Service
- **Responsibility**: Auto-create next recurring task
- **Technology**: Python (event-driven worker)
- **Publishes**: `task-events`
- **Consumes**: `task-events` (filters for completed recurring)
- **Dapr Blocks**: Pub/Sub, State

#### 4. Audit / Activity Log Service
- **Responsibility**: Immutable history of all task operations
- **Technology**: Python (event consumer)
- **Publishes**: None
- **Consumes**: `task-events` (all events)
- **Dapr Blocks**: Pub/Sub, State

#### 5. WebSocket / Realtime Sync Service
- **Responsibility**: Broadcast updates to connected clients
- **Technology**: Python (WebSocket server)
- **Publishes**: WebSocket messages
- **Consumes**: `task-updates`
- **Dapr Blocks**: Pub/Sub, State (connection tracking)

### Event-Driven Communication

#### Kafka Topics (3 Required)
1. **task-events** - All task lifecycle events
2. **reminders** - Due date notifications
3. **task-updates** - Real-time UI sync

#### Event Schema Standard
```json
{
  "eventId": "uuid-v4",
  "eventType": "task.created | task.updated | task.completed | task.deleted",
  "timestamp": "ISO-8601",
  "version": "1.0",
  "source": "service-name",
  "userId": "user-id",
  "data": { /* task data */ },
  "metadata": {
    "correlationId": "trace-id",
    "causationId": "originating-event-id"
  }
}
```

### Dapr Building Blocks (All 5 Mandatory)

1. **Pub/Sub** → Kafka/Redpanda (event streaming)
2. **State Management** → PostgreSQL (session, schedules)
3. **Bindings** → Cron (periodic tasks)
4. **Service Invocation** → HTTP/gRPC (sync calls)
5. **Secrets Management** → Kubernetes Secrets

### Infrastructure Transformation

#### Container Orchestration
- **Local**: Minikube (4 CPU, 8GB RAM minimum)
- **Cloud**: DOKS (preferred) / GKE / AKS
- **Deployment**: Helm charts
- **Scaling**: Horizontal pod autoscaling

#### Technology Stack Extensions
```
Phase I-III Stack (Retained):
- Next.js 16+ (Frontend)
- FastAPI (Backend)
- SQLModel (ORM)
- Neon PostgreSQL (Database)
- Better Auth (JWT)

Phase V Additions (Non-Negotiable):
- Kubernetes (Container orchestration)
- Dapr (Distributed runtime)
- Kafka/Redpanda (Event streaming)
- GitHub Actions (CI/CD)
- Prometheus/Grafana (Monitoring)
- Loki (Logging)
- Jaeger (Tracing)
```

### Core Principles Evolution

#### Updated Principles (5 → 5, but transformed)

1. **Security-First Development** (EXTENDED)
   - **Phase I**: JWT, user isolation
   - **Phase V**: + Service-to-service security, Kubernetes Secrets, no hardcoded credentials

2. **Spec-Driven Implementation** (EXTENDED)
   - **Phase I**: API specs before code
   - **Phase V**: + Event schemas versioned, microservice contracts documented

3. **User Isolation and Data Integrity** (EXTENDED)
   - **Phase I**: User-scoped todos
   - **Phase III**: + User-scoped conversations
   - **Phase V**: + User ID in all events, isolation across service boundaries

4. **Production Realism** → **Cloud-Native Production Readiness** (RENAMED & EXPANDED)
   - **Phase I**: Production patterns, env vars
   - **Phase V**: + Containerization, statelessness, horizontal scaling, observability

5. **Full-Stack Clarity** → **Distributed Systems Clarity** (RENAMED & EXPANDED)
   - **Phase I**: Clear layers (UI, Backend, DB)
   - **Phase V**: + Service boundaries, event contracts, explicit communication patterns

### NON-NEGOTIABLE Architecture Principles (4 New Rules)

These are Phase V-specific architectural constraints:

1. **Event-Driven First**
   - All task actions publish events
   - Services communicate via events (not direct calls)

2. **Loose Coupling via Dapr**
   - No direct Kafka, DB, or secrets usage
   - All infrastructure via Dapr building blocks

3. **Sidecar Model**
   - Every service has Dapr sidecar
   - App talks to Dapr via localhost HTTP/gRPC

4. **Cloud-Ready by Design**
   - Minikube works = Cloud works
   - YAML-based configuration
   - No environment-specific code

### Deployment Model

#### Local (Minikube)
```
Prerequisites:
- Minikube cluster (4 CPU, 8GB RAM)
- Dapr init -k
- Redpanda (Docker/Helm)
- kubectl configured

Deployment:
1. Build Docker images (5 services)
2. Load to Minikube
3. Apply Dapr components
4. Apply K8s manifests
5. Verify sidecars injected
6. Test event flow
```

#### Cloud (DOKS/GKE/AKS)
```
Prerequisites:
- Managed K8s cluster (3+ nodes)
- Dapr via Helm
- Redpanda Cloud
- Container registry
- Helm charts

Deployment:
1. Push images to registry
2. Configure Helm values (replicas, resources)
3. helm install todo-system
4. Configure external Kafka
5. Set up monitoring/logging
```

### CI/CD Pipeline (GitHub Actions)

#### 3 Required Workflows

1. **Build & Test** (every PR)
   - Lint, test, build images, scan vulnerabilities

2. **Deploy to Staging** (merge to main)
   - Build, push, deploy to staging, smoke tests

3. **Deploy to Production** (release tag)
   - Deploy, health checks, monitor, auto-rollback

### Observability Requirements

#### Health Checks (MANDATORY)
- Liveness: `GET /health/live`
- Readiness: `GET /health/ready`

#### Logging (Structured JSON)
- Timestamp, level, service, correlation ID, user ID
- Log all event publish/consume

#### Monitoring Metrics
- Uptime, latency (p50/p95/p99), event lag, error rates, resource usage

#### Tools Stack
- Prometheus (metrics)
- Grafana (dashboards)
- Loki (logs)
- Jaeger (tracing)

### Forbidden Patterns (10 Anti-Patterns)

1. ❌ Hardcoded credentials/secrets
2. ❌ Direct Kafka client usage (use Dapr)
3. ❌ Monolithic service deployment
4. ❌ Missing event schemas
5. ❌ Cloud before Minikube validation
6. ❌ In-memory state storage
7. ❌ Direct DB access from multiple services
8. ❌ Sync HTTP for event-driven flows
9. ❌ Missing health checks
10. ❌ No rollback strategy

### Success Criteria (42 Checkpoints)

#### Minikube Validation (7 checks)
- 5 services deployed with Dapr sidecars
- Redpanda running
- Events flowing through topics
- All Dapr blocks used
- Health checks passing
- Full user flow works

#### Cloud Validation (6 checks)
- 5 services on cloud K8s
- Redpanda Cloud connected
- Helm deployment
- 2+ replicas per service
- External endpoints
- Identical to Minikube

#### Event-Driven Validation (5 checks)
- All CRUD operations publish events
- Events have required fields
- Idempotent consumers
- Event ordering preserved
- Retry logic on failures

#### Dapr Validation (5 checks)
- No direct Kafka usage
- No direct DB drivers
- Secrets via Dapr
- Service invocation via Dapr
- Cron bindings used

#### CI/CD Validation (6 checks)
- Pipeline functional
- Automated builds/tests
- Automated staging deploy
- Manual prod approval
- Rollback tested

#### Observability Validation (5 checks)
- Liveness/readiness probes
- Structured JSON logs
- Metrics collected
- Dashboards created
- Alerts configured

#### Documentation Validation (6 checks)
- Architecture diagram
- Event schemas documented
- Minikube deployment guide
- Cloud deployment guide
- Operational runbook
- Troubleshooting guide

**TOTAL**: 42 verification checkpoints

---

## Architecture Evolution Diagram

```
Phase I: Monolithic Web App
┌─────────────────────────────────┐
│     Next.js Frontend            │
│  ┌──────────────────────────┐   │
│  │  FastAPI Backend         │   │
│  │    ↓                     │   │
│  │  PostgreSQL Database     │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘

Phase III: AI-Powered Chatbot (Still Monolithic)
┌─────────────────────────────────┐
│  ChatKit UI                     │
│    ↓                            │
│  FastAPI + OpenAI Agents        │
│    ↓                            │
│  MCP Tools Layer                │
│    ↓                            │
│  PostgreSQL (+ conversations)   │
└─────────────────────────────────┘

Phase V: Event-Driven Microservices
┌──────────────────────────────────────────────────┐
│              Kubernetes Cluster                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ Chat API   │  │Notification│  │  Recurring │ │
│  │ + Dapr     │  │  Service   │  │   Task     │ │
│  │            │  │  + Dapr    │  │  Service   │ │
│  └─────┬──────┘  └─────┬──────┘  │  + Dapr    │ │
│        │               │         └─────┬──────┘ │
│        │               │               │        │
│        └───────────────┴───────────────┘        │
│                Kafka/Redpanda                    │
│        ┌───────────────┬───────────────┐        │
│        │               │               │        │
│  ┌─────▼──────┐  ┌─────▼──────┐  ┌────▼──────┐ │
│  │   Audit    │  │  WebSocket │  │    Neon   │ │
│  │  Service   │  │    Sync    │  │PostgreSQL │ │
│  │  + Dapr    │  │  Service   │  │           │ │
│  └────────────┘  │  + Dapr    │  └───────────┘ │
│                  └────────────┘                 │
│                                                  │
│  Monitoring: Prometheus, Grafana, Loki, Jaeger  │
└──────────────────────────────────────────────────┘
```

---

## Technology Stack Evolution Timeline

| Component | Phase I | Phase III | Phase V |
|-----------|---------|-----------|---------|
| **Frontend** | Next.js 16+ | Next.js 16+ + ChatKit | Next.js 16+ + ChatKit |
| **Backend** | FastAPI | FastAPI + Agents SDK | FastAPI (microservices) |
| **Database** | PostgreSQL | PostgreSQL + conversations | Neon PostgreSQL (Dapr state) |
| **ORM** | SQLModel | SQLModel | SQLModel (+ Dapr) |
| **Auth** | Better Auth JWT | Better Auth JWT | Better Auth JWT |
| **AI Agents** | - | OpenAI Agents SDK | OpenAI Agents SDK |
| **Tools** | - | MCP SDK | MCP SDK |
| **Messaging** | - | - | Kafka/Redpanda |
| **Runtime** | - | - | Dapr (all 5 blocks) |
| **Orchestration** | - | - | Kubernetes |
| **CI/CD** | Manual | Manual | GitHub Actions |
| **Monitoring** | - | - | Prometheus + Grafana |
| **Logging** | - | - | Loki |
| **Tracing** | - | - | Jaeger |

---

## Principles Evolution Matrix

| Principle | Phase I | Phase III | Phase V |
|-----------|---------|-----------|---------|
| **Security-First** | JWT, user isolation | + Conversations isolated | + Service security, K8s Secrets |
| **Spec-Driven** | API specs | + MCP tool specs | + Event schemas, service contracts |
| **User Isolation** | Todos per user | + Conversations per user | + Events include userId |
| **Production Realism** | Env vars, no shortcuts | + Stateless agents | **→ Cloud-Native**: containers, scaling, observability |
| **Full-Stack Clarity** | UI/Backend/DB layers | + MCP tool layer | **→ Distributed Systems**: service boundaries, event contracts |

---

## Database Schema Evolution

### Phase I Schema
```sql
users (id, email, password_hash, created_at)
todos (id, user_id, title, description, status, priority, due_date, created_at, updated_at)
```

### Phase II Schema (Implied)
```sql
+ categories (id, user_id, name, color, created_at)
+ tags (id, user_id, name, color, created_at)
+ todo_tags (id, todo_id, tag_id, created_at)
+ todos.deleted_at (soft delete)
```

### Phase III Schema
```sql
+ conversations (id, user_id, title, created_at, updated_at)
+ messages (id, conversation_id, role, content, tool_calls, tool_results, created_at)
```

### Phase V Schema (No Changes, but Access Pattern Changes)
```sql
Same schema, but now:
- Accessed via Dapr state management
- Multiple services may read (via Dapr)
- Events published on all mutations
- Audit log stored separately
```

---

## Deployment Model Evolution

| Aspect | Phase I | Phase III | Phase V |
|--------|---------|-----------|---------|
| **Architecture** | Monolithic | Monolithic (stateless) | Microservices (5 services) |
| **Deployment** | Single app | Single app | K8s pods (10+ containers with sidecars) |
| **Scaling** | Vertical | Vertical | Horizontal (per service) |
| **Communication** | In-process | In-process | Events (Kafka) + Dapr invocation |
| **State** | In-memory + DB | Database only | Database (via Dapr) |
| **Orchestration** | None | None | Kubernetes |
| **CI/CD** | Manual | Manual | GitHub Actions (automated) |
| **Observability** | Basic logs | Basic logs | Full stack (metrics, logs, traces) |
| **Deployment Time** | Minutes | Minutes | Seconds (rolling updates) |
| **Rollback** | Manual | Manual | Automated (K8s revisions) |

---

## Success Criteria Evolution

### Phase I Success
- [ ] User signup/signin works
- [ ] CRUD operations functional
- [ ] User isolation verified

**Total**: ~5 checks

### Phase III Success
- [ ] All Phase I criteria
- [ ] AI agent interprets intent
- [ ] MCP tools execute
- [ ] Conversations persisted
- [ ] Stateless architecture

**Total**: ~10 checks

### Phase V Success
- [ ] All Phase III criteria
- [ ] 5 microservices deployed (Minikube + Cloud)
- [ ] Events flowing through Kafka
- [ ] All Dapr blocks used
- [ ] CI/CD pipeline functional
- [ ] Observability operational
- [ ] 42 specific validation checkpoints

**Total**: **42 checks** across 6 categories

---

## Complexity Growth Metrics

| Metric | Phase I | Phase III | Phase V |
|--------|---------|-----------|---------|
| **Services** | 1 | 1 | 5 |
| **Containers** | 1 | 1 | 10+ (with sidecars) |
| **Communication Patterns** | HTTP only | HTTP only | HTTP + Events + Dapr |
| **Infrastructure Components** | 3 (Frontend, Backend, DB) | 4 (+ AI Agents) | 10+ (+ K8s, Dapr, Kafka, Monitoring) |
| **Database Tables** | 2 | 4 | 4 (but accessed differently) |
| **API Endpoints** | ~6 | ~10 | ~15+ (across 5 services) |
| **Event Topics** | 0 | 0 | 3 |
| **Deployment Steps** | ~5 | ~5 | ~20+ |
| **Success Checks** | ~5 | ~10 | 42 |
| **Lines of Config** | ~100 | ~200 | ~1000+ (K8s manifests, Dapr components, Helm charts) |

---

## Key Learnings Per Phase

### Phase I Learnings
- ✅ Spec-driven development prevents rework
- ✅ User isolation must be enforced at every layer
- ✅ JWT authentication is production-ready
- ✅ SQLModel provides type safety

### Phase III Learnings
- ✅ Stateless architecture enables scalability
- ✅ AI agents need clear tool interfaces (MCP)
- ✅ Context rebuilding from DB prevents state bugs
- ✅ Conversation history must be user-scoped

### Phase V Learnings
- ✅ Event-driven architecture decouples services
- ✅ Dapr abstracts infrastructure complexity
- ✅ Kubernetes enables horizontal scaling
- ✅ Observability is not optional (metrics, logs, traces)
- ✅ CI/CD automation prevents deployment errors
- ✅ Minikube validation before cloud is essential
- ✅ Configuration parity (local = cloud) prevents surprises
- ✅ Health checks are critical for orchestration

---

## Migration Path (Hypothetical)

If migrating existing Phase III system to Phase V:

### Step 1: Containerization
- Create Dockerfiles for existing monolith
- Test in Docker Compose
- Validate functionality

### Step 2: Minikube Deployment
- Deploy monolith to Minikube
- Add Dapr sidecar
- Verify identical behavior

### Step 3: Service Extraction
- Extract Notification Service first (least coupled)
- Add Kafka/Redpanda
- Publish events from monolith
- Consume in Notification Service
- Verify end-to-end

### Step 4: Iterate Service Extraction
- Extract Recurring Task Service
- Extract Audit Service
- Extract WebSocket Service
- Each extraction: test in Minikube first

### Step 5: Observability
- Add Prometheus metrics
- Set up Grafana dashboards
- Configure Loki logging
- Enable Jaeger tracing

### Step 6: CI/CD
- Create GitHub Actions workflows
- Automate builds and tests
- Automate deployment to staging
- Add manual gate for production

### Step 7: Cloud Deployment
- Set up cloud K8s cluster (DOKS/GKE/AKS)
- Configure Helm charts
- Deploy to cloud
- Validate identical behavior

### Step 8: Cutover
- Gradual traffic shift (monolith → microservices)
- Monitor error rates
- Rollback plan ready
- Full cutover when validated

**Estimated Timeline**: 4-8 weeks (depends on team size and expertise)

---

## Conclusion

The Todo Chatbot System has evolved from a simple monolithic web application (Phase I) to a sophisticated, cloud-native, event-driven microservices architecture (Phase V) deployed on Kubernetes.

### Key Transformations

1. **Architecture**: Monolith → Stateless AI Chatbot → Distributed Microservices
2. **Communication**: In-process → In-process → Events + Dapr
3. **Deployment**: Manual → Manual → Automated CI/CD on Kubernetes
4. **Scaling**: Vertical → Vertical → Horizontal (per service)
5. **Observability**: Basic → Basic → Full stack (metrics, logs, traces)

### Principles Retained Across All Phases

- ✅ Security-First Development
- ✅ Spec-Driven Implementation
- ✅ User Isolation and Data Integrity

These core principles have been **extended and adapted** but never compromised.

### Phase V as the Current State

Phase V represents the **production-grade, enterprise-ready architecture** suitable for:
- High-scale deployments (10K+ users)
- Mission-critical workloads
- Real-time event processing
- Cloud-native environments
- DevOps automation
- Compliance and audit requirements

---

## References

- Constitution v1.0.0: `.specify/memory/constitution-v1.md` (archived)
- Constitution v2.0.0: `.specify/memory/constitution-v2.md` (archived)
- Constitution v3.0.0 (Current): `.specify/memory/constitution.md`
- Architecture Diagrams: `.specify/docs/architecture/`
- Event Schemas: `.specify/docs/events/`
- Deployment Guides: `.specify/docs/deployment/`

---

**Document Version**: 1.0
**Last Updated**: 2026-02-07
**Status**: Current for Phase V (Constitution v3.0.0)
