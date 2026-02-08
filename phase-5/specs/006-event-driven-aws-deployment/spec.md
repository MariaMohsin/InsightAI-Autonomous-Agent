# Feature Specification: Event-Driven Architecture with Dapr on AWS EKS

**Feature Branch**: `006-event-driven-aws-deployment`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Transform existing Todo app into production-ready, event-driven microservices system using Kafka/Redpanda for messaging, Dapr runtime for service mesh capabilities, and AWS EKS for orchestration. All existing business logic (priorities, tags, search, filters, recurring tasks, reminders) remains intact—this focuses purely on infrastructure, cloud deployment, and event-driven communication patterns.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System Reliability and Availability (Priority: P1)

As a **business stakeholder**, I need the Todo application to be highly available and resilient to failures so that users can access their tasks 24/7 without service interruptions.

**Why this priority**: High availability is critical for user trust and business continuity. Without reliable infrastructure, all application features become unusable.

**Independent Test**: Deploy the system to AWS EKS, simulate node failures, and verify that the application remains accessible with no data loss and automatic recovery within 60 seconds.

**Acceptance Scenarios**:

1. **Given** the system is running on AWS EKS with multiple replicas, **When** one pod crashes, **Then** traffic automatically routes to healthy pods and users experience no downtime
2. **Given** a Kubernetes node fails, **When** pods are rescheduled to other nodes, **Then** all services recover automatically within 60 seconds
3. **Given** the database connection is temporarily lost, **When** Dapr state store retries connection, **Then** operations resume automatically without manual intervention
4. **Given** system load increases by 300%, **When** horizontal pod autoscaling triggers, **Then** new pods are created and requests are distributed evenly

---

### User Story 2 - Asynchronous Task Processing (Priority: P2)

As a **system architect**, I need all task lifecycle events (create, update, delete, complete) to be published to Kafka topics so that downstream services can react independently without coupling business logic.

**Why this priority**: Event-driven architecture enables scalability, maintainability, and future extensibility. Services can be developed, deployed, and scaled independently.

**Independent Test**: Create a task in the frontend, verify the event is published to Kafka's `task-events` topic, and confirm that multiple consumers (audit service, notification service) receive and process the event independently.

**Acceptance Scenarios**:

1. **Given** a user creates a new task, **When** the backend persists the task, **Then** a `task.created` event is published to Kafka via Dapr pub/sub
2. **Given** a user marks a task as complete, **When** the status changes, **Then** both `task.completed` and `task.updated` events are published to respective topics
3. **Given** an event consumer is offline, **When** the consumer comes back online, **Then** it processes all missed events in order without data loss
4. **Given** a recurring task is completed, **When** the next instance is created, **Then** separate events are published for completion and creation

---

### User Story 3 - Automated Deployment Pipeline (Priority: P2)

As a **DevOps engineer**, I need an automated CI/CD pipeline that builds Docker images, pushes them to AWS ECR, and deploys to EKS so that code changes can be shipped to production safely and quickly.

**Why this priority**: Automation reduces human error, enables frequent deployments, and ensures consistency across environments.

**Independent Test**: Push a code change to the Git repository, verify GitHub Actions workflow builds images, pushes to ECR, and deploys to EKS staging environment within 10 minutes with zero manual intervention.

**Acceptance Scenarios**:

1. **Given** code is pushed to the main branch, **When** GitHub Actions workflow triggers, **Then** Docker images are built for all services and tagged with git commit SHA
2. **Given** images are built successfully, **When** they are pushed to AWS ECR, **Then** vulnerability scanning completes and images are tagged as production-ready
3. **Given** images are in ECR, **When** Kubernetes manifests are applied, **Then** rolling updates deploy new versions with zero downtime
4. **Given** a deployment fails health checks, **When** Kubernetes detects unhealthy pods, **Then** the rollout is automatically rolled back to the previous stable version

---

### User Story 4 - Centralized Logging and Monitoring (Priority: P3)

As an **operations team member**, I need all service logs aggregated in AWS CloudWatch and metrics dashboards available so that I can troubleshoot issues and monitor system health in real-time.

**Why this priority**: Observability is essential for production systems to diagnose issues quickly, understand system behavior, and meet SLA requirements.

**Independent Test**: Generate an error in the notification service, verify the error appears in CloudWatch Logs within 30 seconds, and confirm metrics show an increase in error rate on the dashboard.

**Acceptance Scenarios**:

1. **Given** all services are running, **When** they emit logs, **Then** logs are streamed to CloudWatch Logs grouped by service name and environment
2. **Given** a service exceeds resource limits, **When** CloudWatch metrics detect the anomaly, **Then** alerts are triggered to the operations team
3. **Given** a request fails, **When** distributed tracing is enabled, **Then** the complete request path across all microservices is visible in CloudWatch ServiceLens
4. **Given** system metrics are collected, **When** dashboards are viewed, **Then** real-time data for CPU, memory, request latency, and error rates are displayed

---

### User Story 5 - Scheduled Reminder Processing (Priority: P3)

As a **system administrator**, I need reminder checks to run automatically every minute via Dapr cron binding so that users receive timely notifications without manual intervention.

**Why this priority**: Automated scheduling ensures reliability and reduces operational overhead for time-sensitive features like reminders.

**Independent Test**: Set a reminder for a task due in 2 minutes, wait for the cron binding to trigger, and verify the notification service processes the reminder and sends a notification.

**Acceptance Scenarios**:

1. **Given** the cron binding is configured for every 1 minute, **When** the scheduled time arrives, **Then** Dapr invokes the reminder service endpoint automatically
2. **Given** pending reminders exist, **When** the reminder service queries the database, **Then** all due reminders are fetched and published to the `reminders` topic
3. **Given** the notification service consumes reminder events, **When** an event is processed, **Then** notifications are sent to users and reminder status is updated
4. **Given** the cron job fails, **When** Dapr detects the failure, **Then** the next scheduled execution retries automatically

---

### User Story 6 - Service-to-Service Communication via Dapr (Priority: P3)

As a **backend developer**, I need all inter-service communication to go through Dapr service invocation so that services are decoupled from network details and can be discovered dynamically.

**Why this priority**: Dapr service invocation provides built-in retry, timeout, circuit breaking, and service discovery, reducing boilerplate code and improving reliability.

**Independent Test**: Frontend service invokes backend API via Dapr HTTP proxy, verify the request is routed correctly, and confirm Dapr automatically retries on transient failures.

**Acceptance Scenarios**:

1. **Given** the frontend needs to call the backend, **When** it uses Dapr invoke API, **Then** the request is routed through Dapr sidecars with automatic service discovery
2. **Given** the backend service is temporarily unavailable, **When** Dapr detects the failure, **Then** requests are retried with exponential backoff up to configured limits
3. **Given** a circuit is open due to repeated failures, **When** subsequent requests arrive, **Then** they fail fast without overloading the failing service
4. **Given** mTLS is enabled in Dapr, **When** services communicate, **Then** all traffic is encrypted automatically without application code changes

---

### Edge Cases

- **What happens when Kafka broker is unavailable?** Dapr pub/sub component retries publishing events with exponential backoff. If retries exceed the limit, events are logged as failed and require manual intervention or dead-letter queue processing.

- **How does the system handle Dapr sidecar crashes?** Kubernetes automatically restarts the Dapr sidecar. During downtime, application requests fail until the sidecar is healthy again (typically 5-10 seconds).

- **What if AWS EKS cluster runs out of capacity?** Cluster autoscaler provisions new nodes automatically. If AWS account limits are reached, deployments are queued and alerts are sent to operations.

- **How are database connection pool exhaustion issues managed?** Dapr state store uses connection pooling with configurable limits. When exhausted, requests are queued or fail fast based on configuration.

- **What happens during a rolling deployment if event schemas change?** Consumers must be backward-compatible. Schema registry (or versioned topics) ensures producers and consumers can coexist during transition periods.

- **How does the system handle clock skew in distributed systems?** All services use NTP-synchronized clocks. Event timestamps use UTC. Kafka consumers rely on offset ordering, not wall-clock time.

- **What if a microservice processes the same event twice (duplicate delivery)?** All event consumers must be idempotent. Use unique event IDs or database constraints to prevent duplicate processing side effects.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Event-Driven Architecture

- **FR-001**: System MUST publish a `task.created` event to the `task-events` Kafka topic whenever a task is created
- **FR-002**: System MUST publish a `task.updated` event to the `task-updates` Kafka topic whenever task fields are modified
- **FR-003**: System MUST publish a `task.deleted` event to the `task-events` Kafka topic when a task is permanently deleted
- **FR-004**: System MUST publish a `task.completed` event to the `task-events` Kafka topic when a task status changes to completed
- **FR-005**: System MUST publish a `reminder.due` event to the `reminders` Kafka topic when a reminder time is reached
- **FR-006**: Event schemas MUST include event ID, timestamp, correlation ID, event type, user ID, and payload data
- **FR-007**: All events MUST be published via Dapr pub/sub component, not direct Kafka clients

#### Microservices Architecture

- **FR-008**: Frontend Service MUST run as a containerized Next.js application with Dapr sidecar for service invocation
- **FR-009**: Chat API / Backend Service MUST run as a containerized FastAPI application handling all task CRUD operations
- **FR-010**: Notification Service MUST consume reminder events from Kafka and send notifications to users
- **FR-011**: Recurring Task Service MUST consume task completion events and create next instances for recurring tasks
- **FR-012**: Audit Service MUST consume all task events and persist activity logs for compliance and debugging
- **FR-013**: Realtime Sync Service MUST consume task update events and push changes to connected WebSocket clients
- **FR-014**: Each service MUST be independently deployable, scalable, and have clearly defined API boundaries

#### Dapr Integration

- **FR-015**: All services MUST use Dapr pub/sub for asynchronous event publishing and subscription
- **FR-016**: Backend service MUST use Dapr state store for accessing PostgreSQL instead of direct database connections for non-transactional operations
- **FR-017**: All inter-service HTTP calls MUST use Dapr service invocation for automatic retry, timeout, and service discovery
- **FR-018**: Reminder service MUST use Dapr cron binding configured to trigger every 1 minute for checking due reminders
- **FR-019**: All secrets (database credentials, Kafka credentials, API keys) MUST be retrieved via Dapr secret store from Kubernetes Secrets
- **FR-020**: No hardcoded secrets or credentials MUST exist in application code or container images

#### AWS Kubernetes (EKS) Deployment

- **FR-021**: Application MUST run on AWS EKS cluster with minimum 3 worker nodes for high availability
- **FR-022**: Services MUST be organized in Kubernetes namespaces: `todo-prod`, `todo-staging`, `todo-infra`
- **FR-023**: Each service MUST have Kubernetes Deployment with minimum 2 replicas for redundancy
- **FR-024**: Dapr runtime MUST be installed on EKS cluster via Helm chart with mTLS enabled
- **FR-025**: Ingress controller MUST be configured using AWS Application Load Balancer (ALB) for external traffic routing
- **FR-026**: All pods MUST have resource requests and limits defined for CPU and memory
- **FR-027**: Horizontal Pod Autoscaler (HPA) MUST be configured for frontend and backend services based on CPU utilization

#### Containerization

- **FR-028**: All services MUST use multi-stage Dockerfile builds to minimize image size
- **FR-029**: Docker images MUST be tagged with Git commit SHA and semantic version for traceability
- **FR-030**: Images MUST be pushed to AWS Elastic Container Registry (ECR) with vulnerability scanning enabled
- **FR-031**: Base images MUST be official, minimal, and regularly updated (e.g., `node:20-alpine`, `python:3.11-slim`)
- **FR-032**: Images MUST run as non-root users for security

#### CI/CD Pipeline

- **FR-033**: GitHub Actions workflow MUST trigger on push to `main` branch and pull request events
- **FR-034**: Pipeline MUST build Docker images for all modified services automatically
- **FR-035**: Pipeline MUST run unit tests and integration tests before building images
- **FR-036**: Pipeline MUST push images to AWS ECR and tag them with `latest`, commit SHA, and semantic version
- **FR-037**: Pipeline MUST deploy to staging environment automatically on `main` branch commits
- **FR-038**: Pipeline MUST support manual approval gate before deploying to production environment
- **FR-039**: Pipeline MUST perform rolling updates with zero downtime using Kubernetes deployment strategies

#### Monitoring & Logging

- **FR-040**: All services MUST stream logs to AWS CloudWatch Logs in JSON format
- **FR-041**: Log entries MUST include timestamp, service name, pod ID, log level, correlation ID, and message
- **FR-042**: System MUST collect metrics for request count, latency, error rate, CPU, and memory usage
- **FR-043**: CloudWatch dashboards MUST display real-time metrics for all services
- **FR-044**: All pods MUST define liveness probes to detect unresponsive containers
- **FR-045**: All pods MUST define readiness probes to ensure traffic is routed only to healthy instances
- **FR-046**: Health check endpoints MUST return status within 500ms

### Key Entities

- **Event**: Represents a domain event (task created, updated, deleted, completed, reminder due). Contains event ID, type, timestamp, correlation ID, user ID, and payload.
- **Kafka Topic**: Logical channel for event streams (`task-events`, `task-updates`, `reminders`). Partitioned for scalability, retained based on retention policy.
- **Microservice**: Independent, deployable unit with single responsibility (Frontend, Backend, Notification, Recurring Task, Audit, Realtime Sync). Each has its own container, Dapr sidecar, and API.
- **Dapr Component**: Configuration for pub/sub, state store, service invocation, bindings, secrets. Defined as YAML manifests applied to Kubernetes.
- **Kubernetes Resource**: Deployment, Service, ConfigMap, Secret, Ingress. Defines desired state for containers and networking.
- **Docker Image**: Immutable artifact containing application code, dependencies, and runtime. Tagged with version and SHA for traceability.
- **CI/CD Pipeline**: Automated workflow in GitHub Actions. Stages include build, test, scan, push, deploy.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application achieves 99.9% uptime measured over 30-day period (maximum 43 minutes downtime per month)
- **SC-002**: System handles 10,000 concurrent users with average response time under 500ms for 95th percentile
- **SC-003**: Event processing latency from publication to consumption is under 2 seconds for 99% of events
- **SC-004**: Deployments to staging environment complete automatically within 10 minutes of code push
- **SC-005**: Zero-downtime deployments are achieved with no user-facing errors during rolling updates
- **SC-006**: All critical errors are logged to CloudWatch and alerts are triggered within 1 minute of occurrence
- **SC-007**: Mean time to recovery (MTTR) for service failures is under 5 minutes with automatic pod restart and rescheduling
- **SC-008**: Horizontal autoscaling responds to load increases by provisioning new pods within 2 minutes
- **SC-009**: All services demonstrate idempotent event processing with no duplicate side effects in 100% of test scenarios
- **SC-010**: Reminder delivery accuracy is 99.5% or higher (reminders sent within 2 minutes of scheduled time)
- **SC-011**: Infrastructure costs remain under $500/month for baseline load with predictable scaling costs
- **SC-012**: 100% of inter-service communication is encrypted via Dapr mTLS with certificate rotation every 30 days

---

## Assumptions

1. **Redpanda Cloud** is the managed Kafka broker (no self-hosted Kafka cluster management)
2. **Neon PostgreSQL** remains the external managed database (not migrated to AWS RDS)
3. **AWS account** has sufficient IAM permissions and service quotas for EKS, ECR, CloudWatch, and ALB
4. **Existing application code** (frontend and backend) requires minimal changes—only adding Dapr SDK calls
5. **GitHub Actions** runners have network access to AWS APIs and EKS cluster
6. **Event schemas** follow CloudEvents specification for interoperability
7. **Backward compatibility** is maintained during rollout—old and new versions coexist during deployment
8. **Development and production environments** use separate AWS accounts or isolated namespaces
9. **Secrets management** uses Kubernetes native secrets (not AWS Secrets Manager for cost optimization)
10. **Service mesh features** (observability, retry, circuit breaking) are provided by Dapr, not Istio/Linkerd

---

## Out of Scope

- Reimplementation of existing business logic (priorities, tags, search, filters, recurring tasks, reminders)
- UI/UX redesign or frontend feature enhancements
- Migration to non-AWS cloud providers (Azure, GCP)
- Serverless architecture using AWS Lambda or Fargate
- Self-hosted Kafka cluster management (Redpanda Cloud is used instead)
- Advanced service mesh features beyond Dapr (e.g., Istio traffic splitting)
- Multi-region deployment and global load balancing
- AI/ML model integration or recommendation engine
- Mobile app development (iOS, Android)
- Third-party integrations (Slack, email, SMS providers)

---

## Dependencies

- **External Services**:
  - Redpanda Cloud (Kafka-compatible broker)
  - Neon PostgreSQL (managed database)
  - AWS EKS (Kubernetes cluster)
  - AWS ECR (container registry)
  - AWS CloudWatch (logging and monitoring)

- **Infrastructure**:
  - AWS account with EKS, ECR, CloudWatch, IAM permissions
  - GitHub repository with Actions enabled
  - Domain name for ingress (optional, can use ALB DNS)

- **Tooling**:
  - Dapr CLI and runtime (version 1.12+)
  - kubectl (Kubernetes CLI)
  - Helm (Kubernetes package manager)
  - Docker (container runtime)
  - AWS CLI (for ECR, EKS access)

- **Knowledge**:
  - Kubernetes fundamentals (pods, deployments, services)
  - Dapr concepts (pub/sub, state management, service invocation)
  - Event-driven architecture patterns
  - CI/CD pipeline design
  - AWS cloud services

---

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Kafka broker downtime causes event loss | High | Low | Configure Dapr pub/sub with retries and dead-letter queues. Implement event replay mechanism. |
| Dapr sidecar crashes cause service disruption | High | Medium | Kubernetes automatically restarts sidecars. Implement circuit breakers in application code for graceful degradation. |
| AWS EKS costs exceed budget | Medium | Medium | Set resource quotas, use Spot instances for non-critical workloads, monitor costs with CloudWatch billing alerts. |
| Event schema changes break consumers | High | Medium | Use schema versioning, maintain backward compatibility, deploy consumers before producers during migrations. |
| Network latency affects event processing | Medium | Low | Use AWS regions close to users, optimize event payloads, implement caching where appropriate. |
| Secret rotation causes service outages | Medium | Low | Implement graceful secret reloading, test rotation in staging, use Kubernetes secrets with volume mounts. |

---

## Notes

- This specification focuses on **infrastructure transformation**, not application feature development
- All existing business logic remains unchanged—services are refactored only to add event publishing and Dapr SDK calls
- **Phase 1** should prioritize P1 user stories (reliability, core event architecture) before P2/P3 (CI/CD, observability)
- Dapr components (pub/sub, state store, bindings) are configured via YAML manifests, not application code
- Production rollout should be gradual: staging → canary deployment → full production
- Costs should be monitored weekly during initial deployment to avoid budget overruns
- Event-driven architecture enables future features (analytics, integrations, notifications) without modifying core services
