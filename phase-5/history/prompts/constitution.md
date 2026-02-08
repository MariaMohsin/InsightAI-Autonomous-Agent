<!--
Sync Impact Report:
Version: 2.0.0 → 3.0.0
Rationale: Phase V Amendment - Cloud-Native Event-Driven Microservices with Kubernetes & Dapr

Modified Principles:
- RENAMED: Production Realism → Cloud-Native Production Readiness (expanded for K8s)
- EXTENDED: Full-Stack Clarity → Distributed Systems Clarity (now includes microservices boundaries)
- EXTENDED: Technology Stack (added Kubernetes, Dapr, Kafka/Redpanda, GitHub Actions)

Added Sections:
- Phase V: Cloud-Native Event-Driven Architecture
  - Purpose and Strategic Goals
  - NON-NEGOTIABLE Architecture Principles (4 core rules)
  - Mandatory Microservices Architecture (5 required services)
  - Event-Driven Communication Standards
  - Dapr Building Blocks (complete usage mandate)
  - Kafka Topics and Event Schemas
  - Deployment Requirements (Minikube + Cloud)
  - CI/CD and Observability Requirements
  - Forbidden Patterns and Anti-Patterns
  - Success Criteria and Compliance Checklist

Templates Status:
✅ plan-template.md - Constitution Check section supports Phase V requirements
✅ spec-template.md - Supports microservices and event-driven specifications
✅ tasks-template.md - Task structure supports distributed systems implementation
⚠ commands/*.md - May need updates for cloud deployment workflows

Follow-up TODOs:
- Create feature specs for each of the 5 microservices
- Define all event schemas for Kafka topics
- Design Dapr component configurations
- Plan Kubernetes deployment manifests (Minikube + Cloud)
- Set up GitHub Actions CI/CD pipeline
- Configure monitoring and logging infrastructure

Previous Amendments:
- v2.0.0 (2026-01-22): Phase III - AI-Powered Todo Chatbot with MCP Tools
- v1.0.0 (2026-01-12): Initial constitution for Todo Full-Stack Web Application
-->

# Todo Chatbot System Constitution

## Core Principles

### I. Security-First Development

Authentication and authorization MUST be enforced at every layer of the application. All
protected API endpoints MUST require valid JWT authentication. User identity MUST be
derived exclusively from verified JWT tokens, never from client-provided data. Security
vulnerabilities (SQL injection, XSS, CSRF, authentication bypass, token leakage) MUST be
actively prevented through proper validation, sanitization, and secure coding practices.

In distributed systems, security MUST extend to service-to-service communication. Secrets
MUST be managed via Kubernetes Secrets or external secret managers, never hardcoded or
committed to version control.

**Rationale**: Multi-user distributed applications require robust security at every boundary.
Microservices introduce additional attack surfaces that must be protected. Security cannot
be retrofitted; it must be designed into every component from the start.

### II. Spec-Driven Implementation

All API behavior, endpoints, request/response schemas, event schemas, and feature
functionality MUST be explicitly defined in feature specifications before implementation
begins. Implementation MUST follow approved specs without deviation. Changes to behavior
require spec amendments, not ad-hoc code modifications.

For event-driven systems, event schemas MUST be versioned and documented before any
producer or consumer is implemented.

**Rationale**: Spec-driven development ensures all stakeholders agree on requirements
before costly implementation work begins, reduces rework, and creates living documentation
that stays synchronized with the codebase. In distributed systems, explicit contracts
prevent integration failures.

### III. User Isolation and Data Integrity

Every todo item, conversation, message, and event MUST be associated with exactly one user.
Task ownership MUST be enforced on every read, write, update, and delete operation at the
database, API, and event layer. Users MUST only access their own data. Cross-user data
leakage is a critical defect that violates user trust and privacy.

In event-driven architectures, all published events MUST include authenticated `user_id` to
maintain isolation across service boundaries.

**Rationale**: Multi-user distributed applications must guarantee data isolation. A user
seeing or modifying another user's data is an unacceptable security and privacy violation,
regardless of which service processes the request.

### IV. Cloud-Native Production Readiness

All code patterns, architecture decisions, and infrastructure implementations MUST be
suitable for production deployment on Kubernetes clusters (local and cloud). Avoid
shortcuts, mock authentication, hardcoded secrets, or development-only patterns that would
need to be rewritten for production use.

Applications MUST be containerized, stateless, horizontally scalable, and observable. Use
environment variables and ConfigMaps for configuration, proper health checks, graceful
shutdown, and structured logging.

**Rationale**: Cloud-native patterns enable elastic scaling, high availability, and
operational excellence. Building with production patterns from the start prevents technical
debt and teaches industry-standard practices for distributed systems.

### V. Distributed Systems Clarity

Code MUST be clear and understandable to developers working across frontend, backend,
microservices, event streams, and infrastructure layers. Each service MUST have a single,
well-defined responsibility. Service boundaries MUST be explicit and respected.

Communication between services MUST follow documented patterns: synchronous via Dapr
service invocation, or asynchronous via Kafka events. Avoid unnecessary abstractions,
distributed monoliths, or tight coupling between services.

**Rationale**: Distributed systems introduce complexity. Clear service boundaries, explicit
communication contracts, and simple designs allow developers to understand system behavior,
debug production issues, and evolve services independently.

## Technology Stack and Constraints

**Non-Negotiable Stack (Phases I-III Retained)**:
- **Frontend**: Next.js 16+ using App Router (Server Components, Client Components)
- **Backend**: Python FastAPI (async endpoints, Pydantic validation, OpenAPI docs)
- **ORM**: SQLModel (SQLAlchemy + Pydantic for type-safe database models)
- **Database**: Neon Serverless PostgreSQL (with connection pooling)
- **Authentication**: Better Auth with JWT tokens

**Phase V Additions (Non-Negotiable)**:
- **Container Orchestration**: Kubernetes (Minikube for local, DOKS/GKE/AKS for cloud)
- **Distributed Runtime**: Dapr (pub/sub, state management, bindings, service invocation, secrets)
- **Event Streaming**: Kafka or Redpanda (event-driven communication between services)
- **CI/CD**: GitHub Actions (automated build, test, deploy)
- **Observability**: Health checks, readiness probes, structured logging, monitoring

**Architectural Constraints**:
- **Service Communication**: Event-driven via Kafka topics (primary), Dapr service invocation (secondary)
- **Statelessness**: All services MUST be stateless; persist state in database or Dapr state store
- **Sidecar Pattern**: Every service MUST run with a Dapr sidecar container
- **No Direct Dependencies**: Services MUST NOT use Kafka clients, database drivers, or secrets
  managers directly; all infrastructure access via Dapr building blocks
- **Cloud Portability**: Configuration MUST be YAML-based; works identically on Minikube and cloud

## Phase V: Cloud-Native Event-Driven Architecture

### Purpose and Strategic Goals

Transform the Todo Chatbot system from a monolithic application into a scalable, resilient,
event-driven microservices architecture deployed on Kubernetes. Enable:

- **Horizontal Scalability**: Each service scales independently based on load
- **Fault Isolation**: Service failures do not cascade to entire system
- **Asynchronous Processing**: Non-blocking event-driven workflows
- **Operational Excellence**: Automated deployments, monitoring, and recovery
- **Production Readiness**: Proven patterns suitable for real-world deployment

### NON-NEGOTIABLE Architecture Principles

#### 1. Event-Driven First

All task lifecycle actions (create, update, complete, delete) MUST publish events to Kafka
topics. Services MUST communicate through events, not direct API calls (except for
synchronous request-response flows via Dapr service invocation).

**Rationale**: Event-driven architecture decouples services, enables asynchronous processing,
and provides a durable audit trail. Events allow multiple consumers to react independently
without tight coupling.

#### 2. Loose Coupling via Dapr

Application code MUST NOT directly depend on:
- Kafka client libraries (use Dapr pub/sub)
- Database drivers (use Dapr state management)
- Secrets providers (use Dapr secrets management)
- Service discovery (use Dapr service invocation)

All infrastructure access MUST go through Dapr building blocks via HTTP or gRPC.

**Rationale**: Dapr abstracts infrastructure concerns, making services portable across
environments. Code remains simple and testable without vendor lock-in.

#### 3. Sidecar Model

Every service MUST run with a Dapr sidecar container in the same Kubernetes pod. The sidecar
handles all infrastructure communication. Application containers communicate with Dapr via
localhost HTTP (port 3500) or gRPC (port 50001).

**Rationale**: Sidecar pattern separates business logic from infrastructure concerns,
enables polyglot microservices, and centralizes cross-cutting concerns like retries,
circuit breakers, and observability.

#### 4. Cloud-Ready by Design

Anything that works on Minikube MUST work identically on cloud Kubernetes (DOKS/GKE/AKS).
Configuration MUST be externalized via environment variables, ConfigMaps, and Secrets.
No hardcoded URLs, credentials, or environment-specific logic in code.

**Rationale**: Environment parity prevents deployment surprises. Infrastructure-as-code
enables repeatable, auditable deployments. Cloud portability avoids vendor lock-in.

### Mandatory Microservices Architecture

The system MUST be decomposed into exactly these 5 microservices:

#### 1. Chat API / Backend Service (FastAPI + MCP)

**Responsibility**: Handle user requests, orchestrate AI agents, publish task events

**Publishes To**:
- `task-events` topic (all CRUD operations)
- `task-updates` topic (real-time sync triggers)
- `reminders` topic (when due dates are set)

**Consumes From**: None (synchronous request-response only)

**Dapr Building Blocks Used**:
- Pub/Sub (publish events)
- State Management (session state if needed)
- Secrets (database credentials, API keys)
- Service Invocation (call other services synchronously if needed)

**Deployment**: Kubernetes Deployment with Dapr sidecar, horizontal scaling enabled

#### 2. Notification Service

**Responsibility**: Consume reminder events and send scheduled notifications

**Publishes To**: None (terminal consumer)

**Consumes From**:
- `reminders` topic (due date reminders)

**Dapr Building Blocks Used**:
- Pub/Sub (consume events)
- Bindings (cron binding for periodic reminder checks)
- Secrets (email/SMS API keys)

**Deployment**: Kubernetes Deployment with Dapr sidecar, background consumer

#### 3. Recurring Task Service

**Responsibility**: Automatically create next recurring task when a recurring task completes

**Publishes To**:
- `task-events` topic (new recurring task created)

**Consumes From**:
- `task-events` topic (filter for completed recurring tasks)

**Dapr Building Blocks Used**:
- Pub/Sub (consume and publish events)
- State Management (track recurring task schedules)

**Deployment**: Kubernetes Deployment with Dapr sidecar, event-driven consumer

#### 4. Audit / Activity Log Service

**Responsibility**: Store immutable history of all task operations for compliance and analytics

**Publishes To**: None (terminal consumer, write-only audit store)

**Consumes From**:
- `task-events` topic (all events)

**Dapr Building Blocks Used**:
- Pub/Sub (consume events)
- State Management (append-only audit log storage)

**Deployment**: Kubernetes Deployment with Dapr sidecar, event-driven consumer

#### 5. WebSocket / Realtime Sync Service

**Responsibility**: Broadcast task updates to all connected clients for real-time UI sync

**Publishes To**: WebSocket connections (frontend clients)

**Consumes From**:
- `task-updates` topic (UI sync events)

**Dapr Building Blocks Used**:
- Pub/Sub (consume events)
- State Management (track active WebSocket connections)

**Deployment**: Kubernetes Deployment with Dapr sidecar, WebSocket server with sticky sessions

### Event-Driven Communication Standards

#### Kafka Topics (REQUIRED)

1. **`task-events`** - All task lifecycle events
   - Producers: Chat API Backend
   - Consumers: Notification Service, Recurring Task Service, Audit Service

2. **`reminders`** - Due date reminder events
   - Producers: Chat API Backend
   - Consumers: Notification Service

3. **`task-updates`** - Real-time UI sync events
   - Producers: Chat API Backend
   - Consumers: WebSocket Sync Service

#### Event Schema Standards

All events MUST follow this structure:

```json
{
  "eventId": "uuid-v4",
  "eventType": "task.created | task.updated | task.completed | task.deleted",
  "timestamp": "ISO-8601 timestamp",
  "version": "1.0",
  "source": "chat-api-backend",
  "userId": "authenticated user ID",
  "data": {
    "taskId": "uuid",
    "title": "string",
    "status": "pending | in_progress | completed",
    "priority": "low | medium | high",
    "dueDate": "ISO-8601 date or null",
    "isRecurring": "boolean",
    "recurringPattern": "daily | weekly | monthly | null",
    "tags": ["array", "of", "strings"]
  },
  "metadata": {
    "correlationId": "request trace ID",
    "causationId": "originating event ID if chained"
  }
}
```

**Event Versioning**: Event schema changes MUST increment version field and maintain
backward compatibility. Consumers MUST handle multiple versions gracefully.

**Event Ordering**: Events for the same `taskId` MUST be ordered by `timestamp`. Use
Kafka partition keys based on `taskId` to guarantee ordering.

### Dapr Building Blocks (Complete Usage Mandate)

All 5 Dapr building blocks MUST be utilized:

#### 1. Pub/Sub → Kafka (Redpanda)

**Component**: `pubsub.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: todo-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka-broker:9092"
    - name: authType
      value: "none"  # or SASL for cloud
```

**Usage**: All event publishing and consuming via Dapr HTTP API:
- Publish: `POST http://localhost:3500/v1.0/publish/todo-pubsub/task-events`
- Subscribe: Dapr calls service endpoint with events

#### 2. State Management → PostgreSQL (Neon)

**Component**: `statestore.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: todo-statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      secretKeyRef:
        name: db-secret
        key: connectionString
```

**Usage**: Session state, recurring task schedules, WebSocket connection tracking

#### 3. Bindings → Cron (for scheduled tasks)

**Component**: `cron-binding.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: reminder-cron
spec:
  type: bindings.cron
  version: v1
  metadata:
    - name: schedule
      value: "*/5 * * * *"  # every 5 minutes
```

**Usage**: Notification service checks for due reminders periodically

#### 4. Service Invocation

**Usage**: Synchronous service-to-service calls via Dapr:
- Frontend → Backend: `POST http://localhost:3500/v1.0/invoke/chat-api/method/chat`

**Benefit**: Service discovery, retries, load balancing without client libraries

#### 5. Secrets Management

**Component**: `secrets.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
spec:
  type: secretstores.kubernetes
  version: v1
```

**Usage**: All services retrieve secrets via Dapr, not direct environment variables:
- `GET http://localhost:3500/v1.0/secrets/kubernetes-secrets/db-password`

### Deployment Requirements

#### Local Deployment (Minikube)

**Prerequisites**:
1. Minikube cluster running (4 CPU, 8GB RAM minimum)
2. Dapr initialized on Kubernetes: `dapr init -k`
3. Redpanda running (Docker or Helm chart in Minikube)
4. kubectl configured for Minikube context

**Deployment Steps**:
1. Build Docker images for all 5 services
2. Load images into Minikube: `minikube image load <image>`
3. Apply Kubernetes manifests:
   - Dapr components (`dapr/components/*.yaml`)
   - Service deployments (`k8s/deployments/*.yaml`)
   - Service definitions (`k8s/services/*.yaml`)
   - ConfigMaps and Secrets (`k8s/config/*.yaml`)
4. Verify all pods running with Dapr sidecars
5. Test event flow end-to-end

**Success Criteria**: All 5 services deployed, Dapr sidecars injected, events flowing
through Kafka, health checks passing

#### Cloud Deployment (DOKS / GKE / AKS)

**Platform Choice** (select one):
- DigitalOcean Kubernetes (DOKS) - **Preferred** (cost-effective, simple)
- Google Kubernetes Engine (GKE)
- Azure Kubernetes Service (AKS)

**Cloud Requirements**:
1. Managed Kubernetes cluster (3 nodes minimum)
2. Dapr installed via Helm: `helm install dapr dapr/dapr`
3. Redpanda Cloud (Serverless tier) or managed Kafka
4. Container registry (DigitalOcean Container Registry, GCR, ACR)
5. Helm charts for all services

**Deployment Steps**:
1. Push images to container registry
2. Configure Helm values for production:
   - Replicas (2+ per service)
   - Resource limits
   - External endpoints (LoadBalancer)
3. Apply Helm charts: `helm install todo-system ./charts`
4. Configure external Kafka connection (Redpanda Cloud)
5. Set up monitoring and logging

**Success Criteria**: System runs identically to Minikube, auto-scaling configured,
monitoring dashboards operational

### CI/CD and Observability Requirements

#### GitHub Actions CI/CD Pipeline

**Required Workflows**:

1. **Build & Test** (on every PR):
   - Lint code (ruff, eslint)
   - Run unit tests
   - Run integration tests
   - Build Docker images
   - Scan images for vulnerabilities

2. **Deploy to Staging** (on merge to main):
   - Build and tag images
   - Push to container registry
   - Deploy to staging cluster (Minikube or cloud staging)
   - Run smoke tests

3. **Deploy to Production** (on release tag):
   - Deploy to production cluster
   - Run health checks
   - Monitor error rates
   - Automatic rollback on failure

**Required Secrets** (GitHub Secrets):
- `DOCKER_USERNAME`, `DOCKER_PASSWORD` (or cloud registry credentials)
- `KUBECONFIG` (for kubectl access)
- `NEON_DATABASE_URL`
- `REDPANDA_CLOUD_BOOTSTRAP_SERVERS`
- `DAPR_API_TOKEN` (if using Dapr Cloud)

#### Observability Standards

**Health Checks** (MANDATORY for all services):
- Liveness probe: `GET /health/live` (responds 200 if service alive)
- Readiness probe: `GET /health/ready` (responds 200 if service ready to accept traffic)

**Structured Logging**:
- JSON format logs to stdout
- Include: timestamp, level, service name, correlation ID, user ID (if applicable)
- Log all event publications and consumptions

**Monitoring** (Required Metrics):
- Service uptime and availability
- Request latency (p50, p95, p99)
- Event processing lag (Kafka consumer lag)
- Error rates (4xx, 5xx)
- Resource utilization (CPU, memory per pod)

**Tools** (recommended):
- Prometheus (metrics collection)
- Grafana (dashboards)
- Loki (log aggregation)
- Jaeger (distributed tracing via Dapr)

### Forbidden Patterns and Anti-Patterns

**FORBIDDEN ACTIONS** (violations are blocking):

1. ❌ Hardcoding credentials or secrets in code or Dockerfiles
2. ❌ Using Kafka client libraries directly when Dapr is enabled
3. ❌ Combining multiple services into one (monolithic deployment)
4. ❌ Skipping event schema definitions before implementation
5. ❌ Deploying to cloud before validating on Minikube
6. ❌ Storing state in-memory (violates statelessness)
7. ❌ Direct database access from multiple services (use state management)
8. ❌ Synchronous HTTP calls between services for event-driven workflows
9. ❌ Missing health checks or readiness probes
10. ❌ Deploying without proper rollback strategy

**ANTI-PATTERNS TO AVOID**:

- **Distributed Monolith**: Services tightly coupled via synchronous calls
- **Event Soup**: Events without clear schema or consumer contracts
- **Configuration Drift**: Different configs between Minikube and cloud
- **Missing Observability**: Deploying without logging or monitoring
- **Manual Deployments**: Not automating via CI/CD
- **Single Points of Failure**: Services without redundancy

### Success Criteria and Compliance Checklist

Phase V is complete ONLY when ALL of the following are verified:

#### Minikube Validation
- [ ] All 5 microservices deployed to Minikube
- [ ] All services running with Dapr sidecars (2 containers per pod)
- [ ] Redpanda running locally (Docker or K8s)
- [ ] Events flowing through Kafka topics (`task-events`, `reminders`, `task-updates`)
- [ ] All Dapr building blocks utilized (pub/sub, state, bindings, invocation, secrets)
- [ ] Health checks passing for all services
- [ ] Can perform full user flow: create task → event published → consumed by services

#### Cloud Kubernetes Validation
- [ ] All 5 microservices deployed to cloud (DOKS/GKE/AKS)
- [ ] Redpanda Cloud or managed Kafka connected
- [ ] Helm charts used for deployment
- [ ] Horizontal scaling configured (2+ replicas per service)
- [ ] External endpoints exposed (LoadBalancer or Ingress)
- [ ] System behaves identically to Minikube

#### Event-Driven Validation
- [ ] All task CRUD operations publish events
- [ ] Events include required fields (eventId, userId, timestamp, data)
- [ ] Event consumers handle events idempotently
- [ ] Event ordering preserved for same taskId
- [ ] Failed event processing has retry logic

#### Dapr Integration Validation
- [ ] No direct Kafka client usage in application code
- [ ] No direct database driver usage (state via Dapr)
- [ ] Secrets retrieved via Dapr, not environment variables
- [ ] Service-to-service calls via Dapr invocation
- [ ] Cron bindings used for scheduled tasks

#### CI/CD Validation
- [ ] GitHub Actions pipeline functional
- [ ] Automated builds on every PR
- [ ] Automated tests on every PR
- [ ] Automated deployment to staging on merge
- [ ] Manual approval gate for production
- [ ] Rollback tested and functional

#### Observability Validation
- [ ] All services have liveness and readiness probes
- [ ] Structured JSON logs to stdout
- [ ] Metrics collected (Prometheus or equivalent)
- [ ] Dashboards created (Grafana or equivalent)
- [ ] Alerts configured for critical failures

#### Documentation Validation
- [ ] Architecture diagram shows all 5 services and event flows
- [ ] Event schemas documented for all topics
- [ ] Deployment guide for Minikube
- [ ] Deployment guide for cloud
- [ ] Runbook for common operational tasks
- [ ] Troubleshooting guide

## Governance

This constitution supersedes all other development practices. When in doubt, refer to
these principles.

### Amendment Process

1. Proposed changes MUST include rationale and impact assessment
2. Constitution amendments require explicit approval before implementation
3. Version number MUST be incremented following semantic versioning:
   - **MAJOR**: Principle removals or backward-incompatible governance changes
   - **MINOR**: New principles added or existing principles materially expanded
   - **PATCH**: Clarifications, typo fixes, non-semantic wording improvements

### Compliance and Reviews

- All feature specifications MUST be checked against these principles before approval
- Implementation plans MUST document how each principle is satisfied
- Code reviews MUST verify adherence to security-first, event-driven, and cloud-native
  requirements
- Any complexity not justified by these principles MUST be simplified or removed
- Phase V deployments MUST pass ALL success criteria before considered complete

### Development Guidance

For runtime development workflow, refer to `CLAUDE.md` for agent-specific guidance on
when to use specialized skills for their respective technology layers and operations.

## Version History

**Version**: 3.0.0
**Ratified**: 2026-01-12
**Last Amended**: 2026-02-07

**Amendments**:
- v3.0.0 (2026-02-07): Phase V - Cloud-Native Event-Driven Microservices Architecture
- v2.0.0 (2026-01-22): Phase III - AI-Powered Todo Chatbot with MCP Tools
- v1.0.0 (2026-01-12): Initial constitution for Todo Full-Stack Web Application
